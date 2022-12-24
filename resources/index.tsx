import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './AppRouter';
import { AppWrapper } from './AppWrapper';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppWrapper>
        <AppRouter />
        <ReactQueryDevtools initialIsOpen={false} />
      </AppWrapper>
    </BrowserRouter>
  </React.StrictMode>,
);
