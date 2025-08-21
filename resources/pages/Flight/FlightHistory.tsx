import classNames from 'classnames';
import { useEffect, useMemo, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  Button,
  Form,
  FormRadio,
  FormRadioGroup,
  FormRadioGroupOption,
  Loading,
} from 'stratosphere-ui';

import { type GetUserFlightHistoryRequest } from '../../../app/schemas';
import { useLoggedInUserQuery } from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { FlightHistoryRow } from './FlightHistoryRow';
import { useCardClassNames } from './useCardClassNames';

export interface FlightHistoryProps {
  flightId: string;
}

export type FlightHistoryFormData = Pick<
  GetUserFlightHistoryRequest,
  'user' | 'mode'
>;

export const FlightHistory = ({
  flightId,
}: FlightHistoryProps): JSX.Element => {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const methods = useForm<FlightHistoryFormData>({
    defaultValues: {
      user: 'mine',
      mode: 'route',
    },
  });
  const [user, mode] = useWatch<FlightHistoryFormData, ['user', 'mode']>({
    control: methods.control,
    name: ['user', 'mode'],
  });
  const cardClassNames = useCardClassNames();
  const { data: userData } = useLoggedInUserQuery();
  const { data: flightData } = trpc.flights.getFlight.useQuery({
    id: flightId,
  });
  const onOwnProfile =
    userData !== undefined && userData.id === flightData?.userId;
  const { data, isFetching, fetchNextPage, isFetchingNextPage } =
    trpc.flights.getFlightHistory.useInfiniteQuery(
      {
        flightId,
        user,
        mode,
        limit: 5,
      },
      {
        getNextPageParam: ({ metadata }) =>
          metadata.page < metadata.pageCount ? metadata.page + 1 : undefined,
        keepPreviousData: true,
      },
    );
  const flattenedData = useMemo(
    () => data?.pages.flatMap(({ results }) => results) ?? [],
    [data?.pages],
  );
  const remainingRows =
    data !== undefined
      ? data.pages[0].metadata.itemCount - flattenedData.length
      : 0;
  useEffect(() => {
    methods.setValue('user', 'mine');
  }, [flightId, methods]);
  return (
    <div className={classNames('flex flex-col gap-4', cardClassNames)}>
      <div className="font-semibold" ref={headerRef}>
        Flight History
      </div>
      {data !== undefined ? (
        <Form className="flex flex-col gap-4" methods={methods}>
          <FormRadio
            className="flex gap-4 text-sm opacity-80"
            name="user"
            options={[
              {
                id: 'mine',
                className: 'flex-1 flex gap-2 justify-center flex-row-reverse',
                label: 'My Flights',
                value: 'mine',
              },
              ...(!onOwnProfile
                ? [
                    {
                      id: 'following',
                      className:
                        'flex-1 flex gap-2 justify-center flex-row-reverse',
                      label: `${flightData?.user.username}'s Flights`,
                      value: 'user',
                    },
                  ]
                : []),
              ...(onOwnProfile
                ? [
                    {
                      id: 'following',
                      className:
                        'flex-1 flex gap-2 justify-center flex-row-reverse',
                      label: 'Following Flights',
                      value: 'following',
                    },
                  ]
                : []),
            ]}
          />
          <FormRadioGroup activeColor="info" name="mode">
            <FormRadioGroupOption
              className="flex-1"
              size="sm"
              soft
              value="route"
            >
              Route
            </FormRadioGroupOption>
            <FormRadioGroupOption
              className="flex-1"
              size="sm"
              soft
              value="airframe"
            >
              Airframe
            </FormRadioGroupOption>
            <FormRadioGroupOption
              className="flex-1"
              size="sm"
              soft
              value="aircraftType"
            >
              <span className="mx-[-12px]">Aircraft Type</span>
            </FormRadioGroupOption>
            <FormRadioGroupOption
              className="flex-1"
              size="sm"
              soft
              value="airline"
            >
              Airline
            </FormRadioGroupOption>
          </FormRadioGroup>
        </Form>
      ) : null}
      {flattenedData.length === 0 && !isFetching ? (
        <div className="my-4 text-center">No Flights Found</div>
      ) : null}
      {isFetching && !isFetchingNextPage ? (
        <div className="flex justify-center">
          <Loading />
        </div>
      ) : (
        <div className="flex w-full flex-1 flex-col gap-2">
          {flattenedData.map(flight => (
            <FlightHistoryRow key={flight.id} flight={flight} />
          ))}
        </div>
      )}
      {flattenedData.length > 0 && (!isFetching || isFetchingNextPage) ? (
        <div className="flex justify-center">
          <Button
            className="w-[175px]"
            color="neutral"
            disabled={
              isFetchingNextPage ||
              flattenedData.length === data?.pages[0].metadata.itemCount
            }
            loading={isFetchingNextPage}
            onClick={async () => {
              await fetchNextPage();
            }}
            size="sm"
          >
            View More{' '}
            {!isFetchingNextPage && remainingRows > 0
              ? `(${remainingRows.toLocaleString()})`
              : ''}
          </Button>
        </div>
      ) : null}
    </div>
  );
};
