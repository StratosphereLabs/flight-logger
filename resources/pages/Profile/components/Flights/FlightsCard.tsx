import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { type Control, type UseFormReturn, useForm } from 'react-hook-form';
import { useParams, useSearchParams } from 'react-router-dom';
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
import { type ProfileFilterFormData } from '../../hooks';
import { AddFlightForm } from './AddFlightForm';
import { FlightsTableBasic } from './FlightsTableBasic';
import { useAddFlightStore } from './addFlightStore';
import { addFlightFormDefaultValues } from './constants';

export interface FlightCardProps {
  filtersFormControl: Control<ProfileFilterFormData>;
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
  filtersFormControl,
  isFlightsFullScreen,
  mapFormMethods,
  selectedAirportId,
  setIsFlightsFullScreen,
  setIsMapFullScreen,
}: FlightCardProps): JSX.Element => {
  const { username } = useParams();
  const [, setSearchParams] = useSearchParams();
  const { isAddingFlight, setIsAddingFlight, setFlightSearchFormData } =
    useAddFlightStore();
  const [isRowSelectEnabled, setIsRowSelectEnabled] = useState(false);
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
        'w-full bg-base-100',
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
            {onOwnProfile ||
            (data?.isFollowedBy === true && data.isFollowing) ? (
              <div className="flex flex-1 justify-end gap-3">
                {isAddingFlight ? (
                  <Button
                    className="flex w-[120px] flex-nowrap"
                    color="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAddingFlight(false);
                      methods.reset(addFlightFormDefaultValues);
                      setFlightSearchFormData(null);
                    }}
                  >
                    <CloseIcon className="h-4 w-4" />
                    Done
                  </Button>
                ) : null}
                {!isAddingFlight ? (
                  <div className="flex gap-2">
                    <Button
                      className="flex flex-nowrap"
                      color="primary"
                      size="sm"
                      onClick={() => {
                        setIsMapFullScreen(false);
                        mapFormMethods.setValue('mapMode', 'routes');
                        setIsFlightsFullScreen(true);
                        setIsAddingFlight(true);
                      }}
                    >
                      <PlusAirplaneIcon className="h-5 w-5" />
                      Add Flight
                    </Button>
                    <Button
                      color="ghost"
                      onClick={() => {
                        setSearchParams(oldSearchParams => {
                          if (isFlightsFullScreen) {
                            oldSearchParams.delete('isFlightsFullScreen');
                            return oldSearchParams;
                          }
                          return {
                            ...Object.fromEntries(oldSearchParams),
                            isFlightsFullScreen: 'true',
                          };
                        });
                        setIsFlightsFullScreen(isFullScreen => !isFullScreen);
                      }}
                      size="sm"
                    >
                      {isFlightsFullScreen ? (
                        <CollapseIcon className="h-4 w-4" />
                      ) : (
                        <ExpandIcon className="h-4 w-4" />
                      )}
                      <span
                        className={classNames(
                          isFlightsFullScreen && 'hidden sm:block',
                        )}
                      >
                        {isFlightsFullScreen ? 'Collapse' : 'View All'}
                      </span>
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        {isAddingFlight ? <AddFlightForm methods={methods} /> : null}
        {!isFlightsFullScreen && !isAddingFlight ? (
          <div className="min-h-[70px]">
            <FlightsTableBasic
              filtersFormControl={filtersFormControl}
              selectedAirportId={selectedAirportId}
            />
          </div>
        ) : null}
        {isFlightsFullScreen && !isAddingFlight ? (
          <Flights
            filtersFormControl={filtersFormControl}
            isRowSelectEnabled={isRowSelectEnabled}
            selectedAirportId={selectedAirportId}
            setIsRowSelectEnabled={setIsRowSelectEnabled}
          />
        ) : null}
      </CardBody>
    </Card>
  );
};
