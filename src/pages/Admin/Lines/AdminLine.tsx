import { ArrowLeft, Edit2, Layers, Loader2, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Table, type Column } from "../../../components/UI/Table/Table";
import type { Line } from "../../../types/types";
import { useLines } from "../../../hooks/useLines";
import { useState } from "react";

export const AdminLine = () => {
  const { lines, loading, createLine, updateLine } = useLines();

  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<Line | null>(null);

  const handleOpenCreate = () => {
    setEditingLine(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (line: Line) => {
    setEditingLine(line);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLine(null);
  };

  const handleFormSubmit = async (data: {
    lineName: string;
    isActive: boolean;
  }) => {
    try {
      if (editingLine) {
        await updateLine(editingLine.id, data.lineName, data.isActive);
      } else {
        await createLine(data.lineName);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error en la operación:", error);
    }
  };

  const columns: Column<Line>[] = [
    {
      header: "Nombre de la linea",
      accessor: "lineName",
    },
    {
      header: "Activo?",
      accessor: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold 
            uppercase tracking-wider ${
              row.isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
        >
          {row.isActive ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      header: "Fecha de registro",
      accessor: "createdAt",
    },
    {
      header: "Acciones",
      className: "text-right w-28",
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            // onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 
            rounded-md transition-colors cursor-pointer"
          >
            <Edit2 size={16} />
          </button>
          {row.isActive && (
            <button
              // onClick={() => {
              //   if (
              //     confirm(
              //       `¿Seguro que deseas dar de baja el área "${row.name}"?`,
              //     )
              //   ) {
              //     deleteArea(row.areaId, row.name);
              //   }
              // }}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md 
              transition-colors cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-6 py-12 antialiased">
      <div className="w-full max-w-5xl mx-auto space-y-8 architecture-fade-in">
        <header
          className="flex flex-col sm:flex-row sm:items-center justify-between border-b 
          border-gray-200 pb-6 gap-4"
        >
          <div className="space-y-1 text-left">
            <h1
              className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center
              gap-2.5"
            >
              <Layers className="text-slate-700" size={28} />
              Gestión de Líneas
            </h1>
          </div>

          <button
            // onClick={() => {
            //   setTargetModuleId(activeModuleId);
            //   setIsCreateOpen(true);
            // }}
            className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 px-5 
            rounded-xl text-sm transition-all duration-150 flex items-center justify-center gap-2 
            shadow-sm cursor-pointer self-start sm:self-center"
          >
            <Plus size={16} />
            Nueva Área
          </button>
        </header>
        <button
          type="button"
          onClick={() => navigate("/administrador")}
          className="text-slate-500 hover:text-blue-600 flex items-center 
              gap-2 mb-4 transition-colors font-medium text-sm cursor-pointer"
        >
          <ArrowLeft size={20} />
          Volver
        </button>
        <main className="relative">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-500 gap-2 font-medium">
              <Loader2 className="animate-spin text-slate-700" size={20} />
              Cargando datos..
            </div>
          ) : (
            <Table<Line>
              data={lines}
              columns={columns}
              keyExtractor={(item) => item.id}
              emptyMessage="No hay lineas asignadas"
              defaultRowsPerPage={5}
            />
          )}
        </main>
      </div>
    </div>
  );
};
