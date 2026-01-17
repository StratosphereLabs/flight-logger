import { RouterProvider, createRouter } from '@tanstack/react-router';
import { describe, expect, it, vi } from 'vitest';

import { render } from '../common/test-utils';
import { routeTree } from '../routeTree';

const router = createRouter({
  routeTree,
});

vi.mock('@nivo/bar', () => ({
  ResponsiveBar: () => <div data-testid="mock-bar-chart" />,
}));

vi.mock('@nivo/line', () => ({
  ResponsiveLine: () => <div data-testid="mock-line-chart" />,
}));

vi.mock('@nivo/pie', () => ({
  ResponsivePie: () => <div data-testid="mock-pie-chart" />,
}));

vi.mock('@nivo/radar', () => ({
  ResponsiveRadar: () => <div data-testid="mock-radar-chart" />,
}));

describe.skip('<App />', () => {
  it('renders login page', () => {
    const { container } = render(<RouterProvider router={router} />);
    expect(container).toMatchSnapshot();
  });

  it('renders profile page', () => {
    const { container } = render(<RouterProvider router={router} />);
    expect(container).toMatchSnapshot();
  });
});
