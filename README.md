# Destination Activity Ranker by Weather

A scalable web app that ranks a city's desirability for activities (Skiing, Surfing, Outdoor/Indoor Sightseeing) over the next 7 days based on weather forecasts.

## Architecture Overview
- **Monorepo**: Yarn workspaces for backend/frontend—easy dev/shared deps.
- **Backend**: Node.js/TS with Apollo Server (GraphQL via Express). Fetches geocode (Nominatim) + forecast (Open-Meteo). Computes scores in modular utils. Caching (node-cache) for perf. Enums for type-safety. Errors as GraphQLError with codes.
- **Frontend**: React/TS with Apollo Client. Simple form/results UI. Queries GraphQL for rankings.
- **Data Flow**: City input → GraphQL query → Backend geocode/cache → forecast/cache → score/rank → response.
- 
## Setup and Running
1. Clone: `git clone https://github.com/ElvisCsc/Destination_Activity_Ranker_ByWeather.git && cd Destination_Activity_Ranker_ByWeather`.

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation & Running

**Option 1: Run from root (recommended)**
```bash
# Install all dependencies
npm run install:all

# Start both backend and frontend
npm run dev
