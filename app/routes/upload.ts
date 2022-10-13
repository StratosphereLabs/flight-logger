import express from 'express';
import { Request } from 'express-jwt';
import multer from 'multer';
import { UserToken } from '../context';
import { authorizeToken, verifyAdminRest } from '../middleware';
import { saveFlightDiaryData } from '../parsers';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadRouter = express.Router();

uploadRouter.post(
  '/:username/flights/flightdiary',
  authorizeToken(true),
  verifyAdminRest,
  upload.single('file'),
  async (req: Request<UserToken>, res, next) => {
    const { file } = req;
    const username = req.params.username;
    try {
      const flights = await saveFlightDiaryData(username, file);
      res.status(200).json(flights);
    } catch (err) {
      next(err);
    }
  },
);
