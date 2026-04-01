import { z } from "zod";

export const RotationRequest = z.object({
  dates: z.object({
    from: z.date(),
    to: z.date(),
  }),
  category: z.string(),
  groups: z.array(z.string()),
  subgroups: z.array(z.string()),
  product_codes: z.array(z.string()),
  store_ids: z.array(z.string()),
});

export type AnalisisFilters = z.infer<typeof RotationRequest>;

export type RotationRequest = z.infer<typeof RotationRequest>;