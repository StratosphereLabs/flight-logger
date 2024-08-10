export interface FlightAwareAirport {
  TZ: string;
  isValidAirportCode: boolean;
  isCustomGlobalAirport: boolean;
  altIdent: string;
  iata: string;
  friendlyName: string;
  friendlyLocation: string;
  coord: [number, number];
  isLatLon: boolean;
  icao: string;
  gate: string | null;
  terminal: string | null;
  delays: null;
}

export interface FlightAwareFlightTimes {
  scheduled: number;
  estimated: number;
  actual: number | null;
}

export interface FlightAwareFlightPlan {
  speed: number | null;
  altitude: number | null;
  route: string;
  directDistance: number;
  plannedDistance: number | null;
  departure: number;
  ete: number;
  fuelBurn: {
    gallons: number;
    pounds: number;
  };
}

export interface FlightAwareFlightLinks {
  operated: string;
  registration: string;
  permanent: string;
  trackLog: string;
  flightHistory: string;
  buyFlightHistory: string;
  reportInaccuracies: string;
  facebook: string;
  twitter: string;
}

export interface FlightAwareFlightAircraft {
  type: string;
  lifeguard: boolean;
  heavy: boolean;
  tail: string | null;
  owner: string | null;
  ownerLocation: string | null;
  owner_type: string | null;
  canMessage: boolean;
  friendlyType: string;
  typeDetails: {
    manufacturer: string;
    model: string;
    type: string;
    engCount: string;
    engType: string;
  };
}

export interface FlightAwareFlightAirline {
  fullName: string;
  shortName: string;
  icao: string;
  iata: string;
  callsign: string;
  url: string;
}

export interface FlightAwareFlightData {
  origin: FlightAwareAirport;
  destination: FlightAwareAirport;
  aircraftType: string;
  aircraftTypeFriendly: string;
  flightId: string;
  takeoffTimes: FlightAwareFlightTimes;
  landingTimes: FlightAwareFlightTimes;
  gateDepartureTimes: FlightAwareFlightTimes;
  gateArrivalTimes: FlightAwareFlightTimes;
  ga: boolean;
  flightStatus: string;
  fpasAvailable: boolean;
  canEdit: boolean;
  cancelled: boolean;
  resultUnknown: boolean;
  diverted: boolean;
  adhoc: boolean;
  fruOverride: boolean;
  timestamp: number | null;
  roundedTimestamp: number | null;
  permaLink: string | null;
  taxiIn: null;
  taxiOut: null;
  globalIdent: boolean;
  globalFlightFeatures: boolean;
  globalVisualizer: boolean;
  flightPlan: FlightAwareFlightPlan;
  links: FlightAwareFlightLinks;
  aircraft: FlightAwareFlightAircraft;
  displayIdent: string;
  encryptedFlightId: string;
  predictedAvailable: boolean;
  predictedTimes: {
    out: number | null;
    off: number | null;
    on: number | null;
    in: number | null;
  };
}

export interface FlightAwareTracklogItem {
  [x: string]: unknown;
  timestamp: number;
  coord: [number, number];
  alt: number | null;
  gs: number | null;
  type: string;
  isolated: boolean;
}

export interface FlightAwareFlight extends FlightAwareFlightData {
  activityLog:
    | {
        flights: FlightAwareFlightData[] | undefined;
        additionalLogRowsAvailable: boolean;
      }
    | undefined;
  track: FlightAwareTracklogItem[] | undefined;
  waypoints: Array<[number, number]> | undefined;
}

export interface FlightAwareDataResponse {
  version: string;
  summary: boolean;
  flights: Record<string, FlightAwareFlight>;
}

export type FlightAwareDataResult = FlightAwareFlightData &
  Partial<Pick<FlightAwareFlight, 'waypoints' | 'track'>>;
