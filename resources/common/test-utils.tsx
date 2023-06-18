import {
  render,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react';
import { type InitialEntry } from 'history';
import React, { type ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AppWrapper } from '../AppWrapper';

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
