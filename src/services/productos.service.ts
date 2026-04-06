import { api } from "@/config/api";
import  { type Product, ProductSearchSchema } from "@/schemas/entities/product.schema";

export async function fetchProductosByName(
  name: string,
  categoryId: string,
  groups: string[],
  subgroups: string[],
): Promise<Product[]> {

  console.log("name", name);
  console.log("categoryId", categoryId);
  console.log("groups", groups);
  console.log("subgroups", subgroups);
  const data = await api.get("/products/search", {
    product_name: name,
    category_id: categoryId || undefined,
    groups: groups.length > 0 ? groups : undefined,
    subgroups: subgroups.length > 0 ? subgroups : undefined,
  });

  return ProductSearchSchema.parse(data);
}
