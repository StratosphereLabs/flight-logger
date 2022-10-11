import { useEffect, useRef } from 'react';
import { Button, Card } from 'react-daisyui';
import { useNavigate } from 'react-router-dom';
import { Form, FormControl, LoadingCard } from '../../common/components';
import { useAddFlightMutation } from '../../common/hooks';
import { useAppContext } from '../../context';
import { ArrivalAirportInput } from './ArrivalAirportInput';
import { DepartureAirportInput } from './DepartureAirportInput';

export const AddFlight = (): JSX.Element => {
  const { isLoggedIn } = useAppContext();
  const navigate = useNavigate();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const { mutate, isLoading } = useAddFlightMutation();
  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);
  useEffect(() => {
    if (!isLoggedIn) navigate('/auth/login');
  }, [isLoggedIn]);
  return (
    <LoadingCard className="shadow-xl bg-base-200 min-h-[400px] min-w-[500px] overflow-visible">
      <Card.Body>
        <Card.Title className="mb-5 justify-center" tag="h2">
          Add a flight
        </Card.Title>
        <Form
          defaultValues={{
            departureAirportId: '',
            arrivalAirportId: '',
            airlineId: '',
            aircraftTypeId: '',
            outDate: '',
            outTime: '',
            offTime: null,
            onTime: null,
            inTime: '',
          }}
          onFormSubmit={values => mutate(values)}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-8">
              <div className="flex-1 flex justify-center">
                <DepartureAirportInput inputProps={{ ref: firstFieldRef }} />
              </div>
              <div className="flex-1 flex justify-center">
                <ArrivalAirportInput />
              </div>
            </div>
            <div className="flex flex-wrap gap-8">
              <div className="flex-1">
                <FormControl
                  inputProps={{
                    type: 'date',
                  }}
                  labelText="Date"
                  name="outDate"
                />
              </div>
              <div className="flex-1">
                <FormControl
                  inputProps={{
                    type: 'time',
                  }}
                  labelText="Departure Time"
                  name="outTime"
                />
              </div>
              <div className="flex-1">
                <FormControl
                  inputProps={{
                    type: 'time',
                  }}
                  labelText="Arrival Time"
                  name="inTime"
                />
              </div>
            </div>
            <Button className="mt-5" loading={isLoading} type="submit">
              Add Flight
            </Button>
          </div>
        </Form>
      </Card.Body>
    </LoadingCard>
  );
};
