import type { Product } from "@/schemas/entities/product.schema";

export async function fetchProductosByName(name: string): Promise<Product[]> {
  const dummyProductos: Product[] = [
    { id: "1", name: "Bora Bora 2.0", sku: "SKU-001" },
    { id: "2", name: "Bora Junior", sku: "SKU-002" },
    { id: "3", name: "Defender", sku: "SKU-003" },
    { id: "4", name: "Super Defender", sku: "SKU-004" },
    { id: "5", name: "Super Super Defender", sku: "SKU-005" },
    { id: "6", name: "Ultra Defender", sku: "SKU-006" },
    { id: "7", name: "Ultra Super Defender", sku: "SKU-007" },
    { id: "8", name: "Ultra Ultra Defender", sku: "SKU-008" },
    { id: "9", name: "Ultra Mega Defender", sku: "SKU-009" },
    { id: "10", name: "Ultra Mega Super Defender", sku: "SKU-010" },
  ];

  const q = name.trim().toLowerCase();

  return new Promise((resolve) => {
    setTimeout(() => {
      if (!q) {
        resolve([]);
        return;
      }
      resolve(dummyProductos.filter((p) => p.name.toLowerCase().includes(q)));
    }, 500);
  });
}
