import type { FlightClass, FlightReason, SeatPosition } from '@prisma/client';
import { isBefore } from 'date-fns';

import { METERS_IN_MILE } from '../constants';
import {
  type AircraftTypeData,
  type AirlineData,
  type AirportData,
  type ClassData,
  type CountryData,
  type FlightLengthData,
  type FlightTypeData,
  type ReasonData,
  type RegionData,
  type RouteData,
  type SeatPositionData,
} from '../schemas';
import { getDurationMinutes } from './datetime';
import { calculateDistance } from './distance';

export const getOnTimeStreak = (
  flightData: Array<{
    inTime: Date;
    inTimeActual: Date | null;
  }>,
): number => {
  let onTimeStreak = 0;
  for (const flight of flightData) {
    if (flight.inTimeActual !== null) {
      const arrivalDelay = isBefore(flight.inTime, flight.inTimeActual)
        ? getDurationMinutes({
            start: flight.inTime,
            end: flight.inTimeActual,
          })
        : 0;
      if (arrivalDelay >= 15) {
        break;
      }
      onTimeStreak++;
    }
  }
  return onTimeStreak;
};

export const getTotals = (
  flights: Array<{
    departureAirport: {
      lat: number;
      lon: number;
    };
    arrivalAirport: {
      lat: number;
      lon: number;
    };
    diversionAirport: {
      lat: number;
      lon: number;
    } | null;
    inTime: Date;
    inTimeActual: Date | null;
    duration: number;
  }>,
): {
  onTimePercentage: number | null;
  totalFlights: number;
  totalDuration: number;
  totalDurationDays: number;
  totalDistanceMi: number;
  totalDistanceKm: number;
} => {
  let totalDuration = 0;
  let totalDistanceMi = 0;
  let onTimeFlights = 0;
  let flightsWithInTimeActual = 0;
  for (const flight of flights) {
    totalDuration += flight.duration;
    const distanceMi = calculateDistance(
      flight.departureAirport.lat,
      flight.departureAirport.lon,
      flight.diversionAirport?.lat ?? flight.arrivalAirport.lat,
      flight.diversionAirport?.lon ?? flight.arrivalAirport.lon,
    );
    totalDistanceMi += distanceMi;
    if (flight.inTimeActual !== null) {
      flightsWithInTimeActual++;
      const arrivalDelay = isBefore(flight.inTime, flight.inTimeActual)
        ? getDurationMinutes({
            start: flight.inTime,
            end: flight.inTimeActual,
          })
        : 0;
      if (arrivalDelay <= 15) {
        onTimeFlights++;
      }
    }
  }
  const totalFlights = flights.length;
  const onTimePercentage =
    flightsWithInTimeActual > 0
      ? 100 * (onTimeFlights / flightsWithInTimeActual)
      : null;
  const totalDurationDays = totalDuration / 1440;
  const totalDistanceKm = totalDistanceMi * (METERS_IN_MILE / 1000);
  return {
    onTimePercentage,
    totalFlights,
    totalDuration,
    totalDurationDays,
    totalDistanceMi,
    totalDistanceKm,
  };
};

export const getTopRoutes = (
  flights: Array<{
    departureAirport: {
      iata: string;
    };
    arrivalAirport: {
      iata: string;
    };
    diversionAirport: {
      iata: string;
    } | null;
  }>,
): {
  routeCount: number;
  routeChartData: RouteData[];
  cityPairCount: number;
  cityPairChartData: RouteData[];
} => {
  const routeDataMap: Record<string, RouteData> = {};
  const cityPairDataMap: Record<string, RouteData> = {};
  for (const flight of flights) {
    const arrivalAirport = flight.diversionAirport ?? flight.arrivalAirport;
    const routeKey = `${flight.departureAirport.iata}→${arrivalAirport.iata}`;
    const cityPairKey = [flight.departureAirport.iata, arrivalAirport.iata]
      .sort((a, b) => a.localeCompare(b))
      .join('↔');
    if (routeDataMap[routeKey] === undefined) {
      routeDataMap[routeKey] = { route: routeKey, flights: 0 };
    }
    if (cityPairDataMap[cityPairKey] === undefined) {
      cityPairDataMap[cityPairKey] = { route: cityPairKey, flights: 0 };
    }
    routeDataMap[routeKey].flights++;
    cityPairDataMap[cityPairKey].flights++;
  }
  return {
    routeCount: Object.keys(routeDataMap).length,
    routeChartData: Object.values(routeDataMap),
    cityPairCount: Object.keys(cityPairDataMap).length,
    cityPairChartData: Object.values(cityPairDataMap),
  };
};

