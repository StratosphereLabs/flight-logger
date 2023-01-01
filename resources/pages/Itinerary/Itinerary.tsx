import classNames from 'classnames';
import { Card, Divider, Progress } from 'react-daisyui';
import { useParams } from 'react-router-dom';
import { Badge } from 'stratosphere-ui';
import { BADGE_COLORS_MAP, CLASS_TEXT_MAP } from './constants';
import { AirlineLogo, RightArrowIcon } from '../../common/components';
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
      {data?.map((flight, index) => (
        <>
          {flight.segmentTitle !== '' ? (
            <div
              className={classNames(
                'flex',
                'gap-4',
                'items-center',
                'font-semibold',
                'pl-1',
                index > 0 && 'mt-10',
                'mb-2',
              )}
            >
              <h2 className="text-lg">{flight.segmentTitle}</h2>
              <h2 className="text-md opacity-60">{flight.outDate}</h2>
            </div>
          ) : null}
          {flight.layoverDuration.length > 0 ? (
            <Divider className="opacity-90">
              Layover at {flight.departureAirport.iata} (
              {flight.layoverDuration})
            </Divider>
          ) : null}
          <Card key={index} className="bg-base-200 shadow-lg">
            <Card.Body className="flex-row gap-4 justify-between items-center">
              <AirlineLogo
                className="hidden md:block"
                url={flight.airline?.logo}
              />
              <div className="flex-1 flex flex-col gap-1">
                <div className="opacity-90">{flight.airline?.name}</div>
                {flight.flightNumber !== null ? (
                  <div className="text-xs opacity-60">
                    {flight.airline?.iata ?? ''} {flight.flightNumber}
                  </div>
                ) : null}
              </div>
              <div className="w-[120px] flex flex-col text-sm opacity-60">
                {flight.outDate}
              </div>
              <div className="flex-[3] flex flex-col gap-1 opacity-80">
                <div className="flex-1 flex gap-2 flex-wrap justify-center truncate">
                  <div className="font-semibold">
                    {flight.departureAirport.municipality} (
                    {flight.departureAirport.iata})
                  </div>
                  to
                  <div className="font-semibold">
                    {flight.arrivalAirport.municipality} (
                    {flight.arrivalAirport.iata})
                  </div>
                </div>
                <div className="flex-1 flex gap-2 justify-center items-center text-sm">
                  {flight.outTime} <RightArrowIcon />{' '}
                  <div>
                    {flight.inTime}
                    {flight.daysAdded > 0 ? (
                      <sup>+{flight.daysAdded}</sup>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="w-[100px] flex flex-col text-sm gap-1">
                <div className="opacity-60">Travel Time</div>
                <div className="font-mono opacity-90">{flight.duration}</div>
              </div>
              <div className="flex-1 hidden sm:flex flex-col text-sm gap-1">
                <div className="opacity-60">Aircraft</div>
                <div className="opacity-90">
                  {flight.aircraftType?.name ?? ''}
                </div>
              </div>
              <div className="hidden md:flex">
                {flight.class !== null ? (
                  <Badge
                    className="text-xs"
                    color={BADGE_COLORS_MAP[flight.class]}
                    size="sm"
                  >
                    {CLASS_TEXT_MAP[flight.class]}
                  </Badge>
                ) : null}
              </div>
            </Card.Body>
          </Card>
        </>
      ))}
    </>
  );
};
