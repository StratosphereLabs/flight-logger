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

export interface FlightRadarRouteResult {
  identification: {
    id: string | null;
    row: number;
    number: {
      default: string | null;
      alternative: string | null;
    };
    callsign: string | null;
    codeshare: null;
  };
  status: {
    live: boolean;
    text: string;
    icon: string;
    estimated: null;
    ambiguous: boolean;
    generic: {
      status: {
        text: string;
        type: string;
        color: string;
        diverted: null;
      };
      eventTime: {
        utc: number | null;
        local: number | null;
      };
    };
  };
  aircraft: {
    model: {
      code: string;
      text: string;
    };
    registration: string;
    country: {
      id: number;
      name: string;
      alpha2: string;
      alpha3: string;
    };
  };
  airline: {
    name: string;
    code: {
      iata: string;
      icao: string;
    };
  };
  airport: {
    origin: {
      name: string;
      code: {
        iata: string;
        icao: string;
      };
      position: {
        latitude: number;
        longitude: number;
        country: {
          name: string;
          code: string;
          id: number;
        };
        region: {
          city: string;
        };
      };
      timezone: {
        name: string;
        offset: number;
        abbr: string;
        abbrName: string;
        isDst: boolean;
      };
    };
    destination: {
      name: string;
      code: {
        iata: string;
        icao: string;
      };
      position: {
        latitude: number;
        longitude: number;
        country: {
          name: string;
          code: string;
          id: number;
        };
        region: {
          city: string;
        };
      };
      timezone: {
        name: string;
        offset: number;
        abbr: string;
        abbrName: string;
        isDst: boolean;
      };
    };
    real: null;
  };
  time: {
    scheduled: {
      departure: number;
      arrival: number;
    };
    real: {
      departure: number | null;
      arrival: number | null;
    };
    estimated: {
      departure: number | null;
      arrival: number | null;
    };
    other: {
      eta: number | null;
    };
  };
}

export interface FlightRadarRoutesResponse {
  result: {
    request: {
      query: 'default';
      limit: number;
      format: 'json';
      origin: string;
      destination: string;
      fetchBy: string;
      callback: string | null;
      token: string | null;
      pk: string | null;
    };
    response: {
      flight: {
        item: {
          current: number;
        };
        timestamp: string;
        data: FlightRadarRouteResult[];
      };
    };
  };
}
