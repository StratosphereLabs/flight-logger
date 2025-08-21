import classNames from 'classnames';
import {
  CardTitle,
  EyeIcon,
  StatDesc,
  StatTitle,
  StatValue,
} from 'stratosphere-ui';

import { type FlightsRouterOutput } from '../../../app/routes/flights';
import {
  BarometerIcon,
  DewpointIcon,
  TemperatureIcon,
  WindsockIcon,
} from '../../common/components';
import { trpc } from '../../utils/trpc';
import { CloudCoverChart } from './CloudCoverChart';
import { useCardClassNames } from './useCardClassNames';

export interface WeatherCardProps {
  data: NonNullable<
    FlightsRouterOutput['getExtraFlightData']['departureWeather']
  >;
}

export interface WeatherInfoProps {
  flightId: string;
}

export const WeatherCard = ({ data }: WeatherCardProps): JSX.Element => {
  const cardClassNames = useCardClassNames();
  return (
    <div className={classNames('flex flex-col gap-2', cardClassNames)}>
      <div className="flex items-center justify-between">
        <CardTitle className="text-base">{data.airportId} Weather</CardTitle>
        <div className="text-xs opacity-75">
          {new Date(data.obsTime).toLocaleString()}
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div className="flex flex-col gap-1 border-e-0 px-0 py-2">
          <StatTitle className="text-sm font-medium">Temp</StatTitle>
          <StatValue className="flex items-center text-2xl">
            <TemperatureIcon className="text-primary/90 h-8" />
            <span className="text-primary/80">{data.temp}°C</span>
          </StatValue>
        </div>
        <div className="flex flex-col gap-1 px-0 py-2">
          <StatTitle className="text-sm font-medium">Dewpoint</StatTitle>
          <StatValue className="flex items-center gap-1 text-2xl">
            <DewpointIcon className="text-secondary/90 h-8" />
            <span className="text-secondary/80">{data.dewp}°C</span>
          </StatValue>
        </div>
        <div className="flex flex-col gap-1 px-0 py-2">
          <StatTitle className="text-sm font-medium">Visibility</StatTitle>
          <StatValue className="justi flex items-center gap-1 text-2xl">
            <EyeIcon className="text-info/90 h-8" />
            <span className="text-info/80">{data.visib} sm</span>
          </StatValue>
        </div>
        <div className="flex flex-col gap-1 px-0 py-2">
          <StatTitle className="text-sm font-medium">Altimeter</StatTitle>
          <StatValue className="flex items-center gap-1 text-2xl">
            <BarometerIcon className="text-success/90 h-8" />
            <span className="text-success/80">{data.altim} hPa</span>
          </StatValue>
        </div>
      </div>
      <div className="flex flex-col gap-1 px-0 py-2">
        <StatTitle className="text-sm font-medium">Wind</StatTitle>
        <StatValue className="flex items-center gap-1 text-2xl">
          <WindsockIcon className="text-accent/90 h-8" />
          <span className="text-accent/80">
            {data.wdir}° @ {data.wspd} kts
          </span>
        </StatValue>
        {data.wgst > 0 && (
          <StatDesc className="flex items-center">
            <span className="font-medium">Gusts {data.wgst} kts</span>
          </StatDesc>
        )}
      </div>
      <div className="flex justify-between gap-2">
        <span className="text-sm font-medium opacity-75">Clouds</span>
        <span className="font-mono text-sm">
          {data.clouds
            .map(
              ({ cover, base }) => `${cover} ${base?.toLocaleString() ?? ''}`,
            )
            .join(' ')}
        </span>
      </div>
      <CloudCoverChart data={data} />
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium opacity-75">METAR</span>
        <span className="font-mono text-xs">{data.rawOb}</span>
      </div>
    </div>
  );
};

export const WeatherInfo = ({
  flightId,
}: WeatherInfoProps): JSX.Element | null => {
  const { data } = trpc.flights.getExtraFlightData.useQuery({
    flightId,
  });
  if (
    data === undefined ||
    (data.departureWeather === null && data.arrivalWeather === null)
  )
    return null;
  return (
    <div className="flex flex-col gap-3">
      {data.departureWeather !== null ? (
        <WeatherCard data={data.departureWeather} />
      ) : null}
      {data.arrivalWeather !== null ? (
        <WeatherCard data={data.arrivalWeather} />
      ) : null}
    </div>
  );
};
