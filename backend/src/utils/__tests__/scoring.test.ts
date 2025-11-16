import { computeRankings } from '../scoring';

describe('computeRankings', () => {
    const fakeDailyData = [
        // Mock 7 days of data (adjust to your DailyForecast interface)
        {
            temperature_2m_max: 0,
            rain_sum: 0,
            snowfall_sum: 5,
            wind_speed_10m_max: 3,
            weather_code: 200,
        },
    ];

    it('ranks skiing high in cold/snowy weather', () => {
        const rankings = computeRankings(fakeDailyData as any, 'Test City');
        expect(rankings[0].activity).toBe('Skiing');
        expect(rankings[0].score).toBeGreaterThan(70);
    });

    it('handles no data gracefully', () => {
        expect(() => computeRankings([], 'Test City')).toThrow('No forecast data');
    });
});