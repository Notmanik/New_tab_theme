{
  /* <section class="weather">
                <h2>Weather</h2>
                <input type="text" id="cityInput" placeholder="Enter city name" value="New York">
                <button id="getWeatherBtn">Get Weather</button>
                <div class="weather__info">
                    <p>City:</p>
                    <p id="cityName">--</p>
                    <p>Temperature:</p>
                    <p id="temperature">-- °C</p>
                    <p>Conditions:</p>
                    <p id="description">--</p>
                    <div class="humidity">
                        <h3>
                            Humidity
                            <span id="humidityValue">--%</span>
                        </h3>
                        <div class="humidity__container">
                            <div class="humidity__bar" id="humidityBar"></div>
                        </div>
                    </div>
                </div>
            </section> */
}

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
  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    city
  )}&limit=1&appid=${API_KEY}`;
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

// Save all weather data in local storage
function saveWeatherToLocal(data) {
  const weatherData = {
    city: data.name,
    temp: data.main.temp,
    humidity: data.main.humidity,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    timestamp: Date.now(),
  };
  localStorage.setItem("weatherData", JSON.stringify(weatherData));
}

// Load from local storage if available
function loadWeatherFromLocal() {
  const cached = localStorage.getItem("weatherData");
  if (!cached) return false;

  const data = JSON.parse(cached);

  // Check if data is older than 3 hours (3 * 60 * 60 * 1000 ms)
  const THREE_HOURS = 3 * 60 * 60 * 1000;
  if (Date.now() - data.timestamp > THREE_HOURS) {
    console.log("Local storage expired — deleting");
    localStorage.removeItem("weatherData");
    return false;
  }

  // Still valid — use cached data
  cityName.textContent = data.city;
  temperature.textContent = `${Math.round(data.temp)}°C`;
  description.textContent = data.description;
  updateHumidityBar(data.humidity);
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
  weatherIcon.alt = data.description;
  weatherIcon.style.display = "block";
  console.log("Used local storage");
  hideSearchElements();
  addWeatherClickListener();
  return true;
}

// Fetch weather from OpenWeatherMap API
async function getWeather(city) {
  try {
    cityName.textContent = "Loading...";
    temperature.textContent = "-- °C";
    description.textContent = "Fetching weather data...";
    weatherIcon.style.display = "none";

    const coords = await getCoordinates(city);
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`;

    const response = await fetch(weatherUrl);
    const data = await response.json();

    if (!data || data.cod !== 200) {
      throw new Error("Weather data not found");
    }

    cityName.textContent = data.name;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    updateHumidityBar(data.main.humidity);

    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIcon.src = iconUrl;
    weatherIcon.alt = data.weather[0].description;
    weatherIcon.style.display = "block";

    cityInput.value = "";

    // Save to local storage
    saveWeatherToLocal(data);

    hideSearchElements();
    addWeatherClickListener();
  } catch (err) {
    console.error("Error:", err.message);
    cityName.textContent = "City not found";
    temperature.textContent = "-- °C";
    description.textContent = "Please check spelling";
    weatherIcon.style.display = "none";
    updateHumidityBar(0);
  }
}

// Update humidity bar with animation and color coding
function updateHumidityBar(humidity) {
  const percentage = humidity || 0;
  humidityBar.style.width = `${percentage}%`;
  if (humidityValue) humidityValue.textContent = `${percentage}%`;

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

function hideSearchElements() {
  cityInput.style.display = "none";
  getWeatherBtn.style.display = "none";
}

function showSearchElements() {
  cityInput.style.display = "block";
  getWeatherBtn.style.display = "block";
}

function addWeatherClickListener() {
  const weatherInfo = document.querySelector(".weather__info");
  if (weatherInfo) {
    weatherInfo.style.cursor = "pointer";
    weatherInfo.title = "Click to change city";
    weatherInfo.addEventListener("click", showSearchElements);
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

// Enter key listener
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

// Current location weather with caching
async function getCurrentLocationWeather() {
  if (loadWeatherFromLocal()) return;

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

          updateHumidityBar(data.main.humidity);

          saveWeatherToLocal(data);

          hideSearchElements();
          addWeatherClickListener();
        }
        console.log("API used");
      } catch (err) {
        console.error("Error getting current location weather:", err);
      }
    });
  }
}

// Initialize
getCurrentLocationWeather();
document.addEventListener("DOMContentLoaded", addWeatherClickListener);
