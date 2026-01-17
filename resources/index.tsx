import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { Ion } from 'cesium';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { AppWrapper } from './AppWrapper';
import { routeTree } from './routeTree';

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN as string;

const router = createRouter({
  routeTree,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWrapper>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </AppWrapper>
  </React.StrictMode>,
);
