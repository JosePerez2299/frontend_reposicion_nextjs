import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * false en el server y en la hidratación, true después. Sirve para leer estado
 * que solo existe en el cliente (p. ej. el usuario de la cookie) sin hydration mismatch.
 */
export function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
