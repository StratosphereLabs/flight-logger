import express from 'express';

import { verifyGoogleAuthToken } from '../middleware';

export const authRouter = express.Router();

authRouter.post('/google/authenticate', verifyGoogleAuthToken);
