import classNames from 'classnames';
import { type Dispatch, type SetStateAction } from 'react';
import { useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  CloseIcon,
  Form,
  FormRadioGroup,
  FormRadioGroupOption,
  useFormWithQueryParams,
} from 'stratosphere-ui';
import { PlusIcon } from '../../../../common/components';
import { useLoggedInUserQuery } from '../../../../common/hooks';
import { AddFlightForm } from './AddFlightForm';
import { CompletedFlights } from './CompletedFlights';
import { UpcomingFlights } from './UpcomingFlights';

export interface FlightsModeFormData {
  flightsMode: 'upcoming' | 'completed';
}

export interface FlightCardProps {
  isAddingFlight: boolean;
  setIsAddingFlight: Dispatch<SetStateAction<boolean>>;
}

export const FlightsCard = ({
  isAddingFlight,
  setIsAddingFlight,
}: FlightCardProps): JSX.Element => {
  const navigate = useNavigate();
  const { username } = useParams();
  const methods = useFormWithQueryParams<FlightsModeFormData, ['flightsMode']>({
    getDefaultValues: ({ flightsMode }) => ({
      flightsMode:
        (flightsMode as FlightsModeFormData['flightsMode']) ?? 'upcoming',
    }),
    getSearchParams: ([flightsMode]) => ({
      flightsMode,
    }),
    includeKeys: ['flightsMode'],
  });
  const flightsMode = useWatch<FlightsModeFormData, 'flightsMode'>({
    name: 'flightsMode',
    control: methods.control,
  });
  const { onOwnProfile } = useLoggedInUserQuery();
  return (
    <Card
      className={classNames(
        'w-full bg-base-100',
        isAddingFlight ? 'lg:w-full' : 'lg:w-[465px]',
      )}
    >
      <CardBody className="p-1 pt-4">
        <div className="flex w-full min-w-[375px] flex-col gap-3 px-3">
          <div className="flex justify-between">
            <div className="flex items-end gap-1">
              <CardTitle>Flights</CardTitle>
              <Button
                className="w-[100px]"
                color="ghost"
                onClick={() => {
                  navigate(
                    username !== undefined
                      ? `/user/${username}/flights`
                      : '/flights',
                  );
                }}
                size="xs"
              >
                View All
              </Button>
            </div>
            {onOwnProfile ? (
              <div className="flex justify-end gap-4">
                {isAddingFlight ? (
                  <Button
                    className="flex w-[120px] flex-1 flex-nowrap"
                    color="warning"
                    size="sm"
                    onClick={() => {
                      setIsAddingFlight(false);
                    }}
                  >
                    <CloseIcon className="h-4 w-4" />
                    Done
                  </Button>
                ) : null}
                {!isAddingFlight ? (
                  <Button
                    className="flex w-[150px] flex-1 flex-nowrap"
                    color="success"
                    size="sm"
                    onClick={() => {
                      setIsAddingFlight(true);
                    }}
                  >
                    <PlusIcon className="h-4 w-4" /> Add Flight
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
          {isAddingFlight ? <AddFlightForm /> : null}
          {!isAddingFlight ? (
            <Form methods={methods}>
              <FormRadioGroup className="w-full" name="flightsMode">
                <FormRadioGroupOption
                  activeColor="info"
                  className="mr-[1px] flex-1 border-2 border-opacity-50 bg-opacity-25 text-base-content hover:border-opacity-80 hover:bg-opacity-40"
                  size="sm"
                  value="upcoming"
                >
                  Upcoming
                </FormRadioGroupOption>
                <FormRadioGroupOption
                  activeColor="info"
                  className="flex-1 border-2 border-opacity-50 bg-opacity-25 text-base-content hover:border-opacity-80 hover:bg-opacity-40"
                  size="sm"
                  value="completed"
                >
                  Completed
                </FormRadioGroupOption>
              </FormRadioGroup>
            </Form>
          ) : null}
        </div>
        {!isAddingFlight ? (
          <div className="min-h-[60px]">
            {flightsMode === 'completed' ? <CompletedFlights /> : null}
            {flightsMode === 'upcoming' ? <UpcomingFlights /> : null}
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
};
