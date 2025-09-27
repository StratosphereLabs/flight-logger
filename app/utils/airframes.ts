import type { Airframe } from '@prisma/client';

import { fetchFlightRadarRegistrationData } from '../data/flightRadar';
import { prisma } from '../db';

export const getAirframe = async (
  registration: string,
): Promise<Airframe | null> => {
  const airframe = await prisma.airframe.findFirst({
    where: {
      registration,
    },
  });
  if (airframe !== null || process.env.DATASOURCE_FLIGHTRADAR !== 'true')
    return airframe;
  console.log(`Fetching aircraft registration data for ${registration}...`);
  const airframeData = await fetchFlightRadarRegistrationData(registration);
  if (
    airframeData.aircraftData.aircraft === undefined ||
    airframeData.aircraftData.icao24 === undefined ||
    airframeData.aircraftData.typeCode === undefined
  ) {
    console.log(`  Registration data not found for ${registration}.`);
    return null;
  }
  const [manufacturerName, model] =
    airframeData.aircraftData.aircraft.split(' ');
  const manufacturer = await prisma.manufacturer.findFirst({
    where: {
      code: {
        equals: manufacturerName,
        mode: 'insensitive',
      },
    },
    select: {
      code: true,
    },
  });
  if (manufacturer === null) {
    console.log(
      `  Manufacturer ${manufacturerName} not found for ${registration}.`,
    );
    return null;
  }
  const aircraftType = await prisma.aircraftType.findFirst({
    where: {
      icao: airframeData.aircraftData.typeCode,
    },
    select: {
      id: true,
    },
  });
  const operatorAirline =
    airframeData.aircraftData.operatorIata !== undefined &&
    airframeData.aircraftData.operatorIcao !== undefined
      ? await prisma.airline.findFirst({
          where: {
            iata: airframeData.aircraftData.operatorIata,
            icao: airframeData.aircraftData.operatorIcao,
          },
          select: {
            id: true,
          },
        })
      : null;
  return await prisma.airframe.create({
    data: {
      icao24: airframeData.aircraftData.icao24,
      registration,
      manufacturer: {
        connect: {
          code: manufacturer.code,
        },
      },
      model,
      aircraftType:
        aircraftType !== null
          ? {
              connect: {
                id: aircraftType?.id,
              },
            }
          : undefined,
      typeCode: airframeData.aircraftData.typeCode,
      operator:
        operatorAirline !== null
          ? {
              connect: {
                id: operatorAirline.id,
              },
            }
          : undefined,
    },
  });
};
