/* eslint-disable @typescript-eslint/triple-slash-reference */

/// <reference types="vite/client" />

import { type router } from './AppRouter';

declare const APP_VERSION: string;
declare const APP_BUILD_NUMBER: string;

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
