export interface RegistrationData {
  departureTime: Date;
  departureAirportIATA: string;
  arrivalAirportIATA: string;
  offTimeActual: Date | undefined;
  onTimeActual: Date | undefined;
  aircraftTypeCode: string;
  registration: string;
}
