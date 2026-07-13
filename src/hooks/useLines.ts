import { useCallback, useEffect, useState } from "react";
import type { Line } from "../types/types";
import { linesService } from "../api/services/LinesService";
import { toast } from "sonner";

export const useLines = () => {
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLines = useCallback(async () => {
    setLoading(true);
    try {
      const data = await linesService.getLines();
      setLines(data);
    } catch (err: any) {
      toast.error("Error de conexion", {
        description: "No se pudieron sincronizar las lineas",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const createLine = async (lineName: string) => {
    const promise = linesService.create(lineName);
    toast.promise(promise, {
      loading: "Registrando nueva linea",
      success: () => {
        fetchLines();
        return `Linea "${lineName}" creada con éxito`;
      },
      error: "Error al registrar la linea",
    });

    return promise;
  };

  useEffect(() => {
    fetchLines();
  }, [fetchLines]);

  return {
    lines,
    loading,
    createLine,
  };
};
