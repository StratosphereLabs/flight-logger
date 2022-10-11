import { FlightClass, FlightReason, SeatPosition } from '@prisma/client';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useAppContext } from '../../context';
import { API_URL } from '../constants';
import { ErrorResponse } from '../types';
import useErrorResponseHandler from './useErrorResponseHandler';

export interface AddFlightRequest {
  flightNumber?: number | null;
  callsign?: string | null;
  tailNumber?: string | null;
  outDate: string;
  outTime: string;
  offTime?: string | null;
  onTime?: string | null;
  inTime: string;
  class?: FlightClass | null;
  seatNumber?: string | null;
  seatPosition?: SeatPosition | null;
  reason?: FlightReason | null;
  comments?: string | null;
  trackingLink?: string | null;
}

export const useAddFlightMutation = (): UseMutationResult<
  AxiosResponse,
  AxiosError<ErrorResponse>,
  AddFlightRequest
> => {
  const { clearAlertMessages, token, user } = useAppContext();
  const onErrorResponse = useErrorResponseHandler();
  return useMutation(
    async data => {
      clearAlertMessages();
      return await axios.post(
        `${API_URL}/users/${user?.username ?? ''}/flights`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token ?? ''}`,
          },
        },
      );
    },
    {
      onError: ({ response }) => onErrorResponse(response),
    },
  );
};
