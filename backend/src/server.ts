import express from 'express';
import type { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  console.log(`Health check requested at ${req.path}`);
  res.json({ status: 'ok', service: 'FanCompass Backend' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
