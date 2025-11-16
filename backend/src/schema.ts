import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type ActivityRanking {
    activity: String!
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