export enum ActivityType {
    SKIING = 'SKIING',
    SURFING = 'SURFING',
    OUTDOOR_SIGHTSEEING = 'OUTDOOR_SIGHTSEEING',
    INDOOR_SIGHTSEEING = 'INDOOR_SIGHTSEEING'
}

export enum WeatherCondition {
    CLEAR = 0,
    CLOUDY = 1,
    FOG = 2,
    DRIZZLE = 3,
    RAIN = 4,
    SNOW = 5,
    THUNDERSTORM = 6
}

export interface DailyForecast {
    dt: number;
    temp: { max: number };
    rain: number;
    snow: number;
    wind_speed: number;
    weather: { id: number }[];
}

export interface ActivityRanking {
    activity: ActivityType;
    score: number;
    rank: number;
    details: string;
}

export interface ActivityRankings {
    city: string;
    rankings: ActivityRanking[];
}

export interface GeocodeResponse {
    lat: string;
    lon: string;
    display_name: string;
}
