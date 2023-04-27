import { z } from 'zod';

export const fileUploadSchema = z.object({
  file: z.any().refine((val: File) => val.size > 0, 'File is required'),
});
