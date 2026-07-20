import React, { useState, useEffect } from "react";
import { Inbox, ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  defaultRowsPerPage?: number;
  rowsPerPageOptions?: number[];
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "No hay datos disponibles",
  defaultRowsPerPage = 5,
  rowsPerPageOptions = [5, 10, 20, 50],
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const paginatedData = data.slice(startIndex, endIndex);

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div
      className="w-full bg-white rounded-xl border border-slate-200 shadow-sm 
      overflow-hidden flex flex-col"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase 
                    tracking-wider ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Inbox
                      className="w-10 h-10 text-slate-300 mb-3"
                      strokeWidth={1.5}
                    />
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className="hover:bg-slate-50/80 transition-colors duration-150 
                  ease-in-out group"
                >
                  {columns.map((col, index) => (
                    <td
                      key={index}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-slate-700 ${
                        col.className || ""
                      }`}
                    >
                      {typeof col.accessor === "function"
                        ? col.accessor(row)
                        : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <div
          className="flex flex-col sm:flex-row items-center justify-between px-6 
          py-3 border-t border-slate-200 bg-slate-50 gap-4"
        >
          <div
            className="flex items-center gap-4 w-full sm:w-auto justify-between 
            sm:justify-start"
          >
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="hidden sm:inline">Mostrar</span>
              <select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="bg-white border border-slate-300 text-slate-700 
                rounded-md px-2 py-1 focus:outline-none focus:ring-2 
                focus:ring-blue-500"
              >
                {rowsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">
                {startIndex + 1}
              </span>{" "}
              a{" "}
              <span className="font-medium text-slate-900">
                {Math.min(endIndex, totalItems)}
              </span>{" "}
              de{" "}
              <span className="font-medium text-slate-900">{totalItems}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-slate-300 text-slate-500 
              bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed 
              transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-600 font-medium px-2">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-slate-300 text-slate-500 
              bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed 
              transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
