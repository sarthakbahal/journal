const express = require('express');
const JournalController = require('../controllers/journalController');

const router = express.Router();

// POST /api/journal - Create a new journal entry
router.post('/', JournalController.createEntry);

// GET /api/journal/:userId - Get all entries for a user
router.get('/:userId', JournalController.getUserEntries);

// POST /api/journal/analyze - Analyze journal text emotion
router.post('/analyze', JournalController.analyzeEmotion);

// GET /api/journal/insights/:userId - Get user insights
router.get('/insights/:userId', JournalController.getUserInsights);

// PUT /api/journal/:entryId/analysis - Update entry with analysis
router.put('/:entryId/analysis', JournalController.updateEntryWithAnalysis);

module.exports = router;