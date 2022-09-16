import { InitialEntry } from 'history';
import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { AppWrapper } from '../AppWrapper';
import { MemoryRouter } from 'react-router-dom';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: InitialEntry[];
}

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions,
): RenderResult =>
  render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={options?.initialEntries}>
        <AppWrapper>{children}</AppWrapper>
      </MemoryRouter>
    ),
    ...options,
  });

/* eslint-disable import/export */
export * from '@testing-library/react';

export { customRender as render };
