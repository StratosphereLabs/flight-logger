import { scheduleJob } from 'node-schedule';
import { seedAirframes } from '../db/seeders/seedAirframes';

(() => {
  scheduleJob('0 0 1 * *', seedAirframes);
})();
