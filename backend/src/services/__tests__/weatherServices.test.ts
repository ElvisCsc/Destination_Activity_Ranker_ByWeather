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

        // Mock weather API response
        mockedFetchWeatherApi.mockResolvedValueOnce([{
            daily: jest.fn().mockReturnValue({
                time: jest.fn().mockReturnValue(1700000000),
                timeEnd: jest.fn().mockReturnValue(1700600000),
                interval: jest.fn().mockReturnValue(86400),
                variables: jest.fn().mockImplementation((index: number) => ({
                    valuesArray: jest.fn().mockReturnValue(
                        Array(7).fill(0).map((_, i) => {
                            switch (index) {
                                case 0:
                                    return 10 + i; // temperature
                                case 1:
                                    return i * 0.5; // rain
                                case 2:
                                    return 0; // snow
                                case 3:
                                    return 5 + i; // wind
                                case 4:
                                    return 1; // weather code (clear)
                                default:
                                    return 0;
                            }
                        })
                    )
                }))
            }),
            bb: null,
            bb_pos: 0,
            __init: function (i: number, bb: ByteBuffer): WeatherApiResponse {
                throw new Error("Function not implemented.");
            },
            latitude: function (): number {
                throw new Error("Function not implemented.");
            },
            longitude: function (): number {
                throw new Error("Function not implemented.");
            },
            elevation: function (): number {
                throw new Error("Function not implemented.");
            },
            generationTimeMilliseconds: function (): number {
                throw new Error("Function not implemented.");
            },
            locationId: function (): bigint {
                throw new Error("Function not implemented.");
            },
            model: function (): Model {
                throw new Error("Function not implemented.");
            },
            utcOffsetSeconds: function (): number {
                throw new Error("Function not implemented.");
            },
            timezone: function (): string | null {
                throw new Error("Function not implemented.");
            },
            timezoneAbbreviation: function (): string | null {
                throw new Error("Function not implemented.");
            },
            current: function (obj?: VariablesWithTime): VariablesWithTime | null {
                throw new Error("Function not implemented.");
            },
            hourly: function (obj?: VariablesWithTime): VariablesWithTime | null {
                throw new Error("Function not implemented.");
            },
            minutely15: function (obj?: VariablesWithTime): VariablesWithTime | null {
                throw new Error("Function not implemented.");
            },
            monthly: function (obj?: VariablesWithMonth): VariablesWithMonth | null {
                throw new Error("Function not implemented.");
            }
        }]);

        const result = await getActivityRankings('New York');

        expect(result.city).toBe('New York, USA');
        expect(result.rankings).toHaveLength(4);
        expect(result.rankings[0]).toHaveProperty('activity');
        expect(result.rankings[0]).toHaveProperty('score');
        expect(result.rankings[0]).toHaveProperty('rank');
    });

    it('throws GraphQLError for invalid city', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: [] });

        await expect(getActivityRankings('InvalidCity')).rejects.toThrow(
            new GraphQLError('City not found')
        );
    });

    it('handles geocoding API errors gracefully', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

        await expect(getActivityRankings('London')).rejects.toThrow(
            new GraphQLError('Failed to fetch geocoding data')
        );
    });

    it('throws error for invalid city', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: [] });

        await expect(getActivityRankings('InvalidCity')).rejects.toThrow('City not found');
    });

    it('handles API errors gracefully', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

        await expect(getActivityRankings('London')).rejects.toThrow();
    });
});
