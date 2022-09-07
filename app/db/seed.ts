import { prisma } from './prisma';
import usersData from './seed-data/users.json';

/* eslint-disable-next-line @typescript-eslint/no-floating-promises */
(async () => {
  try {
    await prisma.user.deleteMany({});
    const response = await prisma.user.createMany({
      data: usersData,
    });
    console.log(response);
  } catch (err) {
    console.error(err);
  }
})();

export {};
