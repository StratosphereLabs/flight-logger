import { type Prisma } from '@prisma/client';
import axios from 'axios';
import { Promise } from 'bluebird';
import { load } from 'cheerio';
import { prisma } from '../prisma';
import {
  ICAO_AIRLINE_CODE_REGEX,
  IATA_AIRLINE_CODE_REGEX,
  WIKI_PROMISE_CONCURRENCY,
} from './constants';
import {
  getInt,
  getText,
  getWikipediaDataTable,
  parseWikipediaData,
  seedConcurrently,
} from './helpers';

export const getAirlineDocument = async (
  href: string,
): Promise<Prisma.AirlineUpsertArgs | null> => {
  const url = `https://en.wikipedia.org${href}`;
  try {
    const res = await axios.get<string>(url);
    const $ = parseWikipediaData(res.data);

    const name = $('#firstHeading').text().split('(airline')[0].trim();

    const infoTable = $('.infobox.vcard').find('table').eq(0);
    const headers = infoTable.find('th a').text();
    const infoTableCells = infoTable
      .find('td')
      .map((i, td) => getText($(td)))
      .get();
    const iata = (infoTableCells[0] as string | undefined)?.slice(0, 2) ?? '';
    const icao = (infoTableCells[1] as string | undefined)?.slice(0, 3) ?? '';
    const callsign = (infoTableCells[2] as string | undefined) ?? '';

    if (
      headers !== 'IATAICAOCallsign' ||
      (iata.length > 0 && !IATA_AIRLINE_CODE_REGEX.test(iata)) ||
      !ICAO_AIRLINE_CODE_REGEX.test(icao)
    ) {
      return null;
    }

    const fleetSize = getInt($('th:contains("Fleet size")').next());
    const destinations = getInt($('th:contains("Destinations")').next());

    const id = `${iata.length > 0 ? `${iata}_` : ''}${icao}_${name.replace(
      / /g,
      '_',
    )}`;

    const src = $('.infobox-image img').eq(0).attr('src') ?? '';
    const wiki = $('link[rel="canonical"]').attr('href') ?? '';

    const data = {
      name,
      iata: iata.length > 0 ? iata : null,
      icao,
      callsign: callsign.length > 0 ? callsign : null,
      fleetSize,
      destinations,
      logo: src.length > 0 ? `https:${src}` : null,
      wiki: wiki.length > 0 ? wiki : null,
    };

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
  } catch (err) {
    console.error(err);
    return null;
  }
};

const getUpdate = (
  element: cheerio.Element,
): Promise<Prisma.AirlineUpsertArgs | null> | null => {
  const $ = load(element);
  const link = $('td').eq(2).find('a').eq(0);
  const href = link.attr('href');
  if (href === '' || href?.slice(0, 6) !== '/wiki/') {
    return null;
  }
  return getAirlineDocument(href);
};

const getDatabaseRows = async (
  html: string,
): Promise<Prisma.AirlineUpsertArgs[]> => {
  const rows = getWikipediaDataTable(html);
  const documents = await Promise.map(
    rows,
    async item => await getUpdate(item),
    {
      concurrency: WIKI_PROMISE_CONCURRENCY,
    },
  ).filter(document => document !== null);
  return documents as Prisma.AirlineUpsertArgs[];
};

export const seedAirlines = async (): Promise<void> => {
  console.log('Seeding airlines...');
  try {
    const response = await axios.get<string>(
      'https://en.wikipedia.org/wiki/List_of_airline_codes',
    );
    const rows = await getDatabaseRows(response.data);
    const count = await seedConcurrently(rows, row =>
      prisma.airline.upsert(row),
    );
    console.log(`Added ${count} airlines`);
  } catch (err) {
    console.error(err);
  }
};
