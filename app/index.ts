import * as trpcExpress from '@trpc/server/adapters/express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import createError from 'http-errors';
import logger from 'morgan';
import path from 'path';

import { createContext } from './context';
import { errorRequestHandler } from './middleware';
import { authRouter, trpcRouter, uploadRouter } from './routes';

const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'dist')));

app.use('/rest/auth', authRouter);
app.use('/rest/upload', uploadRouter);

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: trpcRouter,
    createContext,
  }),
);

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.use((_, __, next) => {
  next(createError(404));
});

app.use(errorRequestHandler);

export default app;
