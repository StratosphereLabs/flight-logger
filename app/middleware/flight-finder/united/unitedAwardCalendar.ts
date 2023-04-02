import axios, { AxiosError } from 'axios';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { flightFinderRequestSchema } from '../../../schemas';
import { UnitedAwardCalendarError, UnitedAwardCalendarResponse } from './types';

export const unitedAwardCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.headers['x-authorization-api'] as string | undefined;
  if (token === undefined || token === '') {
    return next(createHttpError(401, 'United Airlines API token required.'));
  }
  const result = flightFinderRequestSchema.safeParse(req.body);
  if (!result.success) {
    return next(createHttpError(400, 'Invalid request body.'));
  }
  try {
    const response = await axios.post<UnitedAwardCalendarResponse>(
      'https://www.united.com/api/flight/FetchAwardCalendar',
      {
        SearchTypeSelection: 1,
        SortType: 'bestmatches',
        SortTypeDescending: false,
        Trips: [
          {
            Origin: result.data.departureAirport,
            Destination: result.data.arrivalAirport,
            DepartDate: result.data.dateFrom,
            Index: 1,
            TripIndex: 1,
            SearchRadiusMilesOrigin: 0,
            SearchRadiusMilesDestination: 0,
            DepartTimeApprox: 0,
            SearchFiltersIn: {
              FareFamily: 'ECONOMY',
              AirportsStop: null,
              AirportsStopToAvoid: null,
              StopCountMin: 0,
              StopCountMax: 0,
            },
          },
        ],
        CabinPreferenceMain: 'economy',
        PaxInfoList: [
          {
            PaxType: 1,
          },
        ],
        AwardTravel: true,
        NGRP: true,
        CalendarLengthOfStay: -1,
        PetCount: 0,
        CalendarFilters: {
          Filters: {
            PriceScheduleOptions: {
              Stops: 1,
            },
          },
        },
        Characteristics: [
          {
            Code: 'SOFT_LOGGED_IN',
            Value: false,
          },
          {
            Code: 'UsePassedCartId',
            Value: false,
          },
        ],
        FareType: 'mixedtoggle',
        BBXSolutionSetIdSelected: null,
        FlexibleDaysAfter: 3,
        FlexibleDaysBefore: 3,
      },
      {
        headers: {
          'Accept-Language': 'en-US',
          'x-authorization-api': `bearer ${token}`,
        },
      },
    );
    res.status(response.status).json(response.data);
  } catch (err) {
    const error = (err as AxiosError<UnitedAwardCalendarError>).response?.data
      .errors[0];
    if (error !== undefined) {
      next(createHttpError(error.status, error.detail));
    }
  }
};
