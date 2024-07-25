import { AircraftTypesCard } from './AircraftTypesCard';
import { AirlinesCard } from './AirlinesCard';
import { AirportsCard } from './AirportsCard';

export const Data = (): JSX.Element => (
  <div className="mt-16 flex flex-1 flex-col gap-4 p-2 sm:p-3">
    <AircraftTypesCard />
    <AirlinesCard />
    <AirportsCard />
  </div>
);
