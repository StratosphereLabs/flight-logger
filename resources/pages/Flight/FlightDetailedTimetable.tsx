import classNames from 'classnames';

import { type FlightsRouterOutput } from '../../../app/routes/flights';
import { TEXT_COLORS } from '../../common/constants';
import { AppTheme, useThemeStore } from '../../stores';
import { useCardClassNames } from './useCardClassNames';

export interface FlightDetailedTimetableProps {
  data: FlightsRouterOutput['getFlight'];
}

export const FlightDetailedTimetable = ({
  data,
}: FlightDetailedTimetableProps): JSX.Element => {
  const { theme } = useThemeStore();
  const cardClassNames = useCardClassNames();
  return (
    <div
      className={classNames(
        'flex w-full flex-col gap-2 text-sm',
        cardClassNames,
      )}
    >
      <div className="text-base font-semibold">Detailed Timetable</div>
      <table className="table-xs table table-fixed">
        <thead>
          <tr className="border-b-0">
            <th className="w-[150px]"></th>
            <th className="text-right">Scheduled</th>
            <th className="text-right">Actual</th>
          </tr>
          <tr>
            <th>Flight Times</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b-0">
            <td className="w-[150px] text-sm opacity-80">Gate Departure</td>
            <td className="text-right text-sm font-semibold opacity-90">
              {data.outTimeLocal}
            </td>
            <td
              className={classNames(
                'relative text-right text-sm font-semibold',
                TEXT_COLORS[data.departureDelayStatus],
                [AppTheme.LOFI, AppTheme.CYBERPUNK].includes(theme) &&
                  'brightness-90',
              )}
            >
              {data.outTimeActualLocal !== null &&
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
          </tr>
          <tr className="border-b-0">
            <td className="w-[150px] text-sm opacity-80">Takeoff</td>
            <td className="relative text-right text-sm font-semibold opacity-90">
              {data.offTimeLocal}
              {data.offTimeDaysAdded !== 0 ? (
                <sup className="absolute top-2">{`${data.offTimeDaysAdded > 0 ? '+' : ''}${data.offTimeDaysAdded}`}</sup>
              ) : null}
            </td>
            <td
              className={classNames(
                'relative text-right text-sm font-semibold',
                TEXT_COLORS[data.takeoffDelayStatus],
                [AppTheme.LOFI, AppTheme.CYBERPUNK].includes(theme) &&
                  'brightness-90',
              )}
            >
              {data.offTimeActualLocal !== null &&
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
          </tr>
          <tr className="border-b-0">
            <td className="w-[150px] text-sm opacity-80">Landing</td>
            <td className="relative text-right text-sm font-semibold opacity-90">
              {data.onTimeLocal}
              {data.onTimeDaysAdded !== 0 ? (
                <sup className="absolute top-2">{`${data.onTimeDaysAdded > 0 ? '+' : ''}${data.onTimeDaysAdded}`}</sup>
              ) : null}
            </td>
            <td
              className={classNames(
                'relative text-right text-sm font-semibold',
                TEXT_COLORS[data.landingDelayStatus],
                [AppTheme.LOFI, AppTheme.CYBERPUNK].includes(theme) &&
                  'brightness-90',
              )}
            >
              {data.onTimeActualLocal !== null &&
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
          </tr>
          <tr className="border-b-0">
            <td className="w-[150px] text-sm opacity-80">Gate Arrival</td>
            <td className="relative text-right text-sm font-semibold opacity-90">
              {data.inTimeLocal}
              {data.inTimeDaysAdded !== 0 ? (
                <sup className="absolute top-2">{`${data.inTimeDaysAdded > 0 ? '+' : ''}${data.inTimeDaysAdded}`}</sup>
              ) : null}
            </td>
            <td
              className={classNames(
                'relative text-right text-sm font-semibold',
                TEXT_COLORS[data.arrivalDelayStatus],
                [AppTheme.LOFI, AppTheme.CYBERPUNK].includes(theme) &&
                  'brightness-90',
              )}
            >
              {data.inTimeActualLocal !== null &&
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
          </tr>
        </tbody>
      </table>
      <table className="table-xs table table-fixed">
        <thead>
          <tr>
            <th className="w-[150px]">Durations</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b-0">
            <td className="w-[150px] text-sm opacity-80">Flight Time</td>
            <td className="text-right text-sm font-semibold opacity-90">
              {data.flightDurationString}
            </td>
            <td
              className={classNames(
                'text-right text-sm font-semibold',
                TEXT_COLORS[data.flightDurationDelayStatus],
                [AppTheme.LOFI, AppTheme.CYBERPUNK].includes(theme) &&
                  'brightness-90',
              )}
            >
              {data.flightDurationActualString}
            </td>
          </tr>
          <tr className="border-b-0">
            <td className="w-[150px] text-sm opacity-80">Taxi Time</td>
            <td className="text-right text-sm font-semibold opacity-90">
              {data.taxiDurationString}
            </td>
            <td
              className={classNames(
                'text-right text-sm font-semibold',
                TEXT_COLORS[data.taxiDurationDelayStatus],
                [AppTheme.LOFI, AppTheme.CYBERPUNK].includes(theme) &&
                  'brightness-90',
              )}
            >
              {data.taxiDurationActualString}
            </td>
          </tr>
          <tr>
            <td className="w-[150px] text-sm opacity-80">Block Time</td>
            <td className="text-right text-sm font-semibold opacity-90">
              {data.durationStringLeadingZero}
            </td>
            <td
              className={classNames(
                'text-right text-sm font-semibold',
                TEXT_COLORS[data.durationDelayStatus],
                [AppTheme.LOFI, AppTheme.CYBERPUNK].includes(theme) &&
                  'brightness-90',
              )}
            >
              {data.durationActualString}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
