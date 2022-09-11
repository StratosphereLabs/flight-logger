import { expect, it } from 'vitest';
import App from '../App';
import { render } from '../common/test-utils';

it('renders app', () => {
  const { container } = render(<App />);
  expect(container).toMatchSnapshot();
});
