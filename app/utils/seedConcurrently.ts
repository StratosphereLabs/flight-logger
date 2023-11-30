import type { Prisma } from '@prisma/client';
import { Promise } from 'bluebird';

export const seedConcurrently = async <
  DataType extends Prisma.Enumerable<unknown>,
>(
  rows: DataType[],
  callback: (row: DataType) => Promise<unknown>,
  concurrency: number,
): Promise<number> => {
  let count = 0;
  await Promise.map(
    rows,
    async row => {
      const result = await callback(row);
      if (result !== null) {
        count++;
        if (count % 1000 === 0) {
          console.log(`  ${count}`);
        }
      }
    },
    { concurrency },
  );
  return count;
};
