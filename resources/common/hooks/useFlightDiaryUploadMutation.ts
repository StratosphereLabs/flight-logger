import { flight } from '@prisma/client';
import { UseMutationResult, useMutation } from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse } from 'axios';
import useErrorResponseHandler from './useErrorResponseHandler';
import { useSuccessResponseHandler } from './useSuccessResponseHandler';
import { REST_API_URL } from '../constants';
import { ErrorResponse } from '../types';
import { useAuthStore } from '../../stores';

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
      onError: ({ response }) => onErrorResponse(response),
      onSuccess: response =>
        handleSuccess(
          `Successfully added ${response.data.flights.length} flights!`,
        ),
    },
  );
};
