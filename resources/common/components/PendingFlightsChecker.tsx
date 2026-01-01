/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useEffect, useState } from 'react';

import { useLoggedInUserQuery } from '../../common/hooks';
import { PendingFlightsModal } from '../../pages/Account/PendingFlightsModal';
import { trpc } from '../../utils/trpc';

interface PendingFlightData {
  id: string;
  calendarSource: {
    name: string;
    url: string;
  };
  parsedData: unknown;
  detectedAt: string;
}

interface PendingFlightsResponse {
  flights: PendingFlightData[];
  total: number;
  hasMore: boolean;
}

export const PendingFlightsChecker = (): JSX.Element => {
  const { data: user } = useLoggedInUserQuery();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: pendingFlightsData, refetch } =
    trpc.calendars.getPendingFlights.useQuery(
      { limit: 50, offset: 0 },
      {
        enabled: user !== null && user !== undefined,
        refetchInterval: 30000, // Check every 30 seconds
      },
    );

  // Cast to our expected type to avoid deep type instantiation
  const pendingFlights = pendingFlightsData as
    | PendingFlightsResponse
    | undefined;

  useEffect(() => {
    if (
      pendingFlights !== null &&
      pendingFlights !== undefined &&
      pendingFlights.flights.length > 0 &&
      !modalOpen
    ) {
      setModalOpen(true);
    }
  }, [pendingFlights, modalOpen]);

  const handleClose = (): void => {
    setModalOpen(false);
  };

  const handleFlightsUpdated = (): void => {
    void refetch();
  };

  if (
    user === null ||
    user === undefined ||
    pendingFlights === null ||
    pendingFlights === undefined
  ) {
    return <></>;
  }

  const flightsData = pendingFlights.flights;
  if (!flightsData || flightsData.length === 0) {
    return <></>;
  }

  // Map to the expected format for PendingFlightsModal
  const formattedFlights = flightsData.map(f => ({
    id: f.id,
    calendarSource: f.calendarSource,
    parsedData: f.parsedData,
    detectedAt: f.detectedAt,
  }));

  return (
    <PendingFlightsModal
      isOpen={modalOpen}
      onClose={handleClose}
      pendingFlights={formattedFlights}
      onFlightsUpdated={handleFlightsUpdated}
    />
  );
};