export const getTopAirlines = (
  flights: Array<{
    departureAirport: {
      lat: number;
      lon: number;
    };
    arrivalAirport: {
      lat: number;
      lon: number;
    };
    diversionAirport: {
      lat: number;
      lon: number;
    } | null;
    airline: {
      id: string;
      name: string;
      iata: string | null;
      icao: string;
    } | null;
    duration: number;
  }>,
): {
  count: number;
  chartData: AirlineData[];
} => {
  const airlineDataMap: Record<string, AirlineData> = {};
  for (const flight of flights) {
    if (flight.airline === null) continue;
    const key = flight.airline.iata !== null ? `${flight.airline.iata}/` : '';
    const airlineKey = `${key}${flight.airline.icao}`;
    if (airlineDataMap[airlineKey] === undefined) {
      airlineDataMap[airlineKey] = {
        id: flight.airline.id,
        airline: airlineKey,
        name: flight.airline.name,
        flights: 0,
        distance: 0,
        duration: 0,
      };
    }
    const arrivalAirport = flight.diversionAirport ?? flight.arrivalAirport;
    const distance = calculateDistance(
      flight.departureAirport.lat,
      flight.departureAirport.lon,
      arrivalAirport.lat,
      arrivalAirport.lon,
    );
    const airlineData = airlineDataMap[airlineKey];
    airlineData.flights++;
    airlineData.distance += distance;
    airlineData.duration += flight.duration;
  }
  return {
    count: Object.keys(airlineDataMap).length,
    chartData: Object.values(airlineDataMap),
  };
};

export const getTopAirports = (
  flights: Array<{
    departureAirport: {
      id: string;
      iata: string;
      name: string;
    };
    arrivalAirport: {
      id: string;
      iata: string;
      name: string;
    };
    diversionAirport: {
      id: string;
      iata: string;
      name: string;
    } | null;
  }>,
): {
  count: number;
  chartData: AirportData[];
} => {
  const airportDataMap: Record<string, AirportData> = {};
  for (const flight of flights) {
    const departureAirportId = flight.departureAirport.id;
    if (airportDataMap[departureAirportId] === undefined) {
      airportDataMap[departureAirportId] = {
        id: departureAirportId,
        airport: flight.departureAirport.iata,
        name: flight.departureAirport.name,
        all: 0,
        departure: 0,
        arrival: 0,
      };
    }
    airportDataMap[departureAirportId].all++;
    airportDataMap[departureAirportId].departure++;
    const arrivalAirport = flight.diversionAirport ?? flight.arrivalAirport;
    if (airportDataMap[arrivalAirport.id] === undefined) {
      airportDataMap[arrivalAirport.id] = {
        id: arrivalAirport.id,
        airport: arrivalAirport.iata,
        name: arrivalAirport.name,
        all: 0,
        departure: 0,
        arrival: 0,
      };
    }
    if (departureAirportId !== arrivalAirport.id) {
      airportDataMap[arrivalAirport.id].all++;
    }
    airportDataMap[arrivalAirport.id].arrival++;
  }
  return {
    count: Object.keys(airportDataMap).length,
    chartData: Object.values(airportDataMap),
  };
};

