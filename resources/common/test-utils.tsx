import {
  render,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react';
import { type InitialEntry } from 'history';
import { type ReactElement } from 'react';
import { AppWrapper } from '../AppWrapper';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: InitialEntry[];
}

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions,
): RenderResult =>
  render(ui, {
    wrapper: AppWrapper,
    ...options,
  });

/* eslint-disable import/export */
export * from '@testing-library/react';

export { customRender as render };
