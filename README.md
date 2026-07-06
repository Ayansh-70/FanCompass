# FanCompass

FanCompass is a GenAI-powered multilingual accessibility assistant for FIFA World Cup 2026 stadium fans. It features a secondary operational-intelligence dashboard for venue staff. 

## Project Structure

- **frontend/**: React 18 + TypeScript + Vite
- **backend/**: Node.js + Express + TypeScript
- **docs/**: Architectural documentation

## Getting Started

1. Set up the backend environment:
   ```bash
   cd backend
   cp .env.example .env
   # Add your GEMINI_API_KEY
   ```

2. Install dependencies:
   ```bash
   # From the project root
   cd frontend && npm install
   cd ../backend && npm install
   cd .. && npm install
   ```

3. Run the development servers concurrently:
   ```bash
   # From the project root
   npm run dev
   ```
