import { api } from "@/config/api";
import  { type Product, ProductSearchSchema } from "@/schemas/entities/product.schema";

export async function fetchProductVariants(productCode: string): Promise<string[]> {
  const data = await api.get<string[]>("/products/variants", {
    product_code: productCode,
  });
  return data;
}

export async function fetchProductosByName(
  name: string,
  categoryId: string,
  groups: string[],
  subgroups: string[],
): Promise<Product[]> {

  const data = await api.get("/products/search", {
    product_name: name,
    category_id: categoryId || undefined,
    groups: groups.length > 0 ? groups : undefined,
    subgroups: subgroups.length > 0 ? subgroups : undefined,
  });

  return ProductSearchSchema.parse(data);
}
