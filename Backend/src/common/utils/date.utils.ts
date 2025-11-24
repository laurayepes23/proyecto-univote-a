/**
 * Formatea una fecha a string legible en español (Colombia)
 * @param date - Fecha a formatear
 * @returns String formateado
 */
export function formatDateToESLocale(date: Date): string {
  return date.toLocaleString("es-ES", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Convierte BigInt a string de forma segura para JSON
 * @param value - Valor BigInt
 * @returns String representation
 */
export function bigIntToString(value: bigint): string {
  return value.toString();
}
