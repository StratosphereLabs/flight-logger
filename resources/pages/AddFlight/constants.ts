import { type AddFlightRequest } from '../../../app/schemas';

export const addFlightDefaultValues = {
  departureAirport: null,
  arrivalAirport: null,
  airline: null,
  aircraftType: null,
  flightNumber: null,
  airframe: null,
  outDateISO: '',
  outTimeValue: '',
  inTimeValue: '',
  class: null,
  seatNumber: '',
  seatPosition: null,
  reason: null,
  comments: '',
  trackingLink: '',
} as unknown as AddFlightRequest;
