import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { apiLimiter } from './middleware/rate-limit';
import { errorHandler } from './middleware/error-handler';
import healthRoutes from './routes/health-routes';
import fanRoutes from './routes/fan-routes';
import staffRoutes from './routes/staff-routes';
import stadiumRoutes from './routes/stadium-routes';

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Security Headers
// Helmet restricts potentially dangerous HTTP headers to prevent XSS, clickjacking, etc.
app.use(helmet());

// 2. CORS restrictions
// Restrict cross-origin requests to only the frontend Vite origin, blocking unauthorized web clients.
app.use(cors({
  origin: 'http://localhost:5173'
}));

// 3. Rate Limiter
// Prevents API and LLM abuse by capping requests per IP (20 req / minute).
app.use(apiLimiter);

// 4. JSON body parser with size limit
// Caps payload size at 10kb to defend against payload-bloat/DOS attacks
app.use(express.json({ limit: '10kb' }));

// 5. API Routes
app.use('/api', healthRoutes);
app.use('/api', fanRoutes);
app.use('/api', staffRoutes);
app.use('/api', stadiumRoutes);

// 6. Error Handler (Last middleware)
// Catches any unhandled errors and hides stack traces in production.
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
