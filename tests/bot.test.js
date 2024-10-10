const Telenode = require('telenode-js');
const axios = require('axios');
const db = require('../database');
const { getWeather, logUserRequest, bot } = require('../bot');

jest.mock('axios');
jest.mock('../database')

describe('Weather Bot Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getWeather function', () => {
        it('should return a prompt if no region is provided', async () => {
            const result = await getWeather('');
            expect(result).toBe("Пожалуйста, укажите регион. Пример: /weather London.");
        });

        it('should return an error message for invalid region', async () => {
            const result = await getWeather('!@#$');
            expect(result).toBe("Неверный запрос. Пожалуйста, не используйте специальные символы.");
        });

        it('should return weather data for a valid region', async () => {
            const mockResponse = {
                data: {
                    current: {
                        temp_c: 20,
                        feelslike_c: 18,
                        wind_kph: 15,
                        humidity: 60,
                        condition: { text: 'Солнечно' }
                    }
                }
            };
            axios.get.mockResolvedValue(mockResponse);

            const result = await getWeather('London');
            expect(result).toBe(
                `Температура: 20°C\nОщущается: 18°C\nВетер: 15км/ч\nВлажность: 60\nСолнечно\n`
            );
            expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('London'));
        });

        it('should return an error message if the API request fails', async () => {
            axios.get.mockRejectedValue(new Error('Network Error'));

            const result = await getWeather('London');
            expect(result).toBe("Не получилось вернуть данные. Пожалуйста, проверьте правильность написания и существование указанного региона.");
        });
    });

    describe('logUserRequest function', () => {
        it('should log user request to the database', () => {
            const userId = 123;
            const userReq = '/weather London';
            const botRes = 'some response';
    
            logUserRequest(userId, userReq, botRes);
            
            const dbCall = db.run.mock.calls[0];
            
            // Check the first argument (the SQL query)
            expect(dbCall[0]).toBe("INSERT INTO logs (user_id, user_request, bot_response, timestamp) VALUES ( ?, ?, ?, ? )");
    
            // Check the second argument (the parameters array)
            const params = dbCall[1];
            expect(params).toEqual(expect.arrayContaining([
                userId.toString(),
                userReq.toString(),
                botRes.toString(),
            ]));
    
            // Validate that the last parameter is a valid ISO string
            expect(new Date(params[3])).toBeInstanceOf(Date);
            expect(new Date(params[3]).toISOString()).toEqual(expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/));
        });

        it('should log an error if the database operation fails', () => {
            const userId = 123;
            const userReq = '/weather London';
            const botRes = 'some response';
            db.run.mockImplementationOnce((query, params, callback) => callback(new Error('Database Error')));

            console.error = jest.fn(); // Mock console.error to capture the error output

            logUserRequest(userId, userReq, botRes);
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Database Error'));
        });
    });
});