import { useState } from "react";
import { scanningServce } from "../api/services/ScanningService";
import { toast } from "sonner";
import type { CompleteBatchPayload, ScanRecord } from "../types/types";

export const useScanning = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const [validationId, setValidationId] = useState<number | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const validateQualityApprover = async (
    payrollNumber: number,
  ): Promise<boolean> => {
    setIsValidating(true);
    try {
      const isValid = await scanningServce.validateApprover(payrollNumber);

      if (!isValid) {
        toast.error("Nómina no autorizada o inactiva en el sistema");
      }

      return isValid;
    } catch (error) {
      console.error("Error al validar auditor", error);
      toast.error("Hubo un error de conexión al validar la nómina");
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const saveCompletedBatch = async (
    payrollNumber: number,
    expectedPartCode: string,
    requiredQuantity: number,
    scannedItems: ScanRecord[],
  ) => {
    setLoading(true);

    const payload: CompleteBatchPayload = {
      payrollNumber,
      expectedPartCode,
      requiredQuantity,
      scans: scannedItems.map((item) => ({
        scannedPartCode: item.code,
        isCorrect: item.isCorrect,
        scanDate: item.timestamp.toISOString(),
        releasedByPayroll: item.releasedBy,
      })),
    };

    const promise = scanningServce.saveBatch(payload).finally(() => {
      setLoading(false);
    });

    toast.promise(promise, {
      loading: "Guardando lote en la base de datos...",
      success: () =>
        `Lote guardado exitosamente para el NP: ${expectedPartCode}`,
      error: "Error al guardar el lote de producción",
    });

    return promise;
  };

  const resetValidation = () => {
    setValidationId(null);
  };

  return {
    loading,
    validationId,
    saveCompletedBatch,
    resetValidation,
  };
};
