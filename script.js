const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const weatherDashboard =
    document.getElementById("weatherDashboard");

const welcomeCard =
    document.getElementById("welcomeCard");

const cityName =
    document.getElementById("cityName");

const temperature =
    document.getElementById("temperature");

const weatherDescription =
    document.getElementById("weatherDescription");

const humidity =
    document.getElementById("humidity");

const windSpeed =
    document.getElementById("windSpeed");

const sunrise =
    document.getElementById("sunrise");

const sunset =
    document.getElementById("sunset");

const feelsLike =
    document.getElementById("feelsLike");

const weatherIcon =
    document.getElementById("weatherIcon");

const forecastContainer =
    document.getElementById("forecastContainer");

const dateTime =
    document.getElementById("dateTime");

const errorMessage =
    document.getElementById("errorMessage");

const loading =
    document.getElementById("loading");


// Search button
searchBtn.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if (city === "") {
        showError("Please enter a city name.");
        return;
    }

    getWeather(city);
});


// Press Enter
cityInput.addEventListener("keypress", (event) => {

    if (event.key === "Enter") {

        const city = cityInput.value.trim();

        if (city === "") {
            showError("Please enter a city name.");
            return;
        }

        getWeather(city);
    }
});


// Get weather
async function getWeather(city) {

    try {

        errorMessage.textContent = "";

        loading.textContent =
            "⏳ Getting weather information...";


        // Find city
        const locationResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );


        if (!locationResponse.ok) {
            throw new Error("Unable to find the city.");
        }


        const locationData =
            await locationResponse.json();


        if (
            !locationData.results ||
            locationData.results.length === 0
        ) {

            throw new Error(
                "City not found. Please enter a valid city."
            );

        }


        const location =
            locationData.results[0];


        const latitude =
            location.latitude;

        const longitude =
            location.longitude;


        // Weather API
        const weatherResponse = await fetch(

            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=5`

        );


        if (!weatherResponse.ok) {

            throw new Error(
                "Unable to fetch weather data."
            );

        }


        const weatherData =
            await weatherResponse.json();


        const current =
            weatherData.current;

        const daily =
            weatherData.daily;


        // City
        cityName.textContent =
            `${location.name}, ${location.country}`;


        // Temperature
        temperature.textContent =
            Math.round(current.temperature_2m);


        // Feels like
        feelsLike.textContent =
            `Feels like ${Math.round(current.apparent_temperature)}°C`;


        // Humidity
        humidity.textContent =
            `${current.relative_humidity_2m}%`;


        // Wind
        windSpeed.textContent =
            `${current.wind_speed_10m} km/h`;


        // Weather description
        weatherDescription.textContent =
            getWeatherDescription(
                current.weather_code
            );


        // Weather icon
        weatherIcon.textContent =
            getWeatherIcon(
                current.weather_code
            );


        // Sunrise
        sunrise.textContent =
            formatTime(daily.sunrise[0]);


        // Sunset
        sunset.textContent =
            formatTime(daily.sunset[0]);


        // Current date
        dateTime.textContent =
            new Date().toLocaleString(
                "en-IN",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
            );


        // Forecast
        displayForecast(daily);


        // Show dashboard
        weatherDashboard.classList.remove("hidden");

        welcomeCard.style.display = "none";


        loading.textContent = "";


    } catch (error) {

        console.error(error);

        loading.textContent = "";

        showError(error.message);

    }
}


// Weather description
function getWeatherDescription(code) {

    if (code === 0)
        return "Clear Sky";

    if (code <= 3)
        return "Partly Cloudy";

    if (code === 45 || code === 48)
        return "Foggy";

    if (code <= 55)
        return "Drizzle";

    if (code <= 65)
        return "Rain";

    if (code <= 75)
        return "Snow";

    if (code <= 82)
        return "Rain Showers";

    if (code >= 95)
        return "Thunderstorm";

    return "Unknown Weather";
}


// Weather icons
function getWeatherIcon(code) {

    if (code === 0)
        return "☀️";

    if (code <= 3)
        return "⛅";

    if (code === 45 || code === 48)
        return "🌫️";

    if (code <= 55)
        return "🌦️";

    if (code <= 65)
        return "🌧️";

    if (code <= 75)
        return "❄️";

    if (code <= 82)
        return "🌦️";

    if (code >= 95)
        return "⛈️";

    return "🌤️";
}


// Display forecast
function displayForecast(daily) {

    forecastContainer.innerHTML = "";


    for (let i = 0; i < 5; i++) {

        const date =
            new Date(daily.time[i]);


        const day =
            date.toLocaleDateString(
                "en-IN",
                { weekday: "short" }
            );


        const icon =
            getWeatherIcon(
                daily.weather_code[i]
            );


        const max =
            Math.round(
                daily.temperature_2m_max[i]
            );


        const min =
            Math.round(
                daily.temperature_2m_min[i]
            );


        const card =
            document.createElement("div");


        card.className =
            "forecast-item";


        card.innerHTML = `

            <div class="forecast-day">
                ${day}
            </div>

            <div class="forecast-icon">
                ${icon}
            </div>

            <div class="forecast-temp">
                ${max}° / ${min}°
            </div>

        `;


        forecastContainer.appendChild(card);
    }
}


// Format time
function formatTime(time) {

    if (!time)
        return "--";

    return new Date(time).toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// Error
function showError(message) {

    errorMessage.textContent =
        "⚠️ " + message;
}


// Current location
locationBtn.addEventListener(
    "click",
    () => {

        if (!navigator.geolocation) {

            showError(
                "Location is not supported by your browser."
            );

            return;
        }


        loading.textContent =
            "📍 Getting your location...";


        navigator.geolocation.getCurrentPosition(

            async (position) => {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                try {

                    const response =
                        await fetch(

                            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`

                        );


                    const data =
                        await response.json();


                    if (
                        data.results &&
                        data.results.length > 0
                    ) {

                        getWeather(
                            data.results[0].name
                        );

                    } else {

                        showError(
                            "Unable to detect your city."
                        );

                    }


                } catch (error) {

                    showError(
                        "Unable to get your location."
                    );

                }

            },

            () => {

                showError(
                    "Location permission was denied."
                );

            }

        );
    }
);