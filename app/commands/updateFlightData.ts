import type { FlightWithData } from './types';
import { updateFlightRegistrationData } from './updateFlightRegistrationData';
import { updateFlightTimesData } from './updateFlightTimesData';
import { updateFlightTrackData } from './updateFlightTrackData';
import { updateFlightWeatherReports } from './updateFlightWeatherReports';
import { updateOnTimePerformanceData } from './updateOnTimePerformanceData';

export const updateFlightData = async (
  flights: FlightWithData[],
): Promise<void> => {
  let updatedTimesFlights = flights;
  try {
    updatedTimesFlights = await updateFlightTimesData(updatedTimesFlights);
  } catch (err) {
    console.error(err);
  }
  try {
    updatedTimesFlights =
      await updateFlightRegistrationData(updatedTimesFlights);
  } catch (err) {
    console.error(err);
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
