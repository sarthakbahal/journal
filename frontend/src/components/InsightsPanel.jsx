import React from 'react';

const InsightsPanel = ({ insights, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card">
        <h2>Your Insights</h2>
        <div className="loading">Loading insights...</div>
      </div>
    );
  }

  if (!insights || insights.totalEntries === 0) {
    return (
      <div className="card">
        <h2>Your Insights</h2>
        <div className="empty-state">
          <p>Write a few journal entries to see your personalized insights!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Your Insights</h2>
      
      <div className="insights-grid">
        <div className="insight-item">
          <div className="insight-value">{insights.totalEntries}</div>
          <div className="insight-label">Total Entries</div>
        </div>

        {insights.topEmotion && (
          <div className="insight-item">
            <div className="insight-value" style={{ textTransform: 'capitalize' }}>
              {insights.topEmotion}
            </div>
            <div className="insight-label">Most Common Emotion</div>
          </div>
        )}

        {insights.mostUsedAmbience && (
          <div className="insight-item">
            <div className="insight-value" style={{ textTransform: 'capitalize' }}>
              {insights.mostUsedAmbience === 'forest' && '🌲'}
              {insights.mostUsedAmbience === 'ocean' && '🌊'}
              {insights.mostUsedAmbience === 'mountain' && '🏔️'}
              {' ' + insights.mostUsedAmbience}
            </div>
            <div className="insight-label">Favorite Environment</div>
          </div>
        )}
      </div>

      {insights.recentKeywords && insights.recentKeywords.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ marginBottom: '10px', fontSize: '1.1rem' }}>Recent Themes</h3>
          <div className="keyword-list">
            {insights.recentKeywords.map((keyword, index) => (
              <span key={index} className="keyword-tag">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsPanel;