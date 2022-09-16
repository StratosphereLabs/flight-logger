import { describe, expect, it } from 'vitest';
import App from '../App';
import { render } from '../common/test-utils';

describe('<App />', () => {
  it('renders login page', () => {
    const { container } = render(<App />, {
      initialEntries: ['/auth/login'],
    });
    expect(container).toMatchSnapshot();
  });

  it('renders profile page', () => {
    const { container } = render(<App />, {
      initialEntries: ['/profile'],
    });
    expect(container).toMatchSnapshot();
  });
});
