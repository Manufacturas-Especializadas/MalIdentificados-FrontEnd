import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import type { Line } from "../../../../types/types";

interface LineFormProps {
  initialData?: Line | null;
  onSubmit: (data: { lineName: string; isActive: boolean }) => Promise<void>;
  onCancel: () => void;
}

export const LineForm = ({
  initialData,
  onSubmit,
  onCancel,
}: LineFormProps) => {
  const [lineName, setLineName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setLineName(initialData.lineName);
      setIsActive(initialData.isActive);
    } else {
      setLineName("");
      setIsActive(true);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lineName.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ lineName, isActive });
    } catch (error) {
      console.error("Error al guardar la línea:", error);
      // Aquí podrías agregar un toast de error
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="lineName"
            className="block text-sm font-bold text-slate-700"
          >
            Nombre de la Línea <span className="text-red-500">*</span>
          </label>
          <input
            id="lineName"
            type="text"
            value={lineName}
            onChange={(e) => setLineName(e.target.value)}
            placeholder="Ej. Ensamble Norte A"
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm 
            focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all
            text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {isEditing && (
          <div
            className="flex items-center justify-between p-4 border border-slate-100 
            bg-slate-50/50 rounded-xl"
          >
            <div className="space-y-0.5">
              <label className="text-sm font-bold text-slate-700">
                Estatus Operativo
              </label>
              <p className="text-xs text-slate-500">
                Determina si la línea puede ser seleccionada en piso.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-800 focus:ring-offset-2 ${
                isActive ? "bg-emerald-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 
          rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 
          hover:cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !lineName.trim()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white 
          bg-slate-800 rounded-xl hover:bg-slate-900 transition-all shadow-sm active:scale-[0.98] 
          disabled:opacity-70 disabled:hover:bg-slate-800 hover:cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Guardando...
            </>
          ) : isEditing ? (
            "Guardar Cambios"
          ) : (
            "Registrar Línea"
          )}
        </button>
      </div>
    </form>
  );
};
