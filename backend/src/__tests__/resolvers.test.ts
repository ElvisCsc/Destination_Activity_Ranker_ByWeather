import { resolvers } from '../resolvers';
import { getActivityRankings } from '../services/weatherServices';
import { GraphQLError } from 'graphql';

// Mock the service layer
jest.mock('../services/weatherServices');

const mockedGetActivityRankings = getActivityRankings as jest.Mock;

describe('GraphQL Resolvers', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Query: getActivityRankings', () => {

        it('returns rankings from the service', async () => {
            const mockRankings = { city: 'Test City', rankings: [] };
            mockedGetActivityRankings.mockResolvedValue(mockRankings);

            const result = await resolvers.Query.getActivityRankings(null, { city: 'Test City' });

            expect(result).toEqual(mockRankings);
            expect(mockedGetActivityRankings).toHaveBeenCalledWith('Test City');
        });

        it('throws GraphQLError if city is not found', async () => {
            const mockError = new GraphQLError('City not found', {
                extensions: { code: 'CITY_NOT_FOUND' },
            });
            mockedGetActivityRankings.mockRejectedValue(mockError);

            await expect(
                resolvers.Query.getActivityRankings(null, { city: 'Invalid City' })
            ).rejects.toThrow(mockError);
        });
    });
});
