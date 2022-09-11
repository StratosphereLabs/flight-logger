import cookieParser from 'cookie-parser';
import cors from 'cors';
import csrf from 'csurf';
import express from 'express';
import session from 'express-session';
import createError from 'http-errors';
import logger from 'morgan';
import passport from 'passport';
import path from 'path';

import { errorRequestHandler } from './utils';
import router from '../routes';

const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(csrf());
app.use(passport.authenticate('session'));

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/api', router);

app.use((_, __, next) => {
  next(createError(404));
});

app.use(errorRequestHandler);

export default app;
