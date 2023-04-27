import express from 'express';
import { Request } from 'express-jwt';
import createHttpError from 'http-errors';
import multer from 'multer';
import { findBestMatch } from 'string-similarity';
import { UserToken } from '../context';
import { deleteAllUserFlights, fetchFlightData, prisma } from '../db';
import { authorizeToken } from '../middleware';
import { getFlightTimes } from '../utils';
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
      return next(createHttpError(401, 'Unauthorized.'));
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
      const data = await fetchFlightData({
        airportIds,
        airlineIds,
        aircraftTypeData,
        aircraftSearchType: 'icao',
      });
      const numFlightsDeleted = await deleteAllUserFlights(userId);
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
      res.status(200).json({ numFlightsDeleted, flights });
    } catch (err) {
      next(err);
    }
  },
);
