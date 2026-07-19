import { Router, Request, Response, NextFunction } from 'express';
import { validateStaffInsight } from '../middleware/validate-request';
import { getStadiumData } from '../data/stadium-loader';
import { orchestrateStaffQuery } from '../services/agents/orchestrator';

const router = Router();

// Mock authentication middleware
function authenticateStaff(req: Request, res: Response, next: NextFunction): void {
  // In a real app, verify JWT here. We check a dummy header for demonstration.
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer fancompass_staff_token') {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid staff token' });
    return;
  }
  next();
}

router.post(
  '/staff/insight',
  authenticateStaff,
  validateStaffInsight,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { minutes_to_kickoff, context } = req.body;

      const stadiumData = getStadiumData();
      const result = await orchestrateStaffQuery(context, stadiumData, minutes_to_kickoff);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
