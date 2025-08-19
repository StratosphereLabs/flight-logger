import { describe, expect, it, vi } from 'vitest';

import { AppRouter } from '../AppRouter';
import { render } from '../common/test-utils';

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
    const { container } = render(<AppRouter />, {
      initialEntries: ['/auth/login'],
    });
    expect(container).toMatchSnapshot();
  });

  it('renders profile page', () => {
    const { container } = render(<AppRouter />, {
      initialEntries: ['/'],
    });
    expect(container).toMatchSnapshot();
  });
});
