import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './AppRouter';
import { AppWrapper } from './AppWrapper';
import './index.css';

/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppWrapper>
        <AppRouter />
        <ReactQueryDevtools initialIsOpen={false} />
      </AppWrapper>
    </BrowserRouter>
  </React.StrictMode>,
);
