import { scheduleJob } from 'node-schedule';

import {
  updateFlightsDaily,
  updateFlightsEvery5,
  updateFlightsEvery15,
  updateFlightsEvery15Seconds,
  updateFlightsEveryMinute,
  updateFlightsHourly,
} from '../data/updaters';
import { seedDatabase } from '../db/seeders';

(() => {
  // Seed database at midnight on 1st day of each month
  scheduleJob('0 0 1 * *', seedDatabase);

  // Update flights at midnight every day EXCEPT on 1st day of each month
  scheduleJob('0 0 2-31 * *', updateFlightsDaily);

  // Update flights at top of every hour EXCEPT at midnight
  scheduleJob('0 1-23 * * *', updateFlightsHourly);

  // Update flights every 15 minutes EXCEPT at the top of each hour
  scheduleJob('15,30,45 * * * *', updateFlightsEvery15);

  // Update flights every 5 minutes EXCEPT at 15 minute intervals
  scheduleJob('5,10,20,25,35,40,50,55 * * * *', updateFlightsEvery5);

  // Update flights every minute EXCEPT at 5 minute intervals
  scheduleJob(
    '1,2,3,4,6,7,8,9,11,12,13,14,16,17,18,19,21,22,23,24,26,27,28,29,31,32,33,34,36,37,38,39,41,42,43,44,46,47,48,49,51,52,53,54,56,57,58,59 * * * *',
    updateFlightsEveryMinute,
  );

  // Update flights every 15 seconds EXCEPT at the top of each minute
  scheduleJob('15,30,45 * * * * *', updateFlightsEvery15Seconds);
})();