export const getTopAircraftTypes = (
  flights: Array<{
    departureAirport: {
      lat: number;
      lon: number;
    };
    arrivalAirport: {
      lat: number;
      lon: number;
    };
    diversionAirport: {
      lat: number;
      lon: number;
    } | null;
    duration: number;
    airframe: {
      aircraftType: {
        id: string;
        icao: string;
        name: string;
      } | null;
    } | null;
    aircraftType: {
      id: string;
      icao: string;
      name: string;
    } | null;
  }>,
): {
  count: number;
  chartData: AircraftTypeData[];
} => {
  const aircraftTypeDataMap: Record<string, AircraftTypeData> = {};
  for (const flight of flights) {
    const aircraftType = flight.airframe?.aircraftType ?? flight.aircraftType;
    if (aircraftType === null) continue;
    const icao = aircraftType.icao;
    if (aircraftTypeDataMap[icao] === undefined) {
      aircraftTypeDataMap[icao] = {
        id: aircraftType.id,
        aircraftType: icao,
        name: aircraftType.name,
        flights: 0,
        distance: 0,
        duration: 0,
      };
    }
    const arrivalAirport = flight.diversionAirport ?? flight.arrivalAirport;
    const distance = calculateDistance(
      flight.departureAirport.lat,
      flight.departureAirport.lon,
      arrivalAirport.lat,
      arrivalAirport.lon,
    );
    const aircraftTypeData = aircraftTypeDataMap[icao];
    aircraftTypeData.flights++;
    aircraftTypeData.distance += distance;
    aircraftTypeData.duration += flight.duration;
  }
  return {
    count: Object.keys(aircraftTypeDataMap).length,
    chartData: Object.values(aircraftTypeDataMap),
  };
};

export const getTopCountries = (
  flights: Array<{
    departureAirport: {
      country: {
        id: string;
        name: string;
      };
    };
    arrivalAirport: {
      country: {
        id: string;
        name: string;
      };
    };
    diversionAirport: {
      country: {
        id: string;
        name: string;
      };
    } | null;
  }>,
): {
  count: number;
  chartData: CountryData[];
} => {
  const countriesDataMap: Record<string, CountryData> = {};
  for (const flight of flights) {
    const departureCountryId = flight.departureAirport.country.id;
    const arrivalCountry =
      flight.diversionAirport?.country ?? flight.arrivalAirport.country;
    if (countriesDataMap[departureCountryId] === undefined) {
      countriesDataMap[departureCountryId] = {
        id: departureCountryId,
        country: flight.departureAirport.country.name,
        all: 0,
        departure: 0,
        arrival: 0,
      };
    }
    countriesDataMap[departureCountryId].all++;
    countriesDataMap[departureCountryId].departure++;
    if (countriesDataMap[arrivalCountry.id] === undefined) {
      countriesDataMap[arrivalCountry.id] = {
        id: arrivalCountry.id,
        country: arrivalCountry.name,
        all: 0,
        departure: 0,
        arrival: 0,
      };
    }
    if (departureCountryId !== arrivalCountry.id) {
      countriesDataMap[arrivalCountry.id].all++;
    }
    countriesDataMap[arrivalCountry.id].arrival++;
  }
  return {
    count: Object.keys(countriesDataMap).length,
    chartData: Object.values(countriesDataMap),
  };
};

export const getTopRegions = (
  flights: Array<{
    departureAirport: {
      region: {
        id: string;
        name: string;
      };
    };
    arrivalAirport: {
      region: {
        id: string;
        name: string;
      };
    };
    diversionAirport: {
      region: {
        id: string;
        name: string;
      };
    } | null;
  }>,
): {
  count: number;
  chartData: RegionData[];
} => {
  const regionsDataMap: Record<string, RegionData> = {};
  for (const flight of flights) {
    const departureRegionId = flight.departureAirport.region.id;
    const arrivalRegion =
      flight.diversionAirport?.region ?? flight.arrivalAirport.region;
    if (regionsDataMap[departureRegionId] === undefined) {
      regionsDataMap[departureRegionId] = {
        id: departureRegionId,
        region: flight.departureAirport.region.name,
        all: 0,
        departure: 0,
        arrival: 0,
      };
    }
    regionsDataMap[departureRegionId].all++;
    regionsDataMap[departureRegionId].departure++;
    if (regionsDataMap[arrivalRegion.id] === undefined) {
      regionsDataMap[arrivalRegion.id] = {
        id: arrivalRegion.id,
        region: arrivalRegion.name,
        all: 0,
        departure: 0,
        arrival: 0,
      };
    }
    if (departureRegionId !== arrivalRegion.id) {
      regionsDataMap[arrivalRegion.id].all++;
    }
    regionsDataMap[arrivalRegion.id].arrival++;
  }
  return {
    count: Object.keys(regionsDataMap).length,
    chartData: Object.values(regionsDataMap),
  };
};

