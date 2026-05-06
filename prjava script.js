// --- CONFIGURATION ---
const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your OpenWeatherMap API Key
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// --- DOM ELEMENTS ---
// Auth Elements
const authSection = document.getElementById('auth-section');
const weatherSection = document.getElementById('weather-section');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authBtn = document.getElementById('auth-btn');
const toggleAuthModeBtn = document.getElementById('toggle-auth-mode');
const toggleMsg = document.getElementById('toggle-msg');
const authError = document.getElementById('auth-error');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// Weather Elements
const welcomeMsg = document.getElementById('welcome-msg');
const logoutBtn = document.getElementById('logout-btn');
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherResult = document.getElementById('weather-result');
const weatherError = document.getElementById('weather-error');
const loader = document.getElementById('loader');

// --- STATE ---
let isLoginMode = true;

// --- AUTHENTICATION LOGIC (LocalStorage) ---

// Check if user is already logged in on load
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        showWeatherApp(currentUser);
    }
});

// Toggle between Login and Sign Up
toggleAuthModeBtn.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    authTitle.textContent = isLoginMode ? 'Login' : 'Sign Up';
    authBtn.textContent = isLoginMode ? 'Login' : 'Register';
    toggleMsg.textContent = isLoginMode ? "Don't have an account?" : "Already have an account?";
    toggleAuthModeBtn.textContent = isLoginMode ? 'Sign Up' : 'Login';
    authError.textContent = '';
});

// Handle Auth Form Submit
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        authError.textContent = 'Please fill in all fields.';
        return;
    }

    if (isLoginMode) {
        // Login Logic
        const storedPassword = localStorage.getItem(`user_${username}`);
        if (storedPassword === password) {
            localStorage.setItem('currentUser', username);
            showWeatherApp(username);
        } else {
            authError.textContent = 'Invalid username or password.';
        }
    } else {
        // Sign Up Logic
        if (localStorage.getItem(`user_${username}`)) {
            authError.textContent = 'Username already exists.';
        } else {
            localStorage.setItem(`user_${username}`, password);
            localStorage.setItem('currentUser', username);
            showWeatherApp(username);
        }
    }
});

// Handle Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    showAuthApp();
    resetWeatherUI();
});

// --- UI ROUTING ---
function showWeatherApp(username) {
    authSection.classList.add('hidden');
    weatherSection.classList.remove('hidden');
    welcomeMsg.textContent = `Hello, ${username}!`;
    usernameInput.value = '';
    passwordInput.value = '';
    authError.textContent = '';
}

function showAuthApp() {
    weatherSection.classList.add('hidden');
    authSection.classList.remove('hidden');
    document.body.className = ''; // Reset background
}

function resetWeatherUI() {
    weatherResult.classList.add('hidden');
    cityInput.value = '';
    weatherError.textContent = '';
}

// --- WEATHER API LOGIC ---

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    } else {
        weatherError.textContent = 'Please enter a city name.';
    }
});

// Allow hitting "Enter" to search
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchBtn.click();
});

async function getWeatherData(city) {
    // UI Reset for new search
    weatherResult.classList.add('hidden');
    weatherError.textContent = '';
    loader.classList.remove('hidden');

    try {
        const response = await fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        
        if (!response.ok) {
            if (response.status === 404) throw new Error('City not found.');
            if (response.status === 401) throw new Error('Invalid API Key.');
            throw new Error('An error occurred while fetching data.');
        }

        const data = await response.json();
        updateWeatherUI(data);

    } catch (error) {
        weatherError.textContent = error.message;
    } finally {
        loader.classList.add('hidden');
    }
}

function updateWeatherUI(data) {
    // Populate Data
    document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').textContent = Math.round(data.main.temp);
    document.getElementById('weather-condition').textContent = data.weather[0].main;
    document.getElementById('humidity').textContent = data.main.humidity;
    document.getElementById('wind-speed').textContent = data.wind.speed;
    
    // Set Icon
    const iconCode = data.weather[0].icon;
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    // Dynamic Background logic
    updateBackground(data.weather[0].main.toLowerCase());

    weatherResult.classList.remove('hidden');
}

function updateBackground(condition) {
    document.body.className = ''; // Clear existing
    if (condition.includes('clear')) {
        document.body.classList.add('bg-clear');
    } else if (condition.includes('cloud')) {
        document.body.classList.add('bg-clouds');
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
        document.body.classList.add('bg-rain');
    } else if (condition.includes('snow')) {
        document.body.classList.add('bg-snow');
    }
}