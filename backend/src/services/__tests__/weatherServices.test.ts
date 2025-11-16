import { getActivityRankings } from '../weatherServices';
import axios from 'axios';
import { fetchWeatherApi } from 'openmeteo';

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
                                case 0: return 10 + i; // temperature
                                case 1: return i * 0.5; // rain
                                case 2: return 0; // snow
                                case 3: return 5 + i; // wind
                                case 4: return 1; // weather code (clear)
                                default: return 0;
                            }
                        })
                    )
                }))
            })
        }]);

        const result = await getActivityRankings('New York');

        expect(result.city).toBe('New York, USA');
        expect(result.rankings).toHaveLength(4);
        expect(result.rankings[0]).toHaveProperty('activity');
        expect(result.rankings[0]).toHaveProperty('score');
        expect(result.rankings[0]).toHaveProperty('rank');
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
