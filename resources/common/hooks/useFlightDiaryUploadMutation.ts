import { type flight } from '@prisma/client';
import { type UseMutationResult, useMutation } from '@tanstack/react-query';
import axios, { type AxiosError, type AxiosResponse } from 'axios';
import { useAuthStore } from '../../stores';
import { REST_API_URL } from '../constants';
import { type ErrorResponse } from '../types';
import useErrorResponseHandler from './useErrorResponseHandler';
import { useSuccessResponseHandler } from './useSuccessResponseHandler';

interface FlightDiaryUploadResponse {
  numFlightsDeleted: number;
  flights: flight[];
}

export const useFlightDiaryUploadMutation = (): UseMutationResult<
  AxiosResponse<FlightDiaryUploadResponse>,
  AxiosError<ErrorResponse>,
  File
> => {
  const { token } = useAuthStore();
  const onErrorResponse = useErrorResponseHandler();
  const handleSuccess = useSuccessResponseHandler();
  return useMutation(
    async fileData => {
      const formData = new FormData();
      formData.append('file', fileData);
      return await axios.post(
        `${REST_API_URL}/upload/flights/flightdiary`,
        formData,
        {
          headers: {
            Authorization: token !== null ? `Bearer ${token}` : undefined,
            'Content-Type': 'multipart/form-data',
          },
        },
      );
    },
    {
      onError: ({ response }) => {
        onErrorResponse(response);
      },
      onSuccess: response => {
        handleSuccess(
          `Successfully added ${response.data.flights.length} flights!`,
        );
      },
    },
  );
};
