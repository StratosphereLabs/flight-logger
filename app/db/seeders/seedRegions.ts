import { type Prisma } from '@prisma/client';
import axios from 'axios';

import { prisma } from '../prisma';
import { csvToJson, seedConcurrently } from './helpers';

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

const getDatabaseRows = (csv: string): Prisma.RegionUpsertArgs[] =>
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

export const seedRegions = async (): Promise<void> => {
  console.log('Seeding regions...');
  try {
    const response = await axios.get<string>(
      'https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/regions.csv',
    );
    const rows = getDatabaseRows(response.data);
    const count = await seedConcurrently(rows, row =>
      prisma.region.upsert(row),
    );
    console.log(`  Added ${count} regions`);
  } catch (err) {
    console.error(err);
  }
};
