import { type Prisma } from '@prisma/client';
import axios from 'axios';

import { prisma } from '../prisma';
import { csvToJson, seedConcurrently } from './helpers';

interface CountryResponse {
  id: string;
  code: string;
  name: string;
  continent: string;
  wikipedia_link: string;
  keywords: string;
}

const getDatabaseRows = (csv: string): Prisma.CountryUpsertArgs[] =>
  csvToJson<CountryResponse>(csv).map(row => {
    const data = {
      name: row.name,
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

export const seedCountries = async (): Promise<void> => {
  console.log('Seeding countries...');
  try {
    const response = await axios.get<string>(
      'https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/countries.csv',
    );
    const rows = getDatabaseRows(response.data);
    const count = await seedConcurrently(rows, row =>
      prisma.country.upsert(row),
    );
    console.log(`  Added ${count} countries`);
  } catch (err) {
    console.error(err);
  }
};
