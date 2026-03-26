import { z } from "zod";
const SubgroupSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const GroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  subgroups: z.array(SubgroupSchema),
});

const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  groups: z.array(GroupSchema),
});

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  category_id: z.string(),
});

export const ProductSearchSchema = z.array(ProductSchema);

export type Product = z.infer<typeof ProductSchema>;
export type ProductSearch = z.infer<typeof ProductSearchSchema>;

export type Subgroup = z.infer<typeof SubgroupSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type FilterOptions = z.infer<typeof FilterOptionsSchema>;

export const FilterOptionsSchema = z.array(CategorySchema);
