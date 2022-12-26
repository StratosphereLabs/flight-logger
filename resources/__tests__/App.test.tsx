import { describe, expect, it } from 'vitest';
import { AppRouter } from '../AppRouter';
import { render } from '../common/test-utils';

describe('<App />', () => {
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
