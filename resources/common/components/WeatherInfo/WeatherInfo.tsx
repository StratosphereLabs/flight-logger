import { trpc } from '../../../utils/trpc';
import { WeatherCard } from './WeatherCard';

export interface WeatherInfoProps {
  flightId: string;
}

export const WeatherInfo = ({
  flightId,
}: WeatherInfoProps): JSX.Element | null => {
  const { data: flightData } = trpc.flights.getFlight.useQuery({
    id: flightId,
  });
  const { data } = trpc.flights.getExtraFlightData.useQuery({
    flightId,
  });
  if (
    flightData === undefined ||
    data === undefined ||
    (data.departureWeather === null && data.arrivalWeather === null)
  )
    return null;
  return (
    <div className="flex flex-col gap-3">
      {data.departureWeather !== null ? (
        <WeatherCard
          data={data.departureWeather}
          airport={flightData.departureAirport}
        />
      ) : null}
      {data.arrivalWeather !== null ? (
        <WeatherCard
          data={data.arrivalWeather}
          airport={flightData.arrivalAirport}
        />
      ) : null}
    </div>
  );
};
