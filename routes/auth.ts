import express from 'express';
import {
  generateUserToken,
  upsertUser,
  verifyGoogleAuthToken,
} from '../app/auth';

const router = express.Router();

router.post(
  '/google/callback',
  verifyGoogleAuthToken,
  upsertUser,
  generateUserToken,
);

export default router;
