const Journal = require('../models/Journal');
const LLMService = require('../services/llmService');

class JournalController {
  
  // Create a new journal entry
  static async createEntry(req, res) {
    try {
      const { userId, ambience, text } = req.body;

      // Validate required fields
      if (!userId || !ambience || !text) {
        return res.status(400).json({ 
          error: 'Missing required fields: userId, ambience, text' 
        });
      }

      // Validate ambience value
      const validAmbiences = ['forest', 'ocean', 'mountain'];
      if (!validAmbiences.includes(ambience)) {
        return res.status(400).json({ 
          error: 'Ambience must be one of: forest, ocean, mountain' 
        });
      }

      // Create the journal entry
      const journal = new Journal({
        userId,
        ambience,
        text
      });

      const savedJournal = await journal.save();
      
      res.status(201).json(savedJournal);
    } catch (error) {
      console.error('Error creating journal entry:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all entries for a specific user
  static async getUserEntries(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const entries = await Journal.find({ userId })
        .sort({ createdAt: -1 })
        .lean();

      res.json(entries);
    } catch (error) {
      console.error('Error fetching user entries:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Analyze journal text using LLM
  static async analyzeEmotion(req, res) {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'Text is required for analysis' });
      }

      const analysis = await LLMService.analyzeJournalText(text);
      
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      res.status(500).json({ error: 'Failed to analyze emotion' });
    }
  }

  // Get insights for a specific user
  static async getUserInsights(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Get all user entries
      const entries = await Journal.find({ userId }).lean();

      if (entries.length === 0) {
        return res.json({
          totalEntries: 0,
          topEmotion: null,
          mostUsedAmbience: null,
          recentKeywords: []
        });
      }

      // Calculate insights
      const totalEntries = entries.length;

      // Find most common emotion
      const emotions = entries
        .filter(entry => entry.emotion)
        .map(entry => entry.emotion);
      
      const emotionCounts = emotions.reduce((acc, emotion) => {
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
      }, {});

      const topEmotion = Object.keys(emotionCounts).length > 0 
        ? Object.keys(emotionCounts).reduce((a, b) => 
            emotionCounts[a] > emotionCounts[b] ? a : b
          )
        : null;

      // Find most used ambience
      const ambienceCounts = entries.reduce((acc, entry) => {
        acc[entry.ambience] = (acc[entry.ambience] || 0) + 1;
        return acc;
      }, {});

      const mostUsedAmbience = Object.keys(ambienceCounts).reduce((a, b) => 
        ambienceCounts[a] > ambienceCounts[b] ? a : b
      );

      // Get recent keywords from last 5 entries
      const recentEntries = entries
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      const recentKeywords = [...new Set(
        recentEntries
          .flatMap(entry => entry.keywords || [])
          .filter(keyword => keyword && keyword.trim().length > 0)
      )];

      res.json({
        totalEntries,
        topEmotion,
        mostUsedAmbience,
        recentKeywords
      });

    } catch (error) {
      console.error('Error getting user insights:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update an existing journal entry with analysis results
  static async updateEntryWithAnalysis(req, res) {
    try {
      const { entryId } = req.params;
      const { emotion, keywords, summary } = req.body;

      const updatedEntry = await Journal.findByIdAndUpdate(
        entryId,
        { emotion, keywords, summary },
        { new: true }
      );

      if (!updatedEntry) {
        return res.status(404).json({ error: 'Journal entry not found' });
      }

      res.json(updatedEntry);
    } catch (error) {
      console.error('Error updating journal entry:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = JournalController;