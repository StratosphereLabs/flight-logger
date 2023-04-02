export interface UnitedAwardCalendarCharacteristic {
  Code: string;
  Value: string;
}

export interface UnitedAwardCalendarTiming {
  Name: string;
  TimeMilliseconds: string;
  DTStart: null;
}

export interface FlightFinderRequest {
  departureAirport: string;
  arrivalAirport: string;
  fromDate: string;
  toDate: string;
}

export interface UnitedAwardCalendarResponse {
  data: {
    CalendarLengthOfStay: number;
    CardId: string;
    Characteristics: UnitedAwardCalendarCharacteristic[];
    Timings: UnitedAwardCalendarTiming[];
    LangCode: string;
    LastCallDateTime: string;
    LastTripIndexRequested: number;
    ServerName: string;
    Status: number;
    TripCount: number;
    RecentSearchVersion: string;
    Version: string;
    Calendar: {
      SolutionSet: null;
      LoadedFromCache: boolean;
      LengthOfStay: number;
      MaxLengthOfStay: number;
      AdvancePurchase: number;
      CalendarWindow: number;
      TaxCurrency: null;
      Months: Array<{
        ShowPreviousMonthIndicator: boolean;
        ShowNextMonthIndicator: boolean;
        Year: number;
        Month: number;
        Weeks: Array<{
          Year: number;
          Month: number;
          Days: Array<{
            Year: number;
            Month: number;
            AwardMileage: null;
            Cheapest: boolean;
            DateValue: string;
            ReturnDateValue: null;
            DayNotInThisMonth: boolean;
            Display: boolean;
            DisplayCurrency: null;
            DisplayFare: number;
            Economy: boolean;
            First: boolean;
            SolutionKey: null;
            TaxTotal: null;
            TravelDateRange: boolean;
            DayFareInfos: [];
            Solutions: Array<{
              AwardMileage: null;
              AwardType: string;
              CabinType: string;
              Prices: Array<{
                Currency: string;
                CurrencyAllPax: null;
                Amount: number;
                AmountAllPax: number;
                AmountBase: number;
                PricingType: string;
                PricingDetails: null;
              }>;
              Cheapest: boolean;
              DateValue: string;
              ReturnDateValue: null;
              DayNotInThisMonth: boolean;
              Display: boolean;
              DisplayFare: number;
              SolutionKey: null;
              TaxTotal: null;
              TravelDateRange: boolean;
              DayFareInfos: [];
            }>;
          }>;
        }>;
      }>;
    };
  };
}

export interface UnitedAwardCalendarError {
  errors: Array<{
    id: string;
    status: number;
    code: string;
    detail: string;
  }>;
}
