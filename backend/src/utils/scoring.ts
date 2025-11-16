interface DailyForecast {
    dt: number;
    temp: { max: number; min: number };
    weather: [{ id: number }];
    rain?: number;
    snow?: number;
    wind_speed: number;
}

type Activity = 'Skiing' | 'Surfing' | 'Outdoor sightseeing' | 'Indoor sightseeing';

interface Ranking {
    activity: Activity;
    score: number;
    rank: number;
    details: string;
}

export function computeRankings(dailyData: DailyForecast[], city: string): Ranking[] {
    const activities: Activity[] = ['Skiing', 'Surfing', 'Outdoor sightseeing', 'Indoor sightseeing'];
    const scores: Record<Activity, number> = {} as Record<Activity, number>;

    activities.forEach(activity => {
        let totalScore = 0;

        dailyData.forEach(day => {
            const { temp, rain = 0, snow = 0, wind_speed: wind, weather } = day;
            const tempMax = temp.max;
            const weatherCode = weather[0].id;

            let dailyScore = 0;
            switch (activity) {
                case 'Skiing':
                    dailyScore = 0.4 * Math.max(0, (5 - tempMax) / 5) + 0.4 * Math.min(snow / 10, 1) + 0.2 * Math.max(0, (5 - wind) / 5);
                    break;
                case 'Surfing':
                    dailyScore = 0.4 * Math.min(Math.max(tempMax - 15, 0) / 10, 1) + 0.3 * (Math.abs(wind - 6) < 2 ? 1 : Math.max(0, 1 - Math.abs(wind - 6) / 4)) + 0.3 * Math.max(0, 1 - rain / 5);
                    break;
                case 'Outdoor sightseeing':
                    dailyScore = 0.3 * (Math.abs(tempMax - 20) < 5 ? 1 : Math.max(0, 1 - Math.abs(tempMax - 20) / 10)) + 0.3 * (1 - rain / 5) + 0.2 * Math.max(0, (5 - wind) / 5) + 0.2 * (weatherCode < 300 ? 1 : 0.5);
                    break;
                case 'Indoor sightseeing':
                    dailyScore = 1 - (0.3 * (Math.abs(tempMax - 20) < 5 ? 1 : Math.max(0, 1 - Math.abs(tempMax - 20) / 10)) + 0.3 * (1 - rain / 5) + 0.2 * Math.max(0, (5 - wind) / 5) + 0.2 * (weatherCode < 300 ? 1 : 0.5)); // Inverse outdoor
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
        details: `Average score over 7 days for ${city}`,
    }));
}