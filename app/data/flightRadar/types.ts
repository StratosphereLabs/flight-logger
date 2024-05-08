import type { FlightRadarStatus } from '@prisma/client';

export interface FlightRadarData {
  departureTime: Date;
  departureAirportIATA: string;
  arrivalAirportIATA: string;
  offTimeActual: Date | undefined;
  onTimeActual: Date | undefined;
  aircraftTypeCode: string;
  registration: string | undefined;
  flightStatus: FlightRadarStatus | null;
  diversionIata: string | null;
}
