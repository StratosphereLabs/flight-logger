import { z } from 'zod';

export const fileUploadSchema = z.object({
  file: z
    .any()
    .refine(
      (val: unknown) => val instanceof File && val.size > 0,
      'File is required',
    ),
});
