import { Prisma } from '@prisma/client';
import axios from 'axios';
import cheerio from 'cheerio';
import { prisma } from '../prisma';
import { getText, getWikipediaDataTable } from './helpers';

const getUpdate = (
  element: cheerio.Element,
): Prisma.aircraft_typeCreateInput | null => {
  const $ = cheerio.load(element);
  const tds = $('td');
  const icao = getText(tds.eq(0));
  const iata = getText(tds.eq(1));

  if (icao === '' || iata === '') {
    return null;
  }

  const id = `${iata}_${icao}`;
  const link = tds.eq(2).children('a').eq(0);
  const name = $(link).text();

  return { id, iata, icao, name, class: '' };
};

const getDatabaseRows = (
  html: string,
): Prisma.Enumerable<Prisma.aircraft_typeCreateManyInput> => {
  const rows = getWikipediaDataTable(html);
  const documents = rows
    .map(item => getUpdate(item))
    .filter(document => document !== null);
  return documents as Prisma.Enumerable<Prisma.aircraft_typeCreateManyInput>;
};

export const seedAircraftTypes = async (): Promise<void> => {
  console.log('Seeding aircraft types...');
  try {
    const response = await axios.get<string>(
      'https://en.wikipedia.org/wiki/List_of_aircraft_type_designators',
    );
    const rows = getDatabaseRows(response.data);
    const { count } = await prisma.aircraft_type.createMany({
      data: rows,
      skipDuplicates: true,
    });
    console.log(`  Added ${count} aircraft types`);
  } catch (err) {
    console.error(err);
  }
};
