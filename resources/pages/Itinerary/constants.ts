import { FlightClass } from '@prisma/client';
import { BadgeProps } from 'react-daisyui';

export const BADGE_COLORS_MAP: Record<FlightClass, BadgeProps['color']> = {
  [FlightClass.BASIC]: 'primary',
  [FlightClass.ECONOMY]: 'primary',
  [FlightClass.PREMIUM]: 'secondary',
  [FlightClass.BUSINESS]: 'accent',
  [FlightClass.FIRST]: 'accent',
};

export const CLASS_TEXT_MAP: Record<FlightClass, string> = {
  [FlightClass.BASIC]: 'Economy',
  [FlightClass.ECONOMY]: 'Economy',
  [FlightClass.PREMIUM]: 'Economy+',
  [FlightClass.BUSINESS]: 'Business',
  [FlightClass.FIRST]: 'First',
};
