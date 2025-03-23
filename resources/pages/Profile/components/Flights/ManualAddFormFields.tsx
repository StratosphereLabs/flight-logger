import {
  Button,
  FormControl,
  FormRadio,
  FormRadioGroup,
  FormRadioGroupOption,
  nullEmptyStringTransformer,
} from 'stratosphere-ui';

import {
  AircraftTypeInput,
  AirframeInput,
  AirportInput,
  PlusIcon,
  RightArrowIcon,
} from '../../../../common/components';

export interface ManualAddFormFieldsProps {
  isAddFlightLoading: boolean;
  isShowingRegField: boolean;
}

export const ManualAddFormFields = ({
  isAddFlightLoading,
  isShowingRegField,
}: ManualAddFormFieldsProps): JSX.Element => (
  <>
    <div className="flex w-full flex-col justify-between gap-2 sm:flex-row">
      <div className="flex flex-1 flex-col gap-2">
        <AirportInput
          bordered
          className="w-full sm:max-w-[400px]"
          inputClassName="bg-base-200"
          isRequired
          labelText="Departure Airport"
          menuClassName="w-full bg-base-200 z-50"
          name="departureAirport"
        />
        <FormControl
          bordered
          className="w-[215px]"
          inputClassName="bg-base-200"
          isRequired
          labelText="Departure Time (Local)"
          name="outTimeValue"
          transform={nullEmptyStringTransformer}
          type="time"
        />
      </div>
      <RightArrowIcon className="mt-12 hidden h-6 w-6 sm:block" />
      <div className="flex flex-1 flex-col gap-2 sm:items-end">
        <AirportInput
          bordered
          className="w-full sm:max-w-[400px]"
          inputClassName="bg-base-200"
          isRequired
          labelText="Arrival Airport"
          menuClassName="w-full bg-base-200 z-50"
          name="arrivalAirport"
        />
        <FormControl
          bordered
          className="w-[215px]"
          inputClassName="bg-base-200"
          isRequired
          labelText="Arrival Time (Local)"
          name="inTimeValue"
          type="time"
        />
      </div>
    </div>
    <div className="divider my-0" />
    <div className="flex w-full flex-col justify-between gap-x-4 gap-y-2 sm:flex-row">
      <AircraftTypeInput
        bordered
        className="w-full sm:max-w-[400px]"
        inputClassName="bg-base-200"
        labelText="Aircraft Type"
        menuClassName="w-full bg-base-200 z-50"
        name="aircraftType"
      />
      {isShowingRegField ? (
        <AirframeInput
          bordered
          className="w-full sm:max-w-[400px]"
          inputClassName="bg-base-200"
          labelText="Registration"
          menuClassName="w-full bg-base-200 z-50"
          name="airframe"
        />
      ) : null}
    </div>
    <div className="divider my-0" />
    <div className="flex flex-col justify-between gap-x-4 gap-y-2 md:flex-row">
      <div className="flex flex-1 flex-col gap-x-4 gap-y-2 sm:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <FormControl
            bordered
            className="w-full"
            inputClassName="bg-base-200"
            labelText="Seat Number"
            name="seatNumber"
          />
          <FormRadioGroup
            activeColor="info"
            className="flex w-full"
            labelText="Seat Position"
            name="seatPosition"
          >
            <FormRadioGroupOption
              className="border-opacity-50 bg-opacity-25 text-base-content hover:border-opacity-80 hover:bg-opacity-40 mr-[1px] flex-1 border-2"
              value="WINDOW"
            >
              Window
            </FormRadioGroupOption>
            <FormRadioGroupOption
              className="border-opacity-50 bg-opacity-25 text-base-content hover:border-opacity-80 hover:bg-opacity-40 mr-[1px] flex-1 border-2"
              value="MIDDLE"
            >
              Middle
            </FormRadioGroupOption>
            <FormRadioGroupOption
              className="border-opacity-50 bg-opacity-25 text-base-content hover:border-opacity-80 hover:bg-opacity-40 mr-[1px] flex-1 border-2"
              value="AISLE"
            >
              Aisle
            </FormRadioGroupOption>
          </FormRadioGroup>
        </div>
        <FormRadio
          className="min-w-[200px] flex-1"
          labelText="Class"
          name="class"
          options={[
            {
              id: 'ECONOMY',
              label: 'Economy',
              value: 'ECONOMY',
            },
            {
              id: 'PREMIUM',
              label: 'Premium Economy',
              value: 'PREMIUM',
            },
            {
              id: 'BUSINESS',
              label: 'Business',
              value: 'BUSINESS',
            },
            {
              id: 'FIRST',
              label: 'First',
              value: 'FIRST',
            },
          ]}
        />
      </div>
      <FormRadioGroup
        activeColor="info"
        className="flex"
        labelText="Reason"
        name="reason"
      >
        <FormRadioGroupOption
          className="border-opacity-50 bg-opacity-25 text-base-content hover:border-opacity-80 hover:bg-opacity-40 mr-[1px] flex-1 border-2"
          value="LEISURE"
        >
          Leisure
        </FormRadioGroupOption>
        <FormRadioGroupOption
          className="border-opacity-50 bg-opacity-25 text-base-content hover:border-opacity-80 hover:bg-opacity-40 mr-[1px] flex-1 border-2"
          value="BUSINESS"
        >
          Business
        </FormRadioGroupOption>
        <FormRadioGroupOption
          className="border-opacity-50 bg-opacity-25 text-base-content hover:border-opacity-80 hover:bg-opacity-40 mr-[1px] flex-1 border-2"
          value="CREW"
        >
          Crew
        </FormRadioGroupOption>
      </FormRadioGroup>
    </div>
    <Button
      className="m-auto mt-4 w-full max-w-[500px]"
      color="primary"
      loading={isAddFlightLoading}
      type="submit"
    >
      {!isAddFlightLoading ? (
        <>
          <PlusIcon className="h-5 w-5" />
          Add Flight
        </>
      ) : null}
    </Button>
  </>
);
