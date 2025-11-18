import { Model } from "@openmeteo/sdk/model";
import { VariablesWithMonth } from "@openmeteo/sdk/variables-with-month";
import { VariablesWithTime } from "@openmeteo/sdk/variables-with-time";
import { WeatherApiResponse } from "@openmeteo/sdk/weather-api-response";
import {getActivityRankings} from '../weatherServices';
import axios from 'axios';
import {ByteBuffer} from "flatbuffers";
import {fetchWeatherApi} from 'openmeteo';
import {GraphQLError} from "graphql";

// Mock dependencies
jest.mock('axios');
jest.mock('openmeteo');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedFetchWeatherApi = fetchWeatherApi as jest.MockedFunction<typeof fetchWeatherApi>;

describe('Weather Services', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns activity rankings for valid city', async () => {
        // Mock geocoding response
        mockedAxios.get.mockResolvedValueOnce({
            data: [{
                lat: '40.7128',
                lon: '-74.0060',
                display_name: 'New York, USA'
            }]
        });

        // Define the mock Daily object structure to satisfy the destructuring in weatherServices.ts
        const mockDaily = {
            // These should return numbers for the mock time values
            time: jest.fn().mockReturnValue(1700000000), // Start time in ms
            timeEnd: jest.fn().mockReturnValue(1700000000 + (7 * 86400 * 1000)), // End time for 7 days
            interval: jest.fn().mockReturnValue(86400 * 1000), // Interval in ms (1 day)

            // This is the array of values (temperatures, rain, etc.)
            variables: jest.fn().mockImplementation((index: number) => ({
                valuesArray: jest.fn().mockReturnValue(
                    Array(7).fill(0).map((_, i) => {
                        switch (index) {
                            case 0: // temperature_2m_max
                                return 10 + i;
                            case 1: // rain_sum
                                return i * 0.5;
                            case 2: // snowfall_sum
                                return 0;
                            case 3: // wind_speed_10m_max
                                return 5 + i;
                            case 4: // weather_code
                                return 1; // 1 = mainly clear
                            default:
                                return 0;
                        }
                    })
                )
            }))
        };
        // Mock weather API response
        mockedFetchWeatherApi.mockResolvedValueOnce([{
            daily: jest.fn().mockReturnValue(mockDaily),
            bb: null,
            bb_pos: 0,
            __init: jest.fn(),
            latitude: jest.fn(),
            longitude: jest.fn(),
            elevation: jest.fn(),
            generationTimeMilliseconds: jest.fn(),
            locationId: jest.fn(),
            model: jest.fn(),
            utcOffsetSeconds: jest.fn(),
            timezone: jest.fn(),
            timezoneAbbreviation: jest.fn(),
            current: jest.fn(),
            hourly: jest.fn(),
            minutely15: jest.fn(),
            monthly: jest.fn()
        } as unknown as WeatherApiResponse]);

        const result = await getActivityRankings('New York');

        expect(result.city).toBe('New York, USA');
        expect(result.rankings).toHaveLength(4);
        expect(result.rankings[0]).toHaveProperty('activity');
        expect(result.rankings[0]).toHaveProperty('score');
        expect(result.rankings[0]).toHaveProperty('rank');
    });

    it('throws GraphQLError for invalid city', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: [] });
        await expect(getActivityRankings('InvalidCity'))
            .rejects.toThrow('City not found');
    });

    it('handles geocoding API errors gracefully', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

        await expect(getActivityRankings('London')).rejects.toThrow(
            new GraphQLError('Failed to fetch geocoding data')
        );
    });

    it('handles API errors gracefully', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

        await expect(getActivityRankings('London')).rejects.toThrow();
    });
});
