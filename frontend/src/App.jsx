import React, { useState, useEffect } from 'react';
import JournalForm from './components/JournalForm';
import EntriesList from './components/EntriesList';
import InsightsPanel from './components/InsightsPanel';
import { journalAPI } from './api/journalAPI';

function App() {
  const [entries, setEntries] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [error, setError] = useState('');

  // For demo purposes, using a fixed user ID
  // In a real app, this would come from authentication
  const currentUserId = 'demo-user-123';

  const loadUserData = async () => {
    try {
      setIsLoadingEntries(true);
      setIsLoadingInsights(true);
      setError('');

      const [entriesData, insightsData] = await Promise.all([
        journalAPI.getUserEntries(currentUserId),
        journalAPI.getUserInsights(currentUserId)
      ]);

      setEntries(entriesData);
      setInsights(insightsData);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load your journal data. Please refresh the page.');
    } finally {
      setIsLoadingEntries(false);
      setIsLoadingInsights(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleEntryCreated = (newEntry) => {
    setEntries(prev => [newEntry, ...prev]);
    // Refresh insights after new entry
    loadInsights();
  };

  const handleEntryUpdated = (updatedEntry) => {
    setEntries(prev => 
      prev.map(entry => 
        entry._id === updatedEntry._id ? updatedEntry : entry
      )
    );
    // Refresh insights after analysis
    loadInsights();
  };

  const loadInsights = async () => {
    try {
      const insightsData = await journalAPI.getUserInsights(currentUserId);
      setInsights(insightsData);
    } catch (err) {
      console.error('Error loading insights:', err);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>AI-Assisted Journal</h1>
        <p>Reflect on your nature experiences and discover insights about your well-being</p>
      </header>

      {error && (
        <div className="error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="main-content">
        <div>
          <JournalForm 
            onEntryCreated={handleEntryCreated}
            currentUserId={currentUserId}
          />
          
          <div style={{ marginTop: '30px' }}>
            <InsightsPanel 
              insights={insights}
              isLoading={isLoadingInsights}
            />
          </div>
        </div>

        <div>
          {isLoadingEntries ? (
            <div className="card">
              <h2>Your Journal Entries</h2>
              <div className="loading">Loading your entries...</div>
            </div>
          ) : (
            <EntriesList 
              entries={entries}
              onEntryUpdated={handleEntryUpdated}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;