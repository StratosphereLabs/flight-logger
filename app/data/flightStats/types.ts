export interface FlightStatsAirport {
  fs: string;
  iata: string;
  name: string;
  city: string;
  state: string;
  country: string;
  timeZoneRegionName: string;
  regionName: string;
  gate: string | null;
  terminal: string | null;
  times: {
    scheduled: {
      time: string;
      ampm: string;
      time24: string;
      timezone: string;
    };
    estimatedActual: {
      title: string;
      time: string;
      ampm: string;
      time24: string;
      runway: boolean;
      timezone: string;
    };
  };
  date: string;
}

export interface FlightStatsCodeshare {
  flightNumber: string;
  fs: string;
  name: string;
}

export interface FlightStatsNote {
  final: boolean;
  canceled: boolean;
  hasDepartedGate: boolean;
  hasDepartedRunway: boolean;
  landed: boolean;
  message: string | null;
  messageCode: string | null;
  pastExpectedTakeOff: boolean;
  tracking: boolean;
  hasPositions: boolean;
  trackingUnavailable: boolean;
  phase: string;
  hasActualRunwayDepartureTime: boolean;
  hasActualGateDepartureTime: boolean;
}

export interface FlightStatsSchedule {
  scheduledDeparture: string;
  scheduledDepartureUTC: string;
  estimatedActualDepartureRunway: boolean;
  estimatedActualDepartureTitle: string;
  estimatedActualDeparture: string;
  estimatedActualDepartureUTC: string | null;
  scheduledArrival: string;
  scheduledArrivalUTC: string;
  estimatedActualArrivalRunway: boolean;
  estimatedActualArrivalTitle: string;
  estimatedActualArrival: string;
  estimatedActualArrivalUTC: string | null;
  graphXAxis: {
    dep: string;
    depUTC: string;
    arr: string;
    arrUTC: string;
  };
  tookOff: string;
}

export interface FlightStatsStatus {
  statusCode: string;
  status: string;
  color: string;
  statusDescription: string;
  delay: {
    departure: {
      minutes: number;
    };
    arrival: {
      minutes: number;
    };
  };
  delayStatus: {
    wording: string;
    minutes: number;
  };
  lastUpdatedText: string;
  diverted: boolean;
}

export interface FlightStatsFlight {
  additionalFlightInfo: {
    equipment: {
      iata: string;
      name: string;
      title: string;
    };
    flightDuration: string;
  };
  arrivalAirport: FlightStatsAirport & {
    baggage: string | null;
  };
  codeshares: FlightStatsCodeshare[];
  departureAirport: FlightStatsAirport;
  divertedAirport: null;
  flightId: number;
  flightNote: FlightStatsNote;
  flightState: string;
  isLanded: boolean;
  isScheduled: boolean;
  isTracking: boolean;
  operatedBy: null;
  positional: Record<string, unknown>;
  schedule: FlightStatsSchedule;
  sortTime: string;
  status: FlightStatsStatus;
  ticketHeader: {
    carrier: {
      name: string;
      fs: string;
    };
    flightNumber: string;
  };
}

export interface FlightStatsOtherDayFlight {
  arrivalAirport: {
    city: string;
    fs: string;
    iata: string;
    name: string;
    state: string;
    country: string;
  };
  arrivalTime: string;
  arrivalTimeAmPm: string;
  arrivalTime24: string;
  arrivalTimezone: string;
  departureAirport: {
    city: string;
    fs: string;
    iata: string;
    name: string;
    state: string;
    country: string;
  };
  departureTime: string;
  departureTimeAmPm: string;
  departureTime24: string;
  departureTimezone: string;
  url: string;
  sortTime: string;
}

export interface FlightStatsOtherDay {
  date1: string;
  date2: string;
  day: string;
  year: string;
  flights: FlightStatsOtherDayFlight[];
}

export interface FlightStatsDataProps {
  initialProps: {
    pageProps: {
      head: {
        canonical: string;
        description: string;
        keywords: string;
        noIndex: boolean;
        title: string;
      };
      hostname: string;
      isHistoricalFlight: boolean;
      isOutOfDateRange: boolean;
      params: {
        carrierCode: string;
        date: string;
        flightId: string;
        flightNumber: string;
        month: string;
        year: string;
      };
    };
    user: Record<string, unknown>;
  };
  initialState: {
    app: {
      appHost: string;
      user: Record<string, unknown>;
    };
    elasticSearch: Record<string, unknown>;
    error: {
      LOAD_FLIGHT_TRACKER_FLIGHT: string;
      LOAD_FLIGHT_TRACKER_OTHER_DAYS: string;
    };
    flick: Record<string, unknown>;
    flightTracker: {
      flight: FlightStatsFlight;
      flightLoading: boolean;
      otherDays: FlightStatsOtherDay[] | '';
    };
    loading: {
      LOAD_FLIGHT_TRACKER_FLIGHT: boolean;
      LOAD_FLIGHT_TRACKER_OTHER_DAYS: boolean;
    };
  };
  isServer: boolean;
}

export interface FlightStatsDataResponse {
  assetPrefix: string;
  buildId: string;
  chunks: string[];
  err: null;
  nextExport: boolean;
  page: string;
  pathname: string;
  props: FlightStatsDataProps;
  query: {
    carrierCode: string;
    flightNumber: string;
    flightId: string;
    year: string;
    month: string;
    date: string;
  };
}
