# FanCompass Architecture

FanCompass is a GenAI-powered multilingual accessibility assistant for FIFA World Cup 2026 stadium fans, with a secondary operational-intelligence dashboard for venue staff.

## Folder Structure

### Backend
- **`backend/src/config/`**: Contains environment variable validation and application-wide constants.
- **`backend/src/data/`**: Stores mock JSON data representing stadium gates, sections, and crowd density.
- **`backend/src/services/agents/`**: The multi-agent Gemini layer. This orchestrates specialized agents and isolates all Gemini API calls to this directory.
- **`backend/src/logic/`**: Pure decision-logic functions that do not involve LLM calls. These are kept separate to remain fully unit-testable.
- **`backend/src/routes/`**: Express API route definitions.
- **`backend/src/middleware/`**: Express middlewares such as rate limiting, input validation, and error handling.
- **`backend/src/types/`**: Shared TypeScript interfaces and schemas used across the backend.
- **`backend/src/server.ts`**: The entry point for the Express backend server.
- **`backend/tests/`**: Contains unit and integration tests.

### Frontend
- **`frontend/src/components/`**: Reusable React UI components.
- **`frontend/src/hooks/`**: Custom React hooks for state and side effects.
- **`frontend/src/types/`**: TypeScript interfaces and types for the frontend.
- **`frontend/src/styles/`**: Vanilla CSS files or other styling modules.
- **`frontend/src/App.tsx`**: The main React application component.
- **`frontend/vite.config.ts`**: Configuration for the Vite build tool.

### Docs
- **`docs/architecture.md`**: High-level documentation explaining the project structure and architectural decisions.
