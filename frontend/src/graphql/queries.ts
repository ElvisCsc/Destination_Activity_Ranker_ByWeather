import { gql } from '@apollo/client';

export const GET_ACTIVITY_RANKINGS = gql`
  query GetActivityRankings($city: String!) {
    getActivityRankings(city: $city) {
      city
      rankings {
        activity
        score
        rank
        details
      }
    }
  }
`;
