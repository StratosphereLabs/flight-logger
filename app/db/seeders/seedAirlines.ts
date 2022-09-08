import { Prisma } from '@prisma/client';
import axios from 'axios';
import { Promise } from 'bluebird';
import cheerio from 'cheerio';
import { prisma } from '../prisma';
import { PROMISE_CONCURRENCY } from './constants';
import {
  getInt,
  getText,
  getWikipediaDataTable,
  parseWikipediaData,
} from './helpers';

export const getAirlineDocument = async (
  href: string,
): Promise<Prisma.airlineCreateInput | null> => {
  const url = `https://en.wikipedia.org${href}`;
  try {
    const res = await axios.get<string>(url);
    const $ = parseWikipediaData(res.data);

    const wiki = $('link[rel="canonical"]').attr('href');

    const name = $('#firstHeading').text().split('(airline')[0].trim();

    const infoTable = $('.infobox.vcard').find('table').eq(0);
    const headers = infoTable.find('th a').text();
    const infoTableCells = infoTable
      .find('td')
      .map((i, td) => getText($(td)))
      .get();
    const iata = infoTableCells[0] as string;
    const icao = infoTableCells[1] as string;
    const callsign = infoTableCells[2] as string;

    if (
      headers !== 'IATAICAOCallsign' ||
      iata.length !== 2 ||
      icao.length !== 3
    ) {
      return null;
    }

    const fleetSize = getInt($('th:contains("Fleet size")').next());
    const destinations = getInt($('th:contains("Destinations")').next());

    const id = `${iata}_${icao}_${name.replace(/ /g, '_')}`;

    const src = $('.infobox-image img').eq(0).attr('src');
    const logo = src !== undefined ? `https:${src}` : '';

    return {
      name,
      id,
      iata,
      icao,
      callsign,
      fleetSize,
      destinations,
      logo,
      wiki,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
};

const getUpdate = (
  element: cheerio.Element,
): Promise<Prisma.airlineCreateInput | null> | null => {
  const $ = cheerio.load(element);
  const link = $('td').eq(2).find('a').eq(0);
  const href = link.attr('href');
  if (href === '' || href?.slice(0, 6) !== '/wiki/') {
    return null;
  }
  return getAirlineDocument(href);
};

const getDatabaseRows = async (
  html: string,
): Promise<Prisma.Enumerable<Prisma.airlineCreateManyInput>> => {
  const rows = getWikipediaDataTable(html);
  const documents = await Promise.map(rows, item => getUpdate(item), {
    concurrency: PROMISE_CONCURRENCY,
  }).filter(document => document !== null);
  return documents as Prisma.Enumerable<Prisma.airlineCreateManyInput>;
};

export const seedAirlines = async (): Promise<void> => {
  console.log('Seeding airlines...');
  try {
    const response = await axios.get<string>(
      'https://en.wikipedia.org/wiki/List_of_airline_codes',
    );
    const rows = await getDatabaseRows(response.data);
    const { count } = await prisma.airline.createMany({
      data: rows,
      skipDuplicates: true,
    });
    console.log(`  Added ${count} airlines`);
  } catch (err) {
    console.error(err);
  }
};
