const API_KEY = "8480d7ec75d308ad0c6fb01abb80445f"; // Replace with your actual OpenWeatherMap API key

const getWeatherBtn = document.getElementById("getWeatherBtn");
const cityInput = document.getElementById("cityInput");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const weatherIcon = document.getElementById("weatherIcon");
const humidityBar = document.querySelector(".humidity__bar");
const humidityValue = document.getElementById("humidityValue");

// Fetch coordinates from city name
async function getCoordinates(city) {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
    const response = await fetch(geoUrl);
    const data = await response.json();
    
    if (!data || data.length === 0) {
        throw new Error("City not found");
    }
    
    return {
        lat: data[0].lat,
        lon: data[0].lon,
        name: data[0].name,
    };
}

// Fetch weather from OpenWeatherMap API
async function getWeather(city) {
    try {
        // Show loading state
        cityName.textContent = "Loading...";
        temperature.textContent = "-- °C";
        description.textContent = "Fetching weather data...";
        weatherIcon.style.display = "none";
        
        const coords = await getCoordinates(city);
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`;
        
        console.log("Weather URL:", weatherUrl);
        
        const response = await fetch(weatherUrl);
        const data = await response.json();
        
        console.log("Weather data:", data);
        
        if (!data || data.cod !== 200) {
            throw new Error("Weather data not found");
        }
        
        // Update DOM with the correct element IDs
        cityName.textContent = data.name;
        temperature.textContent = `${Math.round(data.main.temp)}°C`;
        description.textContent = data.weather[0].description;
        
        // Update humidity bar with animation
        updateHumidityBar(data.main.humidity);
        
        // Set weather icon
        const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        weatherIcon.src = iconUrl;
        weatherIcon.alt = data.weather[0].description;
        weatherIcon.style.display = "block";
        
        // Clear input after successful fetch
        cityInput.value = "";
        
        // Auto-hide the search elements after successful fetch
        hideSearchElements();
        
    } catch (err) {
        console.error("Error:", err.message);
        
        // Show error state
        cityName.textContent = "City not found";
        temperature.textContent = "-- °C";
        description.textContent = "Please check spelling";
        weatherIcon.style.display = "none";
        
        // Reset humidity bar
        updateHumidityBar(0);
    }
}

// Update humidity bar with animation and color coding
function updateHumidityBar(humidity) {
    const percentage = humidity || 0;
    
    // Update the bar width with animation
    humidityBar.style.width = `${percentage}%`;
    
    // Update humidity value text
    if (humidityValue) {
        humidityValue.textContent = `${percentage}%`;
    }
    
    // Color coding based on humidity level
    if (percentage <= 30) {
        humidityBar.className = "humidity__bar humidity__bar--low";
    } else if (percentage <= 60) {
        humidityBar.className = "humidity__bar humidity__bar--moderate";
    } else if (percentage <= 80) {
        humidityBar.className = "humidity__bar humidity__bar--high";
    } else {
        humidityBar.className = "humidity__bar humidity__bar--very-high";
    }
}

// Auto-hide search elements after getting weather
function hideSearchElements() {
    cityInput.style.display = "none";
    getWeatherBtn.style.display = "none";
}

// Show search elements (for refresh/change city)
function showSearchElements() {
    cityInput.style.display = "block";
    getWeatherBtn.style.display = "block";
}

// Add click listener to weather info to show search again
function addWeatherClickListener() {
    const weatherInfo = document.querySelector('.weather__info');
    if (weatherInfo) {
        weatherInfo.style.cursor = "pointer";
        weatherInfo.title = "Click to change city";
        weatherInfo.addEventListener('click', showSearchElements);
    }
}

// Button click listener
getWeatherBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
    } else {
        alert("Please enter a city name");
    }
});

// Enter key listener for input field
cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const city = cityInput.value.trim();
        if (city) {
            getWeather(city);
        } else {
            alert("Please enter a city name");
        }
    }
});

// Optional: Get weather for user's current location on page load
async function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
                
                const response = await fetch(weatherUrl);
                const data = await response.json();
                
                if (data && data.cod === 200) {
                    cityName.textContent = data.name;
                    temperature.textContent = `${Math.round(data.main.temp)}°C`;
                    description.textContent = data.weather[0].description;
                    
                    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
                    weatherIcon.src = iconUrl;
                    weatherIcon.alt = data.weather[0].description;
                    weatherIcon.style.display = "block";
                    
                    // Update humidity bar
                    updateHumidityBar(data.main.humidity);
                    
                    // Hide search elements and add click listener
                    hideSearchElements();
                    addWeatherClickListener();
                }
            } catch (err) {
                console.error("Error getting current location weather:", err);
            }
        });
    }
}

// Initialize weather with current location (optional)
// Uncomment the line below if you want to automatically load weather for user's location
getCurrentLocationWeather();

// Initialize click listener on page load
document.addEventListener('DOMContentLoaded', addWeatherClickListener);