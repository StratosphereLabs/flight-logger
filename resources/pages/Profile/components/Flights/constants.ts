import { format } from 'date-fns';

import { DATE_FORMAT_ISO } from '../../../../../app/constants';
import { type FlightSearchFormData } from '../../../../../app/schemas';

export const flightSearchFormDefaultValues: FlightSearchFormData = {
  userType: 'me',
  searchType: 'FLIGHT_NUMBER',
  outDateISO: format(new Date(), DATE_FORMAT_ISO),
  airline: null,
  flightNumber: null,
  departureIata: null,
  arrivalIata: null,
};
