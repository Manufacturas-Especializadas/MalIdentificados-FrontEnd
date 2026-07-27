import { Search, Filter, RefreshCw } from "lucide-react";

interface HistoricHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | "completed" | "inProgress";
  onStatusChange: (value: "all" | "completed" | "inProgress") => void;
  onRefresh: () => void;
  loading: boolean;
}

export const HistoricHeader = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onRefresh,
  loading,
}: HistoricHeaderProps) => {
  return (
    <div
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col 
      md:flex-row justify-between items-center gap-4"
    >
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          Historial de Validaciones
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Monitoreo y trazabilidad de lotes MESA
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="relative grow md:grow-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar modelo o nómina..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full md:w-64 pl-10 pr-3 py-2 border border-slate-200 rounded-xl 
            text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 
            bg-slate-50"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-slate-400" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as any)}
            className="block w-full pl-10 pr-8 py-2 border border-slate-200 rounded-xl text-sm 
            font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 
            appearance-none cursor-pointer"
          >
            <option value="all">Todos los estatus</option>
            <option value="inProgress">En Progreso</option>
            <option value="completed">Completados</option>
          </select>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="bg-slate-800 hover:bg-slate-900 text-white p-2.5 rounded-xl 
          transition-colors disabled:opacity-50 hover:cursor-pointer"
          title="Actualizar datos"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
    </div>
  );
};
