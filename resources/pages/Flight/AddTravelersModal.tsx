import { zodResolver } from '@hookform/resolvers/zod';
import _ from 'lodash';
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
} from 'react';
import { useForm } from 'react-hook-form';
import { Form, Modal } from 'stratosphere-ui';

import {
  type AddTravelersFormData,
  addTravelersFormSchema,
} from '../../../app/schemas';
import {
  FlightTimesDisplay,
  RightArrowIcon,
  UserSelect,
} from '../../common/components';
import {
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export interface AddTravelersModalProps {
  flightId: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const AddTravelersModal = ({
  flightId,
  open,
  setOpen,
}: AddTravelersModalProps): JSX.Element => {
  const utils = trpc.useUtils();
  const handleSuccess = useSuccessResponseHandler();
  const onError = useTRPCErrorHandler();
  const methods = useForm<AddTravelersFormData>({
    defaultValues: {
      usernames: [],
    },
    resolver: zodResolver(addTravelersFormSchema),
  });
  const { data: flight } = trpc.flights.getFlight.useQuery({ id: flightId });
  const { mutate, isLoading } = trpc.flights.addTravelersToFlight.useMutation({
    onSettled: () => {
      setOpen(false);
    },
    onSuccess: data => {
      handleSuccess(
        `Added @${data[0].username}${data.length > 1 ? ` and ${data.length - 1} other${data.length > 2 ? 's' : ''} to this flight` : ''}.`,
      );
      utils.flights.getFlight.setData({ id: flightId }, previousData => ({
        ..._.omit(previousData, 'id'),
        id: flightId,
        otherTravelers:
          previousData !== undefined
            ? [...previousData.otherTravelers, ...data]
            : data,
      }));
      void utils.users.invalidate();
      void utils.statistics.invalidate();
    },
    onError,
  });
  const onSubmit = useCallback(
    (values: AddTravelersFormData) => {
      mutate({
        ...values,
        flightId,
      });
    },
    [flightId, mutate],
  );
  useEffect(() => {
    methods.reset({
      usernames: [],
    });
  }, [methods, open]);
  return (
    <Modal
      actionButtons={[
        {
          children: 'Cancel',
          color: 'secondary',
          onClick: () => {
            setOpen(false);
          },
          soft: true,
        },
        {
          children: !isLoading && 'Add',
          className: 'w-[100px]',
          color: 'primary',
          disabled: isLoading,
          loading: isLoading,
          onClick: methods.handleSubmit(onSubmit),
          soft: true,
        },
      ]}
      className="overflow-y-visible"
      onClose={() => {
        setOpen(false);
      }}
      open={open}
      title="Add Travelers"
    >
      {flight !== undefined ? (
        <div className="flex flex-col gap-2 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-x-4 gap-y-1 lg:flex-row lg:items-center">
              <div className="flex h-[30px] w-[125px]">
                {flight.airline?.logo !== null &&
                flight.airline?.logo !== undefined ? (
                  <a
                    className="flex flex-1 items-center"
                    href={flight.airline.wiki ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      alt={`${flight.airline.name} Logo`}
                      className="max-h-full max-w-full"
                      src={flight.airline.logo}
                    />
                  </a>
                ) : null}
              </div>
              <div className="w-[70px] font-mono opacity-90">
                <span>{flight.airline?.iata}</span>{' '}
                <span className="font-semibold">{flight.flightNumber}</span>
              </div>
            </div>
            <div className="w-[145px] text-right text-sm font-semibold text-nowrap opacity-80">
              {flight.outDateLocal}
            </div>
          </div>
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 items-center justify-between font-mono text-3xl font-bold">
              <div>{flight.departureAirport.iata}</div>
              <RightArrowIcon className="h-6 w-6" />
              <div>{flight.arrivalAirport.iata}</div>
            </div>
            <div className="flex gap-2">
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="truncate text-sm">
                  {flight.departureMunicipalityText}
                </div>
                <FlightTimesDisplay
                  data={{
                    delayStatus: flight.departureDelayStatus,
                    actualValue: flight.outTimeActualValue,
                    value: flight.outTimeValue,
                    actualLocal: flight.outTimeActualLocal,
                    local: flight.outTimeLocal,
                    actualDaysAdded: flight.outTimeActualDaysAdded,
                    daysAdded: 0,
                  }}
                />
              </div>
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="truncate text-right text-sm">
                  {flight.arrivalMunicipalityText}
                </div>
                <FlightTimesDisplay
                  className="justify-end"
                  data={{
                    delayStatus: flight.arrivalDelayStatus,
                    actualValue: flight.inTimeActualValue,
                    value: flight.inTimeValue,
                    actualLocal: flight.inTimeActualLocal,
                    local: flight.inTimeLocal,
                    actualDaysAdded: flight.inTimeActualDaysAdded,
                    daysAdded: flight.inTimeDaysAdded ?? 0,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <Form className="mt-4" methods={methods}>
        <UserSelect
          bordered
          className="w-full"
          defaultShowDropdown
          followingUsersOnly
          formValueMode="id"
          inputClassName="bg-base-200"
          max={5}
          menuClassName="max-h-[300px] overflow-y-scroll w-full bg-base-200 z-50"
          multi
          name="usernames"
          placeholder="Select..."
          withoutFlightId={flightId}
        />
      </Form>
    </Modal>
  );
};
