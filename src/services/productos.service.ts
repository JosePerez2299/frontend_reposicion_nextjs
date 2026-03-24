export async function fetchProductosByName(name: string) {
  const dummyProductos = [
    { id: 1, name: "Producto 1" },
    { id: 2, name: "Producto 2" },
    { id: 3, name: "Producto 3" },
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: dummyProductos.filter((producto) =>
          producto.name.toLowerCase().includes(name.toLowerCase()),
        ),
      });
    }, 500); // Simulamos una latencia de 500ms
  });
}
