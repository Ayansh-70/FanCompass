# FanCompass: Multilingual & Accessibility Fan Assistant

**🚀 Live Deployment:** [https://fan-compass.vercel.app/](https://fan-compass.vercel.app/)

FanCompass is a dual-interface application designed to enhance the stadium experience for fans while providing real-time operational intelligence to stadium staff. 

## 1. Chosen Vertical

We selected the **Multilingual & Accessibility Fan Assistant (with an Operational Intelligence layer)** vertical. This maps directly to multiple problem statement categories:
- **Navigation & Accessibility:** Fans receive context-aware, accessible routing that filters out inappropriate paths (e.g., stairs for wheelchair users).
- **Multilingual Assistance:** Fans can ask questions in their native language and receive localized responses, removing language barriers.
- **Operational Intelligence:** A dedicated Staff Dashboard aggregates live crowd density and kickoff proximity, allowing volunteers and security to proactively reroute fans.

## 2. Approach & Architecture

### LLM Explains, Doesn't Decide
The core architectural principle of FanCompass is the strict separation of logic and presentation. **The LLM does not make routing or safety decisions.**

Instead, we employ a **deterministic decision-logic layer**. This layer ingests real-time crowd data, stadium topology, and fan accessibility needs to calculate the mathematically optimal route and urgency score. 

Once the decision is made, the **agent layer** acts purely as a translator and communicator. It takes the deterministic JSON output and phrases it naturally for the fan in their requested language. This guarantees that hallucination cannot impact physical safety or routing correctness. We explicitly verify this boundary via automated test coverage (`orchestrator.test.ts`), ensuring the LLM is physically incapable of inventing routes.

### How It Works
```text
[ Fan / Staff Query ] 
        │
        ▼
[ Deterministic Logic Layer ] ── (Calculates routes, checks accessibility, measures crowd density)
        │
        ▼ JSON payload of absolute truth
[ Agent Phrasing Layer ] ── (Translates and formats for natural reading/listening)
        │
        ▼
[ Structured Response to Client ]
```

## 3. Setup Instructions

### Prerequisites
- Node.js (v20+)
- A Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ayansh-70/FanCompass.git
   cd FanCompass
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Add your GEMINI_API_KEY to .env
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env.local
   npm run dev
   ```

## 4. Notable Design Choices

- **Explainable Reasoning Trails:** The LLM explicitly includes the "why" in its responses (e.g., "I'm routing you to West Gate because North Gate is congested"), establishing trust.
- **Predictive Congestion Modeling:** The logic engine doesn't just look at current density; it increases the perceived urgency as kickoff approaches, encouraging fans to move early.
- **Voice Input/Output:** Integrated Web Speech API enables hands-free operation and accessibility for visually impaired fans.
- **Offline Resilience & Fallbacks:** If the Gemini API times out or fails, the system falls back to a deterministic, structured JSON response with hardcoded routing, ensuring fans never receive a blank screen.
- **Intelligent Response Caching:** Duplicate queries (same context, rounded kickoff time, and sorted accessibility needs) hit a cache layer, saving LLM calls and drastically reducing latency.
- **Continuous Integration (CI):** A robust GitHub Actions pipeline type-checks the codebase and runs the isolated test suite on every PR, protecting the logic layer from regressions.

## 5. Assumptions Made

- **Mock Stadium Data:** In place of live venue systems, the application uses mock stadium topology and dynamic deterministic generators.
- **No Staff Auth:** For demo scope, the Staff Dashboard does not require authentication. In a real-world scenario, this route would be gated behind SSO/RBAC.
- **Simulated Crowd Density:** Crowd data is generated deterministically rather than pulled from live camera/turnstile feeds.
- **Client-side Kickoff Clock:** `minutes_to_kickoff` is derived from a user-supplied input for the hackathon context, rather than integrating with an official match-clock API.

## 6. Security Considerations

A comprehensive security audit (Phase 9) was performed prior to submission:
1. **Environment Variables:** `.env` is explicitly git-ignored. No secrets were ever committed to version control.
2. **Safe Examples:** `.env.example` contains only placeholder values.
3. **Middleware:** `helmet()`, `cors()`, rate limiting (20/min), and payload size limits (10kb) are strictly enforced in `server.ts`.
4. **CORS:** Cross-Origin requests dynamically read from `process.env.FRONTEND_ORIGIN`, defaulting locally but allowing lockdown in production.
5. **No PII Leaks:** Backend logs never print Fan queries, accessibility needs, or raw LLM transcripts.
6. **Error Handling:** `errorHandler` swallows stack traces and prevents internal architectural details from leaking to the client. An audit of all `new Error()` calls confirmed no user queries are interpolated into error messages.
7. **Clean Dependencies:** `npm audit` on both frontend and backend report 0 vulnerabilities.
8. **Frontend Isolation:** The frontend is completely decoupled from the LLM. It has no access to the `GEMINI_API_KEY`.
9. **Cache Segregation:** The SHA-256 cache key specifically sorts and includes `accessibility_needs`, guaranteeing responses aren't mistakenly shared between users with conflicting mobility requirements.
10. **CI Isolation:** The CI workflow executes completely offline via mock injection, ensuring no API keys are required or exposed in the runner.
11. **Gitignore Integrity:** All build artifacts, logs, and OS files are excluded, with no overly broad wildcards blocking legitimate code.

## 7. Testing

FanCompass relies on a strict testing regimen to guarantee safety:
- **Deterministic Logic Tests:** Every core logic function (urgency calculation, congestion prediction, accessibility filtering) is heavily unit-tested.
- **Agent Boundary Tests:** `orchestrator.test.ts` proves the API can withstand prompt injection attacks.
- **Fail-Fast Defenses:** Tests prove that missing API keys crash the system securely at startup, and timeouts seamlessly trigger deterministic fallbacks.
- **CI/CD:** Every push and PR must pass 45+ isolated backend tests and complete a strict `tsc --noEmit` type-check before merging.
