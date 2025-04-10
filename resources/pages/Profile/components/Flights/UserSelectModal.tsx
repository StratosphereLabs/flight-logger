import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import { useEffect } from 'react';
import { type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import {
  Avatar,
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
  const { data, onOwnProfile } = useLoggedInUserQuery();
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
  return (
    <Modal
      actionButtons={[
        {
          children: 'Cancel',
          color: 'secondary',
          onClick: () => {
            setIsUserSelectModalOpen(false);
          },
          soft: true,
        },
        {
          children: !isLoading ? 'Add Flight' : undefined,
          className: 'w-[125px]',
          color: 'primary',
          loading: isLoading,
          onClick: methods.handleSubmit(onSubmit),
          soft: true,
        },
      ]}
      className="flex flex-col overflow-y-visible"
      onClose={() => {
        setIsUserSelectModalOpen(false);
      }}
      open={isUserSelectModalOpen}
      title="Select User"
    >
      {flight !== null ? (
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
            <div className="flex flex-1 items-center justify-between font-mono text-3xl font-semibold">
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
      <Form
        className="mt-4 flex flex-1 flex-col items-end gap-6"
        methods={methods}
      >
        {onOwnProfile && data !== undefined ? (
          <FormRadioGroup className="w-full" name="userType">
            <FormRadioGroupOption className="flex-1" soft value="me">
              <Avatar
                alt={data.username}
                src={data.avatar}
                shapeClassName="w-5 h-5 rounded-full"
              />
              Myself
            </FormRadioGroupOption>
            <FormRadioGroupOption className="flex-1" soft value="other">
              Other User
            </FormRadioGroupOption>
          </FormRadioGroup>
        ) : null}
        <UserSelect
          bordered
          className={classNames(
            'w-[250px]',
            userType === 'me' && 'pointer-events-none opacity-60',
          )}
          followingUsersOnly
          formValueMode="id"
          inputClassName="bg-base-200"
          menuClassName="max-h-[200px] overflow-y-scroll w-[250px] bg-base-200 z-50"
          name="username"
          placeholder="Select..."
        />
      </Form>
    </Modal>
  );
};
