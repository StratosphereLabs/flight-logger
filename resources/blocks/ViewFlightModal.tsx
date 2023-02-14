import { Modal } from 'stratosphere-ui';
import { UsersRouterOutput } from '../../app/routes/users';
import { RightArrowIcon } from '../common/components';

export interface ViewFlightProps {
  data: UsersRouterOutput['getUserFlights'][number] | null;
  onClose: () => void;
  show: boolean;
}

export const ViewFlightModal = ({
  data,
  onClose,
  show,
}: ViewFlightProps): JSX.Element => (
  <Modal
    actionButtons={[
      {
        children: 'Close',
        color: 'ghost',
        onClick: onClose,
      },
    ]}
    onClose={onClose}
    show={show}
    title={data?.flightNumberString ?? ''}
  >
    <div className="flex flex-1 flex-col items-center gap-6">
      {typeof data?.airline?.logo === 'string' ? (
        <div className="flex w-[200px] justify-center">
          <img
            className="max-h-[80px] max-w-[200px]"
            src={data?.airline?.logo}
          />
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-12">
          <div>
            <div className="text-xl font-bold">{data?.departureAirportId}</div>
            <div className="truncate text-sm opacity-75">
              {data?.departureAirport?.municipality}
            </div>
            <div className="font-mono text-sm font-bold opacity-50">
              {data?.outTimeLocal}
            </div>
          </div>
          <RightArrowIcon className="h-8 w-8 opacity-75" />
          <div>
            <div className="text-xl font-bold">{data?.arrivalAirportId}</div>
            <div className="truncate text-sm opacity-75">
              {data?.arrivalAirport?.municipality}
            </div>
            <div className="font-mono text-sm font-bold opacity-50">
              {data?.inTimeLocal}
            </div>
          </div>
        </div>
        <div className="flex justify-center italic opacity-50">
          {data?.duration} ({data?.distance} nm)
        </div>
      </div>
      <div className="italic">{data?.aircraftType?.name}</div>
    </div>
  </Modal>
);
