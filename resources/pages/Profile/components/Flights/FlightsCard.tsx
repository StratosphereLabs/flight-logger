import classNames from 'classnames';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { type Control } from 'react-hook-form';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  CloseIcon,
  Form,
  FormControl,
  useFormWithQueryParams,
} from 'stratosphere-ui';

import {
  CollapseIcon,
  ExpandIcon,
  PlusAirplaneIcon,
  SearchIcon,
} from '../../../../common/components';
import {
  useLoggedInUserQuery,
  useProfileUserQuery,
} from '../../../../common/hooks';
import { Flights } from '../../../Flights';
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

export interface FlightFiltersFormData {
  searchQuery: string;
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
  const { onOwnProfile } = useLoggedInUserQuery();
  const { data } = useProfileUserQuery();
  const methods = useFormWithQueryParams<
    FlightFiltersFormData,
    ['searchQuery']
  >({
    getDefaultValues: ({ searchQuery }) => ({
      searchQuery: searchQuery ?? '',
    }),
    getSearchParams: ([searchQuery]) => ({
      searchQuery,
    }),
    includeKeys: ['searchQuery'],
  });
  return (
    <Card
      className={classNames(
        'w-full bg-base-100',
        !isFlightsFullScreen && (isAddingFlight ? 'lg:w-full' : 'lg:w-[480px]'),
      )}
    >
      <CardBody className="gap-4 p-1 pt-4">
        <div className="flex w-full min-w-[375px] flex-col gap-4 px-3">
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
                    }}
                  >
                    <CloseIcon className="h-4 w-4" />
                    Done
                  </Button>
                ) : null}
                <Form className="flex gap-2" methods={methods}>
                  {isFlightsFullScreen && !isAddingFlight ? (
                    <FormControl
                      elementLeft={<SearchIcon className="h-4 w-4" />}
                      inputClassName="bg-base-200 pl-8"
                      name="searchQuery"
                      placeholder="Search Flights..."
                      size="sm"
                    />
                  ) : null}
                  {!isAddingFlight ? (
                    <Button
                      className="flex flex-nowrap"
                      color="primary"
                      size="sm"
                      onClick={() => {
                        setIsFlightsFullScreen(true);
                        setIsAddingFlight(true);
                      }}
                    >
                      <PlusAirplaneIcon className="h-5 w-5" />
                      <span
                        className={classNames(
                          isFlightsFullScreen && 'hidden sm:block',
                        )}
                      >
                        Add Flight
                      </span>
                    </Button>
                  ) : null}
                  {!isAddingFlight ? (
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
                  ) : null}
                </Form>
              </div>
            ) : null}
          </div>
        </div>
        {isAddingFlight ? <AddFlightForm /> : null}
        {!isFlightsFullScreen ? (
          <div className="min-h-[70px]">
            <FlightsTableBasic
              filtersFormControl={filtersFormControl}
              selectedAirportId={selectedAirportId}
            />
          </div>
        ) : null}
        {isFlightsFullScreen ? (
          <Flights
            filtersFormControl={filtersFormControl}
            flightFiltersFormControl={methods.control}
            isRowSelectEnabled={isRowSelectEnabled}
            selectedAirportId={selectedAirportId}
            setIsRowSelectEnabled={setIsRowSelectEnabled}
          />
        ) : null}
      </CardBody>
    </Card>
  );
};
