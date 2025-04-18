import type { Prisma } from '@prisma/client';
import { fromUnixTime } from 'date-fns';

import { prisma } from '../db';
import { type AviationWeatherReport, fetchSingleWeatherReport } from '../utils';
import type { FlightWithData } from './types';

const getUpdateObject = (
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
  const departureWeather: AviationWeatherReport | null =
    await fetchSingleWeatherReport(departureAirport.id, departureTime);
  const arrivalWeather: AviationWeatherReport | null =
    await fetchSingleWeatherReport(arrivalAirport.id, arrivalTime);
  let diversionWeather: AviationWeatherReport | null = null;
  if (diversionAirportId !== null) {
    diversionWeather = await fetchSingleWeatherReport(
      diversionAirportId,
      arrivalTime,
    );
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
};
