import classNames from 'classnames';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { type Control } from 'react-hook-form';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button, Card, CardBody, CardTitle, CloseIcon } from 'stratosphere-ui';
import {
  CollapseIcon,
  PlusAirplaneIcon,
  PlusIcon,
} from '../../../../common/components';
import {
  useLoggedInUserQuery,
  useProfileUserQuery,
} from '../../../../common/hooks';
import { Flights } from '../../../Flights';
import { useFlightsPageStore } from '../../../Flights/flightsPageStore';
import { type ProfileFilterFormData } from '../../hooks';
import { AddFlightForm } from './AddFlightForm';
import { FlightsTableBasic } from './FlightsTableBasic';

export interface FlightCardProps {
  filtersFormControl: Control<ProfileFilterFormData>;
  isAddingFlight: boolean;
  isFlightsFullScreen: boolean;
  selectedAirportId: string | null;
  setIsAddingFlight: Dispatch<SetStateAction<boolean>>;
  setIsFlightsFullScreen: Dispatch<SetStateAction<boolean>>;
}

export const FlightsCard = ({
  filtersFormControl,
  isAddingFlight,
  isFlightsFullScreen,
  selectedAirportId,
  setIsAddingFlight,
  setIsFlightsFullScreen,
}: FlightCardProps): JSX.Element => {
  const { username } = useParams();
  const [, setSearchParams] = useSearchParams();
  const [isRowSelectEnabled, setIsRowSelectEnabled] = useState(false);
  const { resetRowSelection, rowSelection, setIsCreateTripDialogOpen } =
    useFlightsPageStore();
  const { onOwnProfile } = useLoggedInUserQuery();
  const { data } = useProfileUserQuery();
  return (
    <Card
      className={classNames(
        'w-full bg-base-100',
        !isFlightsFullScreen && (isAddingFlight ? 'lg:w-full' : 'lg:w-[480px]'),
      )}
    >
      <CardBody className="p-1 pt-4">
        <div className="flex w-full min-w-[375px] flex-col gap-4 px-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-end gap-1">
              <CardTitle>
                {isAddingFlight
                  ? `Add Flight${!onOwnProfile ? ` for @${username}` : ''}`
                  : 'Flights'}
              </CardTitle>
              {!isAddingFlight && !isFlightsFullScreen ? (
                <Button
                  className="w-[100px]"
                  color="ghost"
                  onClick={() => {
                    setIsFlightsFullScreen(true);
                    setSearchParams(oldSearchParams => ({
                      ...Object.fromEntries(oldSearchParams),
                      isFlightsFullScreen: 'true',
                    }));
                  }}
                  size="xs"
                >
                  View All
                </Button>
              ) : null}
            </div>
            {onOwnProfile ||
            (data?.isFollowedBy === true && data.isFollowing) ? (
              <div className="flex gap-3">
                <div className="flex flex-wrap justify-end gap-3">
                  {isAddingFlight ? (
                    <Button
                      className="flex w-[120px] flex-nowrap"
                      color="ghost"
                      size="sm"
                      onClick={() => {
                        setIsAddingFlight(false);
                      }}
                    >
                      <CloseIcon className="h-4 w-4" />
                      Done
                    </Button>
                  ) : null}
                  {onOwnProfile && !isAddingFlight ? (
                    <>
                      {isRowSelectEnabled ? (
                        <Button
                          color="primary"
                          disabled={Object.keys(rowSelection).length === 0}
                          onClick={() => {
                            setIsCreateTripDialogOpen(true);
                          }}
                          size="sm"
                        >
                          Create ({Object.keys(rowSelection).length})
                        </Button>
                      ) : null}
                      {isFlightsFullScreen ? (
                        <Button
                          className={classNames(
                            !isFlightsFullScreen && 'hidden sm:flex',
                          )}
                          color={isRowSelectEnabled ? 'error' : 'secondary'}
                          onClick={() => {
                            setSearchParams(oldSearchParams => ({
                              ...Object.fromEntries(oldSearchParams),
                              isFlightsFullScreen: 'true',
                            }));
                            setIsRowSelectEnabled(isEnabled => {
                              if (isEnabled) resetRowSelection();
                              return !isEnabled;
                            });
                          }}
                          outline
                          size="sm"
                        >
                          {isRowSelectEnabled ? (
                            <CloseIcon className="h-4 w-4" />
                          ) : (
                            <PlusIcon className="h-4 w-4" />
                          )}
                          {isRowSelectEnabled ? 'Cancel' : 'Add Trip'}
                        </Button>
                      ) : null}
                    </>
                  ) : null}
                  {!isAddingFlight ? (
                    <Button
                      className="flex flex-nowrap"
                      color="primary"
                      size="sm"
                      onClick={() => {
                        setIsAddingFlight(true);
                      }}
                    >
                      <PlusAirplaneIcon className="h-5 w-5" /> Add Flight
                    </Button>
                  ) : null}
                </div>
                {isFlightsFullScreen && !isAddingFlight ? (
                  <Button
                    color="ghost"
                    onClick={() => {
                      setIsFlightsFullScreen(false);
                      setSearchParams(oldSearchParams => {
                        oldSearchParams.delete('isFlightsFullScreen');
                        return oldSearchParams;
                      });
                      setIsRowSelectEnabled(false);
                    }}
                    size="sm"
                  >
                    <CollapseIcon className="h-4 w-4" />{' '}
                    <span className="hidden sm:inline-block">Collapse</span>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
          {isAddingFlight ? <AddFlightForm /> : null}
        </div>
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
