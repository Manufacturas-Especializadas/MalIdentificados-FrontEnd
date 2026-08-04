import {
  User,
  CheckCircle2,
  Clock,
  Package,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";
import type { Validation } from "../../../types/types";
import { useMemo, useState } from "react";

export const ValidationCard = ({ validation }: { validation: Validation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const firstScanDate = useMemo(() => {
    const scanDates =
      validation.scanDetails
        ?.map((scan) => parseUtcDate(scan.scanDate))
        .filter((date) => !Number.isNaN(date.getTime())) ?? [];

    if (scanDates.length === 0) {
      return null;
    }

    const earliestTimestamp = Math.min(
      ...scanDates.map((date) => date.getTime()),
    );

    return new Date(earliestTimestamp);
  }, [validation.scanDetails]);

  const isCompleted = validation.status === "completed";
  const progress = Math.min(
    (validation.scannedQuantity / validation.requiredQuantity) * 100,
    100,
  );
  const hasErrors = validation.scanDetails?.some((scan) => !scan.isCorrect);

  const parseUtcDate = (value: string): Date => {
    if (!value) {
      return new Date(Number.NaN);
    }

    const hasTimeZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);

    return new Date(hasTimeZone ? value : `${value}Z`);
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden 
      transition-all hover:shadow-md"
    >
      <div className="p-5 border-b border-slate-100 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Lote #{validation.id}
            </span>
            {isCompleted ? (
              <span
                className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 
                py-0.5 rounded-md flex items-center gap-1"
              >
                <CheckCircle2 size={10} /> Completado
              </span>
            ) : (
              <span
                className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 
                rounded-md flex items-center gap-1"
              >
                <Clock size={10} /> En Progreso
              </span>
            )}
          </div>
          <h3 className="text-lg font-black text-slate-800">
            {validation.expectedPartCode}
          </h3>

          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-500">
            <CalendarDays size={14} />

            <span>
              {firstScanDate
                ? firstScanDate.toLocaleString("es-MX", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
                : "Sin fecha registrada"}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-1 text-slate-500 mb-1">
            <User size={14} />
            <span className="text-xs font-bold">
              {validation.payrollNumber || "N/A"}
            </span>
          </div>
          <p className="text-2xl font-black text-slate-800 tracking-tighter">
            {validation.scannedQuantity}
            <span className="text-sm font-bold text-slate-400">
              /{validation.requiredQuantity}
            </span>
          </p>
        </div>
        <span className="text-xs font-bold">
          {validation.payrollNumber || "N/A"}
        </span>
      </div>

      <div className="h-1.5 w-full bg-slate-100">
        <div
          className={`h-full transition-all duration-500 ${isCompleted ? "bg-emerald-500" : "bg-sky-500"
            }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        className="px-5 py-3 bg-slate-50/50 flex justify-between items-center cursor-pointer 
        hover:bg-slate-100/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div
          className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase 
          tracking-wider"
        >
          <Package size={14} />
          <span>Ver {validation.scanDetails?.length || 0} piezas</span>
        </div>
        <div className="flex items-center gap-3">
          {hasErrors && !isExpanded && (
            <span className="flex items-center gap-1 text-red-600 text-xs font-bold animate-pulse">
              <AlertTriangle size={14} /> Errores detectados
            </span>
          )}
          {isExpanded ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 bg-slate-50 border-t border-slate-100 shadow-inner">
          {validation.scanDetails && validation.scanDetails.length > 0 ? (
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-2 pb-2">
              {validation.scanDetails.map((scan: any) => (
                <div
                  key={scan.id}
                  title={`Código: ${scan.scannedPartCode}\nHora: ${parseUtcDate(
                    scan.scanDate,
                  ).toLocaleTimeString("es-MX")}`}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg 
                      text-xs font-bold border transition-all cursor-help
                    ${scan.isCorrect
                      ? "bg-white border-emerald-200 text-emerald-700 shadow-sm"
                      : "bg-red-50 border-red-300 text-red-700 shadow-sm ring-2 ring-red-100"
                    }`}
                >
                  {scan.isCorrect ? (
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  ) : (
                    <AlertTriangle size={12} />
                  )}
                  <span>
                    {scan.isCorrect
                      ? parseUtcDate(scan.scanDate).toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                      : scan.scannedPartCode}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400">
              <Package className="mx-auto h-8 w-8 opacity-20 mb-2" />
              <p className="text-sm font-medium">
                No hay lecturas registradas.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
