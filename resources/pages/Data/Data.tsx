import { AircraftTypesCard } from './AircraftTypesCard';
import { AirlinesCard } from './AirlinesCard';
import { AirportsCard } from './AirportsCard';

export const Data = (): JSX.Element => (
  <div className="flex flex-1 flex-col gap-4 overflow-y-scroll p-2 scrollbar-none scrollbar-track-base-100 scrollbar-thumb-neutral sm:scrollbar">
    <AircraftTypesCard />
    <AirlinesCard />
    <AirportsCard />
  </div>
);
