import { type WithRequired } from '@tanstack/react-query';

import { getFlightAwareFlightUpdate } from '../data/flightAware';
import { getFlightRadarFlightUpdate } from '../data/flightRadar';
import { getFlightStatsFlightUpdate } from '../data/flightStats';
import type { FlightUpdateInput } from '../data/types';
import type { FlightWithData } from './types';
import { updateFlightWeatherReports } from './updateFlightWeatherReports';
import { updateOnTimePerformanceData } from './updateOnTimePerformanceData';

export const updateFlightData = async (
  flights: FlightWithData[],
): Promise<void> => {
  const firstFlight = flights[0];
  if (
    firstFlight?.airline === null ||
    firstFlight?.airline === undefined ||
    firstFlight.flightNumber === null
  ) {
    return;
  }
  let flightStatsUpdate: FlightUpdateInput | null = null;
  let flightRadarUpdate: FlightUpdateInput | null = null;
  let flightAwareUpdate: FlightUpdateInput | null = null;
  if (process.env.DATASOURCE_FLIGHTSTATS === 'true') {
    try {
      flightStatsUpdate = await getFlightStatsFlightUpdate(
        firstFlight as WithRequired<FlightWithData, 'flightNumber' | 'airline'>,
      );
    } catch (err) {
      console.error(err);
    }
  }
  if (process.env.DATASOURCE_FLIGHTRADAR === 'true') {
    try {
      flightRadarUpdate = await getFlightRadarFlightUpdate(
        firstFlight as WithRequired<FlightWithData, 'flightNumber' | 'airline'>,
      );
    } catch (err) {
      console.error(err);
    }
  }
  if (process.env.DATASOURCE_FLIGHTAWARE === 'true') {
    try {
      flightAwareUpdate = await getFlightAwareFlightUpdate(
        firstFlight as WithRequired<FlightWithData, 'flightNumber' | 'airline'>,
      );
    } catch (err) {
      console.error(err);
    }
  }
  console.log({ flightStatsUpdate, flightRadarUpdate, flightAwareUpdate });
  try {
    await updateOnTimePerformanceData(flights);
  } catch (err) {
    console.error(err);
  }
  try {
    await updateFlightWeatherReports(flights);
  } catch (err) {
    console.error(err);
  }
};
