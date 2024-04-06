import type { NotificationColor } from '@prisma/client';
import { type SVGProps } from 'react';
import { ErrorIcon, InfoIcon, SuccessIcon, WarningIcon } from 'stratosphere-ui';

export const APP_URL = import.meta.env.VITE_APP_URL as string;
export const REST_API_URL = `${APP_URL}/rest`;
export const TRPC_API_URL = `${APP_URL}/trpc`;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

export const NOTIFICATION_STATUS_TO_ICON_MAP: Record<
  NotificationColor,
  (props: SVGProps<SVGSVGElement>) => JSX.Element
> = {
  INFO: InfoIcon,
  SUCCESS: SuccessIcon,
  WARNING: WarningIcon,
  ERROR: ErrorIcon,
};
