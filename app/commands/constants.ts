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
    newValue: updatedData.departureAirportId ?? null,
  }),
  arrivalAirportId: (oldFlight, updatedData) => ({
    field: 'ARRIVAL_AIRPORT',
    oldValue: oldFlight.arrivalAirportId,
    newValue: updatedData.arrivalAirportId ?? null,
  }),
  diversionAirportId: (oldFlight, updatedData) => ({
    field: 'DIVERSION_AIRPORT',
    oldValue: oldFlight.diversionAirportId,
    newValue: updatedData.diversionAirportId ?? null,
  }),
  airlineId: (oldFlight, updatedData) => ({
    field: 'AIRLINE',
    oldValue: oldFlight.airlineId,
    newValue: updatedData.airlineId ?? null,
  }),
  operatorAirlineId: (oldFlight, updatedData) => ({
    field: 'OPERATOR_AIRLINE',
    oldValue: oldFlight.operatorAirlineId,
    newValue: updatedData.operatorAirlineId ?? null,
  }),
  flightNumber: (oldFlight, updatedData) => ({
    field: 'FLIGHT_NUMBER',
    oldValue: oldFlight.flightNumber?.toString() ?? null,
    newValue: updatedData.flightNumber?.toString() ?? null,
  }),
  aircraftTypeId: (oldFlight, updatedData) => ({
    field: 'AIRCRAFT_TYPE',
    oldValue: oldFlight.aircraftTypeId,
    newValue: updatedData.aircraftTypeId ?? null,
  }),
  tailNumber: (oldFlight, updatedData) => ({
    field: 'TAIL_NUMBER',
    oldValue: oldFlight.tailNumber,
    newValue: updatedData.tailNumber ?? null,
  }),
  class: (oldFlight, updatedData) => ({
    field: 'CLASS',
    oldValue: oldFlight.class,
    newValue: updatedData.class ?? null,
  }),
  seatNumber: (oldFlight, updatedData) => ({
    field: 'SEAT_NUMBER',
    oldValue: oldFlight.seatNumber,
    newValue: updatedData.seatNumber ?? null,
  }),
  seatPosition: (oldFlight, updatedData) => ({
    field: 'SEAT_POSITION',
    oldValue: oldFlight.seatPosition,
    newValue: updatedData.seatPosition ?? null,
  }),
  reason: (oldFlight, updatedData) => ({
    field: 'REASON',
    oldValue: oldFlight.reason,
    newValue: updatedData.reason ?? null,
  }),
  comments: (oldFlight, updatedData) => ({
    field: 'COMMENTS',
    oldValue: oldFlight.comments,
    newValue: updatedData.comments ?? null,
  }),
  outTime: (oldFlight, updatedData) => ({
    field: 'OUT_TIME',
    oldValue: oldFlight.outTime.toISOString(),
    newValue: updatedData.outTime?.toISOString() ?? null,
  }),
  offTime: (oldFlight, updatedData) => ({
    field: 'OFF_TIME',
    oldValue: oldFlight.offTime?.toISOString() ?? null,
    newValue: updatedData.offTime?.toISOString() ?? null,
  }),
  onTime: (oldFlight, updatedData) => ({
    field: 'ON_TIME',
    oldValue: oldFlight.onTime?.toISOString() ?? null,
    newValue: updatedData.onTime?.toISOString() ?? null,
  }),
  inTime: (oldFlight, updatedData) => ({
    field: 'IN_TIME',
    oldValue: oldFlight.inTime.toISOString(),
    newValue: updatedData.inTime?.toISOString() ?? null,
  }),
  outTimeActual: (oldFlight, updatedData) => ({
    field: 'OUT_TIME_ACTUAL',
    oldValue: oldFlight.outTimeActual?.toISOString() ?? null,
    newValue: updatedData.outTimeActual?.toISOString() ?? null,
  }),
  offTimeActual: (oldFlight, updatedData) => ({
    field: 'OFF_TIME_ACTUAL',
    oldValue: oldFlight.offTimeActual?.toISOString() ?? null,
    newValue: updatedData.offTimeActual?.toISOString() ?? null,
  }),
  onTimeActual: (oldFlight, updatedData) => ({
    field: 'ON_TIME_ACTUAL',
    oldValue: oldFlight.onTimeActual?.toISOString() ?? null,
    newValue: updatedData.onTimeActual?.toISOString() ?? null,
  }),
  inTimeActual: (oldFlight, updatedData) => ({
    field: 'IN_TIME_ACTUAL',
    oldValue: oldFlight.inTimeActual?.toISOString() ?? null,
    newValue: updatedData.inTimeActual?.toISOString() ?? null,
  }),
  departureTerminal: (oldFlight, updatedData) => ({
    field: 'DEPARTURE_TERMINAL',
    oldValue: oldFlight.departureTerminal,
    newValue: updatedData.departureTerminal ?? null,
  }),
  departureGate: (oldFlight, updatedData) => ({
    field: 'DEPARTURE_GATE',
    oldValue: oldFlight.departureGate,
    newValue: updatedData.departureGate ?? null,
  }),
  arrivalTerminal: (oldFlight, updatedData) => ({
    field: 'ARRIVAL_TERMINAL',
    oldValue: oldFlight.arrivalTerminal,
    newValue: updatedData.arrivalTerminal ?? null,
  }),
  arrivalGate: (oldFlight, updatedData) => ({
    field: 'ARRIVAL_GATE',
    oldValue: oldFlight.arrivalGate,
    newValue: updatedData.arrivalGate ?? null,
  }),
  arrivalBaggage: (oldFlight, updatedData) => ({
    field: 'ARRIVAL_BAGGAGE',
    oldValue: oldFlight.arrivalBaggage,
    newValue: updatedData.arrivalBaggage ?? null,
  }),
};
