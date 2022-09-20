import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import createError from 'http-errors';
import logger from 'morgan';
import path from 'path';

import { errorRequestHandler } from './utils';
import router from '../routes';

const app = express();

app.use(logger('dev'));
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', router);

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use((_, __, next) => {
  next(createError(404));
});

app.use(errorRequestHandler);

export default app;
