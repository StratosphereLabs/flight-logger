import { Prisma, type SeatPosition } from '@prisma/client';
import { fromZonedTime } from 'date-fns-tz';
import express from 'express';
import { type Request } from 'express-jwt';
import createHttpError from 'http-errors';
import groupBy from 'lodash.groupby';
import keyBy from 'lodash.keyby';
import multer from 'multer';
import { findBestMatch } from 'string-similarity';

import { type UserToken } from '../context';
import { fetchFlightData, prisma } from '../db';
import { authorizeToken, verifyAdminRest } from '../middleware';
import {
  FLIGHTY_CLASS_MAP,
  getDurationMinutes,
  getFlightTimes,
  getFlightyFlightNumber,
  parseCSVFile,
  parseFlightyDateTime,
  parseFlightyFile,
} from '../utils';
import {
  getAircraftIcao,
  getAircraftName,
  getFlightNumber,
  parseFlightDiaryFile,
} from '../utils/flightdiary';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadRouter = express.Router();

uploadRouter.post(
  '/flights/flightdiary',
  authorizeToken(true),
  upload.single('file'),
  async (req: Request<UserToken>, res, next) => {
    const { file } = req;
    const userId = req.auth?.id;
    if (userId === undefined) {
      next(createHttpError(401, 'Unauthorized.'));
      return;
    }
    try {
      const rows = parseFlightDiaryFile(file);
      const airportIds = [
        ...new Set(
          rows.flatMap(row =>
            row.From !== '' && row.To !== '' ? [row.From, row.To] : [],
          ),
        ),
      ];
      const airlineIds = [
        ...new Set(
          rows.flatMap(row => (row.Airline !== '' ? [row.Airline] : [])),
        ),
      ];
      const aircraftTypeData = [
        ...new Set(
          rows.flatMap(row =>
            row.Aircraft !== '' ? [getAircraftIcao(row.Aircraft)] : [],
          ),
        ),
      ];
      const registrations = [
        ...new Set(
          rows.flatMap(row =>
            row.Registration !== '' ? [row.Registration] : [],
          ),
        ),
      ];
      const data = await fetchFlightData({
        airportIds,
        airportSearchType: 'id',
        airlineIds,
        airlineSearchType: 'icao',
        aircraftTypeData,
        aircraftSearchType: 'icao',
        registrations,
      });
      const flights = await prisma.$transaction(
        rows.flatMap(row => {
          const departureAirport = data.airports[row.From];
          const arrivalAirport = data.airports[row.To];
          if (departureAirport === undefined || arrivalAirport === undefined)
            return [];
          const airline = data.airlines[row.Airline];
          const aircraftIcao = getAircraftIcao(row.Aircraft);
          const aircraftName = getAircraftName(row.Aircraft);
          const aircraftTypes = data.aircraftTypes[aircraftIcao];
          const airframe = data.airframes[row.Registration];
          const { bestMatchIndex } = findBestMatch(
            aircraftName,
            aircraftTypes?.map(({ name }) => name) ?? [''],
          );
          const { outTime, inTime, duration } = getFlightTimes({
            departureAirport,
            arrivalAirport,
            outDateISO: row.Date,
            outTimeValue: row['Dep time'],
            inTimeValue: row['Arr time'],
          });
          return [
            prisma.flight.create({
              data: {
                user: {
                  connect: {
                    id: userId,
                  },
                },
                departureAirport: {
                  connect: {
                    id: departureAirport.id,
                  },
                },
                arrivalAirport: {
                  connect: {
                    id: arrivalAirport.id,
                  },
                },
                airline:
                  airline !== undefined
                    ? {
                        connect: {
                          id: airline.id,
                        },
                      }
                    : undefined,
                aircraftType:
                  aircraftTypes !== undefined
                    ? {
                        connect: {
                          id: aircraftTypes[bestMatchIndex].id,
                        },
                      }
                    : undefined,
                airframe:
                  airframe !== undefined
                    ? {
                        connect: {
                          icao24: airframe.icao24,
                        },
                      }
                    : undefined,
                flightNumber: getFlightNumber(row['Flight number']),
                tailNumber: row.Registration,
                outTime: outTime.toISOString(),
                inTime: inTime.toISOString(),
                duration,
                seatNumber: row['Seat number'],
                comments: row.Note,
              },
            }),
          ];
        }),
      );
      res.status(200).json({ flights });
    } catch (err) {
      next(err);
    }
  },
);

