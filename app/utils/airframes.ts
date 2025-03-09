import type { Airframe } from '@prisma/client';

import { fetchAircraftRegistrationData } from '../data/flightRadar';
import { prisma } from '../db';

export const getAirframe = async (
  registration: string,
): Promise<Airframe | null> => {
  const airframe = await prisma.airframe.findFirst({
    where: {
      registration,
    },
  });
  if (airframe !== null) return airframe;
  console.log(`Fetching aircraft registration data for ${registration}...`);
  const airframeData = await fetchAircraftRegistrationData(registration);
  if (
    airframeData.aircraft === undefined ||
    airframeData.icao24 === undefined ||
    airframeData.typeCode === undefined
  ) {
    console.log(`  Registration data not found for ${registration}.`);
    return null;
  }
  const [manufacturerName, model] = airframeData.aircraft.split(' ');
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
      icao: airframeData.typeCode,
    },
    select: {
      id: true,
    },
  });
  const operatorAirline =
    airframeData.operatorIata !== undefined &&
    airframeData.operatorIcao !== undefined
      ? await prisma.airline.findFirst({
          where: {
            iata: airframeData.operatorIata,
            icao: airframeData.operatorIcao,
          },
          select: {
            id: true,
          },
        })
      : null;
  return await prisma.airframe.create({
    data: {
      icao24: airframeData.icao24,
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
      typeCode: airframeData.typeCode,
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
