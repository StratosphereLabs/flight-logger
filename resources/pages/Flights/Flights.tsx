import { FlightsCard } from '../../blocks';
import { useProtectedPage } from '../../common/hooks';

export const Flights = (): JSX.Element => {
  useProtectedPage();
  return <FlightsCard />;
};