uploadRouter.post(
  '/flights/csv/:username',
  authorizeToken(true),
  verifyAdminRest,
  upload.single('file'),
  async (req: Request<UserToken>, res, next) => {
    const { file } = req;
    const username = req.params.username;
    if (username === undefined || username === '') {
      next(createHttpError(400, 'Invalid username.'));
      return;
    }
    try {
      const rows = parseCSVFile(file);
      const airportIds = [
        ...new Set(
          rows.flatMap(row =>
            row.dep_iata !== '' && row.arr_iata !== ''
              ? [row.dep_iata, row.arr_iata]
              : [],
          ),
        ),
      ];
      const airlineIds = [
        ...new Set(
          rows.flatMap(row => (row.airline_id !== '' ? [row.airline_id] : [])),
        ),
      ];
      const aircraftTypeData = [
        ...new Set(
          rows.flatMap(row =>
            row.aircraft_type_icao !== '' ? [row.aircraft_type_icao] : [],
          ),
        ),
      ];
      const registrations = [
        ...new Set(
          rows.flatMap(row =>
            row.registration !== '' ? [row.registration] : [],
          ),
        ),
      ];
      const data = await fetchFlightData({
        airportIds,
        airportSearchType: 'iata',
        airlineIds,
        airlineSearchType: 'icao',
        aircraftTypeData,
        aircraftSearchType: 'icao',
        registrations,
      });
      const flights = await prisma.$transaction(
        rows.flatMap(row => {
          const departureAirport = data.airports[row.dep_iata];
          const arrivalAirport = data.airports[row.arr_iata];
          if (departureAirport === undefined || arrivalAirport === undefined)
            return [];
          const airline = data.airlines[row.airline_id];
          const aircraftTypes = data.aircraftTypes[row.aircraft_type_icao];
          const airframe = data.airframes[row.registration];
          const { outTime, offTimeActual, inTime, onTimeActual, duration } =
            getFlightTimes({
              departureAirport,
              arrivalAirport,
              outDateISO: row.date,
              outTimeValue: row.dep_time,
              offTimeActualValue: row.dep_time_actual,
              inTimeValue: row.arr_time,
              onTimeActualValue: row.arr_time_actual,
            });
          return [
            prisma.flight.create({
              data: {
                user: {
                  connect: {
                    username,
                  },
                },
                departureAirport: {
                  connect: {
                    id: departureAirport.id,
                  },
                },
                arrivalAirport: {
                  connect: {
                    id: arrivalAirport.id,
                  },
                },
                airline:
                  airline !== undefined
                    ? {
                        connect: {
                          id: airline.id,
                        },
                      }
                    : undefined,
                aircraftType:
                  aircraftTypes !== undefined
                    ? {
                        connect: {
                          id: aircraftTypes[0].id,
                        },
                      }
                    : undefined,
                airframe:
                  airframe !== undefined
                    ? {
                        connect: {
                          icao24: airframe.icao24,
                        },
                      }
                    : undefined,
                flightNumber: parseInt(row.flight_number, 10),
                tailNumber: row.registration,
                outTime: outTime.toISOString(),
                offTimeActual: offTimeActual?.toISOString() ?? undefined,
                onTimeActual: onTimeActual?.toISOString() ?? undefined,
                inTime: inTime.toISOString(),
                duration,
              },
            }),
          ];
        }),
      );
      res.status(200).json({ flights });
    } catch (err) {
      next(err);
    }
  },
);

