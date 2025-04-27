import classNames from 'classnames';
import { CardTitle } from 'stratosphere-ui';

import { type FlightsRouterOutput } from '../../../app/routes/flights';
import { trpc } from '../../utils/trpc';

export interface WeatherCardProps {
  className?: string;
  data: NonNullable<
    FlightsRouterOutput['getExtraFlightData']['departureWeather']
  >;
}

export interface WeatherInfoProps {
  flightId: string;
}

export const WeatherCard = ({
  className,
  data,
}: WeatherCardProps): JSX.Element => (
  <div className={classNames('flex flex-col gap-2', className)}>
    <div className="flex items-center justify-between">
      <CardTitle>{data.airportId} Weather</CardTitle>
      <div className="text-xs opacity-75">
        {new Date(data.obsTime).toLocaleString()}
      </div>
    </div>

    <div className="space-y-2 opacity-75">
      {/* Temperature */}
      <div className="flex items-center justify-between">
        <span className="font-medium">Temperature:</span>
        <span className="text-lg font-semibold text-blue-600">
          {data.temp}°C
        </span>
      </div>

      {/* Dewpoint */}
      <div className="flex items-center justify-between">
        <span className="font-medium">Dewpoint:</span>
        <span className="text-base">{data.dewp}°C</span>
      </div>

      {/* Wind */}
      <div className="flex items-center justify-between">
        <span className="font-medium">Wind:</span>
        <span className="text-base">
          {data.wdir}° at {data.wspd} kts
        </span>
      </div>

      {/* Gusts */}
      {data.wgst > 0 && (
        <div className="flex items-center justify-between">
          <span className="font-medium">Gusts:</span>
          <span className="text-base">{data.wgst} kts</span>
        </div>
      )}

      {/* Visibility */}
      <div className="flex items-center justify-between">
        <span className="font-medium">Visibility:</span>
        <span className="text-base">{data.visib} sm</span>
      </div>

      {/* Altimeter */}
      <div className="flex items-center justify-between">
        <span className="font-medium">Altimeter:</span>
        <span className="text-base">{data.altim} hPa</span>
      </div>

      {/* Clouds */}
      <div className="flex items-center justify-between">
        <span className="font-medium">Clouds:</span>
        <span className="text-right text-base">
          {data.clouds
            .map(
              ({ cover, base }) => `${cover} ${base?.toLocaleString() ?? ''}`,
            )
            .join(' ')}
        </span>
      </div>

      {/* METAR */}
      <div className="flex items-center justify-between gap-4">
        <span className="font-medium">METAR:</span>
        <span className="text-right font-mono text-xs">{data.rawOb}</span>
      </div>
    </div>
  </div>
);

export const WeatherInfo = ({
  flightId,
}: WeatherInfoProps): JSX.Element | null => {
  const { data } = trpc.flights.getExtraFlightData.useQuery({
    flightId,
  });
  if (data === undefined) return null;
  return (
    <div className="flex flex-col gap-4">
      {data.departureWeather !== null ? (
        <WeatherCard data={data.departureWeather} />
      ) : null}
      {data.arrivalWeather !== null ? (
        <WeatherCard data={data.arrivalWeather} />
      ) : null}
    </div>
  );
};
