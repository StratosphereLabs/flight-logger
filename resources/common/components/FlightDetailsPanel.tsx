import classNames from 'classnames';
import { type ReactNode } from 'react';

import { type FlightsRouterOutput } from '../../../app/routes/flights';
import {
  CARD_BORDER_COLORS,
  CARD_COLORS,
  HIDE_SCROLLBAR_CLASSNAME,
} from '../constants';
import { StickyFlightHeader } from './StickyFlightHeader';

export interface FlightDetailsPanelProps {
  children: ReactNode;
  data: FlightsRouterOutput['getFlight'] | undefined;
  isScrolled: boolean;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

export const FlightDetailsPanel = ({
  children,
  data,
  isScrolled,
  scrollContainerRef,
}: FlightDetailsPanelProps): JSX.Element => (
  <div
    className={classNames(
      'pointer-events-none absolute bottom-0 left-1 h-[calc(50vh+80px)] w-[calc(100%-8px)] overflow-y-scroll pb-1 md:top-1 md:mt-24 md:h-[calc(100%-104px)] md:w-[390px] md:pb-0',
      HIDE_SCROLLBAR_CLASSNAME,
    )}
    ref={scrollContainerRef}
  >
    <div className="relative">
      {isScrolled ? <StickyFlightHeader data={data} /> : null}
      <div className="rounded-box bg-base-100/80 mt-[calc(50vh-305px+80px)] backdrop-blur-sm md:mt-0 md:h-full">
        <div
          className={classNames(
            'rounded-box pointer-events-auto flex flex-1 flex-col gap-3 overflow-y-scroll p-2 md:h-full',
            HIDE_SCROLLBAR_CLASSNAME,
            data !== undefined && CARD_COLORS[data.delayStatus],
            data !== undefined &&
              `border-2 ${CARD_BORDER_COLORS[data.delayStatus]}`,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  </div>
);
