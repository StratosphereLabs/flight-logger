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
            <Divider>Layover ({flight.layoverDuration} min)</Divider>
          ) : null}
          <Card key={index} className="bg-base-200 shadow-xl">
            <Card.Body className="flex-row gap-4">
              <AirlineLogo url={flight.airline?.logo} />
              {flight.airline?.iata ?? ''} {flight.flightNumber}
            </Card.Body>
          </Card>
        </>
      ))}
    </>
  );
};
