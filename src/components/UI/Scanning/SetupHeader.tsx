import { ScanLine, CheckCircle2, UserSquare, Barcode, Hash, Loader2, Play, ListOrdered } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, RefObject } from "react";
import type { SessionConfig, ValidationMode } from "../../../types/types";
import { containerMatches, isPositiveInteger, legacyCodeInput, validateSession } from "../../../utils/scanning";

interface SetupHeaderProps {
  lineName: string;
  validationMode?: ValidationMode;
  isActive: boolean;
  loading: boolean;
  resetTrigger: number;
  unavailableReason?: string;
  onStartSession: (config: SessionConfig) => void;
}

// Remount just the form on reset; no cascading state resets in an effect.
export const SetupHeader = (props: SetupHeaderProps) => (
  <SetupForm key={props.resetTrigger} {...props} />
);

const inputClass = "block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60 disabled:bg-slate-100 transition-all";
const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wider ml-1";
const iconClass = "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none";

function SetupForm({ lineName, validationMode = "shopOrder", isActive, loading, unavailableReason, onStartSession }: SetupHeaderProps) {
  const [payroll, setPayroll] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [shopOrder, setShopOrder] = useState("");
  const [containerNumber, setContainerNumber] = useState("");
  const [quantity, setQuantity] = useState("");
  const [containerChecked, setContainerChecked] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const payrollRef = useRef<HTMLInputElement>(null);
  const partNumberRef = useRef<HTMLInputElement>(null);
  const referenceRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const lastInputRef = useRef<HTMLInputElement | null>(null);
  const id = useId();
  const isContainer = validationMode === "container";
  const disabled = isActive || loading || !!unavailableReason;
  const mismatch = isContainer && !containerMatches(partNumber, containerNumber);
  const containerError = containerChecked && mismatch;

  useEffect(() => {
    if (disabled) return;
    payrollRef.current?.focus();
    const restoreFocus = () => {
      const input = lastInputRef.current ?? payrollRef.current;
      if (input && !input.disabled) input.focus();
    };
    window.addEventListener("focus", restoreFocus);
    return () => window.removeEventListener("focus", restoreFocus);
  }, [disabled]);

  const checkContainer = () => {
    setContainerChecked(true);
    if (!mismatch) return true;
    referenceRef.current?.focus();
    referenceRef.current?.select();
    return false;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, next: RefObject<HTMLInputElement | null> | "submit") => {
    if ((event.key !== "Enter" && event.key !== "Tab") || event.shiftKey) return;
    event.preventDefault();
    if (event.repeat || disabled) return;
    if (isContainer && event.currentTarget === referenceRef.current && !checkContainer()) return;
    if (next === "submit") event.currentTarget.form?.requestSubmit();
    else next.current?.focus();
  };

  const partField = (
    <div className="space-y-1.5" key="part">
      <label htmlFor={id + "-part"} className={labelClass}>Número de Parte</label>
      <div className="relative">
        <div className={iconClass}><Barcode className="h-5 w-5 text-slate-400" /></div>
        <input id={id + "-part"} ref={partNumberRef} type="text" required disabled={disabled}
          value={partNumber} autoComplete="off"
          onChange={(event) => setPartNumber(isContainer ? event.target.value : legacyCodeInput(event.target.value))}
          onKeyDown={(event) => handleKeyDown(event, isContainer ? referenceRef : quantityRef)}
          className={inputClass} />
      </div>
    </div>
  );

  const referenceField = (
    <div className="space-y-1.5" key="reference">
      <label htmlFor={id + "-reference"} className={labelClass}>{isContainer ? "Número de Contenedor" : "Shop Order"}</label>
      <div className="relative">
        <div className={iconClass}><ListOrdered className="h-5 w-5 text-slate-400" /></div>
        <input id={id + "-reference"} ref={referenceRef} type={isContainer ? "text" : "number"}
          required disabled={disabled} autoComplete="off"
          value={isContainer ? containerNumber : shopOrder}
          aria-invalid={containerError || undefined}
          aria-describedby={containerError ? id + "-container-error" : undefined}
          onChange={(event) => isContainer ? setContainerNumber(event.target.value) : setShopOrder(event.target.value)}
          onFocus={(event) => { if (isContainer) event.currentTarget.select(); }}
          onBlur={(event) => {
            if (!isContainer || disabled || !containerNumber || !mismatch) return;
            setContainerChecked(true);
            // Permit correcting the expected part/payroll; keep failed scans out of quantity.
            if (event.relatedTarget !== partNumberRef.current && event.relatedTarget !== payrollRef.current) {
              requestAnimationFrame(() => {
                // Recheck live values: a rescan may have corrected the code before
                // this deferred callback runs. Never steal focus after correction.
                const stillInvalid = !containerMatches(
                  partNumberRef.current?.value ?? "",
                  referenceRef.current?.value ?? "",
                );
                const target = document.activeElement;
                if (document.hasFocus() && stillInvalid && target !== partNumberRef.current && target !== payrollRef.current) {
                  referenceRef.current?.focus();
                  referenceRef.current?.select();
                }
              });
            }
          }}
          onKeyDown={(event) => handleKeyDown(event, isContainer ? quantityRef : partNumberRef)}
          className={inputClass} />
      </div>
      {containerError && <p id={id + "-container-error"} role="alert" className="text-sm font-semibold text-red-700">El contenedor no coincide con el número de parte. Escanéalo nuevamente.</p>}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2"><ScanLine className="text-sky-600" />Línea: {lineName}</h2>
        {isActive && <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={14} />Lote Activo</span>}
      </div>
      {unavailableReason && <p role="alert" className="mb-4 text-sm font-semibold text-amber-800">{unavailableReason}</p>}
      <form className="grid grid-cols-1 md:grid-cols-4 gap-5"
        onFocusCapture={(event) => {
          if (event.target instanceof HTMLInputElement) lastInputRef.current = event.target;
        }}
        onSubmit={(event) => {
        event.preventDefault();
        if (disabled) return;
        if (isContainer && !checkContainer()) return;
        const config: SessionConfig = {
          payroll: Number(payroll), partNumber, quantity: Number(quantity),
          ...(isContainer ? { validationMode: "container", containerNumber } : { validationMode: "shopOrder", shopOrder }),
        };
        const error = validateSession(config);
        setFormError(error);
        if (error) { if (!isPositiveInteger(config.quantity)) quantityRef.current?.focus(); return; }
        onStartSession(config);
      }}>
        <div className="space-y-1.5">
          <label htmlFor={id + "-payroll"} className={labelClass}>Nómina</label>
          <div className="relative">
            <div className={iconClass}><UserSquare className="h-5 w-5 text-slate-400" /></div>
            <input id={id + "-payroll"} ref={payrollRef} type="number" required autoFocus disabled={disabled}
              value={payroll} onChange={(event) => setPayroll(event.target.value)}
              onKeyDown={(event) => handleKeyDown(event, isContainer ? partNumberRef : referenceRef)} className={inputClass} />
          </div>
        </div>
        {isContainer ? [partField, referenceField] : [referenceField, partField]}
        <div className="space-y-1.5">
          <label htmlFor={id + "-quantity"} className={labelClass}>Standard Pack</label>
          <div className="flex gap-3">
            <div className="relative grow">
              <div className={iconClass}><Hash className="h-5 w-5 text-slate-400" /></div>
              <input id={id + "-quantity"} ref={quantityRef} type="number" required min={1} max={2147483647} step={1}
                disabled={disabled} value={quantity} onChange={(event) => setQuantity(event.target.value)}
                onKeyDown={(event) => handleKeyDown(event, "submit")} className={inputClass} />
            </div>
            {!isActive && <button type="submit" disabled={disabled || !payroll || !partNumber.trim() || !quantity || (isContainer ? mismatch : !shopOrder)}
              className="bg-slate-800 hover:bg-slate-900 text-white px-5 rounded-xl font-bold flex items-center justify-center transition-all disabled:opacity-50 shrink-0 shadow-sm hover:cursor-pointer"
              title="Iniciar Lote" aria-label="Iniciar Lote">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} className="fill-current" />}
            </button>}
          </div>
        </div>
      </form>
      {formError && <p role="alert" className="mt-3 text-sm text-red-700">{formError}</p>}
    </div>
  );
}
