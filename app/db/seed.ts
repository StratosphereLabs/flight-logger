import { prisma } from './prisma';
import { tripsData, usersData } from './seed-data';

const seedUsers = async (): Promise<void> => {
  await prisma.user.deleteMany({});
  const response = await prisma.user.createMany({
    data: usersData,
  });
  console.log(`Added ${response.count} users`);
};

const seedTrips = async (): Promise<void> => {
  await prisma.trip.deleteMany({});
  const response = await prisma.trip.createMany({
    data: tripsData,
  });
  console.log(`Added ${response.count} trips`);
};

/* eslint-disable-next-line @typescript-eslint/no-floating-promises */
(async () => {
  await seedUsers();
  await seedTrips();
})();

export {};
