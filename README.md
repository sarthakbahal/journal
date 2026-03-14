# AI-Assisted Journal System

A production-quality web application that allows users to write journal entries after nature sessions and gain insights about their mental state through AI-powered emotional analysis.

## 🌟 Overview

This application helps users:
- Write journal entries after immersive nature experiences (forest, ocean, mountain)
- Analyze emotions and extract keywords using AI (Groq API with Llama 3)
- Track mental health insights and patterns over time
- View personalized analytics about their journaling habits

## 🛠 Tech Stack

**Backend:**
- Node.js & Express.js
- MongoDB Atlas with Mongoose
- Groq API (Llama 3 model)
- Rate limiting & caching

**Frontend:**
- React 18 with Vite
- Axios for API calls
- Modern CSS (no frameworks)

**Additional Features:**
- Docker support
- Error handling middleware
- Response caching
- Environment configuration

## 📋 Prerequisites

Before running this application, ensure you have:
- Node.js 16+ installed
- MongoDB Atlas account
- Groq API account and API key

## ⚙️ Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend/` directory.

**Getting your API keys:**

1. **MongoDB Atlas:**
   - Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a cluster
   - Get connection string from "Connect" > "Connect your application"

2. **Groq API:**
   - Create account at [Groq Console](https://console.groq.com/)
   - Generate API key in the dashboard
   - Free tier available with rate limits

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd journal
```

### 2. Backend Setup

```bash
# Install backend dependencies
cd backend
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your actual values

# Start backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd frontend
npm install

# Start frontend development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Verify Setup

- Backend health check: `http://localhost:5000/health`
- Frontend: `http://localhost:5173`

## 📡 API Endpoints

### Journal Endpoints

#### Create Journal Entry
```
POST /api/journal
Content-Type: application/json

{
  "userId": "demo-user-123",
  "ambience": "forest",
  "text": "I felt incredibly peaceful walking through the forest today..."
}

Response:
{
  "_id": "...",
  "userId": "demo-user-123",
  "ambience": "forest",
  "text": "I felt incredibly peaceful...",
  "emotion": null,
  "keywords": [],
  "summary": null,
  "createdAt": "2024-03-13T10:30:00.000Z"
}
```

#### Get User Entries
```
GET /api/journal/:userId

Response:
[
  {
    "_id": "...",
    "userId": "demo-user-123",
    "ambience": "forest",
    "text": "Today's session was amazing...",
    "emotion": "calm",
    "keywords": ["nature", "peace", "reflection"],
    "summary": "User experienced deep relaxation",
    "createdAt": "2024-03-13T10:30:00.000Z"
  }
]
```

#### Analyze Journal Emotion
```
POST /api/journal/analyze
Content-Type: application/json

{
  "text": "I felt calm and peaceful after my forest walk today"
}

Response:
{
  "emotion": "calm",
  "keywords": ["forest", "peaceful", "nature"],
  "summary": "User experienced tranquility during forest session"
}
```

#### Get User Insights
```
GET /api/journal/insights/:userId

Response:
{
  "totalEntries": 15,
  "topEmotion": "peaceful",
  "mostUsedAmbience": "forest",
  "recentKeywords": ["nature", "calm", "reflection", "trees", "mindfulness"]
}
```

### Health Check
```
GET /health

Response:
{
  "status": "OK",
  "timestamp": "2024-03-13T10:30:00.000Z",
  "environment": "development"
}
```

## 🏗 Architecture

### Backend Structure
```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   └── journalController.js # Business logic
├── models/
│   └── Journal.js           # Database schema
├── routes/
│   └── journalRoutes.js     # API endpoints
├── services/
│   └── llmService.js        # Groq API integration
├── utils/
│   └── errorHandler.js      # Error middleware
├── server.js                # Application entry point
├── package.json
├── Dockerfile
└── .env.example
```

### Frontend Structure
```
frontend/
├── src/
│   ├── api/
│   │   └── journalAPI.js    # API client
│   ├── components/
│   │   ├── JournalForm.jsx
│   │   ├── EntriesList.jsx
│   │   └── InsightsPanel.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── index.html
```

## 🐳 Docker Support

### Build Backend Container
```bash
cd backend
docker build -t journal-backend .
```

### Run Backend Container
```bash
docker run -p 5000:5000 \
  -e MONGO_URI="your_mongo_uri" \
  -e GROQ_API_KEY="your_groq_key" \
  journal-backend
```

## 🔧 Development

### Available Scripts

**Backend:**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality

The application follows these practices:
- **MVC Architecture** - Clear separation of concerns
- **Error Handling** - Comprehensive error middleware
- **Caching** - LLM response caching to reduce costs
- **Rate Limiting** - Protection against abuse
- **Input Validation** - Request validation and sanitization

## 🧪 Testing

### Manual Testing Checklist

1. **Backend API Testing:**
   ```bash
   # Test health endpoint
   curl http://localhost:5000/health
   
   # Test journal creation
   curl -X POST http://localhost:5000/api/journal \
     -H "Content-Type: application/json" \
     -d '{"userId":"test","ambience":"forest","text":"test entry"}'
   ```

2. **Frontend Testing:**
   - Create journal entries
   - Analyze emotions
   - View insights
   - Responsive design

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Verify MONGO_URI in .env
   - Check network access in MongoDB Atlas
   - Ensure correct username/password

2. **Groq API Errors**
   - Verify GROQ_API_KEY in .env
   - Check API rate limits
   - Ensure account has credit

3. **CORS Errors**
   - Ensure CLIENT_URL matches frontend URL
   - Check if both servers are running

4. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   npx kill-port 5000
   ```

## 📈 Performance Optimization

- **LLM Response Caching** - Reduces API costs by 60-80%
- **Database Indexing** - Fast queries on userId and date
- **Rate Limiting** - Prevents API abuse
- **Optimistic Updates** - Responsive UI interactions

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.