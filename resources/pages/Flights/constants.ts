import { type EditFlightRequest } from '../../../app/schemas';

export const FETCH_FLIGHTS_PAGE_SIZE = 20;

export const editFlightDefaultValues = {
  id: '',
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
} as unknown as EditFlightRequest;

export const customAirframe = {
  type: 'custom' as const,
  icao24: '',
  registration: '',
  manufacturerCode: '',
  model: '',
  typeCode: '',
  serialNumber: '',
  lineNumber: '',
  icaoAircraftType: '',
  owner: '',
  testReg: '',
  registrationDate: null,
  registrationExprDate: null,
  builtDate: null,
  engines: '',
  aircraftTypeId: '',
  operatorId: '',
  aircraftType: null,
  operator: null,
};
