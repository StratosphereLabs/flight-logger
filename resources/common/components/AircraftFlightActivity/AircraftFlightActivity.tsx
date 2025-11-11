import classNames from 'classnames';
import { useRef } from 'react';
import { Loading } from 'stratosphere-ui';

import {
  sortByArrivalTimeDesc,
  sortByDepartureTimeAsc,
} from '../../../pages/Home/utils';
import { trpc } from '../../../utils/trpc';
import { useCardClassNames } from '../../hooks';
import { AircraftFlightHistoryRow } from './AircraftFlightHistoryRow';

export interface AircraftFlightHistoryProps {
  airframeId: string;
}

export const AircraftFlightActivity = ({
  airframeId,
}: AircraftFlightHistoryProps): JSX.Element => {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const cardClassNames = useCardClassNames();
  const { data, isFetching } = trpc.flights.getAircraftOtherFlights.useQuery({
    icao24: airframeId,
  });
  return (
    <div
      className={classNames(
        'flex w-full flex-col gap-2 text-sm',
        cardClassNames,
      )}
    >
      <div className="text-base font-semibold" ref={headerRef}>
        Flight Activity
      </div>
      {data?.count === 0 && !isFetching ? (
        <div className="my-4 text-center">No Flights Found</div>
      ) : null}
      {isFetching ? (
        <div className="flex justify-center">
          <Loading />
        </div>
      ) : (
        <div className="mx-[-4px] flex flex-1 flex-col gap-2">
          {data?.groupedFlights.CURRENT?.sort(sortByDepartureTimeAsc).map(
            flight => (
              <AircraftFlightHistoryRow
                key={flight.id}
                flight={flight}
                previousPageName={`Aircraft ${airframeId}`}
              />
            ),
          )}
          {data?.groupedFlights.UPCOMING?.sort(sortByDepartureTimeAsc).map(
            flight => (
              <AircraftFlightHistoryRow
                key={flight.id}
                flight={flight}
                previousPageName={`Aircraft ${airframeId}`}
              />
            ),
          )}
          {data?.groupedFlights.COMPLETED?.sort(sortByArrivalTimeDesc).map(
            flight => (
              <AircraftFlightHistoryRow
                key={flight.id}
                flight={flight}
                previousPageName={`Aircraft ${airframeId}`}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
};
