import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  enum ActivityType {
    SKIING
    SURFING
    OUTDOOR_SIGHTSEEING
    INDOOR_SIGHTSEEING
  }

  type ActivityRanking {
    activity: ActivityType!
    score: Float!
    rank: Int!
    details: String
  }

  type ActivityRankings {
    city: String!
    rankings: [ActivityRanking!]!
  }

  type Query {
    getActivityRankings(city: String!): ActivityRankings
  }
`;
