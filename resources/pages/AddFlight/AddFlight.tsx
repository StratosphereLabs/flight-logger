import { zodResolver } from '@hookform/resolvers/zod';
import { FlightClass, FlightReason, SeatPosition } from '@prisma/client';
import { useEffect, useRef } from 'react';
import { Button, Card, Divider } from 'react-daisyui';
import { useNavigate } from 'react-router-dom';
import { addFlightSchema } from '../../../app/schemas';
import {
  Form,
  FormControl,
  FormRadio,
  LoadingCard,
} from '../../common/components';
import {
  nullEmptyStringTransformer,
  numberInputTransformer,
} from '../../common/transformers';
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
            outTime: null,
            offTime: null,
            onTime: null,
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
              <div className="flex-1 flex justify-center">
                <FormControl
                  inputProps={{
                    type: 'date',
                  }}
                  labelText="Date"
                  name="outDate"
                />
              </div>
              <div className="flex-1 flex justify-center">
                <FormControl
                  inputProps={{
                    type: 'time',
                  }}
                  labelText="Departure Time"
                  name="outTime"
                  transform={nullEmptyStringTransformer}
                />
              </div>
              <div className="flex-1 flex justify-center">
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
              <div className="flex-1 flex justify-center">
                <FormControl
                  inputProps={{
                    type: 'number',
                    onWheel: e => (e.target as HTMLInputElement).blur?.(),
                  }}
                  labelText="Flight Number"
                  name="flightNumber"
                  transform={numberInputTransformer}
                />
              </div>
              <div className="flex-1 flex justify-center">
                <FormControl labelText="Callsign" name="callsign" />
              </div>
              <div className="flex-1 flex justify-center">
                <FormControl labelText="Registration" name="tailNumber" />
              </div>
            </div>
            <Divider />
            <div className="flex flex-wrap gap-12">
              <div className="flex-1 min-w-[200px]">
                <FormRadio
                  labelText="Class"
                  name="class"
                  options={[
                    {
                      label: 'Basic Economy',
                      value: FlightClass.BASIC,
                    },
                    {
                      label: 'Economy',
                      value: FlightClass.ECONOMY,
                    },
                    {
                      label: 'Premium Economy',
                      value: FlightClass.PREMIUM,
                    },
                    {
                      label: 'Business',
                      value: FlightClass.BUSINESS,
                    },
                    {
                      label: 'First',
                      value: FlightClass.FIRST,
                    },
                  ]}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <FormControl
                  inputProps={{
                    className: 'mb-5',
                  }}
                  labelText="Seat Number"
                  name="seatNumber"
                />
                <FormRadio
                  name="seatPosition"
                  options={[
                    {
                      label: 'Window',
                      value: SeatPosition.WINDOW,
                    },
                    {
                      label: 'Middle',
                      value: SeatPosition.MIDDLE,
                    },
                    {
                      label: 'Aisle',
                      value: SeatPosition.AISLE,
                    },
                  ]}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <FormRadio
                  labelText="Reason"
                  name="reason"
                  options={[
                    {
                      label: 'Leisure',
                      value: FlightReason.LEISURE,
                    },
                    {
                      label: 'Business',
                      value: FlightReason.BUSINESS,
                    },
                    {
                      label: 'Other',
                      value: FlightReason.OTHER,
                    },
                  ]}
                />
              </div>
            </div>
            <Divider />
            <div className="flex flex-wrap gap-8 mb-8">
              <div className="flex-1 flex justify-center">
                <FormControl labelText="Comments" name="comments" />
              </div>
              <div className="flex-1 flex justify-center">
                <FormControl labelText="Tracking Link" name="trackingLink" />
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
