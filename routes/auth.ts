import express from 'express';
import { verifyToken } from '../app/auth';

export interface GoogleAuthPayload {
  credential: string;
  g_csrf_token: string;
}

const router = express.Router();

router.post(
  '/google/callback',
  (req, _, next) => {
    const response = req.body as GoogleAuthPayload;
    const cookies = req.cookies as Record<string, string>;
    const csrfTokenCookie = cookies.g_csrf_token;
    if (csrfTokenCookie === undefined) {
      next(new Error('No CSRF token in Cookie'));
    }
    const googleCsrfToken = response.g_csrf_token;
    if (googleCsrfToken === undefined) {
      next(new Error('No CSRF token in post body'));
    }
    if (csrfTokenCookie !== googleCsrfToken) {
      next(new Error('Failed to verify double submit cookie'));
    }
    next();
  },
  async (req, res, next) => {
    const response = req.body as GoogleAuthPayload;
    try {
      const user = await verifyToken(response.credential);
      if (user === undefined) {
        throw new Error('Unable to verify token');
      }
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
