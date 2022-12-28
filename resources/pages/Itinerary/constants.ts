import { FlightClass } from '@prisma/client';
import { BadgeProps } from 'react-daisyui';

export const BADGE_COLORS_MAP: Record<FlightClass, BadgeProps['color']> = {
  [FlightClass.BASIC]: 'primary',
  [FlightClass.ECONOMY]: 'primary',
  [FlightClass.PREMIUM]: 'secondary',
  [FlightClass.BUSINESS]: 'accent',
  [FlightClass.FIRST]: 'accent',
};
