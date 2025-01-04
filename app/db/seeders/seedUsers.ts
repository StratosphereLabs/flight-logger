import { prisma } from '../prisma';
import { usersData } from './data';

/* eslint-disable @typescript-eslint/no-floating-promises */
(async () => {
  console.log('Seeding users...');
  const { count } = await prisma.user.createMany({
    data: usersData,
  });
  console.log(`  Added ${count} users`);
})();
