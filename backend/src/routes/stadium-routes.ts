import { Router, Request, Response, NextFunction } from 'express';
import { getStadiumData } from '../data/stadium-loader';

const router = Router();

router.get('/stadium/gates', (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const data = getStadiumData();
    res.json(data.gates);
  } catch (error) {
    next(error);
  }
});

export default router;
