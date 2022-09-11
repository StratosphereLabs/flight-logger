/* eslint-disable @typescript-eslint/triple-slash-reference */

/// <reference types="vite/client" />

import type { user } from '@prisma/client';

declare global {
  namespace Express {
    interface User extends user {}
  }
}
