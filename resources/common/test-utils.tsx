import React, { FC, ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { AppWrapper } from '../AppWrapper';

const AllTheProviders: FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AppWrapper>{children}</AppWrapper>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult => render(ui, { wrapper: AllTheProviders, ...options });

/* eslint-disable import/export */
export * from '@testing-library/react';

export { customRender as render };
