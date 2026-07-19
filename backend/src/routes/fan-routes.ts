import { Router, Request, Response, NextFunction } from 'express';
import { validateFanQuery } from '../middleware/validate-request';
import { getStadiumData } from '../data/stadium-loader';
import { generateCacheKey, getCachedResponse, setCachedResponse } from '../services/response-cache';
import { orchestrateFanQuery } from '../services/agents/orchestrator';

const router = Router();

router.post(
  '/fan/query',
  validateFanQuery,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query, context } = req.body;

      const stadiumData = getStadiumData();

      // Check Cache
      const cacheKey = generateCacheKey(query, context);
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      // Call orchestrator
      const result = await orchestrateFanQuery(query, context, stadiumData);

      // Cache and return
      setCachedResponse(cacheKey, result);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
