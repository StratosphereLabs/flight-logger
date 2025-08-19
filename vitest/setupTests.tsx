import { vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

vi.stubGlobal('APP_VERSION', '0.0.1');
vi.stubGlobal('APP_BUILD_NUMBER', '1234567');

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

const fetchMock = createFetchMock(vi);

fetchMock.enableMocks();
