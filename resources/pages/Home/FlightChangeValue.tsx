import type {
  airport,
  aircraft_type,
  airline,
  FlightChangeField,
} from '@prisma/client';
import { formatInTimeZone } from 'date-fns-tz';
import { type FlightsRouterOutput } from '../../../app/routes/flights';
import { type FlightUpdateChangeWithData } from '../../../app/utils';
import { DATE_FORMAT, TIME_FORMAT_12H } from './constants';

export interface FlightChangeValueProps {
  className?: string;
  field: FlightChangeField;
  flightData: FlightsRouterOutput['getFlightChangelog']['results'][number];
  value: FlightUpdateChangeWithData['oldValue'];
}

export const FlightChangeValue = ({
  className,
  field,
  flightData,
  value,
}: FlightChangeValueProps): JSX.Element | null => {
  switch (field) {
    case 'AIRCRAFT_TYPE': {
      const data = value as unknown as aircraft_type | null;
      return data !== null ? (
        <div className={className}>{data.icao}</div>
      ) : null;
    }
    case 'ARRIVAL_AIRPORT':
    case 'DEPARTURE_AIRPORT':
    case 'DIVERSION_AIRPORT': {
      const data = value as unknown as airport | null;
      return data !== null ? (
        <div className={className}>{data.ident}</div>
      ) : null;
    }
    case 'AIRLINE':
    case 'OPERATOR_AIRLINE': {
      const data = value as unknown as airline | null;
      return data !== null ? (
        <div className={className}>{data.iata}</div>
      ) : null;
    }
    case 'OUT_TIME':
    case 'OUT_TIME_ACTUAL':
    case 'OFF_TIME':
    case 'OFF_TIME_ACTUAL': {
      const data = value as unknown as string | null;
      const formattedTime =
        data !== null
          ? formatInTimeZone(
              data,
              flightData.departureAirport?.timeZone ?? 'UTC',
              `${DATE_FORMAT} ${TIME_FORMAT_12H}`,
            )
          : null;
      return (
        <div className={className}>
          {formattedTime}{' '}
          {formattedTime !== null && flightData.departureAirport === null
            ? 'UTC'
            : null}
        </div>
      );
    }
    case 'ON_TIME':
    case 'ON_TIME_ACTUAL':
    case 'IN_TIME':
    case 'IN_TIME_ACTUAL': {
      const data = value as unknown as string | null;
      const formattedTime =
        data !== null
          ? formatInTimeZone(
              data,
              flightData.arrivalAirport?.timeZone ?? 'UTC',
              `${DATE_FORMAT} ${TIME_FORMAT_12H}`,
            )
          : null;
      return (
        <div className={className}>
          {formattedTime}{' '}
          {formattedTime !== null && flightData.arrivalAirport === null
            ? 'UTC'
            : null}
        </div>
      );
    }
    default: {
      const data = value as string;
      return <div className={className}>{data}</div>;
    }
  }
};
