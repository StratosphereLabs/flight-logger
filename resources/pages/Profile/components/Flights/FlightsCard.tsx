import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from '@tanstack/react-router';
import classNames from 'classnames';
import { type Dispatch, type SetStateAction, useEffect } from 'react';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { Button, Card, CardBody, CardTitle, CloseIcon } from 'stratosphere-ui';

import {
  type AddFlightRequest,
  addFlightSchema,
} from '../../../../../app/schemas';
import {
  CollapseIcon,
  ExpandIcon,
  PlusAirplaneIcon,
} from '../../../../common/components';
import {
  useLoggedInUserQuery,
  useProfileUserQuery,
} from '../../../../common/hooks';
import { Flights } from '../../../Flights';
import { type MapCardFormData } from '../../Profile';
import { AddFlightForm } from './AddFlightForm';
import { FlightsTableBasic } from './FlightsTableBasic';
import { useAddFlightStore } from './addFlightStore';
import { addFlightFormDefaultValues } from './constants';

export interface FlightCardProps {
  isFlightsFullScreen: boolean;
  mapFormMethods: UseFormReturn<MapCardFormData>;
  selectedAirportId: string | null;
  setIsFlightsFullScreen: Dispatch<SetStateAction<boolean>>;
  setIsMapFullScreen: Dispatch<SetStateAction<boolean>>;
}

export interface FlightFiltersFormData {
  searchQuery: string;
}

export const FlightsCard = ({
  isFlightsFullScreen,
  mapFormMethods,
  selectedAirportId,
  setIsFlightsFullScreen,
  setIsMapFullScreen,
}: FlightCardProps): JSX.Element => {
  const { username } = useParams({
    from: '/pathlessProfileLayout/user/$username',
  });
  const navigate = useNavigate({ from: '/profile' });
  const { isAddingFlight, setIsAddingFlight, setFlightSearchFormData } =
    useAddFlightStore();
  const { onOwnProfile } = useLoggedInUserQuery();
  const methods = useForm<AddFlightRequest>({
    defaultValues: addFlightFormDefaultValues,
    resolver: zodResolver(addFlightSchema),
    reValidateMode: 'onBlur',
  });
  const { data } = useProfileUserQuery();
  useEffect(() => {
    setIsAddingFlight(false);
  }, [setIsAddingFlight, username]);
  return (
    <Card
      className={classNames(
        'bg-base-100 w-full',
        isFlightsFullScreen || isAddingFlight ? 'flex-1' : 'lg:w-[480px]',
      )}
    >
      <CardBody
        className={classNames(
          'items-center gap-4 pt-4',
          isAddingFlight ? 'p-3' : 'p-1',
        )}
      >
        <div
          className={classNames(
            'flex w-full min-w-[375px] flex-col gap-4',
            isAddingFlight ? 'px-0' : 'px-3',
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <CardTitle>
              {isAddingFlight
                ? `Add Flight${!onOwnProfile ? ` for @${username}` : ''}`
                : 'Flights'}
            </CardTitle>
            <div className="flex flex-1 justify-end gap-3">
              {isAddingFlight ? (
                <Button
                  className="flex w-[120px] flex-nowrap"
                  onClick={() => {
                    setIsAddingFlight(false);
                    methods.reset(addFlightFormDefaultValues);
                    setFlightSearchFormData(null);
                  }}
                  size="sm"
                  soft
                >
                  <CloseIcon className="h-4 w-4" />
                  Done
                </Button>
              ) : null}
              {!isAddingFlight ? (
                <div className="flex gap-2">
                  {onOwnProfile ||
                  (data?.isFollowedBy === true && data.isFollowing) ? (
                    <Button
                      className="flex flex-nowrap"
                      color="primary"
                      onClick={() => {
                        setIsMapFullScreen(false);
                        mapFormMethods.setValue('mapMode', 'routes');
                        setIsAddingFlight(true);
                      }}
                      size="sm"
                      soft
                    >
                      <PlusAirplaneIcon className="h-5 w-5" />
                      Add Flight
                    </Button>
                  ) : null}
                  <Button
                    onClick={() => {
                      void navigate({
                        search: prev => ({
                          ...prev,
                          isFlightsFullScreen:
                            prev.isFlightsFullScreen === true
                              ? undefined
                              : true,
                        }),
                        replace: true,
                      });
                      setIsFlightsFullScreen(isFullScreen => !isFullScreen);
                    }}
                    size="sm"
                    soft
                  >
                    {isFlightsFullScreen ? (
                      <CollapseIcon className="h-4 w-4" />
                    ) : (
                      <ExpandIcon className="h-4 w-4" />
                    )}
                    {isFlightsFullScreen ? 'Collapse' : 'View All'}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        {isAddingFlight ? <AddFlightForm methods={methods} /> : null}
        {!isFlightsFullScreen && !isAddingFlight ? (
          <div className="min-h-[70px]">
            <FlightsTableBasic selectedAirportId={selectedAirportId} />
          </div>
        ) : null}
        {isFlightsFullScreen && !isAddingFlight ? (
          <Flights selectedAirportId={selectedAirportId} />
        ) : null}
      </CardBody>
    </Card>
  );
};
