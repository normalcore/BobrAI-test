const Telenode = require('telenode-js');
const axios = require('axios');

const db = require('./database')
require('dotenv').config();

// Bot Instance
const bot = new Telenode({
    apiToken: process.env.API_TOKEN,
});

// Start long polling
bot.startLongPolling();

// Calling OpenWeatherAPI
async function getWeather(region) {
    if (!region) {
        return "Пожалуйста, укажите регион. Пример: /weather London.";
    }
    const isValidRequest = /^[a-zA-Z0-9\s]+$/;
    if (!isValidRequest.test(region)) {
        return "Неверный запрос. Пожалуйста, не используйте специальные символы.";
    }
    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${region}&lang=ru`;
    try {
        const response = await axios.get(url);
        const weatherData = response.data.current;
        return `Температура: ${weatherData.temp_c}°C\nОщущается: ${weatherData.feelslike_c}°C\nВетер: ${weatherData.wind_kph}км/ч\nВлажность: ${weatherData.humidity}\n${weatherData.condition.text}\n`
    } catch (error) {
        return "Не получилось вернуть данные. Пожалуйста, проверьте правильность написания и существование указанного региона.";
    }
};

// Log function
function logUserRequest(userId, userReq, botRes) {
    db.run("INSERT INTO logs (user_id, user_request, bot_response, timestamp) VALUES ( ?, ?, ?, ? )", [userId.toString(), userReq.toString(), botRes.toString(), new Date().toISOString()], function (err) {
        if (err) {
            return console.error(err.message);
        }
    })
}

// Register weather command
bot.onTextMessage(/^\/weather ?(.*)$/, async (messageBody) => {
    const region = messageBody.text.split(" ")[1];
    const userId = messageBody.from.id;

    const weatherResponse = await getWeather(region);

    logUserRequest(userId, messageBody.text, weatherResponse)

    await bot.sendTextMessage(weatherResponse, messageBody.chat.id);
});

process.on('exit', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database: ' + err.message);
        } else {
            console.log('Database connection closed.');
        }
    });
});

module.exports = { logUserRequest, getWeather, bot }
