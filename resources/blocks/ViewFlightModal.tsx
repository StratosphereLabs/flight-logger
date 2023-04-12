import { Modal } from 'stratosphere-ui';
import { UsersRouterOutput } from '../../app/routes/users';
import { RightArrowIcon } from '../common/components';

export interface ViewFlightProps {
  data: UsersRouterOutput['getUserFlights'][number] | null;
  onClose: () => void;
  open: boolean;
}

export const ViewFlightModal = ({
  data,
  onClose,
  open,
}: ViewFlightProps): JSX.Element => (
  <Modal
    actionButtons={[
      {
        children: 'Done',
        color: 'ghost',
        onClick: onClose,
      },
    ]}
    onClose={onClose}
    open={open}
    title=""
  >
    <div className="flex flex-1 flex-col items-center gap-8">
      {typeof data?.airline?.logo === 'string' ? (
        <div className="flex w-[200px] justify-center">
          <img
            alt={`${data.airline.name} Logo`}
            className="max-h-[80px] max-w-[200px]"
            src={data.airline.logo}
          />
        </div>
      ) : null}
      <div className="flex w-full flex-col gap-2">
        <div className="text-center text-lg font-bold opacity-75">
          Flight #{data?.flightNumber}
        </div>
        <div className="text-center text-sm opacity-75">
          {data?.outDateLocal}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-1 justify-center">
            <div className="max-w-[100px] sm:max-w-[200px]">
              <div className="text-xl font-bold">
                {data?.departureAirportId}
              </div>
              <div className="truncate text-sm opacity-75">
                {data?.departureAirport?.municipality}
              </div>
              <div className="font-mono text-sm font-bold opacity-50">
                {data?.outTimeLocal}
              </div>
            </div>
          </div>
          <RightArrowIcon className="h-8 w-8 opacity-75" />
          <div className="flex flex-1 justify-center">
            <div className="max-w-[100px] sm:max-w-[200px]">
              <div className="text-xl font-bold">{data?.arrivalAirportId}</div>
              <div className="truncate text-sm opacity-75">
                {data?.arrivalAirport?.municipality}
              </div>
              <div className="font-mono text-sm font-bold opacity-50">
                {data?.inTimeLocal}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center italic opacity-50">
          {data?.duration} ({data?.distance} nm)
        </div>
      </div>
      <div className="flex w-full items-center justify-center gap-12">
        <div className="max-w-[150px] sm:max-w-[200px]">
          {data?.aircraftType?.name}
        </div>
        <div className="max-w-[150px] font-mono text-lg sm:max-w-[200px]">
          {data?.tailNumber}
        </div>
      </div>
    </div>
  </Modal>
);
