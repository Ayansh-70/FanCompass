# FanCompass

FanCompass is a GenAI-powered multilingual accessibility assistant for FIFA World Cup 2026 stadium fans. It features a secondary operational-intelligence dashboard for venue staff. 

## Project Structure

- **frontend/**: React 18 + TypeScript + Vite
- **backend/**: Node.js + Express + TypeScript
- **docs/**: Architectural documentation

## Design Choices

- **Decoupled Logic**: Both frontend and backend logic layers remain strictly decoupled from their frameworks. For example, the frontend's `useKickoffTimer.ts` utilizes no React lifecycle hooks (`useState`/`useEffect`). It operates as a thin wrapper around a pure deterministic calculation, ensuring it remains fully isolated, testable, and framework-agnostic.

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
