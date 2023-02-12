import { AircraftTypesCard } from './AircraftTypesCard';
import { AirlinesCard } from './AirlinesCard';
import { AirportsCard } from './AirportsCard';

export const Data = (): JSX.Element => (
  <div className="flex flex-1 flex-col gap-3 p-3">
    <AircraftTypesCard />
    <AirlinesCard />
    <AirportsCard />
  </div>
);
