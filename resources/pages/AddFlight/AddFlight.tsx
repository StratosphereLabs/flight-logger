import { useEffect } from 'react';
import { Card } from 'react-daisyui';
import { useNavigate } from 'react-router-dom';
import { Form, FormControl, LoadingCard } from '../../common/components';
import { useAppContext } from '../../context';
import { ArrivalAirportInput } from './ArrivalAirportInput';
import { DepartureAirportInput } from './DepartureAirportInput';

export const AddFlight = (): JSX.Element => {
  const { isLoggedIn } = useAppContext();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoggedIn) navigate('/auth/login');
  }, [isLoggedIn]);
  return (
    <LoadingCard className="shadow-xl bg-base-200 min-h-[400px] min-w-[500px]">
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
            outTime: null,
            offTime: null,
            onTime: null,
            inTime: null,
          }}
          onFormSubmit={values => console.log(values)}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-8">
              <div className="flex-1 flex justify-center">
                <DepartureAirportInput />
              </div>
              <div className="flex-1 flex justify-center">
                <ArrivalAirportInput />
              </div>
            </div>
            <div className="flex flex-wrap gap-8">
              <div className="flex-1">
                <FormControl label="Date" name="outTime" type="date" />
              </div>
              <div className="flex-1">
                <FormControl
                  label="Departure Time"
                  name="outTime"
                  type="time"
                />
              </div>
              <div className="flex-1">
                <FormControl label="Arrival Time" name="inTime" type="time" />
              </div>
            </div>
          </div>
        </Form>
      </Card.Body>
    </LoadingCard>
  );
};
