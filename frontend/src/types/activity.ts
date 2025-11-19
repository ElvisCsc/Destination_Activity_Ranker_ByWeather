export enum ActivityType {
    SKIING = 'SKIING',
    SURFING = 'SURFING',
    OUTDOOR_SIGHTSEEING = 'OUTDOOR_SIGHTSEEING',
    INDOOR_SIGHTSEEING = 'INDOOR_SIGHTSEEING'
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

export interface GetActivityRankingsResponse {
    getActivityRankings: ActivityRankings;
}
