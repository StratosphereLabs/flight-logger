import { Prisma } from '@prisma/client';

export const usersData: Prisma.Enumerable<Prisma.userCreateManyInput> = [
  {
    id: 1,
    username: 'EchoSierra98',
    email: 'ethan.shields21@gmail.com',
    firstName: 'Ethan',
    lastName: 'Shields',
  },
  {
    id: 2,
    username: 'zackary747',
    email: 'zackary747@gmail.com',
    firstName: 'Zackary',
    lastName: 'Hall',
  },
];
