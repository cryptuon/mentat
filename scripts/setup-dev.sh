#!/bin/bash

# Mentat Protocol - Development Environment Setup Script
# This script helps set up both backend and frontend for local development

set -e

echo "🚀 Mentat Protocol - Development Setup"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Node.js $(node --version)"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found. Please install Python 3.11+${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Python $(python3 --version)"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} PostgreSQL client not found. Make sure PostgreSQL is installed."
else
    echo -e "${GREEN}✓${NC} PostgreSQL $(psql --version)"
fi

echo ""

# Setup Backend
echo "🔧 Setting up Backend..."
cd apps/backend

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating backend .env file..."
    cp .env.example .env
    echo -e "${YELLOW}⚠${NC} Please update apps/backend/.env with your database credentials"
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo -e "${GREEN}✓${NC} Backend setup complete"
echo ""

# Setup Frontend
echo "🎨 Setting up Frontend..."
cd ../web

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating frontend .env file..."
    cp .env.example .env
fi

# Install Node dependencies
echo "📦 Installing Node dependencies..."
npm install

echo -e "${GREEN}✓${NC} Frontend setup complete"
echo ""

# Database setup instructions
echo "📊 Database Setup"
echo "================="
echo "Run these commands to set up your database:"
echo ""
echo "  createdb mentat_dev"
echo "  cd apps/backend"
echo "  aerich init-db"
echo ""

# Final instructions
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "To start development:"
echo ""
echo "1. Start the backend:"
echo "   cd apps/backend"
echo "   make dev"
echo "   # or: uvicorn src.main:app --reload"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd apps/web"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "📚 See INTEGRATION.md for detailed documentation"
echo ""
