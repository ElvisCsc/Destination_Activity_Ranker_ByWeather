import { getActivityRankings } from './services/weatherService';

export const resolvers = {
    Query: {
        getActivityRankings: async (_: any, { city }: { city: string }) => {
            return await getActivityRankings(city);
        },
    },
};