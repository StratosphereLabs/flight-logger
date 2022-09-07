import { seedAirports } from './seedAirports';
import { seedCountries } from './seedCountries';
import { seedRegions } from './seedRegions';
import { seedTrips } from './seedTrips';
import { seedUsers } from './seedUsers';

/* eslint-disable-next-line @typescript-eslint/no-floating-promises */
(async () => {
  await seedCountries();
  await seedRegions();
  await seedAirports();

  await seedUsers();
  await seedTrips();
})();
