import { useState, useMemo } from "react";

import { Package, RefreshCw } from "lucide-react";
import { useScanning } from "../../../hooks/useScanning";
import { HistoricHeader } from "./HistoricHeader";
import { ValidationCard } from "./ValidationCard";

export const Historic = () => {
  const { validations, loading, fetchValidations } = useScanning();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "inProgress"
  >("all");

  const filteredValidations = useMemo(() => {
    return validations.filter((v) => {
      const matchesSearch =
        v.expectedPartCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.payrollNumber?.toString().includes(searchTerm);

      const matchesStatus = statusFilter === "all" || v.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [validations, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <HistoricHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onRefresh={fetchValidations}
          loading={loading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading && validations.length === 0 ? (
            <div
              className="col-span-full py-20 text-center text-slate-500 font-medium 
              bg-white rounded-2xl border border-slate-200 border-dashed"
            >
              <RefreshCw className="h-8 w-8 animate-spin text-sky-500 mx-auto mb-3" />
              Cargando historial de lotes...
            </div>
          ) : filteredValidations.length === 0 ? (
            <div
              className="col-span-full py-20 text-center text-slate-500 font-medium 
              bg-white rounded-2xl border border-slate-200 border-dashed"
            >
              <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              No se encontraron registros que coincidan con la búsqueda.
            </div>
          ) : (
            filteredValidations.map((validation) => (
              <ValidationCard key={validation.id} validation={validation} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
