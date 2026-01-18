import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormRadio,
  FormRadioGroup,
  FormRadioGroupOption,
  Modal,
} from 'stratosphere-ui';

import {
  type AddUserToFlightFormData,
  addUserToFlightFormSchema,
} from '../../../app/schemas';
import { FlightTimesDisplay, RightArrowIcon } from '../../common/components';
import {
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export interface AddUserToFlightModalProps {
  flightId: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const AddUserToFlightModal = ({
  flightId,
  open,
  setOpen,
}: AddUserToFlightModalProps): JSX.Element => {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const handleSuccess = useSuccessResponseHandler();
  const onError = useTRPCErrorHandler();
  const methods = useForm<AddUserToFlightFormData>({
    defaultValues: {
      class: null,
      seatNumber: '',
      seatPosition: null,
      reason: null,
    },
    resolver: zodResolver(addUserToFlightFormSchema),
  });
  const { data: flight } = trpc.flights.getFlight.useQuery({ id: flightId });
  const displayName = useMemo(
    () => flight?.user?.firstName ?? flight?.user?.username,
    [flight?.user],
  );
  const { mutate, isLoading } = trpc.flights.addUserToFlight.useMutation({
    onSettled: () => {
      setOpen(false);
    },
    onSuccess: ({ id }) => {
      handleSuccess('You have successfully joined this flight.');
      void navigate({ to: '/flight/$flightId', params: { flightId: id } });
      void utils.flights.invalidate();
      void utils.users.invalidate();
      void utils.statistics.invalidate();
    },
    onError,
  });
  const onSubmit = useCallback(
    (values: AddUserToFlightFormData) => {
      mutate({
        ...values,
        flightId,
      });
    },
    [flightId, mutate],
  );
  useEffect(() => {
    methods.reset({
      class: null,
      seatNumber: '',
      seatPosition: null,
      reason: null,
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
          children: !isLoading && 'Join',
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
      title={`Join ${displayName !== undefined ? `${displayName}'s ` : ''}Flight`}
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
      <Form className="mt-4 flex flex-col gap-2" methods={methods}>
        <div className="flex flex-col justify-between gap-x-4 gap-y-2 md:flex-row">
          <div className="flex flex-1 flex-col gap-x-4 gap-y-2 sm:flex-row">
            <div className="flex flex-1 flex-col gap-2">
              <FormControl
                bordered
                className="w-full text-sm"
                inputClassName="bg-base-200"
                labelText="Seat Number"
                name="seatNumber"
              />
              <FormRadioGroup
                activeColor="info"
                className="flex w-full text-sm"
                labelText="Seat Position"
                name="seatPosition"
              >
                <FormRadioGroupOption className="flex-1" soft value="WINDOW">
                  Window
                </FormRadioGroupOption>
                <FormRadioGroupOption className="flex-1" soft value="MIDDLE">
                  Middle
                </FormRadioGroupOption>
                <FormRadioGroupOption className="flex-1" soft value="AISLE">
                  Aisle
                </FormRadioGroupOption>
              </FormRadioGroup>
            </div>
            <FormRadio
              className="min-w-[200px] flex-1 text-sm"
              labelText="Class"
              name="class"
              options={[
                {
                  id: 'ECONOMY',
                  label: 'Economy',
                  value: 'ECONOMY',
                },
                {
                  id: 'PREMIUM',
                  label: 'Premium Economy',
                  value: 'PREMIUM',
                },
                {
                  id: 'BUSINESS',
                  label: 'Business',
                  value: 'BUSINESS',
                },
                {
                  id: 'FIRST',
                  label: 'First',
                  value: 'FIRST',
                },
              ]}
            />
          </div>
        </div>
        <FormRadioGroup
          activeColor="info"
          className="flex w-full text-sm"
          labelText="Reason"
          name="reason"
        >
          <FormRadioGroupOption className="flex-1" soft value="LEISURE">
            Leisure
          </FormRadioGroupOption>
          <FormRadioGroupOption className="flex-1" soft value="BUSINESS">
            Business
          </FormRadioGroupOption>
          <FormRadioGroupOption className="flex-1" soft value="CREW">
            Crew
          </FormRadioGroupOption>
        </FormRadioGroup>
      </Form>
    </Modal>
  );
};
