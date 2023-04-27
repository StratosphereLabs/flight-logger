import { prisma } from '../db';

export const deleteAllUserFlights = async (userId: number): Promise<number> => {
  const result = await prisma.flight.deleteMany({
    where: {
      userId,
    },
  });
  return result.count;
};
