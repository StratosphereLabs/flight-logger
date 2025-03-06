import { type Prisma } from '@prisma/client';
import axios from 'axios';

import { prisma } from '../prisma';
import { csvToJson } from './helpers';

interface ManufacturerResponse {
  Code: string;
  Name: string;
}

const getDatabaseRows = (csv: string): Prisma.ManufacturerUpsertArgs[] =>
  csvToJson<ManufacturerResponse>(csv, {
    skipRecordsWithError: true,
  }).map(row => ({
    where: {
      code: row.Code,
    },
    update: {
      code: row.Code,
      name: row.Name,
    },
    create: {
      code: row.Code,
      name: row.Name,
    },
  }));

export const seedManufacturers = async (): Promise<void> => {
  console.log('Seeding manufacturers...');
  try {
    const response = await axios.get<string>(
      'https://opensky-network.org/datasets/metadata/doc8643Manufacturers.csv',
    );
    const rows = getDatabaseRows(response.data);
    const result = await prisma.$transaction(
      rows.map(row => prisma.manufacturer.upsert(row)),
    );
    console.log(`  Added ${result.length} manufacturers`);
  } catch (err) {
    console.error(err);
  }
};
