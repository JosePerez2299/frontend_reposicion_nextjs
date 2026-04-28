import { z } from "zod";

export const ExportAllProductsDetailsXmlRequest = z.object({
  body: z.object({
    product_codes: z.array(z.string()),
    store_ids: z.array(z.string()),
    category_id: z.string(),
    group_ids: z.array(z.string()),
    subgroup_ids: z.array(z.string()),
  }),
  dates: z.object({
    start: z.string(),
    end: z.string(),
  }),
});

export type ExportAllProductsDetailsXmlRequest = z.infer<
  typeof ExportAllProductsDetailsXmlRequest
>;
