const apiKey = "2c83cf81016cc6a2b2e0ef72fc29c523"; 

let tempBarChart, weatherDoughnutChart, tempLineChart; 
const sendButton = document.getElementById('send-chatbot');
const chatbotInput = document.getElementById('chatbot-input'); 
const chatbotMessages = document.getElementById('chatbot-messages');
//TABLE BUTTON
const tablesBtn = document.getElementById('tables-btn');
const forecastTable = document.getElementById('forecast-table');
tablesBtn.addEventListener('click', () => {
   
    forecastTable.scrollIntoView({ behavior: 'smooth' });
});

// ClOSE CHATBOT
document.getElementById('close-chatbot').addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent event from bubbling up
    document.getElementById('chatbot-widget').classList.add('minimized'); 
});

// OPEN CHATBOT
document.getElementById('chatbot-widget').addEventListener('click', () => {
    const chatbotWidget = document.getElementById('chatbot-widget');
    if (chatbotWidget.classList.contains('minimized')) {
        chatbotWidget.classList.remove('minimized');
    }
});

window.onload = () => {
    const chatbotWidget = document.getElementById('chatbot-widget');
    chatbotWidget.classList.add('minimized'); 
    document.getElementById('chatbot-widget').classList.remove('hidden'); 
//GEOLOCATIOBN API
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherDataByLocation(lat, lon);
        }, (error) => {
            console.error("Geolocation error: ", error);
            alert("Unable to retrieve your location !! Please search manually");
        });
    } else {
        alert("Geolocation is not supported by your browser!");
    }
};

async function fetchWeatherDataByLocation(lat, lon) {
    const spinner = document.getElementById('loading-spinner');
    spinner.classList.remove('hidden'); // Show spinner

    try {
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const weatherData = await weatherResponse.json();

        if (weatherData.cod !== 200) throw new Error(weatherData.message); 

        displayWeatherData(weatherData); 
        fetchForecastDataByLocation(lat, lon); 
    } 
    catch (error) 
    {
        alert(error.message); 
    }
    finally {
        spinner.classList.add('hidden'); 
    }
}

async function fetchForecastDataByLocation(lat, lon)
 {
    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const forecastData = await forecastResponse.json();
    displayForecast(forecastData); 
}

document.getElementById('get-weather').addEventListener('click', () => {
    const city = document.getElementById('city-input').value; 
    if (city)
    {
        fetchWeatherDataAndDisplay(city); 
    } 
    else
    {
        alert("Please enter a city name!"); 
    }
});

async function fetchWeatherDataAndDisplay(city) {
    const spinner = document.getElementById('loading-spinner');
    spinner.classList.remove('hidden');
    try {
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const weatherData = await weatherResponse.json();

       
        if (weatherData.cod === "404") 
        {
            throw new Error("City not found! Please check the city name and try again");
        } else if (weatherData.cod === "429")
        {
            throw new Error("API limit reached! Please wait a while and try again.");
        } else if (weatherData.cod !== 200) {
            throw new Error(weatherData.message || "An error occurred while fetching the weather data!");
        }

        displayWeatherData(weatherData);
        fetchForecastData(city); 
    } catch (error) {
        
        displayErrorMessage(error.message);
    }
    finally {
        spinner.classList.add('hidden'); 
    }
}

function displayErrorMessage(message) {
    const weatherContainer = document.querySelector('.weather-container');
    const forecastSection = document.querySelector('.forecast-section'); 
    const filterSection = document.getElementById('filter-section'); 

   
    weatherContainer.classList.remove('hidden');
    forecastSection.classList.add('hidden');
    filterSection.classList.add('hidden');
    const weatherWidget = document.getElementById('weather-widget');
    weatherWidget.innerHTML = `
        <h2>Error</h2>
        <p>${message}</p>
    `;

    weatherContainer.className = 'weather-container error-bg';
}


