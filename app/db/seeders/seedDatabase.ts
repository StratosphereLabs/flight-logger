import { prisma } from '../prisma';
import { seedAircraftTypes } from './seedAircraftTypes';
import { seedAirframes } from './seedAirframes';
import { seedAirlines } from './seedAirlines';
import { seedAirports } from './seedAirports';
import { seedCountries } from './seedCountries';
import { seedManufacturers } from './seedManufacturers';
import { seedRegions } from './seedRegions';

export const seedDatabase = async (): Promise<void> => {
  await seedCountries();
  await seedRegions();
  await seedAirports();
  await seedManufacturers();
  await seedAircraftTypes();
  await seedAirlines();
  await seedAirframes();
  await prisma.$disconnect();
};
