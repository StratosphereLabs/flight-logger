import { Prisma } from '@prisma/client';
import axios from 'axios';
import { prisma } from '../prisma';
import { csvToJson } from './helpers';

interface CountryResponse {
  id: string;
  code: string;
  name: string;
  continent: string;
  wikipedia_link: string;
  keywords: string;
}

const getDatabaseRows = (
  csv: string,
): Prisma.Enumerable<Prisma.countryCreateManyInput> => {
  const rows = csvToJson<CountryResponse>(csv).map<Record<string, unknown>>(
    row => ({
      id: row.code,
      name: row.name,
      continent: row.continent,
      wiki: row.wikipedia_link,
    }),
  );
  return rows as Prisma.Enumerable<Prisma.countryCreateManyInput>;
};

export const seedCountries = async (): Promise<void> => {
  console.log('Seeding countries...');
  try {
    const response = await axios.get<string>(
      'https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/countries.csv',
    );
    const rows = getDatabaseRows(response.data);
    const { count } = await prisma.country.createMany({
      data: rows,
    });
    console.log(`  Added ${count} countries`);
  } catch (err) {
    console.error(err);
  }
};
