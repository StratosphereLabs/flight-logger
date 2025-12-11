import classNames from 'classnames';
import { isAfter, isBefore } from 'date-fns';

import { type FlightsRouterOutput } from '../../../app/routes/flights';
import { AppTheme, useThemeStore } from '../../stores';
import { TEXT_COLORS } from '../constants';
import { useCardClassNames } from '../hooks';

export interface FlightDetailedTimetableProps {
  data?: Pick<
    FlightsRouterOutput['getFlight'],
    | 'flightStatus'
    | 'outTime'
    | 'outTimeLocal'
    | 'outTimeActual'
    | 'outTimeActualLocal'
    | 'outTimeActualDaysAdded'
    | 'departureDelayStatus'
    | 'offTimeLocal'
    | 'offTimeActual'
    | 'offTimeDaysAdded'
    | 'offTimeActualLocal'
    | 'offTimeActualDaysAdded'
    | 'takeoffDelayStatus'
    | 'onTimeLocal'
    | 'onTimeActual'
    | 'onTimeDaysAdded'
    | 'landingDelayStatus'
    | 'onTimeActualLocal'
    | 'onTimeActualDaysAdded'
    | 'inTimeLocal'
    | 'inTimeActual'
    | 'inTimeDaysAdded'
    | 'arrivalDelayStatus'
    | 'inTimeActualLocal'
    | 'inTimeActualDaysAdded'
    | 'flightDurationString'
    | 'flightDurationDelayStatus'
    | 'flightDurationActualString'
    | 'taxiDurationString'
    | 'taxiDurationDelayStatus'
    | 'taxiDurationActualString'
    | 'durationStringLeadingZero'
    | 'durationDelayStatus'
    | 'durationActualString'
  >;
}

