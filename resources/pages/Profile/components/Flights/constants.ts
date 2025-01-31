import { format } from 'date-fns';

import { DATE_FORMAT_ISO } from '../../../../../app/constants';
import { type AddFlightRequest } from '../../../../../app/schemas';

export const addFlightFormDefaultValues = {
  outDateISO: format(new Date(), DATE_FORMAT_ISO),
  airline: null,
  flightNumber: null,
  departureAirport: null,
  arrivalAirport: null,
  aircraftType: null,
  airframe: null,
  outTimeValue: '',
  inTimeValue: '',
  seatNumber: '',
  seatPosition: null,
  class: 'ECONOMY',
  reason: 'LEISURE',
} as unknown as AddFlightRequest;
