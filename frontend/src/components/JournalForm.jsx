import React, { useState } from 'react';
import { journalAPI } from '../api/journalAPI';

const JournalForm = ({ onEntryCreated, currentUserId }) => {
  const [formData, setFormData] = useState({
    ambience: 'forest',
    text: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.text.trim()) {
      setError('Please write your journal entry');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const entryData = {
        userId: currentUserId,
        ambience: formData.ambience,
        text: formData.text.trim()
      };

      const newEntry = await journalAPI.createEntry(entryData);
      
      setSuccess('Journal entry saved successfully!');
      setFormData({ ambience: 'forest', text: '' });
      
      if (onEntryCreated) {
        onEntryCreated(newEntry);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save journal entry');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Write Your Journal Entry</h2>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="ambience">Nature Environment</label>
          <select
            id="ambience"
            value={formData.ambience}
            onChange={(e) => setFormData({ ...formData, ambience: e.target.value })}
          >
            <option value="forest">🌲 Forest</option>
            <option value="ocean">🌊 Ocean</option>
            <option value="mountain">🏔️ Mountain</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="journalText">How are you feeling after this nature session?</label>
          <textarea
            id="journalText"
            placeholder="Describe your thoughts and emotions..."
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            rows={6}
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-full"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Entry'}
        </button>
      </form>
    </div>
  );
};

export default JournalForm;