import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from '@tanstack/react-router';
import { Ion } from 'cesium';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { AppWrapper } from './AppWrapper';
import { StatsigInitializationProvider } from './providers';
import { type AppRouter, appRouter } from './router';

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN as string;

declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter;
  }
}

/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWrapper>
      <StatsigInitializationProvider>
        <RouterProvider router={appRouter} />
      </StatsigInitializationProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </AppWrapper>
  </React.StrictMode>,
);
