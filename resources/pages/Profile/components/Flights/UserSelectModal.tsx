import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import { useEffect } from 'react';
import { type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import {
  Form,
  FormRadioGroup,
  FormRadioGroupOption,
  Modal,
} from 'stratosphere-ui';

import { type FlightDataRouterOutput } from '../../../../../app/routes/flightData';
import {
  type UserSelectFormData,
  selectUserSchema,
} from '../../../../../app/schemas';
import {
  FlightTimesDisplay,
  RightArrowIcon,
  UserSelect,
} from '../../../../common/components';
import { useLoggedInUserQuery } from '../../../../common/hooks';
import { useAddFlightStore } from './addFlightStore';

export interface UserSelectModalProps {
  flight:
    | FlightDataRouterOutput['fetchFlightsByFlightNumber']['results'][number]
    | null;
  isLoading: boolean;
  onSubmit: SubmitHandler<UserSelectFormData>;
}

export const UserSelectModal = ({
  flight,
  isLoading,
  onSubmit,
}: UserSelectModalProps): JSX.Element => {
  const { isUserSelectModalOpen, setIsUserSelectModalOpen } =
    useAddFlightStore();
  const { onOwnProfile } = useLoggedInUserQuery();
  const methods = useForm<UserSelectFormData>({
    defaultValues: {
      userType: 'me',
      username: null,
    } as unknown as UserSelectFormData,
    resolver: zodResolver(selectUserSchema),
  });
  const userType = useWatch<UserSelectFormData, 'userType'>({
    name: 'userType',
    control: methods.control,
  });
  useEffect(() => {
    if (userType === 'other' && isUserSelectModalOpen) {
      setTimeout(() => {
        methods.setFocus('username');
      });
    }
  }, [isUserSelectModalOpen, methods, userType]);
  useEffect(() => {
    methods.clearErrors('username');
  }, [methods, userType]);
  useEffect(() => {
    if (!isUserSelectModalOpen) {
      methods.reset();
    }
  }, [isUserSelectModalOpen, methods]);
  const departureMunicipality = flight?.departureAirport.municipality;
  const departureAirport = flight?.departureAirport;
  const departureRegion =
    departureAirport !== undefined &&
    (departureAirport.countryId === 'US' || departureAirport.countryId === 'CA')
      ? departureAirport.regionId.split('-')[1]
      : departureAirport?.countryId;
  const arrivalMunicipality = flight?.arrivalAirport.municipality;
  const arrivalAirport = flight?.arrivalAirport;
  const arrivalRegion =
    arrivalAirport !== undefined &&
    (arrivalAirport.countryId === 'US' || arrivalAirport.countryId === 'CA')
      ? arrivalAirport.regionId.split('-')[1]
      : arrivalAirport?.countryId;
  return (
    <Modal
      actionButtons={[
        {
          children: 'Cancel',
          color: 'secondary',
          onClick: () => {
            setIsUserSelectModalOpen(false);
          },
          outline: true,
        },
        {
          children: !isLoading ? 'Add Flight' : undefined,
          className: 'w-[125px]',
          color: 'primary',
          loading: isLoading,
          onClick: methods.handleSubmit(onSubmit),
        },
      ]}
      className="flex flex-col overflow-y-visible"
      onClose={() => {
        setIsUserSelectModalOpen(false);
      }}
      open={isUserSelectModalOpen}
      title="Select User"
    >
      <div className="flex flex-col gap-2 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-x-4 lg:flex-row lg:items-center">
            <div className="flex h-[30px] w-[125px]">
              {flight?.airline?.logo !== null &&
              flight?.airline?.logo !== undefined ? (
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
              <span>{flight?.airline?.iata}</span>{' '}
              <span className="font-semibold">{flight?.flightNumber}</span>
            </div>
          </div>
          <div className="w-[145px] text-nowrap text-right text-sm font-semibold opacity-80">
            {flight?.outDateLocal}
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 items-center justify-between font-mono text-3xl font-semibold">
            <div>{flight?.departureAirport.iata}</div>
            <RightArrowIcon className="h-6 w-6" />
            <div>{flight?.arrivalAirport.iata}</div>
          </div>
          <div className="flex gap-2">
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="truncate text-sm">
                {departureMunicipality}, {departureRegion}
              </div>
              {flight !== null ? (
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
              ) : null}
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="truncate text-right text-sm">
                {arrivalMunicipality}, {arrivalRegion}
              </div>
              {flight !== null ? (
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
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <Form className="flex flex-1 flex-col items-end gap-6" methods={methods}>
        {onOwnProfile ? (
          <FormRadioGroup className="w-full" name="userType">
            <FormRadioGroupOption
              activeColor="info"
              className="mr-[1px] flex-1 border-2 border-opacity-50 bg-opacity-25 text-base-content hover:border-opacity-80 hover:bg-opacity-40"
              value="me"
            >
              Myself
            </FormRadioGroupOption>
            <FormRadioGroupOption
              activeColor="info"
              className="flex-1 border-2 border-opacity-50 bg-opacity-25 text-base-content hover:border-opacity-80 hover:bg-opacity-40"
              value="other"
            >
              Other User
            </FormRadioGroupOption>
          </FormRadioGroup>
        ) : null}
        <UserSelect
          className={classNames(
            'w-[250px]',
            userType === 'me' && 'pointer-events-none opacity-60',
          )}
          followingUsersOnly
          formValueMode="id"
          getBadgeText={({ username }) => username}
          inputClassName="bg-base-200"
          menuClassName="max-h-[200px] overflow-y-scroll w-[250px] bg-base-200"
          name="username"
          placeholder="Select..."
        />
      </Form>
    </Modal>
  );
};
