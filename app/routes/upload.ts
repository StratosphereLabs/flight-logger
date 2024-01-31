import express from 'express';
import { type Request } from 'express-jwt';
import createHttpError from 'http-errors';
import multer from 'multer';
import { findBestMatch } from 'string-similarity';
import { type UserToken } from '../context';
import { fetchFlightData, prisma } from '../db';
import { authorizeToken, verifyAdminRest } from '../middleware';
import { getFlightTimes, parseCSVFile } from '../utils';
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
