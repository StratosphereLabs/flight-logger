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
import { AppTheme, useThemeStore } from '../../stores';
import { trpc } from '../../utils/trpc';
import { CloudCoverChart } from './CloudCoverChart';
import { useCardClassNames } from './useCardClassNames';

export interface WeatherCardProps {
  data: NonNullable<
    FlightsRouterOutput['getExtraFlightData']['departureWeather']
  >;
  airport: FlightsRouterOutput['getFlight']['departureAirport'];
}

export interface WeatherInfoProps {
  flightId: string;
}

export const WeatherCard = ({
  data,
  airport,
}: WeatherCardProps): JSX.Element => {
  const { theme } = useThemeStore();
  const cardClassNames = useCardClassNames();
  return (
    <div className={classNames('flex flex-col gap-3', cardClassNames)}>
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{airport.ident} Weather</CardTitle>
          <div className="text-xs opacity-75">
            {new Date(data.obsTime).toLocaleString(undefined, {
              timeZone: airport.timeZone,
            })}
          </div>
        </div>
        <div className="text-sm opacity-90">{airport.name}</div>
      </div>
      <div className="grid grid-cols-6">
        <div className="col-span-2 flex flex-col gap-1 py-1">
          <StatTitle className="text-sm font-medium">Temp</StatTitle>
          <StatValue className="flex items-center text-xl">
            <TemperatureIcon className="text-primary/90 h-6" />
            <span className="text-primary/80">{data.temp}°C</span>
          </StatValue>
        </div>
        <div className="col-span-2 flex flex-col gap-1 py-1">
          <StatTitle className="text-sm font-medium">Dewpoint</StatTitle>
          <StatValue className="flex items-center gap-1 text-xl">
            <DewpointIcon className="text-secondary/90 h-6" />
            <span className="text-secondary/80">{data.dewp}°C</span>
          </StatValue>
        </div>
        <div className="col-span-2 flex flex-col gap-1 py-1">
          <StatTitle className="text-sm font-medium">Visibility</StatTitle>
          <StatValue className="flex items-center gap-1 text-xl">
            <EyeIcon
              className={classNames(
                'text-accent/90 h-6',
                theme === AppTheme.ABYSS && 'brightness-200',
              )}
            />
            <span
              className={classNames(
                'text-accent/80',
                theme === AppTheme.ABYSS && 'brightness-200',
              )}
            >
              {data.visib} sm
            </span>
          </StatValue>
        </div>
        <div className="col-span-3 flex flex-col gap-1 py-1">
          <StatTitle className="text-sm font-medium">Altimeter</StatTitle>
          <StatValue className="flex items-center gap-1 text-xl">
            <BarometerIcon className="text-success/90 h-6" />
            <span className="text-success/80">{data.altim} hPa</span>
          </StatValue>
        </div>
        <div className="col-span-3 flex flex-col gap-1 py-1">
          <StatTitle className="text-sm font-medium">Wind</StatTitle>
          <StatValue className="flex items-center gap-1 text-xl">
            <WindsockIcon className="text-info/90 h-6" />
            <span className="text-info/80">
              {data.wdir}° @ {data.wspd} kts
            </span>
          </StatValue>
          {data.wgst > 0 && (
            <StatDesc className="flex items-center">
              <span className="font-medium">Gusts {data.wgst} kts</span>
            </StatDesc>
          )}
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex justify-between gap-3">
          <span className="text-sm font-medium opacity-60">Clouds</span>
          <span className="text-right font-mono text-sm">
            {data.clouds
              .map(
                ({ cover, base }) => `${cover} ${base?.toLocaleString() ?? ''}`,
              )
              .join(' ')}
          </span>
        </div>
        <CloudCoverChart data={data} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium opacity-60">METAR</span>
        <span className="font-mono text-xs">{data.rawOb}</span>
      </div>
    </div>
  );
};

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
