import {
  ScanLine,
  CheckCircle2,
  UserSquare,
  Barcode,
  Hash,
  Loader2,
  Play,
  ListOrdered,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SetupHeaderProps {
  lineName: string;
  isActive: boolean;
  loading: boolean;
  resetTrigger: number;
  onStartSession: (
    payroll: number,
    partNumber: string,
    quantity: number,
    shopOrder: string,
  ) => void;
}

export const SetupHeader = ({
  lineName,
  isActive,
  loading,
  resetTrigger,
  onStartSession,
}: SetupHeaderProps) => {
  const [payroll, setPayroll] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [shopOrder, setShopOrder] = useState("");
  const [quantity, setQuantity] = useState("");

  const partNumberRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const payrollRef = useRef<HTMLInputElement>(null);
  const shopOrderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPayroll("");
    setPartNumber("");
    setShopOrder("");
    setQuantity("");

    payrollRef.current?.focus();
  }, [resetTrigger]);

  const submitForm = () => {
    if (!payroll || !partNumber || !quantity || !shopOrder) return;

    onStartSession(
      Number(payroll),
      partNumber.toUpperCase(),
      Number(quantity),
      shopOrder.toUpperCase(),
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitForm();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextRef: React.RefObject<HTMLInputElement | null> | "submit",
  ) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();

      if (nextRef === "submit") {
        e.currentTarget.form?.requestSubmit();
      } else {
        nextRef.current?.focus();
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <ScanLine className="text-sky-600" />
          Línea: {lineName}
        </h2>

        {isActive && (
          <span
            className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1
            rounded-full uppercase tracking-wider flex items-center gap-1"
          >
            <CheckCircle2 size={14} />
            Lote Activo
          </span>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-5"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
            Nómina
          </label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <UserSquare className="h-5 w-5 text-slate-400" />
            </div>

            <input
              type="number"
              required
              autoFocus
              ref={payrollRef}
              disabled={isActive}
              value={payroll}
              onChange={(e) => setPayroll(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, partNumberRef)}
              className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200
              rounded-xl text-base font-semibold text-slate-800 focus:outline-none
              focus:ring-2 focus:ring-sky-500 disabled:opacity-60
              disabled:bg-slate-100 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
            Shop Order
          </label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <ListOrdered className="h-5 w-5 text-slate-400" />
            </div>

            <input
              type="number"
              required
              autoFocus
              ref={shopOrderRef}
              disabled={isActive}
              value={shopOrder}
              onChange={(e) => setShopOrder(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, shopOrderRef)}
              className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200
              rounded-xl text-base font-semibold text-slate-800 focus:outline-none
              focus:ring-2 focus:ring-sky-500 disabled:opacity-60
              disabled:bg-slate-100 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
            Número de Parte
          </label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Barcode className="h-5 w-5 text-slate-400" />
            </div>

            <input
              ref={partNumberRef}
              type="text"
              required
              disabled={isActive}
              value={partNumber}
              onChange={(e) =>
                setPartNumber(e.target.value.toUpperCase().replace(/'/g, "-"))
              }
              onKeyDown={(e) => handleKeyDown(e, quantityRef)}
              className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200
              rounded-xl text-base font-bold text-slate-800 focus:outline-none
              focus:ring-2 focus:ring-sky-500 disabled:opacity-60
              disabled:bg-slate-100 transition-all uppercase"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
            Standard Pack
          </label>

          <div className="flex gap-3">
            <div className="relative grow">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-slate-400" />
              </div>

              <input
                ref={quantityRef}
                type="number"
                required
                min={1}
                disabled={isActive}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "submit")}
                className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200
                rounded-xl text-base font-bold text-slate-800 focus:outline-none
                focus:ring-2 focus:ring-sky-500 disabled:opacity-60
                disabled:bg-slate-100 transition-all"
              />
            </div>

            {!isActive && (
              <button
                type="submit"
                disabled={loading || !payroll || !partNumber || !quantity}
                className="bg-slate-800 hover:bg-slate-900 text-white px-5 rounded-xl
                font-bold flex items-center justify-center transition-all
                disabled:opacity-50 shrink-0 shadow-sm hover:cursor-pointer"
                title="Iniciar Lote"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Play size={20} className="fill-current" />
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
