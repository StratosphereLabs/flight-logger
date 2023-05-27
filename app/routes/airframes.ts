import { z } from 'zod';
import { procedure, router } from '../trpc';

const getAirframeSchema = z.object({
  registration: z.string(),
});

export const airframeRouter = router({
  getAirframe: procedure.input(getAirframeSchema).query(({ input }) => {
    const { registration } = input;
    return '';
  }),
});
