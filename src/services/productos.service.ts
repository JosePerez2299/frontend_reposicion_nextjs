import { api } from "@/config/api";
import  { type Product, ProductSearchSchema } from "@/schemas/entities/product.schema";

export async function fetchProductosByName(
  name: string,
  categoryId: string,
  groups: string[],
  subgroups: string[],
): Promise<Product[]> {
  const data = await api.get("/products/search", {
    product_name: name,
    category_id: categoryId,
    groups,
    subgroups,
  });

  return ProductSearchSchema.parse(data);
}
