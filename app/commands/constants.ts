import type { flight, flight_update_change } from '@prisma/client';

export const UPDATE_CONCURRENCY = 4;

export const FLIGHT_CHANGE_GETTER_MAP: Partial<
  Record<
    keyof flight,
    (
      oldFlight: flight,
      updatedData: Partial<flight>,
    ) => Omit<flight_update_change, 'id' | 'updateId'>
  >
> = {
  departureAirportId: (oldFlight, updatedData) => ({
    field: 'DEPARTURE_AIRPORT',
    oldValue: oldFlight.departureAirportId,
    oldDisplayValue: null,
    newValue: updatedData.departureAirportId ?? null,
    newDisplayValue: null,
  }),
  arrivalAirportId: (oldFlight, updatedData) => ({
    field: 'ARRIVAL_AIRPORT',
    oldValue: oldFlight.arrivalAirportId,
    oldDisplayValue: null,
    newValue: updatedData.arrivalAirportId ?? null,
    newDisplayValue: null,
  }),
  diversionAirportId: (oldFlight, updatedData) => ({
    field: 'DIVERSION_AIRPORT',
    oldValue: oldFlight.diversionAirportId,
    oldDisplayValue: null,
    newValue: updatedData.diversionAirportId ?? null,
    newDisplayValue: null,
  }),
  airlineId: (oldFlight, updatedData) => ({
    field: 'AIRLINE',
    oldValue: oldFlight.airlineId,
    oldDisplayValue: null,
    newValue: updatedData.airlineId ?? null,
    newDisplayValue: null,
  }),
  operatorAirlineId: (oldFlight, updatedData) => ({
    field: 'OPERATOR_AIRLINE',
    oldValue: oldFlight.operatorAirlineId,
    oldDisplayValue: null,
    newValue: updatedData.operatorAirlineId ?? null,
    newDisplayValue: null,
  }),
  flightNumber: (oldFlight, updatedData) => ({
    field: 'FLIGHT_NUMBER',
    oldValue: oldFlight.flightNumber?.toString() ?? null,
    oldDisplayValue: null,
    newValue: updatedData.flightNumber?.toString() ?? null,
    newDisplayValue: null,
  }),
  aircraftTypeId: (oldFlight, updatedData) => ({
    field: 'AIRCRAFT_TYPE',
    oldValue: oldFlight.aircraftTypeId,
    oldDisplayValue: null,
    newValue: updatedData.aircraftTypeId ?? null,
    newDisplayValue: null,
  }),
  tailNumber: (oldFlight, updatedData) => ({
    field: 'TAIL_NUMBER',
    oldValue: oldFlight.tailNumber,
    oldDisplayValue: null,
    newValue: updatedData.tailNumber ?? null,
    newDisplayValue: null,
  }),
  class: (oldFlight, updatedData) => ({
    field: 'CLASS',
    oldValue: oldFlight.class,
    oldDisplayValue: null,
    newValue: updatedData.class ?? null,
    newDisplayValue: null,
  }),
  seatNumber: (oldFlight, updatedData) => ({
    field: 'SEAT_NUMBER',
    oldValue: oldFlight.seatNumber,
    oldDisplayValue: null,
    newValue: updatedData.seatNumber ?? null,
    newDisplayValue: null,
  }),
  seatPosition: (oldFlight, updatedData) => ({
    field: 'SEAT_POSITION',
    oldValue: oldFlight.seatPosition,
    oldDisplayValue: null,
    newValue: updatedData.seatPosition ?? null,
    newDisplayValue: null,
  }),
  reason: (oldFlight, updatedData) => ({
    field: 'REASON',
    oldValue: oldFlight.reason,
    oldDisplayValue: null,
    newValue: updatedData.reason ?? null,
    newDisplayValue: null,
  }),
  comments: (oldFlight, updatedData) => ({
    field: 'COMMENTS',
    oldValue: oldFlight.comments,
    oldDisplayValue: null,
    newValue: updatedData.comments ?? null,
    newDisplayValue: null,
  }),
  outTime: (oldFlight, updatedData) => ({
    field: 'OUT_TIME',
    oldValue: oldFlight.outTime.toISOString(),
    oldDisplayValue: null,
    newValue: updatedData.outTime?.toISOString() ?? null,
    newDisplayValue: null,
  }),
  offTime: (oldFlight, updatedData) => ({
    field: 'OFF_TIME',
    oldValue: oldFlight.offTime?.toISOString() ?? null,
    oldDisplayValue: null,
    newValue: updatedData.offTime?.toISOString() ?? null,
    newDisplayValue: null,
  }),
  onTime: (oldFlight, updatedData) => ({
    field: 'ON_TIME',
    oldValue: oldFlight.onTime?.toISOString() ?? null,
    oldDisplayValue: null,
    newValue: updatedData.onTime?.toISOString() ?? null,
    newDisplayValue: null,
  }),
  inTime: (oldFlight, updatedData) => ({
    field: 'IN_TIME',
    oldValue: oldFlight.inTime.toISOString(),
    oldDisplayValue: null,
    newValue: updatedData.inTime?.toISOString() ?? null,
    newDisplayValue: null,
  }),
  outTimeActual: (oldFlight, updatedData) => ({
    field: 'OUT_TIME_ACTUAL',
    oldValue: oldFlight.outTimeActual?.toISOString() ?? null,
    oldDisplayValue: null,
    newValue: updatedData.outTimeActual?.toISOString() ?? null,
    newDisplayValue: null,
  }),
  offTimeActual: (oldFlight, updatedData) => ({
    field: 'OFF_TIME_ACTUAL',
    oldValue: oldFlight.offTimeActual?.toISOString() ?? null,
    oldDisplayValue: null,
    newValue: updatedData.offTimeActual?.toISOString() ?? null,
    newDisplayValue: null,
  }),
  onTimeActual: (oldFlight, updatedData) => ({
    field: 'ON_TIME_ACTUAL',
    oldValue: oldFlight.onTimeActual?.toISOString() ?? null,
    oldDisplayValue: null,
    newValue: updatedData.onTimeActual?.toISOString() ?? null,
    newDisplayValue: null,
  }),
  inTimeActual: (oldFlight, updatedData) => ({
    field: 'IN_TIME_ACTUAL',
    oldValue: oldFlight.inTimeActual?.toISOString() ?? null,
    oldDisplayValue: null,
    newValue: updatedData.inTimeActual?.toISOString() ?? null,
    newDisplayValue: null,
  }),
};
