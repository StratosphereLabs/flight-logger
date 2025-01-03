import { type Prisma } from '@prisma/client';
import { Promise } from 'bluebird';
import { load } from 'cheerio';
import { parse } from 'csv-parse/sync';

import { DB_PROMISE_CONCURRENCY } from './constants';

export const csvToJson = <Data>(csv: string, skipError?: boolean): Data[] => {
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-call */
  return parse(csv, {
    columns: true,
    skip_empty_lines: true,
    skip_records_with_error: skipError,
  }) as Data[];
};

export const parseWikipediaData = (data: string): cheerio.Root =>
  load(data, { decodeEntities: false });

export const getWikipediaDataTable = (html: string): cheerio.Element[] => {
  const $ = parseWikipediaData(html);
  return $('.wikitable tr').toArray().slice(1);
};

export const getText = (node: cheerio.Cheerio): string =>
  node
    .text()
    .replace(/None|Unknown|N\/A|-|–|—|\?|\*/gi, '')
    .split(/\/|\(|\[|<|,|;| or /)[0]
    .trim();

export const getInt = (node: cheerio.Cheerio): number | null => {
  const text = getText(node);
  const ints = text.match(/[0-9]+/g);
  if (ints !== null) {
    return parseInt(ints[0], 10);
  }
  return null;
};

export const seedConcurrently = async <
  DataType extends Prisma.Enumerable<unknown>,
>(
  rows: DataType[],
  callback: (row: DataType) => Promise<unknown>,
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
    {
      concurrency: DB_PROMISE_CONCURRENCY,
    },
  );
  return count;
};
