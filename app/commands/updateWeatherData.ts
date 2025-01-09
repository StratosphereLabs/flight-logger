import type { Prisma } from '@prisma/client';
import { fromUnixTime } from 'date-fns';

import { prisma } from '../db';
import { type AviationWeatherReport, fetchWeatherReports } from '../utils';
import type { FlightWithData } from './types';

export const getUpdateObject = (
  data: AviationWeatherReport,
): Prisma.WeatherReportCreateInput => ({
  id: data.metar_id,
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
  wgst: data.wgst ?? 0,
  visib: data.visib.toString(),
  altim: data.altim,
  wxString: data.wxString,
  vertVis: data.vertVis,
  rawOb: data.rawOb,
  clouds: data.clouds,
});

export const updateWeatherData = async (
  flights: FlightWithData[],
): Promise<void> => {
  console.log(`Fetching weather reports for ${flights.length} flights...`);
  const weatherReports = await fetchWeatherReports(flights);
  if (weatherReports !== null) {
    console.log(
      `  Saving weather reports for ${flights.length} to database...`,
    );
    await prisma.$transaction(
      weatherReports.map(
        ({ id, departureWeather, arrivalWeather, diversionWeather }) =>
          prisma.flight.update({
            where: { id },
            data: {
              departureWeather:
                departureWeather !== null
                  ? {
                      connectOrCreate: {
                        where: {
                          id: departureWeather.metar_id,
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
                          id: arrivalWeather.metar_id,
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
                          id: diversionWeather.metar_id,
                        },
                        create: getUpdateObject(diversionWeather),
                      },
                    }
                  : undefined,
            },
          }),
      ),
    );
  } else {
    console.error(
      `  Unable to fetch weather reports for ${flights.length} flights. Please try again later.`,
    );
  }
};
