import { FlightsCard } from '../../blocks';
import { useProtectedPage } from '../../common/hooks';

export const Flights = (): JSX.Element => {
  useProtectedPage();
  return (
    <div className="flex flex-1 flex-col gap-3 p-3">
      <FlightsCard />
    </div>
  );
};
