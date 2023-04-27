import { prisma } from './prisma';

export const deleteAllUserFlights = async (userId: number): Promise<number> => {
  const result = await prisma.flight.deleteMany({
    where: {
      userId,
    },
  });
  return result.count;
};