export const getReasonDistributionData = (
  flights: Array<{
    departureAirport: {
      lat: number;
      lon: number;
    };
    arrivalAirport: {
      lat: number;
      lon: number;
    };
    diversionAirport: {
      lat: number;
      lon: number;
    } | null;
    duration: number;
    reason: FlightReason | null;
  }>,
): ReasonData[] => {
  const reasonDataMap: Record<string, ReasonData> = {
    LEISURE: {
      reason: 'Leisure',
      flights: 0,
      distance: 0,
      duration: 0,
    },
    BUSINESS: {
      reason: 'Business',
      flights: 0,
      distance: 0,
      duration: 0,
    },
    CREW: {
      reason: 'Crew',
      flights: 0,
      distance: 0,
      duration: 0,
    },
  };
  for (const {
    departureAirport,
    arrivalAirport: scheduledArrivalAirport,
    diversionAirport,
    duration,
    reason,
  } of flights) {
    if (reason !== null) {
      const arrivalAirport = diversionAirport ?? scheduledArrivalAirport;
      const distance = calculateDistance(
        departureAirport.lat,
        departureAirport.lon,
        arrivalAirport.lat,
        arrivalAirport.lon,
      );
      reasonDataMap[reason].flights++;
      reasonDataMap[reason].distance += distance;
      reasonDataMap[reason].duration += duration;
    }
  }
  return Object.values(reasonDataMap);
};

export const getSeatPositionData = (
  flights: Array<{
    departureAirport: {
      lat: number;
      lon: number;
    };
    arrivalAirport: {
      lat: number;
      lon: number;
    };
    diversionAirport: {
      lat: number;
      lon: number;
    } | null;
    duration: number;
    seatPosition: SeatPosition | null;
  }>,
): SeatPositionData[] => {
  const seatPositionDataMap: Record<string, SeatPositionData> = {
    AISLE: {
      seatPosition: 'Aisle',
      flights: 0,
      distance: 0,
      duration: 0,
    },
    MIDDLE: {
      seatPosition: 'Middle',
      flights: 0,
      distance: 0,
      duration: 0,
    },
    WINDOW: {
      seatPosition: 'Window',
      flights: 0,
      distance: 0,
      duration: 0,
    },
  };
  for (const {
    departureAirport,
    arrivalAirport: scheduledArrivalAirport,
    diversionAirport,
    duration,
    seatPosition,
  } of flights) {
    if (seatPosition !== null) {
      const arrivalAirport = diversionAirport ?? scheduledArrivalAirport;
      const distance = calculateDistance(
        departureAirport.lat,
        departureAirport.lon,
        arrivalAirport.lat,
        arrivalAirport.lon,
      );
      seatPositionDataMap[seatPosition].flights++;
      seatPositionDataMap[seatPosition].distance += distance;
      seatPositionDataMap[seatPosition].duration += duration;
    }
  }
  return Object.values(seatPositionDataMap);
};

export const getClassData = (
  flights: Array<{
    departureAirport: {
      lat: number;
      lon: number;
    };
    arrivalAirport: {
      lat: number;
      lon: number;
    };
    diversionAirport: {
      lat: number;
      lon: number;
    } | null;
    duration: number;
    class: FlightClass | null;
  }>,
): ClassData[] => {
  const classDataMap: Record<string, ClassData> = {
    BASIC: {
      flightClass: 'Basic Economy',
      flights: 0,
      distance: 0,
      duration: 0,
    },
    ECONOMY: {
      flightClass: 'Economy',
      flights: 0,
      distance: 0,
      duration: 0,
    },
    PREMIUM: {
      flightClass: 'Premium',
      flights: 0,
      distance: 0,
      duration: 0,
    },
    BUSINESS: {
      flightClass: 'Business',
      flights: 0,
      distance: 0,
      duration: 0,
    },
    FIRST: {
      flightClass: 'First',
      flights: 0,
      distance: 0,
      duration: 0,
    },
  };
  for (const {
    departureAirport,
    arrivalAirport: scheduledArrivalAirport,
    diversionAirport,
    class: flightClass,
    duration,
  } of flights) {
    if (flightClass !== null) {
      const arrivalAirport = diversionAirport ?? scheduledArrivalAirport;
      const distance = calculateDistance(
        departureAirport.lat,
        departureAirport.lon,
        arrivalAirport.lat,
        arrivalAirport.lon,
      );
      classDataMap[flightClass].flights++;
      classDataMap[flightClass].distance += distance;
      classDataMap[flightClass].duration += duration;
    }
  }
  return Object.values(classDataMap);
};

