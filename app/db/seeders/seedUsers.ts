import { usersData } from './data';
import { prisma } from '../prisma';

export const seedUsers = async (): Promise<void> => {
  console.log('Seeding users...');
  const { count } = await prisma.user.createMany({
    data: usersData,
  });
  console.log(`  Added ${count} users`);
};
