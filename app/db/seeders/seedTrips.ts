import { tripsData } from './data';
import { prisma } from '../prisma';

export const seedTrips = async (): Promise<void> => {
  console.log('Seeding trips...');
  const { count } = await prisma.trip.createMany({
    data: tripsData,
  });
  console.log(`  Added ${count} trips`);
};
