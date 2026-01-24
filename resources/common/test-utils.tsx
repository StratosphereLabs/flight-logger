import {
  type RenderOptions,
  type RenderResult,
  render,
} from '@testing-library/react';
import { type ReactElement } from 'react';

import { AppWrapper } from '../AppWrapper';

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult =>
  render(ui, {
    wrapper: ({ children }) => <AppWrapper>{children}</AppWrapper>,
    ...options,
  });

/* eslint-disable import/export */
export * from '@testing-library/react';

export { customRender as render };