uploadRouter.post(
  '/flights/flighty',
  authorizeToken(true),
  upload.single('file'),
  async (req: Request<UserToken>, res, next) => {
    const { file } = req;
    const userId = req.auth?.id;
    if (userId === undefined) {
      next(createHttpError(401, 'Unauthorized.'));
      return;
    }
    try {
      const rows = parseFlightyFile(file).filter(
        flight => flight.Canceled === 'FALSE',
      );
      const airportIatas = [
        ...new Set(rows.flatMap(row => [row.From, row.To])),
      ];
      const airlineIcaos = [...new Set(rows.map(row => row.Airline))];
      const registrations = [
        ...new Set(
          rows.flatMap(row =>
            row['Tail Number'] !== '' ? [row['Tail Number']] : [],
          ),
        ),
      ];
      console.time(`airports query (${airportIatas.length})`);
      const airports = await prisma.airport.findMany({
        where: {
          iata: {
            in: airportIatas,
          },
        },
      });
      console.timeEnd(`airports query (${airportIatas.length})`);
      console.time(`airlines query (${airlineIcaos.length})`);
      const airlines = await prisma.airline.findMany({
        where: {
          icao: {
            in: airlineIcaos,
          },
        },
      });
      console.timeEnd(`airlines query (${airlineIcaos.length})`);
      console.time(`airframes query (${registrations.length})`);
      const airframes = await prisma.$queryRaw<
        Array<{
          registration: string;
          icao24: string;
          aircraftTypeId: string | null;
          typeCode: string | null;
        }>
      >`
        SELECT "registration", "icao24", "aircraftTypeId", "typeCode" FROM "airframe" WHERE "registration" ILIKE ANY (ARRAY[${Prisma.join(
          registrations.map(reg => reg.split('').join('%')),
        )}])
      ;`;
      console.timeEnd(`airframes query (${registrations.length})`);
      const aircraftTypeIcaos = [
        ...new Set(
          airframes.flatMap(({ aircraftTypeId, typeCode }) =>
            aircraftTypeId === null && typeCode !== null && typeCode.length > 0
              ? typeCode
              : [],
          ),
        ),
      ];
      console.time(`aircraft types query (${aircraftTypeIcaos.length})`);
      const aircraftTypes = await prisma.aircraftType.findMany({
        where: {
          icao: {
            in: aircraftTypeIcaos,
          },
        },
      });
      console.timeEnd(`aircraft types query (${aircraftTypeIcaos.length})`);
      const airportData = keyBy(airports, 'iata');
      const airlineData = keyBy(airlines, 'icao');
      const aircraftTypeData = groupBy(aircraftTypes, 'icao');
      console.time(`flights query (${rows.length})`);
      const flights = await prisma.$transaction(
        rows.flatMap(row => {
          const departureAirport = airportData[row.From];
          const arrivalAirport = airportData[row.To];
          if (departureAirport === undefined || arrivalAirport === undefined)
            return [];
          const airlineIcao = row.Airline;
          const flightNumber = row.Flight;
          const airline = airlineData[airlineIcao];
          const airframe =
            row['Tail Number'].length > 0
              ? airframes.find(({ registration }) =>
                  new RegExp(
                    `^(?=${row['Tail Number']
                      .split('')
                      .map(val => `.*${val}`)
                      .join('')}).+$`,
                  ).test(registration),
                )
              : undefined;
          const aircraftTypeId =
            airframe?.aircraftTypeId ??
            (airframe?.typeCode !== undefined && airframe?.typeCode !== null
              ? (aircraftTypeData[airframe.typeCode]?.[0].id ?? null)
              : null);
          if (
            row['Gate Departure (Scheduled)'] === '' ||
            row['Gate Arrival (Scheduled)'] === ''
          ) {
            console.error(
              `  Missing departure/arrival time information for ${airlineIcao}${flightNumber} on ${row['Gate Departure (Scheduled)']}`,
            );
            return [];
          }
          const [gateDepartureScheduledDate, gateDepartureScheduledTime] =
            row['Gate Departure (Scheduled)'].split(' ');
          const [gateArrivalScheduledDate, gateArrivalScheduledTime] =
            row['Gate Arrival (Scheduled)'].split(' ');
          const outTime = fromZonedTime(
            new Date(
              `${gateDepartureScheduledDate} ${gateDepartureScheduledTime}`,
            ),
            departureAirport.timeZone,
          );
          const outTimeActual = parseFlightyDateTime(
            row['Gate Departure (Actual)'],
            departureAirport.timeZone,
          );
          const offTime = parseFlightyDateTime(
            row['Take off (Scheduled)'],
            departureAirport.timeZone,
          );
          const offTimeActual = parseFlightyDateTime(
            row['Take off (Actual)'],
            departureAirport.timeZone,
          );
          const onTime = parseFlightyDateTime(
            row['Landing (Scheduled)'],
            arrivalAirport.timeZone,
          );
          const onTimeActual = parseFlightyDateTime(
            row['Landing (Actual)'],
            arrivalAirport.timeZone,
          );
          const inTime = fromZonedTime(
            new Date(`${gateArrivalScheduledDate} ${gateArrivalScheduledTime}`),
            arrivalAirport.timeZone,
          );
          const inTimeActual = parseFlightyDateTime(
            row['Gate Arrival (Actual)'],
            arrivalAirport.timeZone,
          );
          const duration = getDurationMinutes({
            start: outTime,
            end: inTime,
          });
          return [
            prisma.flight.create({
              data: {
                user: {
                  connect: {
                    id: userId,
                  },
                },
                departureAirport: {
                  connect: {
                    id: departureAirport.id,
                  },
                },
                arrivalAirport: {
                  connect: {
                    id: arrivalAirport.id,
                  },
                },
                airline:
                  airline !== undefined
                    ? {
                        connect: {
                          id: airline.id,
                        },
                      }
                    : undefined,
                aircraftType:
                  aircraftTypeId !== null
                    ? {
                        connect: {
                          id: aircraftTypeId,
                        },
                      }
                    : undefined,
                airframe:
                  airframe !== undefined
                    ? {
                        connect: {
                          icao24: airframe.icao24,
                        },
                      }
                    : undefined,
                flightNumber: getFlightyFlightNumber(flightNumber),
                tailNumber:
                  airframe?.registration ??
                  (row['Tail Number'].length > 0
                    ? row['Tail Number']
                    : undefined),
                departureTerminal:
                  row['Dep Terminal'].length > 0
                    ? row['Dep Terminal']
                    : undefined,
                departureGate:
                  row['Dep Gate'].length > 0 ? row['Dep Gate'] : undefined,
                arrivalTerminal:
                  row['Arr Terminal'].length > 0
                    ? row['Arr Terminal']
                    : undefined,
                arrivalGate:
                  row['Arr Gate'].length > 0 ? row['Arr Gate'] : undefined,
                seatNumber: row.Seat.length > 0 ? row.Seat : undefined,
                seatPosition:
                  row['Seat Type'].length > 0
                    ? (row['Seat Type'] as SeatPosition)
                    : undefined,
                class:
                  row['Cabin Class'].length > 0
                    ? FLIGHTY_CLASS_MAP[row['Cabin Class']]
                    : undefined,
                comments: row.Notes.length > 0 ? row.Notes : undefined,
                outTime,
                outTimeActual,
                offTime,
                offTimeActual,
                onTime,
                onTimeActual,
                inTime,
                inTimeActual,
                duration,
              },
            }),
          ];
        }),
      );
      console.timeEnd(`flights query (${rows.length})`);
      res.status(200).json({ flights });
    } catch (err) {
      next(err);
    }
  },
);
