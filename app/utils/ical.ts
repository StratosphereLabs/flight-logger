import ical, { type VEvent } from 'node-ical';

// Regex to remove zero-width characters that apps like Flighty insert
// eslint-disable-next-line no-misleading-character-class
const ZERO_WIDTH_CHARS_REGEX = /[\u200B\u200C\u200D\uFEFF]/g;

export interface ParsedFlightEvent {
  uid: string;
  summary: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  rawEvent: VEvent;
}

export interface FlightData {
  airline?: string;
  flightNumber?: number;
  departureAirport?: string;
  arrivalAirport?: string;
  outTime?: Date;
  inTime?: Date;
  rawSummary: string;
}

/**
 * Parse iCal events into flight event objects
 */
const parseEvents = (data: ical.CalendarResponse): ParsedFlightEvent[] => {
  const events: ParsedFlightEvent[] = [];

  for (const key in data) {
    const event = data[key];
    if (event.type !== 'VEVENT') continue;

    // Convert dates to JavaScript Date objects
    const start =
      event.start instanceof Date ? event.start : new Date(event.start);
    const end = event.end instanceof Date ? event.end : new Date(event.end);

    events.push({
      uid: event.uid,
      summary:
        event.summary !== undefined && event.summary !== ''
          ? event.summary
          : '',
      start,
      end,
      location: event.location,
      description: event.description,
      rawEvent: event,
    });
  }

  return events;
};

/**
 * Parse flight information from text (summary or description)
 */
const parseSummary = (text: string): Partial<FlightData> => {
  const result: Partial<FlightData> = {};

  // Remove zero-width characters that Flighty uses
  const cleanText = text.replace(ZERO_WIDTH_CHARS_REGEX, '');

  // Common patterns:
  // "✈ BRU→EWR • UA 998" (Flighty)
  // "AA 1234 JFK-LAX"
  // "American Airlines 1234 from JFK to LAX"
  // "DL1234 JFK to LAX"
  // "Flight 1 of 2 | DL2709 | IAH to ATL"

  // Extract airline code and flight number
  // Try multiple patterns in order of specificity
  const airlineFlightPatterns = [
    /•\s*([A-Z]{2})\s*(\d{1,4})\b/, // Flighty: • UA 998
    /\|\s*([A-Z]{2})(\d{1,4})\s*\|/, // Delta: | DL2709 |
    /\b([A-Z]{2,3})\s*(\d{1,4})\b/, // Standard: AA 1234 or AA1234
    /Flight[:\s]+([A-Z]{2})\s*(\d{1,4})\b/i, // Flight: AS 453
  ];

  for (const pattern of airlineFlightPatterns) {
    const match = cleanText.match(pattern);
    if (match !== null) {
      result.airline = match[1];
      result.flightNumber = parseInt(match[2], 10);
      break;
    }
  }

  // Extract airports
  const airports = parseAirports(cleanText);
  result.departureAirport = airports.departureAirport;
  result.arrivalAirport = airports.arrivalAirport;

  return result;
};

/**
 * Extract airport codes from text
 */
