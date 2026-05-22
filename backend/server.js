import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: env.nodeEnv === 'production' ? env.clientUrl : [env.clientUrl, 'http://localhost:4173'],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(rateLimit({
  windowMs: 60 * 1000,
  limit: 90,
  standardHeaders: 'draft-7',
  legacyHeaders: false
}));

app.use('/api', apiRouter);
app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Weather API running on port ${env.port}`);
});

