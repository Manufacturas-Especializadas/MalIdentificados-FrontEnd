import { useState } from "react";
import { scanningServce } from "../api/services/ScanningService";
import { toast } from "sonner";

export const useScanning = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const [validationId, setValidationId] = useState<number | null>(null);

  const startValidation = async (
    payrollNumber: number,
    partNumberScanned: string,
    quantity: number,
  ) => {
    setLoading(true);

    const promise = scanningServce
      .scanning(payrollNumber, partNumberScanned, quantity)
      .then((response) => {
        setValidationId(response.validationId);

        return response;
      })
      .finally(() => {
        setLoading(false);
      });

    toast.promise(promise, {
      loading: "Abriendo sesión de escaneo...",
      success: () => `Sesión iniciada para el NP: ${partNumberScanned}`,
      error: "Error al iniciar la sesión",
    });

    return promise;
  };

  const resetValidation = () => {
    setValidationId(null);
  };

  return {
    loading,
    validationId,
    startValidation,
    resetValidation,
  };
};
