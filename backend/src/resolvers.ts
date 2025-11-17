import { getActivityRankings } from './services/weatherServices';

export const resolvers = {
    Query: {
        getActivityRankings: async (_: any, { city }: { city: string }) => {
            try {
                return await getActivityRankings(city);
            } catch (error) {
                throw new Error(`Failed to fetch rankings: ${(error as Error).message}`);
            }
        },
    },
};
