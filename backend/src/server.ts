import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'FanCompass Backend' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
