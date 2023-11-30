import { type Prisma } from '@prisma/client';
import axios from 'axios';
import { seedConcurrently } from '../../utils';
import { prisma } from '../prisma';
import { DB_PROMISE_CONCURRENCY } from './constants';
import { csvToJson } from './helpers';

interface RegionResponse {
  id: string;
  code: string;
  local_code: string;
  name: string;
  continent: string;
  iso_country: string;
  wikipedia_link: string;
  keywords: string;
}

const getDatabaseRows = (csv: string): Prisma.regionUpsertArgs[] =>
  csvToJson<RegionResponse>(csv).map(row => {
    const data = {
      name: row.name,
      countryId: row.iso_country,
      continent: row.continent,
      wiki: row.wikipedia_link,
    };
    return {
      where: {
        id: row.code,
      },
      update: data,
      create: {
        id: row.code,
        ...data,
      },
    };
  });

/* eslint-disable @typescript-eslint/no-floating-promises */
(async () => {
  console.log('Seeding regions...');
  try {
    const response = await axios.get<string>(
      'https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/regions.csv',
    );
    const rows = getDatabaseRows(response.data);
    const count = await seedConcurrently(
      rows,
      row => prisma.region.upsert(row),
      DB_PROMISE_CONCURRENCY,
    );
    console.log(`  Added ${count} regions`);
  } catch (err) {
    console.error(err);
  }
})();
