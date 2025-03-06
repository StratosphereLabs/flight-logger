import { type Airframe } from '@prisma/client';
import axios from 'axios';
import fs, { type ReadStream } from 'fs';
import readline from 'readline';
import { findBestMatch } from 'string-similarity';

import { prisma } from '../prisma';
import {
  AIRFRAMES_CSV_PATH,
  AIRFRAMES_CSV_URL,
  READ_AIRFRAMES_CHUNK_SIZE,
} from './constants';
import { csvToJson, seedConcurrently } from './helpers';

interface AirframeResponse {
  icao24: string;
  timestamp: string;
  acars: string;
  adsb: string;
  built: string;
  categoryDescription: string;
  country: string;
  engines: string;
  firstFlightDate: string;
  firstSeen: string;
  icaoAircraftClass: string;
  lineNumber: string;
  manufacturerIcao: string;
  manufacturerName: string;
  model: string;
  modes: string;
  nextReg: string;
  notes: string;
  operator: string;
  operatorCallsign: string;
  operatorIata: string;
  operatorIcao: string;
  owner: string;
  prevReg: string;
  regUntil: string;
  registered: string;
  registration: string;
  selCal: string;
  serialNumber: string;
  status: string;
  typecode: string;
  vdl: string;
}

const getDatabaseRows = (csv: string): AirframeResponse[] =>
  csvToJson<AirframeResponse>(csv, {
    skipRecordsWithError: true,
    quote: "'",
  }).filter(
    row =>
      row.registration !== '' &&
      (row.manufacturerIcao !== '' || row.manufacturerName !== ''),
  );

const updateAirframe = async (
  row: AirframeResponse,
): Promise<Airframe | null> => {
  const airframeString = `${row.icao24} ${row.registration} (${row.typecode !== '' ? row.typecode : 'Unknown'})`;
  const manufacturer = await prisma.manufacturer.findFirst({
    where: {
      code: {
        equals:
          row.manufacturerIcao !== ''
            ? row.manufacturerIcao
            : row.manufacturerName,
        mode: 'insensitive',
      },
    },
  });
  if (manufacturer === null) {
    console.log(`Unable to find manufacturer for ${airframeString}`);
    return null;
  }
  const airlines = await prisma.airline.findMany({
    where: {
      iata: row.operatorIata !== '' ? row.operatorIata : undefined,
      icao: row.operatorIcao,
    },
  });
  const aircraftType =
    row.typecode.length > 0
      ? await prisma.aircraftType.findFirst({
          where: {
            icao: row.typecode,
          },
        })
      : null;
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
    serialNumber: row.serialNumber !== '' ? row.serialNumber : null,
    lineNumber: row.lineNumber !== '' ? row.lineNumber : null,
    icaoAircraftType:
      row.icaoAircraftClass !== '' ? row.icaoAircraftClass : null,
    operator:
      airlines.length > 0
        ? {
            connect: {
              id: airlines[bestMatchIndex].id,
            },
          }
        : undefined,
    owner: row.owner !== '' ? row.owner : null,
    testReg: row.prevReg !== '' ? row.prevReg : null,
    registrationDate:
      row.registered !== '' ? new Date(row.registered).toISOString() : null,
    registrationExprDate:
      row.regUntil !== '' ? new Date(row.regUntil).toISOString() : null,
    builtDate: row.built !== '' ? new Date(row.built).toISOString() : null,
    aircraftType:
      aircraftType !== null
        ? {
            connect: {
              id: aircraftType.id,
            },
          }
        : undefined,
    engines: row.engines !== '' ? row.engines : null,
  };
  const airframe = await prisma.airframe.findUnique({
    where: {
      icao24: row.icao24,
    },
  });
  if (airframe === null) {
    console.log(`Adding new airframe for ${airframeString}`);
    const newAirframe = await prisma.airframe.create({
      data: {
        icao24: row.icao24,
        ...airframeUpdate,
      },
    });
    await prisma.flight.updateMany({
      where: {
        airframeId: null,
        tailNumber: newAirframe.registration,
      },
      data: {
        airframeId: newAirframe.icao24,
      },
    });
    return newAirframe;
  }
  console.log(`Updating airframe for ${airframeString}`);
  return await prisma.airframe.update({
    where: {
      icao24: row.icao24,
    },
    data: airframeUpdate,
  });
};

const processLines = async (
  headerRow: string,
  lines: string[],
): Promise<void> => {
  const rows = getDatabaseRows([headerRow, ...lines].join('\n'));
  await seedConcurrently(rows, updateAirframe, false);
};

export const seedAirframes = async (): Promise<void> => {
  console.log('Seeding airframes...');
  try {
    console.log('Fetching airframes data file...');
    const response = await axios.get<ReadStream>(AIRFRAMES_CSV_URL, {
      responseType: 'stream',
    });
    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(AIRFRAMES_CSV_PATH);
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    const readStream = fs.createReadStream(AIRFRAMES_CSV_PATH);
    const rl = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity,
    });
    let linesBuffer: string[] = [];
    let headerRow;
    for await (const line of rl) {
      if (headerRow === undefined) {
        headerRow = line;
        continue;
      }
      linesBuffer.push(line);
      if (linesBuffer.length === READ_AIRFRAMES_CHUNK_SIZE) {
        await processLines(headerRow, linesBuffer);
        linesBuffer = [];
      }
    }
    if (linesBuffer.length > 0 && headerRow !== undefined) {
      await processLines(headerRow, linesBuffer);
    }
  } catch (err) {
    console.error(err);
  }
};
