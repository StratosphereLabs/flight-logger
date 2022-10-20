import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import {
  Button,
  Card,
  Divider,
  Form as DaisyUIForm,
  Radio,
} from 'react-daisyui';
import { useNavigate } from 'react-router-dom';
import { addFlightSchema } from '../../../app/schemas';
import { Form, FormControl, LoadingCard } from '../../common/components';
import { useAppContext } from '../../providers';
import { trpc } from '../../utils/trpc';
import { AircraftTypeInput } from './AircraftTypeInput';
import { AirlineInput } from './AirlineInput';
import { ArrivalAirportInput } from './ArrivalAirportInput';
import { DepartureAirportInput } from './DepartureAirportInput';

export const AddFlight = (): JSX.Element => {
  const { isLoggedIn } = useAppContext();
  const navigate = useNavigate();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const { mutate, isLoading } = trpc.users.addFlight.useMutation();
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
          Add a Flight
        </Card.Title>
        <Form
          defaultValues={{
            departureAirportId: '',
            arrivalAirportId: '',
            airlineId: '',
            aircraftTypeId: '',
            flightNumber: null,
            callsign: '',
            tailNumber: '',
            outDate: '',
            outTime: '',
            offTime: '',
            onTime: '',
            inTime: '',
            class: null,
            seatNumber: '',
            seatPosition: null,
            reason: null,
            comments: '',
            trackingLink: '',
          }}
          onFormSubmit={values => mutate(values)}
          resolver={zodResolver(addFlightSchema)}
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
            <Divider />
            <div className="flex flex-wrap gap-8">
              <div className="flex-1 flex justify-center">
                <AirlineInput />
              </div>
              <div className="flex-1 flex justify-center">
                <AircraftTypeInput />
              </div>
            </div>
            <div className="flex flex-wrap gap-8">
              <div className="flex-1">
                <FormControl
                  inputProps={{
                    type: 'number',
                    onWheel: e => (e.target as HTMLInputElement).blur?.(),
                  }}
                  labelText="Flight Number"
                  name="flightNumber"
                />
              </div>
              <div className="flex-1">
                <FormControl labelText="Callsign" name="callsign" />
              </div>
              <div className="flex-1">
                <FormControl labelText="Registration" name="tailNumber" />
              </div>
            </div>
            <Divider />
            <div className="flex flex-wrap gap-12">
              <div className="flex-1">
                <DaisyUIForm.Label title="Class" />
                <DaisyUIForm.Label title="Basic Economy">
                  <Radio name="class" defaultChecked />
                </DaisyUIForm.Label>
                <DaisyUIForm.Label title="Economy">
                  <Radio name="class" />
                </DaisyUIForm.Label>
                <DaisyUIForm.Label title="Premium Economy">
                  <Radio name="class" />
                </DaisyUIForm.Label>
                <DaisyUIForm.Label title="Business">
                  <Radio name="class" />
                </DaisyUIForm.Label>
                <DaisyUIForm.Label title="First">
                  <Radio name="class" />
                </DaisyUIForm.Label>
              </div>
              <div className="flex-1">
                <FormControl
                  inputProps={{
                    className: 'mb-5',
                  }}
                  labelText="Seat Number"
                  name="seatNumber"
                />
                <DaisyUIForm.Label title="Seat Position" />
                <DaisyUIForm.Label title="Window">
                  <Radio name="seatPosition" defaultChecked />
                </DaisyUIForm.Label>
                <DaisyUIForm.Label title="Middle">
                  <Radio name="seatPosition" />
                </DaisyUIForm.Label>
                <DaisyUIForm.Label title="Aisle">
                  <Radio name="seatPosition" />
                </DaisyUIForm.Label>
              </div>
              <div className="flex-1">
                <DaisyUIForm.Label title="Reason" />
                <DaisyUIForm.Label title="Business">
                  <Radio name="reason" defaultChecked />
                </DaisyUIForm.Label>
                <DaisyUIForm.Label title="Leisure">
                  <Radio name="reason" />
                </DaisyUIForm.Label>
                <DaisyUIForm.Label title="Other">
                  <Radio name="reason" />
                </DaisyUIForm.Label>
              </div>
            </div>
            <Divider />
            <div className="flex flex-wrap gap-8 mb-8">
              <div className="flex-1 flex justify-center">
                <FormControl labelText="Comments" name="comments" />
              </div>
              <div className="flex-1 flex justify-center">
                <FormControl
                  inputProps={{
                    placeholder: 'FlightAware, FlightRadar24 ...',
                  }}
                  labelText="Tracking Link"
                  name="trackingLink"
                />
              </div>
            </div>
            <Button loading={isLoading} type="submit">
              Submit
            </Button>
          </div>
        </Form>
      </Card.Body>
    </LoadingCard>
  );
};