async function fetchForecastData(city) {

    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
    const forecastData = await forecastResponse.json();
    displayForecast(forecastData); 
}
let isCelsius = true;
function displayWeatherData(data) {
    const weatherContainer = document.querySelector('.weather-container');
    const forecastSection = document.querySelector('.forecast-section');
    const filterSection = document.getElementById('filter-section');

    weatherContainer.classList.remove('hidden');
    forecastSection.classList.remove('hidden');
    filterSection.classList.remove('hidden');

    const backgroundClasses = {
        "Clear": "clear-bg",
        "Clouds": "cloudy-bg",
        "Rain": "rainy-bg",
        "Drizzle": "drizzle-bg",
        "Thunderstorm": "storm-bg",
        "Snow": "snowy-bg",
        "Mist": "mist-bg",
        "Smoke": "mist-bg",
        "Haze": "mist-bg",
        "Dust": "mist-bg",
        "Fog": "mist-bg",
        "Sand": "mist-bg",
        "Ash": "mist-bg",
        "Squall": "mist-bg",
        "Tornado": "storm-bg"
    };

    const condition = data.weather[0].main;
    weatherContainer.className = `weather-container ${backgroundClasses[condition] || "default-bg"}`;

    let temperatureCelsius = data.main.temp;
    const weatherWidget = document.getElementById('weather-widget');
    weatherWidget.innerHTML = `
    <h2>${data.name}</h2>
    <p id="temperature-text">Temperature: ${temperatureCelsius} °C</p>
    <p>Humidity: ${data.main.humidity} %</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
    <p>${data.weather[0].description}</p>
    <button id="toggle-temperature">Switch to Fahrenheit</button>
`;

const toggleButton = document.getElementById('toggle-temperature');
toggleButton.addEventListener('click', () => {
    isCelsius = !isCelsius; 
    let temperatureText = document.getElementById('temperature-text');
    
    if (isCelsius) {
        temperatureText.innerHTML = `Temperature: ${temperatureCelsius} °C`;
        toggleButton.innerHTML = 'Switch to Fahrenheit';
    } else {
        let temperatureFahrenheit = (temperatureCelsius * 9/5) + 32; 
        temperatureText.innerHTML = `Temperature: ${temperatureFahrenheit.toFixed(2)} °F`;
        toggleButton.innerHTML = 'Switch to Celsius';
    }
});

}

let currentPage = 1;
const itemsPerPage = 10;

function displayForecast(data) {
    const forecastSection = document.querySelector('.forecast-section');
    forecastSection.classList.remove('hidden');

    const forecastTable = document.getElementById('forecast-table');
    forecastTable.innerHTML = '';

    const totalItems = data.list.length;

    const table = document.createElement('table');
    table.className = 'weather-table';
    table.innerHTML = '<tr><th>Date</th><th>Temp (°C)</th><th>Condition</th></tr>';

    const labels = [];
    const temperatures = [];
    const rainyDays = [];
    const weatherConditions = {};

    data.list.forEach((entry) => {
        const date = new Date(entry.dt * 1000).toLocaleDateString();
        const temp = entry.main.temp;
        const condition = entry.weather[0].main.toLowerCase();

        temperatures.push({ date, temp });
        labels.push(date);

        if (condition.includes('rain')) {
            rainyDays.push(entry);
        }

        weatherConditions[condition] = (weatherConditions[condition] || 0) + 1;
    });

    displayForecastItems(data.list, table);
    forecastTable.appendChild(table);
    displayTemperatureFilters(temperatures, rainyDays);
    createCharts(labels, temperatures, weatherConditions);
    createPaginationControls(totalItems, data.list);
}

function displayForecastItems(forecastList, table) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToDisplay = forecastList.slice(startIndex, endIndex); 
    table.innerHTML = '<tr><th>Date</th><th>Temp (°C)</th><th>Condition</th></tr>'; 
    itemsToDisplay.forEach(entry => {
        const date = new Date(entry.dt * 1000).toLocaleDateString();
        table.innerHTML += `<tr><td>${date}</td><td>${entry.main.temp} °C</td><td>${entry.weather[0].description}</td></tr>`;
    });
}

function createPaginationControls(totalItems, forecastList) {
    const paginationControls = document.getElementById('pagination-controls');
    paginationControls.innerHTML = '';

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = 'pagination-btn';
        button.dataset.page = i;
        button.innerText = i;

        button.addEventListener('click', () => {
            currentPage = i;
            displayForecastItems(forecastList, document.querySelector('.weather-table'));
        });

        paginationControls.appendChild(button);
    }
}

