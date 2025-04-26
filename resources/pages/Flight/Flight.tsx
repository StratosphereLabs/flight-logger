import { useParams } from 'react-router-dom';

import {
  FlightChangelogTable,
  OnTimePerformanceChart,
  WeatherInfo,
} from '../../common/components';

export const Flight = (): JSX.Element | null => {
  const { flightId } = useParams();
  if (flightId === undefined) return null;
  return (
    <div className="mt-24">
      <OnTimePerformanceChart flightId={flightId} />
      <WeatherInfo flightId={flightId} />
      <FlightChangelogTable flightId={flightId} />
    </div>
  );
};
