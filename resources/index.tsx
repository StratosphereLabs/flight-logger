import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { router } from './AppRouter';
import { AppWrapper } from './AppWrapper';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppWrapper>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </AppWrapper>
  </React.StrictMode>,
);