const parseAirports = (
  text: string,
): {
  departureAirport?: string;
  arrivalAirport?: string;
} => {
  // Remove zero-width characters that Flighty uses
  const cleanText = text.replace(ZERO_WIDTH_CHARS_REGEX, '');

  // Look for patterns like "JFK-LAX", "JFK to LAX", "from JFK to LAX", "JFK→LHR" (Flighty)
  const patterns = [
    /([A-Z]{3})\s*→\s*([A-Z]{3})/, // JFK→LHR (Flighty arrow format)
    /([A-Z]{3})\s*[-–—]\s*([A-Z]{3})/, // JFK-LAX (dash/en dash/em dash)
    /\bfrom\s+([A-Z]{3})\s+to\s+([A-Z]{3})\b/i, // from JFK to LAX
    /([A-Z]{3})\s+to\s+([A-Z]{3})\b/, // JFK to LAX
    /\|\s*([A-Z]{3})\s+to\s+([A-Z]{3})\b/i, // | IAH to ATL (Delta format)
  ];

  for (const pattern of patterns) {
    const match = cleanText.match(pattern);
    if (match !== null) {
      return {
        departureAirport: match[1].toUpperCase(),
        arrivalAirport: match[2].toUpperCase(),
      };
    }
  }

  // Try to find airport codes in parentheses: "Depart: Houston, TX (IAH)" ... "Arrive: Seattle, WA (SEA)"
  // This handles Alaska Airlines format
  const departMatch = cleanText.match(/\bDepart[^(]*\(([A-Z]{3})\)/i);
  const arriveMatch = cleanText.match(/\bArrive[^(]*\(([A-Z]{3})\)/i);
  if (departMatch !== null && arriveMatch !== null) {
    return {
      departureAirport: departMatch[1].toUpperCase(),
      arrivalAirport: arriveMatch[1].toUpperCase(),
    };
  }

  return {};
};

/**
 * Fetch and parse iCal data from a URL
 */
export const fetchCalendar = async (
  url: string,
): Promise<ParsedFlightEvent[]> => {
  try {
    const data = await ical.fromURL(url);
    return parseEvents(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch calendar from ${url}: ${message}`);
  }
};

/**
 * Extract flight information from an iCal event summary
 * Supports common formats like "AA 1234 JFK-LAX" or "American Airlines 1234 from JFK to LAX"
 */
export const extractFlightData = (event: ParsedFlightEvent): FlightData => {
  const { summary, location, description } = event;

  let flightData: FlightData = {
    rawSummary: summary,
    outTime: event.start,
    inTime: event.end,
  };

  // Try to parse from summary first
  flightData = { ...flightData, ...parseSummary(summary) };

  // If airports not found in summary, try location
  let hasDepartureAirport =
    flightData.departureAirport !== undefined &&
    flightData.departureAirport !== '';
  let hasArrivalAirport =
    flightData.arrivalAirport !== undefined && flightData.arrivalAirport !== '';
  const hasLocation = location !== undefined && location !== '';

  if (!hasDepartureAirport && !hasArrivalAirport && hasLocation) {
    const airports = parseAirports(location);
    flightData = { ...flightData, ...airports };
  }

  // Additional parsing from description if available
  const hasDescription = description !== undefined && description !== '';
  const hasAirline =
    flightData.airline !== undefined && flightData.airline !== '';
  const hasFlightNumber =
    flightData.flightNumber !== undefined && flightData.flightNumber !== 0;

  if (hasDescription && (!hasAirline || !hasFlightNumber)) {
    const descData = parseSummary(description);
    flightData = {
      ...flightData,
      airline: hasAirline ? flightData.airline : descData.airline,
      flightNumber: hasFlightNumber
        ? flightData.flightNumber
        : descData.flightNumber,
    };
  }

  // If still missing airports, try description (handles Alaska Airlines format)
  hasDepartureAirport =
    flightData.departureAirport !== undefined &&
    flightData.departureAirport !== '';
  hasArrivalAirport =
    flightData.arrivalAirport !== undefined && flightData.arrivalAirport !== '';

  if (hasDescription && (!hasDepartureAirport || !hasArrivalAirport)) {
    const descAirports = parseAirports(description);
    flightData = {
      ...flightData,
      departureAirport: hasDepartureAirport
        ? flightData.departureAirport
        : descAirports.departureAirport,
      arrivalAirport: hasArrivalAirport
        ? flightData.arrivalAirport
        : descAirports.arrivalAirport,
    };
  }

  return flightData;
};

/**
 * Check if an event appears to be a flight based on content
 */
export const isFlightEvent = (event: ParsedFlightEvent): boolean => {
  const { summary, location, description } = event;
  const locationStr = location ?? '';
  const descriptionStr = description ?? '';

  // Remove zero-width characters
  const cleanSummary = summary.replace(ZERO_WIDTH_CHARS_REGEX, '');
  const cleanLocation = locationStr.replace(ZERO_WIDTH_CHARS_REGEX, '');
  const cleanDescription = descriptionStr.replace(ZERO_WIDTH_CHARS_REGEX, '');

  const text = `${cleanSummary} ${cleanLocation} ${cleanDescription}`;

  // Strong indicators - if any match, it's likely a flight
  const strongIndicators = [
    /✈/, // Flighty airplane emoji
    /\b[A-Z]{2}\s*\d{1,4}\b/, // Airline code + flight number (UA 998, DL2709)
    /[A-Z]{3}\s*→\s*[A-Z]{3}/, // Airport arrow format (BRU→EWR)
    /[A-Z]{3}\s*[-–—]\s*[A-Z]{3}/, // Airport dash format (JFK-LAX)
    /\bflight\s*(#|number|:)?\s*\d+/i, // "flight 123", "flight #123"
    /\b(airline|airways)\s+itinerary\b/i, // "Alaska Airlines Itinerary"
    /\bconfirmation\s*(code|number|#)?\s*:?\s*[A-Z0-9]{5,}/i, // Confirmation codes
    /flighty:\/\/flight/i, // Flighty deep link
  ];

  for (const indicator of strongIndicators) {
    if (indicator.test(text)) {
      return true;
    }
  }

  // Weaker indicators - need multiple matches
  let weakMatches = 0;

  // Has flight number pattern
  if (/\b\d{1,4}\b/.test(cleanSummary)) weakMatches++;

  // Has potential airport codes (3 uppercase letters)
  const airportMatches = text.match(/\b[A-Z]{3}\b/g);
  if (airportMatches !== null && airportMatches.length >= 2) weakMatches++;

  // Has flight-related keywords
  if (/\b(flight|depart|arrive|boarding)\b/i.test(text)) weakMatches++;

  return weakMatches >= 2;
};
