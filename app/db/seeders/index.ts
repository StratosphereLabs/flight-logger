import { seedAircraftTypes } from './seedAircraftTypes';
import { seedAirlines } from './seedAirlines';
import { seedAirports } from './seedAirports';
import { seedCountries } from './seedCountries';
import { seedRegions } from './seedRegions';
import { seedUsers } from './seedUsers';

/* eslint-disable-next-line @typescript-eslint/no-floating-promises */
(async () => {
  await seedCountries();
  await seedRegions();
  await seedAirports();
  await seedAircraftTypes();
  await seedAirlines();

  await seedUsers();
})();
