import { Prisma } from '@prisma/client';
import axios from 'axios';
import { prisma } from '../prisma';
import { csvToJson } from './helpers';

/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const { find } = require('geo-tz') as {
  find: (lat: number, lon: number) => string[];
};

interface AirportResponse {
  id: string;
  ident: string;
  type: string;
  name: string;
  latitude_deg: string;
  longitude_deg: string;
  elevation_ft: string;
  continent: string;
  iso_country: string;
  iso_region: string;
  municipality: string;
  scheduled_service: string;
  gps_code: string;
  iata_code: string;
  local_code: string;
  home_link: string;
  wikipedia_link: string;
  keywords: string;
}

const getDatabaseRows = (
  csv: string,
): Prisma.Enumerable<Prisma.airportCreateManyInput> => {
  const rows = csvToJson<AirportResponse>(csv).reduce<
    Array<Record<string, unknown>>
  >((acc, row) => {
    if (row.scheduled_service === 'no') return acc;
    const lat = parseFloat(row.latitude_deg);
    const lon = parseFloat(row.longitude_deg);
    const timeZones = find(lat, lon);
    return [
      ...acc,
      {
        id: row.ident,
        type: row.type,
        name: row.name,
        lat: parseFloat(row.latitude_deg),
        lon: parseFloat(row.longitude_deg),
        elevation:
          row.elevation_ft === '' ? undefined : parseInt(row.elevation_ft),
        continent: row.continent,
        countryId: row.iso_country,
        regionId: row.iso_region,
        municipality: row.municipality,
        timeZone: timeZones[0],
        scheduledService: row.scheduled_service !== 'no',
        ident: row.ident,
        gps: row.gps_code,
        iata: row.iata_code,
        local: row.local_code,
      },
    ];
  }, []);
  return rows as Prisma.Enumerable<Prisma.airportCreateManyInput>;
};

export const seedAirports = async (): Promise<void> => {
  console.log('Seeding airports...');
  try {
    const response = await axios.get<string>(
      'https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv',
    );
    const rows = getDatabaseRows(response.data);
    const { count } = await prisma.airport.createMany({
      data: rows,
    });
    console.log(`  Added ${count} airports`);
  } catch (err) {
    console.error(err);
  }
};
