import { Prisma } from '@prisma/client';

export const tripsData: Prisma.Enumerable<Prisma.tripCreateManyInput> = [
  {
    userId: 1,
    name: 'Cabo/Guadalajara Trip',
  },
  {
    userId: 1,
    name: 'Denver/Vegas Trip',
  },
  {
    userId: 2,
    name: 'Florida Trip',
  },
  {
    userId: 2,
    name: 'Denver/Vegas Trip',
  },
];
