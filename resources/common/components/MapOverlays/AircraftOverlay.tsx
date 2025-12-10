import { OverlayView, OverlayViewF } from '@react-google-maps/api';
import classNames from 'classnames';
import { useMemo } from 'react';
import { Button, Tooltip, TooltipContent } from 'stratosphere-ui';

import { type FlightsRouterOutput } from '../../../../app/routes/flights';
import { AppTheme, useThemeStore } from '../../../stores';
import {
  CHRISTMAS_THEME_TOOLTIP_COLORS,
  TOOLTIP_COLORS,
} from '../../constants';
import { PlaneSolidIcon, SleighIcon } from '../Icons';

export interface AircraftOverlayProps {
  data: Pick<
    FlightsRouterOutput['getFlight'],
    | 'estimatedHeading'
    | 'estimatedLocation'
    | 'tracklog'
    | 'callsign'
    | 'airline'
    | 'flightNumber'
    | 'estimatedAltitude'
    | 'altChangeString'
    | 'delayStatus'
    | 'user'
  >;
}

export const AircraftOverlay = ({
  data,
}: AircraftOverlayProps): JSX.Element => {
  const { theme } = useThemeStore();
  const shouldFlipIcon =
    data.estimatedHeading >= 180 || data.estimatedHeading < 0;
  const currentTracklogItem = useMemo(
    () =>
      data.tracklog !== undefined && data.tracklog.length > 1
        ? data.tracklog[data.tracklog.length - 2]
        : null,
    [data.tracklog],
  );
  const currentSpeed = useMemo(
    () =>
      currentTracklogItem !== null
        ? Math.round(currentTracklogItem.gs ?? 0)
        : null,
    [currentTracklogItem],
  );
  return (
    <OverlayViewF
      position={{
        lat: data.estimatedLocation.lat,
        lng: data.estimatedLocation.lng,
      }}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(width, height) => ({
        x: -(width / 2),
        y: -(height / 2),
      })}
      zIndex={100}
    >
      <Tooltip
        className={classNames(
          theme === AppTheme.CHRISTMAS &&
            CHRISTMAS_THEME_TOOLTIP_COLORS[data.delayStatus],
        )}
        color={
          theme === AppTheme.CHRISTMAS
            ? undefined
            : TOOLTIP_COLORS[data.delayStatus]
        }
        open
      >
        <TooltipContent className="flex items-center gap-1 font-mono">
          <div className="flex flex-col">
            <span className="flex gap-1 font-bold">
              {data.callsign ?? `${data.airline?.icao}${data.flightNumber}`}
            </span>
            <span className="flex gap-1 text-xs">
              {currentTracklogItem?.ground === true ? (
                <>
                  <span>GND {currentSpeed}</span>
                  <span>kts</span>
                </>
              ) : (
                <>
                  <span>
                    {data.estimatedAltitude !== null
                      ? `FL${data.estimatedAltitude < 10 ? '0' : ''}${data.estimatedAltitude < 100 ? '0' : ''}${data.estimatedAltitude < 0 ? '0' : data.estimatedAltitude}`
                      : null}
                  </span>
                  <span className="font-bold">{data.altChangeString}</span>
                  <span>{currentSpeed}</span>
                </>
              )}
            </span>
          </div>
        </TooltipContent>
        <Button
          size="sm"
          shape="circle"
          color="ghost"
          title={data.user !== null ? `@${data.user.username}` : undefined}
        >
          {theme === AppTheme.CHRISTMAS ? (
            <SleighIcon
              className={classNames(
                'text-secondary h-7 w-7 brightness-80',
                shouldFlipIcon && 'scale-x-[-1]',
              )}
              style={{
                transform: `rotate(${Math.round(
                  (shouldFlipIcon
                    ? -data.estimatedHeading
                    : data.estimatedHeading) - 90,
                )}deg)`,
              }}
            />
          ) : (
            <PlaneSolidIcon
              className="text-primary h-6 w-6"
              style={{
                transform: `rotate(${Math.round(data.estimatedHeading - 90)}deg)`,
              }}
            />
          )}
          {/* {theme === AppTheme.HALLOWEEN ? (
                <HalloweenIcon
                  className="text-primary h-7 w-7"
                  style={{
                    transform: `rotate(${Math.round(data.estimatedHeading)}deg)`,
                  }}
                />
              ) : (
                <PlaneSolidIcon
                  className="text-primary h-6 w-6"
                  style={{
                    transform: `rotate(${Math.round(data.estimatedHeading - 90)}deg)`,
                  }}
                />
              )} */}
          <span className="sr-only">
            {data.user !== null ? `@${data.user.username}` : null}
          </span>
        </Button>
      </Tooltip>
    </OverlayViewF>
  );
};