function displayTemperatureFilters(temperatures, rainyDays) {
    const filterSection = document.getElementById('filter-section');
    filterSection.innerHTML = '';

    const ascendingTemps = [...temperatures].sort((a, b) => a.temp - b.temp);
    let ascendingTempList = '<h3>Temperatures in Ascending Order</h3><ul>';
    ascendingTemps.forEach(temp => {
        ascendingTempList += `<li>${temp.date}: ${temp.temp} °C</li>`;
    });
    ascendingTempList += '</ul>';
    
    const descendingTemps = [...temperatures].sort((a, b) => b.temp - a.temp);
    let descendingTempList = '<h3>Temperatures in Descending Order</h3><ul>';
    descendingTemps.forEach(temp => {
        descendingTempList += `<li>${temp.date}: ${temp.temp} °C</li>`;
    });
    descendingTempList += '</ul>';

    let rainyDaysList = '<h3>Rainy Days</h3><ul>';
    rainyDays.forEach(day => {
        rainyDaysList += `<li>${new Date(day.dt * 1000).toLocaleDateString()}: ${day.main.temp} °C - ${day.weather[0].description}</li>`;
    });
    rainyDaysList += '</ul>';

    const highestTempDay = temperatures.reduce((max, entry) => (entry.temp > max.temp ? entry : max), temperatures[0]);
    const highestTemp = `<h3>Highest Temperature</h3><p>The day with the highest temperature is ${highestTempDay.date} with ${highestTempDay.temp} °C.</p>`;

    filterSection.innerHTML = ascendingTempList + descendingTempList + rainyDaysList + highestTemp;
}

function createCharts(labels, temperatures, weatherConditions) {
    const temperatureValues = temperatures.map(t => t.temp);

    const barCtx = document.getElementById('temp-bar-chart').getContext('2d');
    if (tempBarChart) tempBarChart.destroy();
    tempBarChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatureValues,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            animation: {
                delay: 500,
                duration: 1000,
            }
        }
    });

    const doughnutCtx = document.getElementById('weather-doughnut-chart').getContext('2d');
    if (weatherDoughnutChart) weatherDoughnutChart.destroy();
    weatherDoughnutChart = new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(weatherConditions),
            datasets: [{
                label: 'Weather Conditions',
                data: Object.values(weatherConditions),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: {
                delay: (context) => {
                    if (context.type === 'data' && context.mode === 'default' && !context.chart.getDatasetMeta(context.datasetIndex).hidden) {
                        return context.dataIndex * 100;
                    }
                    return 0;
                }
            }
        }
    });

    const lineCtx = document.getElementById('temp-line-chart').getContext('2d');
    if (tempLineChart) tempLineChart.destroy();
    tempLineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatureValues,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            animation: {
                easing: 'easeOutBounce',
                duration: 1500,
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function displayChatMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatbotMessages.appendChild(messageElement);
}

const chatResponseElem = document.getElementById('chatbot-messages'); 
async function getGeminiResponse(userInput) {
    const geminiApiKey = 'AIzaSyBllknY5ZkFWNeE2fMNDs_sPvWmqplOJCo';
    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

    try {
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: userInput 
                    }]
                }]
            })
        });

        if (!response.ok) {
            console.error('Response Error:', response.status, response.statusText);
            throw new Error('Failed to get response from Gemini API');
        }

        const data = await response.json();
        console.log("Full Gemini API response:", JSON.stringify(data, null, 2));
        if (data.error) {
            console.error("API Error:", data.error);
            return `Error: ${data.error.message}`;
        }

        if (data.candidates && data.candidates.length > 0) {
            const responseText = data.candidates[0].content.parts[0].text.trim(); 
            return responseText || 'Sorry, I didn’t get a proper response.';
        } else {
            return 'Sorry, no valid response from Gemini API.';
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        return 'Sorry, there was an error processing your request.'; 
    }
}


sendButton.addEventListener('click', async () => {
    const userMessage = chatbotInput.value.trim();
    if (userMessage === '') return; 
    displayChatMessage('User', userMessage);
    chatbotInput.value = ''; 
    const spinner = document.getElementById('loading-spinner');
    spinner.classList.remove('hidden');
    try {
        const geminiResponse = await getGeminiResponse(userMessage);
        displayChatMessage('Gemini', geminiResponse);
    } finally {
        spinner.classList.add('hidden'); 
    }
});
