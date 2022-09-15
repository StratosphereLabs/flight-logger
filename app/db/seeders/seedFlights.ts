import { prisma } from '../prisma';
import { flightsData } from './data/flights';

export const seedFlights = async (): Promise<void> => {
  console.log('Seeding flights...');
  const { count } = await prisma.flight.createMany({
    data: flightsData,
  });
  console.log(`  Added ${count} flights`);
};
