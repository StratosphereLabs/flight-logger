import { UseMutationResult, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../../stores';

export const useFlightDiaryUploadMutation = (): UseMutationResult<
  unknown,
  unknown,
  string
> => {
  const { token } = useAuthStore();
  return useMutation(async fileData => {
    const formData = new FormData();
    formData.append('file', fileData);
    return await axios.post('/rest/upload/flights/flightdiary', fileData, {
      headers: {
        Authorization: token !== null ? `Bearer ${token}` : undefined,
        'Content-Type': 'multipart/form-data',
      },
    });
  });
};
