import React from 'react';

interface RankingData {
    city: string;
    rankings: {
        activity: string;
        score: number;
        rank: number;
        details: string;
    }[];
}

const RankingDisplay: React.FC<{ data: RankingData }> = ({ data }) => {
    const getActivityIcon = (activity: string) => {
        switch (activity) {
            case 'SKIING': return '⛷️';
            case 'SURFING': return '🏄';
            case 'OUTDOOR_SIGHTSEEING': return '🏞️';
            case 'INDOOR_SIGHTSEEING': return '🏛️';
            default: return '🎯';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'score-excellent';
        if (score >= 60) return 'score-good';
        if (score >= 40) return 'score-fair';
        return 'score-poor';
    };

    const formatActivityName = (activity: string) => {
        return activity.toLowerCase().replace(/_/g, ' ');
    };

    return (
        <div className="rankings-container">
            <h2>Activity Rankings for {data.city}</h2>
            <p className="rankings-subtitle">Based on 7-day weather forecast</p>

            <div className="rankings-grid">
                {data.rankings.map((ranking) => (
                    <div key={ranking.activity} className="ranking-card">
                        <div className="ranking-header">
                            <span className="activity-icon">{getActivityIcon(ranking.activity)}</span>
                            <div className="ranking-info">
                                <h3 className="activity-name">{formatActivityName(ranking.activity)}</h3>
                                <span className="rank-badge">Rank #{ranking.rank}</span>
                            </div>
                        </div>

                        <div className="score-section">
                            <div className={`score-display ${getScoreColor(ranking.score)}`}>
                                <span className="score-value">{ranking.score}</span>
                                <span className="score-label">/100</span>
                            </div>
                        </div>

                        <p className="ranking-details">{ranking.details}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RankingDisplay;
