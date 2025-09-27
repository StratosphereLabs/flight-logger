import type { Prisma } from '@prisma/client';
import { fromUnixTime } from 'date-fns';

import { prisma } from '../db';
import { type AviationWeatherReport, fetchSingleWeatherReport } from '../utils';
import type { FlightWithData } from './types';

const getUpdateObject = (
  data: AviationWeatherReport,
): Prisma.WeatherReportCreateInput => ({
  id: `${data.icaoId}_${data.obsTime}`,
  airport: {
    connect: {
      id: data.icaoId,
    },
  },
  obsTime: fromUnixTime(data.obsTime),
  temp: data.temp,
  dewp: data.dewp,
  wdir: data.wdir.toString(),
  wspd: data.wspd,
  wgst: 0,
  visib: data.visib.toString(),
  altim: data.altim,
  wxString: null,
  vertVis: null,
  rawOb: data.rawOb,
  clouds: data.clouds,
});

export const updateFlightWeatherReports = async (
  flights: FlightWithData[],
): Promise<void> => {
  const {
    departureAirport,
    arrivalAirport,
    diversionAirportId,
    inTime,
    inTimeActual,
    offTime,
    offTimeActual,
    onTime,
    onTimeActual,
    outTime,
    outTimeActual,
  } = flights[0];
  const departureTime = offTimeActual ?? offTime ?? outTimeActual ?? outTime;
  const arrivalTime = onTimeActual ?? onTime ?? inTimeActual ?? inTime;
  let departureWeather: AviationWeatherReport | null = null;
  let arrivalWeather: AviationWeatherReport | null = null;
  let diversionWeather: AviationWeatherReport | null = null;
  try {
    departureWeather = await fetchSingleWeatherReport(
      departureAirport.id,
      departureTime,
    );
    arrivalWeather = await fetchSingleWeatherReport(
      arrivalAirport.id,
      arrivalTime,
    );
    if (diversionAirportId !== null) {
      diversionWeather = await fetchSingleWeatherReport(
        diversionAirportId,
        arrivalTime,
      );
    }
  } catch (err) {
    console.error(err);
  }
  if (
    departureWeather === null &&
    arrivalWeather === null &&
    diversionWeather === null
  ) {
    return;
  }
  await prisma.$transaction(
    flights.map(({ id }) =>
      prisma.flight.update({
        where: { id },
        data: {
          departureWeather:
            departureWeather !== null
              ? {
                  connectOrCreate: {
                    where: {
                      id: `${departureWeather.icaoId}_${departureWeather.obsTime}`,
                    },
                    create: getUpdateObject(departureWeather),
                  },
                }
              : undefined,
          arrivalWeather:
            arrivalWeather !== null
              ? {
                  connectOrCreate: {
                    where: {
                      id: `${arrivalWeather.icaoId}_${arrivalWeather.obsTime}`,
                    },
                    create: getUpdateObject(arrivalWeather),
                  },
                }
              : undefined,
          diversionWeather:
            diversionWeather !== null
              ? {
                  connectOrCreate: {
                    where: {
                      id: `${diversionWeather.icaoId}_${diversionWeather.obsTime}`,
                    },
                    create: getUpdateObject(diversionWeather),
                  },
                }
              : undefined,
        },
      }),
    ),
  );
};
