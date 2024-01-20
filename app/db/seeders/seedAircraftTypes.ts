import { type Prisma } from '@prisma/client';
import axios from 'axios';
import cheerio from 'cheerio';
import { prisma } from '../prisma';
import { FREIGHTER_AIRCRAFT_REGEX } from './constants';
import { getText, getWikipediaDataTable, seedConcurrently } from './helpers';

const getUpdate = (
  element: cheerio.Element,
): Prisma.aircraft_typeUpsertArgs | null => {
  const $ = cheerio.load(element);
  const tds = $('td');
  const icao = getText(tds.eq(0));
  const iata = getText(tds.eq(1));

  if (icao === '' || iata === '') {
    return null;
  }

  const id = `${iata}_${icao}`;
  const linkText = tds.eq(2).children('a').eq(0).text().trim();
  const name = linkText !== '' ? linkText : tds.eq(2).text().trim();

  const match = name.match(FREIGHTER_AIRCRAFT_REGEX) ?? [];
  if (match.length > 0) return null;

  const data = { iata, icao, name, class: '' };

  return {
    where: {
      id,
    },
    update: data,
    create: {
      id,
      ...data,
    },
  };
};

const getDatabaseRows = (html: string): Prisma.aircraft_typeUpsertArgs[] => {
  const rows = getWikipediaDataTable(html);
  const documents = rows
    .map(item => getUpdate(item))
    .filter(document => document !== null);
  return documents as Prisma.aircraft_typeUpsertArgs[];
};

export const seedAircraftTypes = async (): Promise<void> => {
  console.log('Seeding aircraft types...');
  try {
    const response = await axios.get<string>(
      'https://en.wikipedia.org/wiki/List_of_aircraft_type_designators',
    );
    const rows = getDatabaseRows(response.data);
    const count = await seedConcurrently(rows, row =>
      prisma.aircraft_type.upsert(row),
    );
    console.log(`  Added ${count} aircraft types`);
  } catch (err) {
    console.error(err);
  }
};
