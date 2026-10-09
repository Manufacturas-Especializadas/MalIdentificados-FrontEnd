import { isAxiosError } from "axios";
import type {
  CompleteBatchPayload,
  Line,
  ScanRecord,
  ScanningContract,
  SessionConfig,
} from "../types/types";

export const legacyCodeInput = (value: string) =>
  value.toUpperCase().replace(/'/g, "-");

export const literalCodeInput = (value: string) => value;

export const isPositiveInteger = (value: number) =>
  Number.isSafeInteger(value) && value > 0 && value <= 2147483647;

// Same comparison as the API: trimmed, case-sensitive, preserving internal characters.
export const containerMatches = (part: string, container: string) =>
  part.trim().length > 0 && part.trim() === container.trim();

export function validateSession(config: SessionConfig): string | null {
  if (!Number.isInteger(config.payroll) || !config.partNumber.trim()) {
    return "Captura la nómina y el número de parte.";
  }
  if (!isPositiveInteger(config.quantity)) {
    return "Standard Pack debe ser un entero positivo.";
  }
  if (config.validationMode === "container") {
    return containerMatches(config.partNumber, config.containerNumber)
      ? null
      : "El número de contenedor debe coincidir exactamente con el número de parte.";
  }
  return config.shopOrder.trim() ? null : "Captura Shop Order.";
}

export function resolveActiveLine(lines: Line[], id: number): Line {
  if (!isPositiveInteger(id)) throw new Error("Falta configurar el identificador real de la línea.");
  const matches = lines.filter((line) => line.id === id && line.isActive);
  if (matches.length !== 1) throw new Error("La línea configurada no existe o no está activa.");
  return matches[0];
}

export function buildBatchPayload(
  config: SessionConfig,
  contract: ScanningContract,
  items: ScanRecord[],
): CompleteBatchPayload {
  const error = validateSession(config);
  if (error) throw new Error(error);
  const common = {
    payrollNumber: config.payroll,
    expectedPartCode: config.partNumber,
    requiredQuantity: config.quantity,
    scans: items.map((item) => ({
      scannedPartCode: item.code,
      isCorrect: item.isCorrect,
      scanDate: item.timestamp.toISOString(),
      releasedByPayroll: item.releasedBy ?? null,
    })),
  };
  if (contract.version === "legacy") {
    if (config.validationMode !== "shopOrder") {
      throw new Error("El modo contenedor requiere el contrato actualizado.");
    }
    return { ...common, shopOrder: config.shopOrder };
  }
  if (!isPositiveInteger(contract.lineId)) throw new Error("Identificador de línea inválido.");
  return config.validationMode === "container"
    ? { ...common, validationMode: "container", lineId: contract.lineId, containerNumber: config.containerNumber }
    : { ...common, validationMode: "shopOrder", lineId: contract.lineId, shopOrder: config.shopOrder };
}

export function describeSaveError(error: unknown): { message: string; uncertain: boolean } {
  if (isAxiosError<{ errors?: Record<string, string[]> }>(error)) {
    const messages = error.response?.data?.errors;
    const details = messages && typeof messages === "object"
      ? Object.values(messages).flat().filter((value) => typeof value === "string").join(" ")
      : "";
    return {
      message: details || "No se pudo confirmar el guardado del lote. Las lecturas se conservaron.",
      // A lost response or server error may happen after the transaction committed.
      uncertain: !error.response || error.response.status >= 500 || error.response.status === 408,
    };
  }
  return { message: error instanceof Error ? error.message : "No se pudo guardar el lote.", uncertain: true };
}
