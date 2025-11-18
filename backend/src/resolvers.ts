import { getActivityRankings } from './services/weatherServices';

export const resolvers = {
    Query: {
        getActivityRankings: async (_: any, { city }: { city: string }) => {
            return await getActivityRankings(city);
        },
    },
};
