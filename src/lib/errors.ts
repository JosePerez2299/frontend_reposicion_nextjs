import { ApiError } from "@/config/api";

/**
 * Extracts a human-readable error message from an ApiError.
 * Handles common response shapes: { detail }, { message }, { error }, { msg },
 * array of field errors, or falls back to status-based message.
 */
export function getErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    if (error instanceof Error) return error.message;
    return "Ha ocurrido un error inesperado";
  }

  const { status, data } = error;

  // Try to extract message from common response shapes
  if (data && typeof data === "object") {
    const body = data as Record<string, unknown>;

    // FastAPI standard: { detail: "..." }
    if (typeof body.detail === "string" && body.detail) return body.detail;

    // Common: { message: "..." }
    if (typeof body.message === "string" && body.message) return body.message;

    // Common: { error: "..." }
    if (typeof body.error === "string" && body.error) return body.error;

    // Common: { msg: "..." }
    if (typeof body.msg === "string" && body.msg) return body.msg;

    // Validation errors: { detail: [{ loc, msg }, ...] } (FastAPI validation)
    if (Array.isArray(body.detail)) {
      const msgs = (body.detail as Record<string, unknown>[])
        .map((e) => e.msg)
        .filter((m): m is string => typeof m === "string");
      if (msgs.length > 0) return msgs.join(", ");
    }

    // Field errors: { email: ["Invalid email"], password: [...] }
    const fieldErrors = Object.values(body)
      .filter((v): v is string[] => Array.isArray(v))
      .flat()
      .filter((m): m is string => typeof m === "string");
    if (fieldErrors.length > 0) return fieldErrors.join(", ");
  }

  // Fallback: status-based messages
  const statusMessages: Record<number, string> = {
    400: "La solicitud es incorrecta",
    401: "Credenciales inválidas. Verifica tu email y contraseña.",
    403: "No tienes permisos para realizar esta acción",
    404: "El recurso solicitado no existe",
    409: "Ya existe un registro con esos datos",
    422: "Los datos enviados no son válidos",
    500: "Error interno del servidor. Inténtalo de nuevo más tarde.",
    502: "El servidor no está disponible en este momento",
    503: "El servicio no está disponible. Inténtalo más tarde.",
  };

  return statusMessages[status] || `Error del servidor (${status})`;
}
