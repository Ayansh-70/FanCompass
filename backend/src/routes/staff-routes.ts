import { Router, Request, Response, NextFunction } from 'express';
import { validateStaffInsight } from '../middleware/validate-request';
import { getStadiumData } from '../data/stadium-loader';
import { orchestrateStaffQuery } from '../services/agents/orchestrator';

const router = Router();

router.post('/staff/insight', validateStaffInsight, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { minutes_to_kickoff, context } = req.body;
    
    const stadiumData = getStadiumData();
    const result = await orchestrateStaffQuery(context, stadiumData, minutes_to_kickoff);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
