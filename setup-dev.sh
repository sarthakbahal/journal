#!/bin/bash

# Development setup script for AI Journal System

echo "🌟 Setting up AI Journal System for development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Setup backend
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ ! -f ".env" ]; then
    echo "📝 Creating backend .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your actual values:"
    echo "   - MONGO_URI (MongoDB Atlas connection)"
    echo "   - GROQ_API_KEY (Groq API key)"
else
    echo "✅ Backend .env file already exists"
fi

cd ..

# Setup frontend
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "🎉 Setup complete!"
echo ""
echo "🚀 To start development:"
echo "   1. Edit backend/.env with your API keys"
echo "   2. Start backend: cd backend && npm run dev"
echo "   3. Start frontend: cd frontend && npm run dev"
echo ""
echo "📚 Visit http://localhost:5173 to see the app"
echo "🔧 Backend API: http://localhost:5000"