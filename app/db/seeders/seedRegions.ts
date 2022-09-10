import { Prisma } from '@prisma/client';
import axios from 'axios';
import { prisma } from '../prisma';
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

const getDatabaseRows = (
  csv: string,
): Prisma.Enumerable<Prisma.regionCreateManyInput> => {
  const rows = csvToJson<RegionResponse>(csv).map<Record<string, unknown>>(
    row => ({
      id: row.code,
      name: row.name,
      countryId: row.iso_country,
      continent: row.continent,
      wiki: row.wikipedia_link,
    }),
  );
  return rows as Prisma.Enumerable<Prisma.regionCreateManyInput>;
};

export const seedRegions = async (): Promise<void> => {
  console.log('Seeding regions...');
  try {
    const response = await axios.get<string>(
      'https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/regions.csv',
    );
    const rows = getDatabaseRows(response.data);
    const { count } = await prisma.region.createMany({
      data: rows,
    });
    console.log(`  Added ${count} regions`);
  } catch (err) {
    console.error(err);
  }
};
