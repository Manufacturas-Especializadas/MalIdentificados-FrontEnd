import {
  Barcode,
  CheckCircle2,
  ListOrdered,
  ScanLine,
  XCircle,
  AlertTriangle,
  Trash2,
} from "lucide-react";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ScanRecord } from "../../../types/types";
import { legacyCodeInput } from "../../../utils/scanning";

interface ActiveScanningProps {
  goal: number;
  scannedCount: number;
  scannedItems: ScanRecord[];
  allowDelete: boolean;
  isBlocked: boolean;
  captureDisabled?: boolean;
  transformInput?: (value: string) => string;
  onScanUnit: (scannedCode: string) => void;
  onRemoveItem: (id: string, isCorrect: boolean) => void;
  onClearWarning: () => void;
}

export const ActiveScanning = ({
  goal,
  scannedCount,
  scannedItems,
  onScanUnit,
  onRemoveItem,
  allowDelete,
  isBlocked,
  captureDisabled = false,
  transformInput = legacyCodeInput,
  onClearWarning,
}: ActiveScanningProps) => {
  const [currentScan, setCurrentScan] = useState("");
  const pendingScanRef = useRef("");

  const unitScanRef = useRef<HTMLInputElement>(null);
  const warningPanelRef = useRef<HTMLDivElement>(null);

  // Limpia la lectura actual sin utilizar temporizadores.
  const clearPendingScan = useCallback(() => {
    pendingScanRef.current = "";
    setCurrentScan("");
  }, []);

  useEffect(() => {
    const focusCapture = () => {
      if (isBlocked) {
        warningPanelRef.current?.focus();
      } else if (!captureDisabled) {
        unitScanRef.current?.focus();
      }
    };

    const restoreFocus = () => {
      clearPendingScan();
      focusCapture();
    };

    const onVisibility = () => {
      if (!document.hidden) {
        restoreFocus();
      } else {
        clearPendingScan();
      }
    };

    // Evita que el Enter del lector confirme una alerta.
    const guardAlertEnter = (event: KeyboardEvent) => {
      if (isBlocked && event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    focusCapture();

    window.addEventListener("focus", restoreFocus);
    window.addEventListener("blur", clearPendingScan);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("keydown", guardAlertEnter, true);

    return () => {
      window.removeEventListener("focus", restoreFocus);
      window.removeEventListener("blur", clearPendingScan);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("keydown", guardAlertEnter, true);
    };
  }, [isBlocked, captureDisabled, clearPendingScan]);

  // Procesa la lectura cuando el escáner envía Enter o Tab.
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      (e.key === "Enter" || e.key === "Tab") &&
      !e.shiftKey
    ) {
      e.preventDefault();

      if (isBlocked || captureDisabled || e.repeat) return;

      const value = pendingScanRef.current.trim();

      if (!value) return;

      // Consumir primero para evitar lecturas duplicadas.
      pendingScanRef.current = "";
      e.currentTarget.value = "";
      setCurrentScan("");

      // Validar la pieza con la lógica existente.
      onScanUnit(value);
    }
  };

  const progressPercentage = Math.min(
    (scannedCount / (goal || 1)) * 100,
    100
  );

  return (
    <div
      className="grow grid grid-cols-1 lg:grid-cols-12 gap-6 architecture-fade-in relative items-start"
    >
      {isBlocked && (
        <div
          ref={warningPanelRef}
          tabIndex={-1}
          role="alertdialog"
          aria-modal="true"
          aria-label="Alerta de mezcla detectada"
          className="absolute inset-0 z-50 bg-red-600/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-white text-center animate-fade-in shadow-2xl border-4 border-red-700"
        >
          <div className="bg-white/10 p-4 rounded-full mb-4 animate-pulse">
            <AlertTriangle size={64} className="text-white" />
          </div>

          <h2 className="text-4xl font-black tracking-wider uppercase mb-2">
            ¡Alerta de Mezcla Detectada!
          </h2>

          <p className="text-lg font-medium max-w-xl mb-8 text-red-100">
            Se escaneó un número de parte incorrecto.
            Por favor, retira la pieza del contenedor.
          </p>

          <button
            type="button"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
              }
            }}
            onClick={() => {
              clearPendingScan();
              onClearWarning();
            }}
            className="w-full max-w-sm bg-slate-900 hover:bg-slate-800 text-white text-xl font-extrabold px-8 py-4 rounded-xl shadow-lg transition-all uppercase tracking-wider flex items-center justify-center gap-2 hover:cursor-pointer outline-none focus:ring-4 focus:ring-slate-400"
          >
            Entendido, pieza retirada
          </button>

          <p className="mt-3 text-sm">
            Confirma con clic o con Tab y espacio.
            Enter del lector no confirma.
          </p>
        </div>
      )}

      <div className="lg:col-span-5 flex flex-col gap-6 sticky top-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Barcode size={18} />
            Escanear Pieza
          </h3>

          <div>
            <input
              ref={unitScanRef}
              type="text"
              disabled={isBlocked || captureDisabled}
              aria-label="Escanear Pieza"
              autoComplete="off"
              value={currentScan}
              onChange={(e) => {
                const value = transformInput(e.target.value);

                pendingScanRef.current = value;
                setCurrentScan(value);
              }}
              onBlur={() => {
                clearPendingScan();

                requestAnimationFrame(() => {
                  if (
                    !document.hasFocus() ||
                    unitScanRef.current?.disabled
                  ) {
                    return;
                  }

                  const target = document.activeElement;

                  if (
                    target === document.body ||
                    target === null
                  ) {
                    unitScanRef.current?.focus();
                  }
                });
              }}
              onKeyDown={handleKeyDown}
              className="w-full text-center text-3xl font-black text-slate-800 py-6 bg-slate-50 border-2 border-slate-300 rounded-2xl focus:outline-none focus:border-sky-500 focus:bg-sky-50 transition-all tracking-widest placeholder:text-slate-300 placeholder:text-2xl placeholder:font-bold disabled:opacity-50"
              placeholder={
                isBlocked || captureDisabled
                  ? "LECTURAS BLOQUEADAS"
                  : "ESCANEA AQUÍ"
              }
              autoFocus
            />

            <p className="text-center text-slate-400 mt-3 text-sm font-medium">
              Protección activa: las lecturas mantendrán el cursor aquí.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-8 flex flex-col items-center justify-center grow relative overflow-hidden min-h-75">
          <div
            className="absolute bottom-0 left-0 h-2 bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />

          <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-2 z-10">
            Progreso del Contenedor
          </h3>

          <div className="flex items-baseline gap-2 z-10">
            <span
              className={`text-7xl font-black ${scannedCount >= goal
                ? "text-emerald-400"
                : "text-white"
                }`}
            >
              {scannedCount}
            </span>

            <span className="text-3xl text-slate-500 font-bold">
              / {goal}
            </span>
          </div>

          {scannedCount >= goal && (
            <div className="mt-6 flex items-center gap-2 text-emerald-400 font-bold text-lg animate-bounce z-10">
              <CheckCircle2 size={24} />
              ¡Lote Completado!
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-150 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <ListOrdered
              size={18}
              className="text-slate-400"
            />
            Últimas Piezas Escaneadas
          </h3>

          <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-md">
            Total: {scannedItems.length}
          </span>
        </div>

        <div className="grow overflow-y-auto p-4 custom-scrollbar">
          {scannedItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-12">
              <ScanLine
                size={48}
                className="opacity-20"
              />
              <p className="font-medium">
                Esperando la primera lectura...
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {scannedItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-xl border ${item.isCorrect
                    ? "bg-emerald-50/50 border-emerald-100"
                    : "bg-red-50 border-red-200"
                    } animate-fade-in`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${item.isCorrect
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-600"
                        }`}
                    >
                      {item.isCorrect ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <XCircle size={18} />
                      )}
                    </div>

                    <div>
                      <p
                        className={`font-bold text-lg ${item.isCorrect
                          ? "text-slate-700"
                          : "text-red-700"
                          }`}
                      >
                        {item.code}
                      </p>

                      <p className="text-xs text-slate-500 font-medium">
                        {item.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!item.isCorrect && (
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200 animate-pulse">
                        ¡ALERTA!
                      </span>
                    )}

                    {allowDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          onRemoveItem(
                            item.id,
                            item.isCorrect
                          );
                          unitScanRef.current?.focus();
                        }}
                        className={`p-2 rounded-lg transition-colors hover:cursor-pointer ${item.isCorrect
                          ? "text-slate-400 hover:text-red-500 hover:bg-red-50"
                          : "text-red-400 hover:text-red-600 hover:bg-red-100"
                          }`}
                        title="Eliminar lectura"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
