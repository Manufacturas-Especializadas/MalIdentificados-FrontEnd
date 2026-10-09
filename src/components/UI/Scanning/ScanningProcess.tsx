import { useEffect, useRef, useState } from "react";
import { linesService } from "../../../api/services/LinesService";
import { scanningContractVersion } from "../../../config/scanning";
import { useScanning } from "../../../hooks/useScanning";
import type { CompleteBatchPayload, Line, SessionConfig, ValidationMode } from "../../../types/types";
import { buildBatchPayload, describeSaveError, isPositiveInteger, legacyCodeInput, literalCodeInput, resolveActiveLine, validateSession } from "../../../utils/scanning";
import { addScan, removeScan, startScanningSession } from "../../../utils/scanningSession";
import type { ScanningSession } from "../../../utils/scanningSession";
import { ActiveScanning } from "./ActiveScanning";
import { SetupHeader } from "./SetupHeader";

interface ScanningProcessProps {
  lineName: string;
  validationMode: ValidationMode;
  lineId: number;
}

export function ScanningProcess({ lineName, validationMode, lineId }: ScanningProcessProps) {
  const { saveCompletedBatch } = useScanning({ loadHistory: false });
  const [session, setSession] = useState<ScanningSession | null>(null);
  // Update synchronously in event handlers: fast reads cannot reuse stale React state.
  const sessionRef = useRef<ScanningSession | null>(null);
  const payloadRef = useRef<CompleteBatchPayload | null>(null);
  const savingRef = useRef(false);
  const mountedRef = useRef(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [resetHeader, setResetHeader] = useState(0);
  const [saveError, setSaveError] = useState<ReturnType<typeof describeSaveError> | null>(null);
  const [checkedHistory, setCheckedHistory] = useState(false);
  const [catalog, setCatalog] = useState<{ line: Line | null; error: string | null }>({ line: null, error: null });
  const [catalogAttempt, setCatalogAttempt] = useState(0);
  const explicitContract = scanningContractVersion === "line-container";
  const validLineId = isPositiveInteger(lineId);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!explicitContract || !validLineId) return;
    let cancelled = false;
    linesService.getLines().then((lines) => {
      const line = resolveActiveLine(lines, lineId);
      if (!cancelled) setCatalog({ line, error: null });
    }).catch((error: unknown) => {
      if (!cancelled) setCatalog({ line: null, error: error instanceof Error ? error.message : "No se pudo verificar la línea." });
    });
    return () => { cancelled = true; };
  }, [explicitContract, validLineId, lineId, catalogAttempt]);

  let unavailableReason: string | undefined;
  if (scanningContractVersion !== "legacy" && !explicitContract) {
    unavailableReason = "La configuración del proceso no es válida. Contacta al administrador.";
  } else if (!explicitContract && validationMode === "container") {
    unavailableReason = "Proceso pendiente de habilitación: primero debe confirmarse la actualización del servidor y de la base de datos.";
  } else if (explicitContract && !validLineId) {
    unavailableReason = "Falta configurar el identificador real de esta línea. Contacta al administrador.";
  } else if (explicitContract && catalog.error) {
    unavailableReason = "No se pudo verificar una línea activa. Revisa la conexión y la configuración con el administrador.";
  }
  const resolvingLine = explicitContract && validLineId && !catalog.line && !catalog.error;

  const updateSession = (next: ScanningSession | null) => {
    sessionRef.current = next;
    setSession(next);
  };

  const persistBatch = async (completed: ScanningSession) => {
    if (savingRef.current || completed.status === "saved") return;
    savingRef.current = true;
    updateSession({ ...completed, status: "saving" });
    setSaveError(null);
    setCheckedHistory(false);
    try {
      // Freeze one payload, including IDs/timestamps, for all deliberate retries.
      const payload = payloadRef.current ?? buildBatchPayload(completed.config,
        explicitContract ? { version: "line-container", lineId } : { version: "legacy" }, completed.items);
      payloadRef.current = payload;
      await saveCompletedBatch(payload);
      if (!mountedRef.current) return;
      updateSession({ ...completed, status: "saved" });
      resetTimerRef.current = setTimeout(() => {
        updateSession(null);
        payloadRef.current = null;
        setResetHeader((value) => value + 1);
      }, 2500);
    } catch (error) {
      if (!mountedRef.current) return;
      setSaveError(describeSaveError(error));
      updateSession({ ...completed, status: "failed" });
    } finally {
      savingRef.current = false;
    }
  };

  const handleStartSession = (config: SessionConfig) => {
    if (sessionRef.current || unavailableReason || resolvingLine || validateSession(config)) return;
    if (config.validationMode !== validationMode) return;
    payloadRef.current = null;
    setSaveError(null);
    updateSession(startScanningSession(config));
  };

  const handleScanUnit = (code: string) => {
    const current = sessionRef.current;
    if (!current) return;
    const next = addScan(current, code);
    if (next === current) return;
    updateSession(next);
    if (next.status === "saving") void persistBatch(next);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased flex flex-col">
      <div className="w-full max-w-7xl mx-auto space-y-6 grow flex flex-col architecture-fade-in">
        <SetupHeader lineName={lineName} validationMode={validationMode} isActive={!!session}
          loading={resolvingLine} resetTrigger={resetHeader} unavailableReason={unavailableReason}
          onStartSession={handleStartSession} />
        {explicitContract && catalog.line && !session && <p className="text-sm text-slate-500">Línea verificada: {catalog.line.lineName} (ID {catalog.line.id})</p>}
        {catalog.error && !session && <button type="button" className="self-start font-semibold text-sky-700 underline" onClick={() => {
          setCatalog({ line: null, error: null });
          setCatalogAttempt((attempt) => attempt + 1);
        }}>Volver a verificar línea</button>}
        {session && <ActiveScanning goal={session.config.quantity} scannedCount={session.count}
          scannedItems={session.items} onScanUnit={handleScanUnit}
          transformInput={validationMode === "container" ? literalCodeInput : legacyCodeInput}
          allowDelete={session.status === "scanning" && !session.blocked}
          isBlocked={session.blocked} captureDisabled={session.status !== "scanning"}
          onRemoveItem={(id) => { if (sessionRef.current) updateSession(removeScan(sessionRef.current, id)); }}
          onClearWarning={() => {
            const current = sessionRef.current;
            if (current?.status === "scanning") updateSession({ ...current, blocked: false });
          }} />}
        {session?.status === "saving" && <p role="status" className="font-semibold text-sky-700">Guardando lote… Las lecturas están bloqueadas.</p>}
        {session?.status === "saved" && <p role="status" className="font-semibold text-emerald-700">Lote guardado. Preparando el siguiente lote…</p>}
        {session?.status === "failed" && saveError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
          <p className="font-semibold text-red-800">{saveError.message}</p>
          {saveError.uncertain && <>
            <p className="text-sm text-red-800">La respuesta pudo perderse después de guardar. Revisa el <a href="/administrador/historial" target="_blank" rel="noreferrer" className="underline">historial</a> antes de reenviar para evitar registrar el lote dos veces.</p>
            <label className="flex gap-2 text-sm text-red-800"><input type="checkbox" checked={checkedHistory} onChange={(event) => setCheckedHistory(event.target.checked)} />Verifiqué que este lote no fue registrado.</label>
          </>}
          <button type="button" disabled={saveError.uncertain && !checkedHistory}
            className="rounded-lg bg-slate-800 px-4 py-2 text-white font-semibold disabled:opacity-50"
            onKeyDown={(event) => { if (event.key === "Enter") event.preventDefault(); }}
            onClick={() => {
              const current = sessionRef.current;
              if (current?.status === "failed" && (!saveError.uncertain || checkedHistory)) void persistBatch(current);
            }}>Reintentar guardado</button>
          <p className="text-sm text-red-800">Conserva esta pantalla abierta hasta confirmar el registro del lote.</p>
        </div>}
      </div>
    </div>
  );
}
