import classNames from 'classnames';
import { Button, Card, Divider, Progress } from 'react-daisyui';
import { useParams } from 'react-router-dom';
import { Badge } from 'stratosphere-ui';
import { BADGE_COLORS_MAP, CLASS_TEXT_MAP } from './constants';
import { AirlineLogo, LinkIcon, RightArrowIcon } from '../../common/components';
import { APP_URL } from '../../common/constants';
import { useCopyToClipboard } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export const Itinerary = (): JSX.Element | null => {
  const { id } = useParams();
  const copyToClipboard = useCopyToClipboard();
  const { data, isLoading } = trpc.itineraries.getItinerary.useQuery(
    {
      id: id ?? '',
    },
    {
      enabled: id !== undefined,
    },
  );
  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-scroll p-3">
      <div className="relative mb-4 flex items-center justify-center">
        <h1 className="text-2xl font-bold sm:text-3xl">{data?.name}</h1>
        <Button
          startIcon={<LinkIcon />}
          className="absolute end-0"
          color="ghost"
          onClick={() =>
            copyToClipboard(
              `${APP_URL}/itinerary/${data?.id ?? ''}`,
              'Link copied to clipboard!',
            )
          }
        >
          <span className="hidden sm:block">Copy Link</span>
        </Button>
      </div>
      {isLoading ? <Progress /> : null}
      {data?.flights.map((flight, index) => (
        <>
          {flight.segmentTitle !== '' ? (
            <div
              className={classNames(
                'mb-2 flex items-center gap-4 pl-1 font-semibold',
                index > 0 && 'mt-10',
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
          <Card key={index} className="bg-base-100 shadow-lg">
            <Card.Body className="flex-row items-center justify-between gap-4">
              {flight.airline !== null ? (
                <AirlineLogo
                  alt="Airline Logo"
                  className="hidden md:block"
                  url={flight.airline?.logo}
                />
              ) : (
                'Unknown Airline'
              )}
              <div className="flex flex-1 flex-col gap-1">
                <div className="opacity-90">{flight.airline?.name}</div>
                {flight.flightNumber !== null ? (
                  <div className="text-xs opacity-60">
                    {flight.airline?.iata ?? ''} {flight.flightNumber}
                  </div>
                ) : null}
              </div>
              <div className="flex w-[120px] flex-col text-sm opacity-60">
                {flight.outDate}
              </div>
              <div className="flex flex-[3] flex-col gap-1 opacity-80">
                <div className="flex flex-1 flex-wrap justify-center gap-2 truncate">
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
                <div className="flex flex-1 items-center justify-center gap-2 text-sm">
                  {flight.outTime} <RightArrowIcon className="h-4 w-4" />{' '}
                  <div>
                    {flight.inTime}
                    {flight.daysAdded > 0 ? (
                      <sup>+{flight.daysAdded}</sup>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="flex w-[100px] flex-col gap-1 text-sm">
                <div className="opacity-60">Travel Time</div>
                <div className="font-mono opacity-90">{flight.duration}</div>
              </div>
              {flight.aircraftType !== null ? (
                <div className="hidden flex-1 flex-col gap-1 text-sm sm:flex">
                  <div className="opacity-60">Aircraft</div>
                  <div className="opacity-90">{flight.aircraftType.name}</div>
                </div>
              ) : null}
              {flight.class !== null ? (
                <div className="hidden md:flex">
                  <Badge
                    className="text-xs"
                    color={BADGE_COLORS_MAP[flight.class]}
                    size="sm"
                  >
                    {CLASS_TEXT_MAP[flight.class]}
                  </Badge>
                </div>
              ) : null}
            </Card.Body>
          </Card>
        </>
      ))}
    </div>
  );
};
