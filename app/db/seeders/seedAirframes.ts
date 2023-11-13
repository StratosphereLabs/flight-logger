import { type airframe } from '@prisma/client';
import fs from 'fs';
import { findBestMatch } from 'string-similarity';
import { prisma } from '../prisma';
import { csvToJson, seedConcurrently } from './helpers';

interface AirframeResponse {
  icao24: string;
  registration: string;
  manufacturericao: string;
  manufacturername: string;
  model: string;
  typecode: string;
  serialnumber: string;
  linenumber: string;
  icaoaircrafttype: string;
  operator: string;
  operatorcallsign: string;
  operatoricao: string;
  operatoriata: string;
  owner: string;
  testreg: string;
  registered: string;
  reguntil: string;
  status: string;
  built: string;
  firstflightdate: string;
  seatconfiguration: string;
  engines: string;
  modes: string;
  adsb: string;
  acars: string;
  notes: string;
  categoryDescription: string;
}

const getDatabaseRows = (csv: string): AirframeResponse[] =>
  csvToJson<AirframeResponse>(csv, true).filter(
    row =>
      row.registration !== '' &&
      (row.manufacturericao !== '' || row.manufacturername !== ''),
  );

const updateAirframe = async (
  row: AirframeResponse,
): Promise<airframe | null> => {
  const manufacturer = await prisma.manufacturer.findFirst({
    where: {
      code: {
        equals:
          row.manufacturericao !== ''
            ? row.manufacturericao
            : row.manufacturername,
        mode: 'insensitive',
      },
    },
  });
  if (manufacturer === null) return null;
  const airlines = await prisma.airline.findMany({
    where: {
      iata: row.operatoriata !== '' ? row.operatoriata : undefined,
      icao: row.operatoricao,
    },
  });
  const bestMatchIndex =
    airlines.length > 0
      ? findBestMatch(
          row.operator,
          airlines.map(({ name }) => name),
        ).bestMatchIndex
      : 0;
  const airframeUpdate = {
    registration: row.registration,
    manufacturer: {
      connect: {
        code: manufacturer.code,
      },
    },
    model: row.model !== '' ? row.model : null,
    typeCode: row.typecode !== '' ? row.typecode : null,
    serialNumber: row.serialnumber !== '' ? row.serialnumber : null,
    lineNumber: row.linenumber !== '' ? row.linenumber : null,
    icaoAircraftType: row.icaoaircrafttype !== '' ? row.icaoaircrafttype : null,
    operator:
      airlines.length > 0
        ? {
            connect: {
              id: airlines[bestMatchIndex].id,
            },
          }
        : undefined,
    owner: row.owner !== '' ? row.owner : null,
    testReg: row.testreg !== '' ? row.testreg : null,
    registrationDate:
      row.registered !== '' ? new Date(row.registered).toISOString() : null,
    registrationExprDate:
      row.reguntil !== '' ? new Date(row.reguntil).toISOString() : null,
    builtDate: row.built !== '' ? new Date(row.built).toISOString() : null,
    engines: row.engines !== '' ? row.engines : null,
  };
  return await prisma.airframe.upsert({
    where: {
      icao24: row.icao24,
    },
    update: airframeUpdate,
    create: {
      icao24: row.icao24,
      ...airframeUpdate,
    },
  });
};

/* eslint-disable @typescript-eslint/no-floating-promises */
(async () => {
  console.log('Seeding airframes...');
  try {
    const data = fs
      .readFileSync('./app/db/seeders/data/aircraftDatabase-2023-11.csv')
      .toString();
    const rows = getDatabaseRows(data);
    console.log(`Attempting to add ${rows.length} airframes`);
    const count = await seedConcurrently(rows, updateAirframe);
    console.log(`  Added ${count} airframes`);
  } catch (err) {
    console.error(err);
  }
})();
