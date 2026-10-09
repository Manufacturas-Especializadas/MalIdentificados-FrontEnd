import { useCallback, useEffect, useState } from "react";
import { scanningServce } from "../api/services/ScanningService";
import { toast } from "sonner";
import type {
  CompleteBatchPayload,
  Validation,
} from "../types/types";

export const useScanning = ({ loadHistory = true } = {}) => {
  const [validations, setValidations] = useState<Validation[]>([]);
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

  const fetchValidations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await scanningServce.getValidations();
      setValidations(response);
    } catch (error) {
      console.error("Error al obtener los datos", error);
      toast.error("No se pudo obtener los datos");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveCompletedBatch = async (
    payload: CompleteBatchPayload,
  ) => {
    setLoading(true);

    const promise = scanningServce.saveBatch(payload).finally(() => {
      setLoading(false);
    });

    toast.promise(promise, {
      loading: "Guardando lote en la base de datos...",
      success: () =>
        `Lote guardado exitosamente para el NP: ${payload.expectedPartCode}`,
      error: "Error al guardar el lote de producción",
    });

    return promise;
  };

  const resetValidation = () => {
    setValidationId(null);
  };

  useEffect(() => {
    if (!loadHistory) return;
    const timer = window.setTimeout(() => void fetchValidations(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchValidations, loadHistory]);

  return {
    loading,
    validationId,
    saveCompletedBatch,
    isValidating,
    validateQualityApprover,
    resetValidation,
    validations,
    fetchValidations,
  };
};
