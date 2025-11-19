import React, { useState } from 'react';
import { useLazyQuery, gql } from '@apollo/client';
import RankingDisplay from './components/RankingDisplay';
import { GET_ACTIVITY_RANKINGS } from './graphql/queries';
import { GetActivityRankingsResponse } from './types/activity';
import './App.css';

function App() {
    const [city, setCity] = useState('');
    const [getRankings, { loading, error, data }] = useLazyQuery<GetActivityRankingsResponse>(
        GET_ACTIVITY_RANKINGS
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (city.trim()) {
            try {
                await getRankings({ variables: { city: city.trim() } });
            } catch (err) {
                console.error('Query error:', err);
            }
        }
    };

    const handleRetry = () => {
        if (city.trim()) {
            getRankings({ variables: { city: city.trim() } });
        }
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>Weather Activity Ranker</h1>
                <p>Discover the best activities based on 7-day weather forecasts</p>
            </header>

            <main className="app-main">
                <form onSubmit={handleSubmit} className="search-form">
                    <div className="search-input-group">
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Enter city or town (e.g., Cape Town, London, Tokyo)"
                            className="search-input"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !city.trim()}
                            className="search-button"
                        >
                            {loading ? 'Searching...' : 'Get Rankings'}
                        </button>
                    </div>
                </form>

                {loading && (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading activity rankings for {city}...</p>
                    </div>
                )}

                {error && (
                    <div className="error-state">
                        <div className="error-icon">⚠️</div>
                        <h3>Something went wrong</h3>
                        <p>{error.message}</p>
                        <button onClick={handleRetry} className="retry-button">
                            Try Again
                        </button>
                    </div>
                )}

                {data && <RankingDisplay data={data.getActivityRankings} />}

                {!data && !loading && !error && (
                    <div className="welcome-message">
                        <h2>Welcome</h2>
                        <p>Enter a city name above to see activity rankings based on the upcoming 7-day weather forecast.</p>
                        <div className="features-grid">
                            <div className="feature">
                                <span className="feature-icon">⛷️</span>
                                <span>Skiing Conditions</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">🏄</span>
                                <span>Surfing Potential</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">🏞️</span>
                                <span>Outdoor Sightseeing</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">🏛️</span>
                                <span>Indoor Activities</span>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
