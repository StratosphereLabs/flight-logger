import type { FlightWithData } from './types';
import { updateFlightTrackData } from './updateFlightTrackData';
import { updateFlightWeatherReports } from './updateFlightWeatherReports';
import { updateOnTimePerformanceData } from './updateOnTimePerformanceData';
import { updateTrackAircraftData } from './updateTrackAircraftData';

export const updateFlightData = async (
  flights: FlightWithData[],
  shouldUpdateTrackAircraftData?: boolean,
): Promise<void> => {
  let updatedTimesFlights = flights;
  try {
    updatedTimesFlights = await updateFlightTimesData(updatedTimesFlights);
  } catch (err) {
    console.error(err);
  }
  const flightsWithUserId = updatedTimesFlights.filter(
    ({ userId }) => userId !== null,
  );
  if (shouldUpdateTrackAircraftData === true && flightsWithUserId.length > 0) {
    try {
      await updateTrackAircraftData(flightsWithUserId);
    } catch (err) {
      console.error(err);
    }
  } else {
    try {
      updatedTimesFlights =
        await updateFlightRegistrationData(updatedTimesFlights);
    } catch (err) {
      console.error(err);
    }
  }
  try {
    await updateFlightTrackData(updatedTimesFlights);
  } catch (err) {
    console.error(err);
  }
  try {
    await updateOnTimePerformanceData(updatedTimesFlights);
  } catch (err) {
    console.error(err);
  }
  try {
    await updateFlightWeatherReports(updatedTimesFlights);
  } catch (err) {
    console.error(err);
  }
};