export const FlightDetailedTimetable = ({
  data,
}: FlightDetailedTimetableProps): JSX.Element | null => {
  const { theme } = useThemeStore();
  const cardClassNames = useCardClassNames();
  if (data === undefined) return null;
  const showEstimatedColumn = data.flightStatus !== 'ARRIVED';
  const showActualColumn = data.flightStatus !== 'SCHEDULED';
  return (
    <div
      className={classNames(
        'flex w-full flex-col gap-2 text-sm',
        cardClassNames,
      )}
    >
      <div className="text-base font-semibold">Detailed Timetable</div>
      <table className="table-xs mx-[-3px] table w-[calc(100%+6px)] table-fixed overflow-visible text-nowrap">
        <thead>
          <tr className="border-b-0">
            <th
              className={classNames(
                showEstimatedColumn && showActualColumn && 'w-[105px]',
              )}
            ></th>
            <th className="text-right">Scheduled</th>
            {showEstimatedColumn ? (
              <th className="text-right">Estimated</th>
            ) : null}
            {showActualColumn ? (
              <th
                className={classNames(
                  'text-right',
                  showEstimatedColumn && 'w-[75px]',
                )}
              >
                Actual
              </th>
            ) : null}
          </tr>
          <tr>
            <th>Flight Times</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b-0">
            <td className="text-[0.8125rem] opacity-80">Gate Departure</td>
            <td className="text-right text-sm font-semibold opacity-90">
              {data.outTimeLocal}
            </td>
            {showEstimatedColumn ? (
              <td
                className={classNames(
                  'relative text-right text-sm font-semibold',
                  TEXT_COLORS[data.departureDelayStatus],
                  [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
                )}
              >
                {data.outTimeActualLocal !== null &&
                isBefore(new Date(), data.outTimeActualLocal) &&
                data.outTimeActualDaysAdded !== null ? (
                  <>
                    {data.outTimeActualLocal}
                    {data.outTimeActualDaysAdded !== 0 ? (
                      <sup className="absolute top-2">
                        {`${data.outTimeActualDaysAdded > 0 ? '+' : ''}${data.outTimeActualDaysAdded}`}
                      </sup>
                    ) : null}
                  </>
                ) : null}
              </td>
            ) : null}
            {showActualColumn ? (
              <td
                className={classNames(
                  'relative text-right text-sm font-semibold',
                  TEXT_COLORS[data.departureDelayStatus],
                  [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
                )}
              >
                {data.outTimeActualLocal !== null &&
                data.outTimeActual !== null &&
                isAfter(new Date(), data.outTimeActual) &&
                data.outTimeActualDaysAdded !== null ? (
                  <>
                    {data.outTimeActualLocal}
                    {data.outTimeActualDaysAdded !== 0 ? (
                      <sup className="absolute top-2">
                        {`${data.outTimeActualDaysAdded > 0 ? '+' : ''}${data.outTimeActualDaysAdded}`}
                      </sup>
                    ) : null}
                  </>
                ) : null}
              </td>
            ) : null}
          </tr>
          <tr className="border-b-0">
            <td className="text-[0.8125rem] opacity-80">Takeoff</td>
            <td className="relative text-right text-sm font-semibold opacity-90">
              {data.offTimeLocal}
              {data.offTimeDaysAdded !== 0 ? (
                <sup className="absolute top-2">{`${data.offTimeDaysAdded > 0 ? '+' : ''}${data.offTimeDaysAdded}`}</sup>
              ) : null}
            </td>
            {showEstimatedColumn ? (
              <td
                className={classNames(
                  'relative text-right text-sm font-semibold',
                  TEXT_COLORS[data.takeoffDelayStatus],
                  [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
                )}
              >
                {data.offTimeActualLocal !== null &&
                data.offTimeActual !== null &&
                isBefore(new Date(), data.offTimeActual) &&
                data.offTimeActualDaysAdded !== null ? (
                  <>
                    {data.offTimeActualLocal}
                    {data.offTimeActualDaysAdded !== 0 ? (
                      <sup className="absolute top-2">
                        {`${data.offTimeActualDaysAdded > 0 ? '+' : ''}${data.offTimeActualDaysAdded}`}
                      </sup>
                    ) : null}
                  </>
                ) : null}
              </td>
            ) : null}
            {showActualColumn ? (
              <td
                className={classNames(
                  'relative text-right text-sm font-semibold',
                  TEXT_COLORS[data.takeoffDelayStatus],
                  [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
                )}
              >
                {data.offTimeActualLocal !== null &&
                data.offTimeActual !== null &&
                isAfter(new Date(), data.offTimeActual) &&
                data.offTimeActualDaysAdded !== null ? (
                  <>
                    {data.offTimeActualLocal}
                    {data.offTimeActualDaysAdded !== 0 ? (
                      <sup className="absolute top-2">
                        {`${data.offTimeActualDaysAdded > 0 ? '+' : ''}${data.offTimeActualDaysAdded}`}
                      </sup>
                    ) : null}
                  </>
                ) : null}
              </td>
            ) : null}
          </tr>
          <tr className="border-b-0">
            <td className="text-[0.8125rem] opacity-80">Landing</td>
            <td className="relative text-right text-sm font-semibold opacity-90">
              {data.onTimeLocal}
              {data.onTimeDaysAdded !== 0 ? (
                <sup className="absolute top-2">{`${data.onTimeDaysAdded > 0 ? '+' : ''}${data.onTimeDaysAdded}`}</sup>
              ) : null}
            </td>
            {showEstimatedColumn ? (
              <td
                className={classNames(
                  'relative text-right text-sm font-semibold',
                  TEXT_COLORS[data.landingDelayStatus],
                  [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
                )}
              >
                {data.onTimeActualLocal !== null &&
                data.onTimeActual !== null &&
                isBefore(new Date(), data.onTimeActual) &&
                data.onTimeActualDaysAdded !== null ? (
                  <>
                    {data.onTimeActualLocal}
                    {data.onTimeActualDaysAdded !== 0 ? (
                      <sup className="absolute top-2">
                        {`${data.onTimeActualDaysAdded > 0 ? '+' : ''}${data.onTimeActualDaysAdded}`}
                      </sup>
                    ) : null}
                  </>
                ) : null}
              </td>
            ) : null}
            {showActualColumn ? (
              <td
                className={classNames(
                  'relative text-right text-sm font-semibold',
                  TEXT_COLORS[data.landingDelayStatus],
                  [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
                )}
              >
                {data.onTimeActualLocal !== null &&
                data.onTimeActual !== null &&
                isAfter(new Date(), data.onTimeActual) &&
                data.onTimeActualDaysAdded !== null ? (
                  <>
                    {data.onTimeActualLocal}
                    {data.onTimeActualDaysAdded !== 0 ? (
                      <sup className="absolute top-2">
                        {`${data.onTimeActualDaysAdded > 0 ? '+' : ''}${data.onTimeActualDaysAdded}`}
                      </sup>
                    ) : null}
                  </>
                ) : null}
              </td>
            ) : null}
          </tr>
          <tr className="border-b-0">
            <td className="text-[0.8125rem] opacity-80">Gate Arrival</td>
            <td className="relative text-right text-sm font-semibold opacity-90">
              {data.inTimeLocal}
              {data.inTimeDaysAdded !== 0 ? (
                <sup className="absolute top-2">{`${data.inTimeDaysAdded > 0 ? '+' : ''}${data.inTimeDaysAdded}`}</sup>
              ) : null}
            </td>
            {showEstimatedColumn ? (
              <td
                className={classNames(
                  'relative text-right text-sm font-semibold',
                  TEXT_COLORS[data.arrivalDelayStatus],
                  [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
                )}
              >
                {data.inTimeActualLocal !== null &&
                data.inTimeActual !== null &&
                isBefore(new Date(), data.inTimeActual) &&
                data.inTimeActualDaysAdded !== null ? (
                  <>
                    {data.inTimeActualLocal}
                    {data.inTimeActualDaysAdded !== 0 ? (
                      <sup className="absolute top-2">
                        {`${data.inTimeActualDaysAdded > 0 ? '+' : ''}${data.inTimeActualDaysAdded}`}
                      </sup>
                    ) : null}
                  </>
                ) : null}
              </td>
            ) : null}
            {showActualColumn ? (
              <td
                className={classNames(
                  'relative text-right text-sm font-semibold',
                  TEXT_COLORS[data.arrivalDelayStatus],
                  [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
                )}
              >
                {data.inTimeActualLocal !== null &&
                data.inTimeActual !== null &&
                isAfter(new Date(), data.inTimeActual) &&
                data.inTimeActualDaysAdded !== null ? (
                  <>
                    {data.inTimeActualLocal}
                    {data.inTimeActualDaysAdded !== 0 ? (
                      <sup className="absolute top-2">
                        {`${data.inTimeActualDaysAdded > 0 ? '+' : ''}${data.inTimeActualDaysAdded}`}
                      </sup>
                    ) : null}
                  </>
                ) : null}
              </td>
            ) : null}
          </tr>
        </tbody>
      </table>
      <table className="table-xs mx-[-4px] table w-[calc(100%+8px)] table-fixed">
        <thead>
          <tr>
            <th
              className={classNames(
                showEstimatedColumn && showActualColumn && 'w-[105px]',
              )}
            >
              Durations
            </th>
            <th />
            {showEstimatedColumn ? <th /> : null}
            {showActualColumn ? (
              <th className={classNames(showEstimatedColumn && 'w-[75px]')} />
            ) : null}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b-0">
            <td className="text-[0.8125rem] opacity-80">Flight Time</td>
            <td className="text-right text-sm font-semibold opacity-90">
              {data.flightDurationString}
            </td>
            {showEstimatedColumn ? (
              <td
                className={classNames(
                  'text-right text-sm font-semibold',
                  TEXT_COLORS[data.flightDurationDelayStatus],
                  [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
                )}
              >
                {data.onTimeActual !== null &&
                isBefore(new Date(), data.onTimeActual)
                  ? data.flightDurationActualString
                  : null}
              </td>
            ) : null}
            {showActualColumn ? (
              <td
                className={classNames(
                  'text-right text-sm font-semibold',
                  TEXT_COLORS[data.flightDurationDelayStatus],
                  [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
                )}
              >
                {data.onTimeActual !== null &&
                isAfter(new Date(), data.onTimeActual)
                  ? data.flightDurationActualString
                  : null}
              </td>
            ) : null}
          </tr>
          <tr className="border-b-0">
            <td className="text-[0.8125rem] opacity-80">Taxi Time</td>
            <td className="text-right text-sm font-semibold opacity-90">
              {data.taxiDurationString}
            </td>
            {showEstimatedColumn ? (
              <td
                className={classNames(
                  'text-right text-sm font-semibold',
                  TEXT_COLORS[data.taxiDurationDelayStatus],
                  [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
                )}
              >
                {data.inTimeActual !== null &&
                isBefore(new Date(), data.inTimeActual)
                  ? data.taxiDurationActualString
                  : null}
              </td>
            ) : null}
            {showActualColumn ? (
              <td
                className={classNames(
                  'text-right text-sm font-semibold',
                  TEXT_COLORS[data.taxiDurationDelayStatus],
                  [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
                )}
              >
                {data.inTimeActual !== null &&
                isAfter(new Date(), data.inTimeActual)
                  ? data.taxiDurationActualString
                  : null}
              </td>
            ) : null}
          </tr>
          <tr>
            <td className="text-[0.8125rem] opacity-80">Block Time</td>
            <td className="text-right text-sm font-semibold opacity-90">
              {data.durationStringLeadingZero}
            </td>
            {showEstimatedColumn ? (
              <td
                className={classNames(
                  'text-right text-sm font-semibold',
                  TEXT_COLORS[data.durationDelayStatus],
                  [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
                )}
              >
                {data.inTimeActual !== null &&
                isBefore(new Date(), data.inTimeActual)
                  ? data.durationActualString
                  : null}
              </td>
            ) : null}
            {showActualColumn ? (
              <td
                className={classNames(
                  'text-right text-sm font-semibold',
                  TEXT_COLORS[data.durationDelayStatus],
                  [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
                )}
              >
                {data.inTimeActual !== null &&
                isAfter(new Date(), data.inTimeActual)
                  ? data.durationActualString
                  : null}
              </td>
            ) : null}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
