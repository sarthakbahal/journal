import React, { useState } from 'react';
import { journalAPI } from '../api/journalAPI';

const EntriesList = ({ entries, onEntryUpdated }) => {
  const [analyzingId, setAnalyzingId] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyzeEmotion = async (entry) => {
    if (!entry.text) return;

    setAnalyzingId(entry._id);
    setError('');

    try {
      const analysis = await journalAPI.analyzeEmotion(entry.text);
      
      // Update the entry with analysis results
      const updatedEntry = await journalAPI.updateEntryWithAnalysis(entry._id, analysis);
      
      if (onEntryUpdated) {
        onEntryUpdated(updatedEntry);
      }
    } catch (err) {
      setError(`Failed to analyze entry: ${err.response?.data?.error || err.message}`);
    } finally {
      setAnalyzingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasFallbackAnalysis = (entry) => {
    return entry.emotion === 'neutral'
      && entry.summary === 'Unable to analyze this entry at the moment';
  };

  if (entries.length === 0) {
    return (
      <div className="card">
        <h2>Your Journal Entries</h2>
        <div className="empty-state">
          <p>No journal entries yet. Start writing to see your entries here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Your Journal Entries ({entries.length})</h2>
      
      {error && <div className="error">{error}</div>}

      <div className="entries-list">
        {entries.map((entry) => (
          <div key={entry._id} className="entry-card">
            <div className="entry-header">
              <span className="entry-date">{formatDate(entry.createdAt)}</span>
              <span className={`ambience-tag ambience-${entry.ambience}`}>
                {entry.ambience === 'forest' && '🌲 Forest'}
                {entry.ambience === 'ocean' && '🌊 Ocean'}
                {entry.ambience === 'mountain' && '🏔️ Mountain'}
              </span>
            </div>

            <div className="entry-text">{entry.text}</div>

            {(entry.emotion || entry.keywords?.length > 0 || entry.summary) && (
              <div className="entry-analysis">
                {entry.emotion && (
                  <div>
                    <span className="emotion-tag">{entry.emotion}</span>
                  </div>
                )}
                {entry.summary && (
                  <div style={{ margin: '8px 0', fontStyle: 'italic' }}>
                    "{entry.summary}"
                  </div>
                )}
                {entry.keywords?.length > 0 && (
                  <div className="keywords">
                    <strong>Keywords:</strong> {entry.keywords.join(', ')}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => handleAnalyzeEmotion(entry)}
              className="btn btn-secondary"
              disabled={analyzingId === entry._id}
              style={{ marginTop: '10px', fontSize: '14px', padding: '8px 16px' }}
            >
              {analyzingId === entry._id
                ? 'Analyzing...'
                : hasFallbackAnalysis(entry)
                  ? 'Retry Analysis'
                  : entry.emotion || entry.summary || entry.keywords?.length > 0
                    ? 'Re-analyze Emotion'
                    : 'Analyze Emotion'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EntriesList;