import { computeRankings, calculateSkiingScore, calculateSurfingScore, calculateOutdoorSightseeingScore, mapWeatherCodeToCondition } from '../scoring';
import { ActivityType, WeatherCondition } from '../../types/weather';

describe('Scoring Utilities', () => {
    describe('mapWeatherCodeToCondition', () => {
        it('maps clear weather correctly', () => {
            expect(mapWeatherCodeToCondition(0)).toBe(WeatherCondition.CLEAR);
        });

        it('maps cloudy weather correctly', () => {
            expect(mapWeatherCodeToCondition(1)).toBe(WeatherCondition.CLOUDY);
            expect(mapWeatherCodeToCondition(3)).toBe(WeatherCondition.CLOUDY);
        });

        it('maps fog correctly', () => {
            expect(mapWeatherCodeToCondition(45)).toBe(WeatherCondition.FOG);
            expect(mapWeatherCodeToCondition(48)).toBe(WeatherCondition.FOG);
        });

        it('maps rain correctly', () => {
            expect(mapWeatherCodeToCondition(51)).toBe(WeatherCondition.RAIN);
            expect(mapWeatherCodeToCondition(65)).toBe(WeatherCondition.RAIN);
        });

        it('maps snow correctly', () => {
            expect(mapWeatherCodeToCondition(71)).toBe(WeatherCondition.SNOW);
            expect(mapWeatherCodeToCondition(77)).toBe(WeatherCondition.SNOW);
        });

        it('maps thunderstorms correctly', () => {
            expect(mapWeatherCodeToCondition(95)).toBe(WeatherCondition.THUNDERSTORM);
            expect(mapWeatherCodeToCondition(99)).toBe(WeatherCondition.THUNDERSTORM);
        });
    });

    describe('calculateSkiingScore', () => {
        it('gives high score for ideal skiing conditions', () => {
            const score = calculateSkiingScore(-5, 20, 3, WeatherCondition.SNOW);
            expect(score).toBeGreaterThan(0.8);
        });

        it('gives low score for warm weather', () => {
            const score = calculateSkiingScore(15, 20, 3, WeatherCondition.SNOW);
            expect(score).toBeLessThan(0.3);
        });

        it('gives low score for no snow', () => {
            const score = calculateSkiingScore(-5, 0, 3, WeatherCondition.SNOW);
            expect(score).toBeLessThan(0.6);
        });
    });

    describe('calculateSurfingScore', () => {
        it('gives high score for ideal surfing conditions', () => {
            const score = calculateSurfingScore(25, 8, 0, WeatherCondition.CLEAR);
            expect(score).toBeGreaterThan(0.8);
        });

        it('gives low score for no wind', () => {
            const score = calculateSurfingScore(25, 2, 0, WeatherCondition.CLEAR);
            expect(score).toBeLessThan(0.5);
        });

        it('gives low score for thunderstorms', () => {
            const score = calculateSurfingScore(25, 8, 0, WeatherCondition.THUNDERSTORM);
            expect(score).toBeLessThan(0.5);
        });
    });

    describe('calculateOutdoorSightseeingScore', () => {
        it('gives high score for perfect conditions', () => {
            const score = calculateOutdoorSightseeingScore(22, 0, 5, WeatherCondition.CLEAR);
            expect(score).toBeGreaterThan(0.9);
        });

        it('gives low score for heavy rain', () => {
            const score = calculateOutdoorSightseeingScore(22, 10, 5, WeatherCondition.RAIN);
            expect(score).toBeLessThan(0.5);
        });

        it('gives low score for extreme temperatures', () => {
            const coldScore = calculateOutdoorSightseeingScore(-10, 0, 5, WeatherCondition.CLEAR);
            const hotScore = calculateOutdoorSightseeingScore(40, 0, 5, WeatherCondition.CLEAR);
            expect(coldScore).toBeLessThan(0.4);
            expect(hotScore).toBeLessThan(0.4);
        });

        it('gives a mediocre score for fog', () => {
            const clearScore = calculateOutdoorSightseeingScore(22, 0, 5, WeatherCondition.CLEAR);
            const fogScore = calculateOutdoorSightseeingScore(22, 0, 5, WeatherCondition.FOG);
            const rainScore = calculateOutdoorSightseeingScore(22, 5, 5, WeatherCondition.RAIN);

            expect(fogScore).toBeLessThan(clearScore);
            expect(fogScore).toBeGreaterThan(rainScore);
        });
    });

    describe('computeRankings', () => {
        const mockDailyData = [
            {
                dt: 1700000000,
                temp: { max: -2 },
                rain: 0,
                snow: 25,
                wind_speed: 3,
                weather: [{ id: 71 }] // Snow
            },
            {
                dt: 1700086400,
                temp: { max: -1 },
                rain: 0,
                snow: 30,
                wind_speed: 2,
                weather: [{ id: 73 }] // Snow
            }
        ];

        it('ranks skiing highest in snowy conditions', () => {
            const rankings = computeRankings(mockDailyData, 'Test City');
            expect(rankings[0].activity).toBe(ActivityType.SKIING);
            expect(rankings[0].score).toBeGreaterThan(70);
        });

        it('returns all activity types', () => {
            const rankings = computeRankings(mockDailyData, 'Test City');
            const activityTypes = rankings.map(r => r.activity);
            expect(activityTypes).toContain(ActivityType.SKIING);
            expect(activityTypes).toContain(ActivityType.SURFING);
            expect(activityTypes).toContain(ActivityType.OUTDOOR_SIGHTSEEING);
            expect(activityTypes).toContain(ActivityType.INDOOR_SIGHTSEEING);
        });

        it('assigns proper ranks (1 to 4)', () => {
            const rankings = computeRankings(mockDailyData, 'Test City');
            const ranks = rankings.map(r => r.rank);
            expect(ranks).toEqual([1, 2, 3, 4]);
        });

        it('throws error for empty data', () => {
            expect(() => computeRankings([], 'Test City')).toThrow('No forecast data');
        });

        it('calculates scores between 0 and 100', () => {
            const rankings = computeRankings(mockDailyData, 'Test City');
            rankings.forEach(ranking => {
                expect(ranking.score).toBeGreaterThanOrEqual(0);
                expect(ranking.score).toBeLessThanOrEqual(100);
            });
        });
    });
});