export const getFlightTypeData = (
  flights: Array<{
    departureAirport: {
      countryId: string;
      lat: number;
      lon: number;
    };
    arrivalAirport: {
      countryId: string;
      lat: number;
      lon: number;
    };
    diversionAirport: {
      countryId: string;
      lat: number;
      lon: number;
    } | null;
    duration: number;
  }>,
): FlightTypeData[] => {
  const flightTypeDataMap: Record<string, FlightTypeData> = {
    domestic: {
      id: 'Domestic',
      label: 'Domestic',
      flights: 0,
      duration: 0,
      distance: 0,
    },
    international: {
      id: "Int'l",
      label: 'International',
      flights: 0,
      duration: 0,
      distance: 0,
    },
  };
  for (const {
    departureAirport,
    arrivalAirport: scheduledArrivalAirport,
    diversionAirport,
    duration,
  } of flights) {
    const arrivalAirport = diversionAirport ?? scheduledArrivalAirport;
    const flightType =
      departureAirport.countryId === arrivalAirport.countryId
        ? 'domestic'
        : 'international';
    const distance = calculateDistance(
      departureAirport.lat,
      departureAirport.lon,
      arrivalAirport.lat,
      arrivalAirport.lon,
    );
    flightTypeDataMap[flightType].flights++;
    flightTypeDataMap[flightType].duration += duration;
    flightTypeDataMap[flightType].distance += distance;
  }
  return Object.values(flightTypeDataMap);
};

export const getFlightLengthData = (
  flights: Array<{
    departureAirport: {
      lat: number;
      lon: number;
    };
    arrivalAirport: {
      lat: number;
      lon: number;
    };
    diversionAirport: {
      lat: number;
      lon: number;
    } | null;
    duration: number;
  }>,
): FlightLengthData[] => {
  const flightLengthDataMap: Record<string, FlightLengthData> = {
    short: {
      flightLength: 'Short',
      flights: 0,
      distance: 0,
      duration: 0,
    },
    medium: {
      flightLength: 'Medium',
      flights: 0,
      distance: 0,
      duration: 0,
    },
    long: {
      flightLength: 'Long',
      flights: 0,
      distance: 0,
      duration: 0,
    },
    ultraLong: {
      flightLength: 'Ultra Long',
      flights: 0,
      distance: 0,
      duration: 0,
    },
  };
  for (const {
    departureAirport,
    arrivalAirport: scheduledArrivalAirport,
    diversionAirport,
    duration,
  } of flights) {
    const arrivalAirport = diversionAirport ?? scheduledArrivalAirport;
    const flightDistance = calculateDistance(
      departureAirport.lat,
      departureAirport.lon,
      arrivalAirport.lat,
      arrivalAirport.lon,
    );
    if (duration > 960) {
      flightLengthDataMap.ultraLong.flights++;
      flightLengthDataMap.ultraLong.distance += flightDistance;
      flightLengthDataMap.ultraLong.duration += duration;
    } else if (flightDistance > 2400 && duration > 360) {
      flightLengthDataMap.long.flights++;
      flightLengthDataMap.long.distance += flightDistance;
      flightLengthDataMap.long.duration += duration;
    } else if (flightDistance > 900 && duration > 180) {
      flightLengthDataMap.medium.flights++;
      flightLengthDataMap.medium.distance += flightDistance;
      flightLengthDataMap.medium.duration += duration;
    } else {
      flightLengthDataMap.short.flights++;
      flightLengthDataMap.short.distance += flightDistance;
      flightLengthDataMap.short.duration += duration;
    }
  }
  return Object.values(flightLengthDataMap);
};
