import express from 'express';
import { Request } from 'express-jwt';
import createHttpError from 'http-errors';
import multer from 'multer';
import { UserToken } from '../context';
import { authorizeToken } from '../middleware';
import { saveFlightDiaryData } from '../parsers';
import { deleteAllUserFlights } from '../utils';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadRouter = express.Router();

uploadRouter.post(
  '/flights/flightdiary',
  authorizeToken(true),
  upload.single('file'),
  async (req: Request<UserToken>, res, next) => {
    const { file } = req;
    const userId = req.auth?.id;
    if (userId === undefined) {
      return next(createHttpError(401, 'Unauthorized.'));
    }
    try {
      const result = await saveFlightDiaryData(userId, file);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
);
