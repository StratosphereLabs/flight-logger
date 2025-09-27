import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

import { DATE_FORMAT_ISO } from '../../constants';
import type { FetchFlightDataParams } from '../types';
import { fetchData } from './fetchData';
import type { FlightStatsFlight } from './types';

export const fetchFlightStatsFlightData = async ({
  airline,
  arrivalAirport,
  departureAirport,
  flightNumber,
  isoDate,
}: FetchFlightDataParams): Promise<FlightStatsFlight | null> => {
  const data = await fetchData({
    airline,
    flightNumber,
    isoDate,
  });
  if (data === null) return null;
  if (Object.keys(data.flight).length > 0) {
    const departureDate = formatInTimeZone(
      data.flight.sortTime,
      data.flight.departureAirport.timeZoneRegionName,
      DATE_FORMAT_ISO,
    );
    if (
      data.flight.departureAirport.iata === departureAirport.iata &&
      data.flight.arrivalAirport.iata === arrivalAirport.iata &&
      departureDate === isoDate
    )
      return data.flight;
  }
  const flights =
    data.otherDays.find(({ date1, year }) => {
      const date = format(new Date(`${year}-${date1}`), DATE_FORMAT_ISO);
      return date === isoDate;
    })?.flights ?? [];
  const customUrl = flights.find(
    flight =>
      flight.departureAirport.iata === departureAirport.iata &&
      flight.arrivalAirport.iata === arrivalAirport.iata,
  )?.url;
  if (customUrl === undefined) return null;
  const correctedData = await fetchData({
    airline,
    flightNumber,
    isoDate,
    customUrl,
  });
  if (correctedData === null) return null;
  return correctedData.flight;
};
