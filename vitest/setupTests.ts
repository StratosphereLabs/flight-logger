import createFetchMock from 'vitest-fetch-mock';
import { vi } from 'vitest';

vi.stubGlobal('APP_VERSION', '0.0.1');
vi.stubGlobal('APP_BUILD_NUMBER', '1234567');

const fetchMock = createFetchMock(vi);

fetchMock.enableMocks();
