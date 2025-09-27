import { type WithRequired } from '@tanstack/react-query';

import { getFlightAwareUpdate } from '../data/flightAware';
import { getFlightRadarUpdate } from '../data/flightRadar';
import { getFlightStatsUpdate } from '../data/flightStats';
import type { FlightUpdateInput } from '../data/types';
import type { FlightWithData } from './types';

// import { updateFlightWeatherReports } from './updateFlightWeatherReports';
// import { updateOnTimePerformanceData } from './updateOnTimePerformanceData';

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
      flightStatsUpdate = await getFlightStatsUpdate(
        firstFlight as WithRequired<FlightWithData, 'flightNumber' | 'airline'>,
      );
    } catch (err) {
      console.error(err);
    }
  }
  if (process.env.DATASOURCE_FLIGHTRADAR === 'true') {
    try {
      flightRadarUpdate = await getFlightRadarUpdate(
        firstFlight as WithRequired<FlightWithData, 'flightNumber' | 'airline'>,
      );
    } catch (err) {
      console.error(err);
    }
  }
  if (process.env.DATASOURCE_FLIGHTAWARE === 'true') {
    try {
      flightAwareUpdate = await getFlightAwareUpdate(
        firstFlight as WithRequired<FlightWithData, 'flightNumber' | 'airline'>,
      );
    } catch (err) {
      console.error(err);
    }
  }
  console.log({ flightStatsUpdate, flightRadarUpdate, flightAwareUpdate });
  // try {
  //   await updateOnTimePerformanceData(updatedTimesFlights);
  // } catch (err) {
  //   console.error(err);
  // }
  // try {
  //   await updateFlightWeatherReports(updatedTimesFlights);
  // } catch (err) {
  //   console.error(err);
  // }
};
