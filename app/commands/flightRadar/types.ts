export interface RegistrationData {
  departureTime: Date;
  departureAirportIATA: string;
  arrivalAirportIATA: string;
  offTimeActual: Date | undefined;
  onTimeActual: Date | undefined;
  registration: string;
}
