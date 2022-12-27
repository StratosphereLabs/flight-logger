import { Card, Divider, Progress } from 'react-daisyui';
import { useParams } from 'react-router-dom';
import { AirlineLogo } from '../../common/components';
import { trpc } from '../../utils/trpc';

export const Itinerary = (): JSX.Element | null => {
  const { id } = useParams();
  const { data, isLoading } = trpc.itineraries.getItinerary.useQuery(
    {
      id: id ?? '',
    },
    {
      enabled: id !== undefined,
    },
  );
  return (
    <>
      <div className="flex justify-center mb-4">
        <h1 className="text-3xl font-bold">Itinerary</h1>
      </div>
      {isLoading ? <Progress /> : null}
      {data?.flights.map((flight, index) => (
        <>
          {flight.layoverDuration > 0 ? (
            <Divider>
              Layover at {flight.departureAirport.iata} (
              {flight.layoverDuration} min)
            </Divider>
          ) : null}
          <Card key={index} className="bg-base-200 shadow-xl">
            <Card.Body className="flex-row gap-4 justify-between items-center">
              <AirlineLogo
                className="hidden sm:block"
                url={flight.airline?.logo}
              />
              <div className="flex-1 flex flex-col opacity-80">
                {flight.airline?.name}
                <div className="opacity-60 text-xs">
                  {flight.airline?.iata ?? ''} {flight.flightNumber}
                </div>
              </div>
              <div className="flex-[3] flex font-semibold truncate">
                {flight.departureAirport.municipality} (
                {flight.departureAirport.iata}) to{' '}
                {flight.arrivalAirport.municipality} (
                {flight.arrivalAirport.iata})
              </div>
              <div className="flex-1 flex font-mono">
                {flight.duration[0] ?? 0}h {flight.duration[1] ?? 0}m
              </div>
              <div className="flex-1 flex flex-col text-sm gap-1">
                {flight.aircraftType?.name ?? ''}
                <div className="opacity-50 text-xs">{flight.class ?? ''}</div>
              </div>
            </Card.Body>
          </Card>
        </>
      ))}
    </>
  );
};
