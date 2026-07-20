import { useState } from "react";
import { ActiveScanning } from "../../components/UI/Scanning/ActiveScanning";
import { SetupHeader } from "../../components/UI/Scanning/SetupHeader";
import type { ScanRecord } from "../../types/types";
import { useScanning } from "../../hooks/useScanning";

export const MicroChannel = () => {
  const { loading, saveCompletedBatch } = useScanning();

  const [sessionConfig, setSessionConfig] = useState({
    payroll: 0,
    partNumber: "",
    quantity: 0,
  });

  const [scannedItems, setScannedItems] = useState<ScanRecord[]>([]);
  const [scannedCount, setScannedCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [allowDelete, setAllowDelete] = useState(true);

  const handleStartSession = (
    payroll: number,
    partNumber: string,
    quantity: number,
  ) => {
    setSessionConfig({ payroll, partNumber, quantity });
    setScannedItems([]);
    setScannedCount(0);
    setIsBlocked(false);
    setAllowDelete(true);
  };

  const handleRemoveItem = (id: string, isCorrect: boolean) => {
    if (!allowDelete) return;

    setScannedItems((prev) => prev.filter((item) => item.id !== id));
    if (isCorrect) {
      setScannedCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleScanUnit = async (scannedCode: string) => {
    if (isBlocked) return;

    const isCorrect = scannedCode === sessionConfig.partNumber;

    const newRecord: ScanRecord = {
      id: Math.random().toString(36).substr(2, 9),
      code: scannedCode,
      isCorrect,
      timestamp: new Date(),
    };

    const updatedItems = [newRecord, ...scannedItems];
    setScannedItems(updatedItems);

    if (isCorrect) {
      const newCount = scannedCount + 1;
      setScannedCount(newCount);

      if (newCount === sessionConfig.quantity) {
        try {
          await saveCompletedBatch(
            sessionConfig.payroll,
            sessionConfig.partNumber,
            sessionConfig.quantity,
            updatedItems,
          );

          setTimeout(() => {
            handleStartSession(0, "", 0);
          }, 2500);
        } catch (error) {
          console.error("Error al procesar el lote final", error);
        }
      }
    } else {
      setIsBlocked(true);
    }
  };

  const handleClearWarning = () => {
    setIsBlocked(false);
  };

  const isSessionActive = !!sessionConfig.partNumber;

  return (
    <div
      className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 
      font-sans antialiased flex flex-col"
    >
      <div
        className="w-full max-w-7xl mx-auto space-y-6 grow flex flex-col 
        architecture-fade-in"
      >
        <SetupHeader
          lineName="MicroChannel"
          isActive={isSessionActive}
          loading={loading}
          onStartSession={handleStartSession}
        />

        {isSessionActive && (
          <ActiveScanning
            goal={sessionConfig.quantity}
            scannedCount={scannedCount}
            scannedItems={scannedItems}
            onScanUnit={handleScanUnit}
            onRemoveItem={handleRemoveItem}
            allowDelete={allowDelete}
            isBlocked={isBlocked}
            onClearWarning={handleClearWarning}
          />
        )}
      </div>
    </div>
  );
};
