import { DailyForecast, ActivityType, ActivityRanking, WeatherCondition } from '../types/weather';

function computeRankings(dailyData: DailyForecast[], city: string): ActivityRanking[] {
    if (dailyData.length === 0) throw new Error('No forecast data');

    const activities = Object.values(ActivityType);
    const scores: Record<ActivityType, number> = {
        [ActivityType.SKIING]: 0,
        [ActivityType.SURFING]: 0,
        [ActivityType.OUTDOOR_SIGHTSEEING]: 0,
        [ActivityType.INDOOR_SIGHTSEEING]: 0
    };

    activities.forEach(activity => {
        let totalScore = 0;
        dailyData.forEach(day => {
            const { temp, rain, snow, wind_speed: wind, weather } = day;
            const tempMax = temp.max;
            const weatherCode = weather[0].id;
            const condition = mapWeatherCodeToCondition(weatherCode);

            let dailyScore = 0;

            switch (activity) {
                case ActivityType.SKIING:
                    dailyScore = calculateSkiingScore(tempMax, snow, wind, condition);
                    break;
                case ActivityType.SURFING:
                    dailyScore = calculateSurfingScore(tempMax, wind, rain, condition);
                    break;
                case ActivityType.OUTDOOR_SIGHTSEEING:
                    dailyScore = calculateOutdoorSightseeingScore(tempMax, rain, wind, condition);
                    break;
                case ActivityType.INDOOR_SIGHTSEEING:
                    const outdoorScore = calculateOutdoorSightseeingScore(tempMax, rain, wind, condition);
                    dailyScore = 1 - outdoorScore;
                    break;
            }
            totalScore += dailyScore;
        });
        scores[activity] = (totalScore / dailyData.length) * 100;
    });

    const sorted = activities.sort((a, b) => scores[b] - scores[a]);
    return sorted.map((activity, index) => ({
        activity,
        score: Math.round(scores[activity]),
        rank: index + 1,
        details: `Based on 7-day forecast for ${city}`,
    }));
}

function calculateSkiingScore(temp: number, snow: number, wind: number, condition: WeatherCondition): number {
    const tempScore = Math.max(0, (5 - temp) / 10); // Ideal: below 5°C
    const snowScore = Math.min(snow / 10, 1); // More snow is better
    const windScore = Math.max(0, (10 - wind) / 10); // Lower wind is better
    const conditionScore = condition === WeatherCondition.SNOW ? 1 :
        condition === WeatherCondition.CLEAR ? 0.8 : 0.5;

    return (tempScore * 0.3) + (snowScore * 0.4) + (windScore * 0.2) + (conditionScore * 0.1);
}

function calculateSurfingScore(temp: number, wind: number, rain: number, condition: WeatherCondition): number {
    const tempScore = Math.min(Math.max(temp - 15, 0) / 15, 1); // Ideal: above 15°C
    const windScore = Math.abs(wind - 8) < 4 ? 1 : Math.max(0, 1 - Math.abs(wind - 8) / 10); // Ideal: 4-12 m/s
    const rainScore = Math.max(0, 1 - rain / 10); // Less rain is better
    const conditionScore = condition !== WeatherCondition.THUNDERSTORM ? 0.8 : 0.2;

    return (tempScore * 0.3) + (windScore * 0.4) + (rainScore * 0.2) + (conditionScore * 0.1);
}

function calculateOutdoorSightseeingScore(temp: number, rain: number, wind: number, condition: WeatherCondition): number {
    const tempScore = Math.abs(temp - 20) < 10 ? 1 : Math.max(0, 1 - Math.abs(temp - 20) / 20); // Ideal: 10-30°C
    const rainScore = Math.max(0, 1 - rain / 5); // Less rain is better
    const windScore = Math.max(0, (15 - wind) / 15); // Lower wind is better
    const conditionScore = [WeatherCondition.CLEAR, WeatherCondition.CLOUDY].includes(condition) ? 1 :
        condition === WeatherCondition.FOG ? 0.4 : 0.2; // Fog is not great, rain is worse

    return (tempScore * 0.4) + (rainScore * 0.3) + (windScore * 0.2) + (conditionScore * 0.1);
}

function mapWeatherCodeToCondition(code: number): WeatherCondition {
    // WMO Weather interpretation codes (Open-Meteo)
    if (code === 0) return WeatherCondition.CLEAR;
    if (code >= 1 && code <= 3) return WeatherCondition.CLOUDY;
    if (code === 45 || code === 48) return WeatherCondition.FOG;
    if (code >= 51 && code <= 57) return WeatherCondition.RAIN;
    if (code >= 61 && code <= 67) return WeatherCondition.RAIN;
    if (code >= 71 && code <= 77) return WeatherCondition.SNOW;
    if (code >= 80 && code <= 82) return WeatherCondition.RAIN;
    if (code >= 85 && code <= 86) return WeatherCondition.SNOW;

    if (code === 95) return WeatherCondition.THUNDERSTORM;
    if (code >= 96 && code <= 99) return WeatherCondition.THUNDERSTORM;

    // Default to cloudy if unknown
    return WeatherCondition.CLOUDY;
}

export {
    computeRankings,
    calculateSkiingScore,
    calculateSurfingScore,
    calculateOutdoorSightseeingScore,
    mapWeatherCodeToCondition
};