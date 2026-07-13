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

  useEffect(() => {
    fetchLines();
  }, [fetchLines]);

  return {
    lines,
    loading,
  };
};
