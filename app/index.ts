import cookieParser from 'cookie-parser';
import express, { ErrorRequestHandler } from 'express';
import createError, { HttpError } from 'http-errors';
import logger from 'morgan';
import path from 'path';

import indexRouter from '../routes/index';
import usersRouter from '../routes/users';

const app = express();

const errorRequestHandler: ErrorRequestHandler = (err: HttpError, req, res) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status ?? 500);
  res.render('error');
};

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use((req, res, next) => {
  next(createError(404));
});

app.use(errorRequestHandler);

export default app;
