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
  baggage: string | null;
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
  scheduledDepartureUTC: string | null;
  estimatedActualDepartureRunway: boolean;
  estimatedActualDepartureTitle: string;
  estimatedActualDeparture: string;
  estimatedActualDepartureUTC: string | null;
  scheduledArrival: string;
  scheduledArrivalUTC: string | null;
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
  tookOff?: string;
  landing?: string;
  isLanded?: boolean;
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
    } | null;
    flightDuration: string;
  };
  arrivalAirport: FlightStatsAirport;
  codeshares: FlightStatsCodeshare[];
  departureAirport: Omit<FlightStatsAirport, 'baggage'>;
  divertedAirport: FlightStatsAirport | null;
  flightId: number;
  flightNote: FlightStatsNote;
  flightState: string;
  isLanded: boolean;
  isScheduled: boolean;
  isTracking: boolean;
  operatedBy: null;
  positional: {
    departureAirportCode: string;
    arrivalAirportCode: string;
    divertedAirportCode: string | null;
    flexFlightStatus: string;
    flexTrack?: {
      flightId: number;
      carrierFsCode: string;
      flightNumber: string;
      tailNumber: string | null;
      callsign: string;
      departureAirportFsCode: string;
      arrivalAirportFsCode: string;
      departureDate: {
        dateUtc: string;
        dateLocal: string;
      };
      equipment: string | null;
      delayMinutes: number;
      bearing: number;
      heading: number;
      positions?: Array<{
        lon: number;
        lat: number;
        speedMph: number;
        altitudeFt: number;
        source: string;
        date: string;
        course: number;
        vrateMps: number;
        lastObserved: string;
      }>;
      irregularOperations: [];
      fleetAircraftId: number;
    };
  };
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
  isServer: boolean;
  initialState: {
    app: {
      user: Record<string, unknown>;
      appHost: string;
    };
    elasticSearch: Record<string, unknown>;
    error?: Record<string, string>;
    flick: Record<string, unknown>;
    flightTracker: {
      flight?: FlightStatsFlight;
      flightLoading: boolean;
      otherDays: FlightStatsOtherDay[] | '';
    };
    loading: {
      LOAD_FLIGHT_TRACKER_FLIGHT: boolean;
      LOAD_FLIGHT_TRACKER_OTHER_DAYS: boolean;
    };
  };
  initialProps: {
    user: Record<string, unknown>;
    pageProps: {
      params: {
        carrierCode: string;
        flightNumber: string;
        year: string;
        month: string;
        date: string;
        flightId: string;
      };
      isHistoricalFlight: boolean;
      isOutOfDateRange: boolean;
      head: {
        title: string;
        description: string;
        keywords: string;
        canonical: string;
        noIndex: boolean;
      };
      userAgent: string;
      hostname: string;
    };
  };
}

export interface FlightStatsDataResponse {
  props: FlightStatsDataProps;
  page: string;
  query: {
    carrierCode: string;
    flightNumber: string;
    flightId?: string;
    year?: string;
    month?: string;
    date?: string;
  };
  buildId: string;
  dynamicIds: number[];
}

export interface FlightStatsFlightData {
  flight: FlightStatsFlight;
  otherDays: FlightStatsOtherDay[];
}

export interface FlightStatsOnTimePerformanceRating {
  airline: {
    fs: string;
    iata: string;
    icao: string;
    name: string;
    active: boolean;
    category: string;
    flightNumber: string;
  };
  departureAirport: {
    fs: string;
    iata: string;
    icao: string;
    name: string;
    city: string;
    state: string;
    country: string;
    active: boolean;
    classification: number;
    timeZoneRegionName: string;
  };
  arrivalAirport: {
    fs: string;
    iata: string;
    icao: string;
    name: string;
    city: string;
    state: string;
    country: string;
    active: boolean;
    classification: number;
    timeZoneRegionName: string;
  };
  flightNumber: string;
  chart: {
    onTime: number;
    late: number;
    veryLate: number;
    excessive: number;
    cancelled: number;
    diverted: number;
  };
  statistics: {
    totalObservations: number;
    delayObservations: number;
    codeshares: number;
    mean: number;
    standardDeviation: number;
    min: number;
    max: number;
  };
  details: {
    overall: {
      stars: number;
      roundedStars: number;
      appraisal: string;
      ontimePercent: number;
      cumulative: number;
      delayMean: number;
    };
    otp: {
      stars: number;
      roundedStars: number;
      appraisal: string;
      ontimePercent: number;
      cumulative: number;
    };
    delayPerformance: {
      stars: number;
      roundedStars: number;
      appraisal: string;
      cumulative: number;
      delayMean: number;
      standardDeviation: number;
    };
  };
  otherStops: [];
}

export interface FlightStatsOnTimePerformanceResponse {
  OnTimePerformance: {
    error: null;
    loadAttempts: number;
    loading: boolean;
    loaded: boolean;
    ratings: FlightStatsOnTimePerformanceRating[];
  };
}
