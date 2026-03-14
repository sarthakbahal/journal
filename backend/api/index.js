require('dotenv').config();

const app = require('../app');
const connectDB = require('../config/database');

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Vercel function error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
};