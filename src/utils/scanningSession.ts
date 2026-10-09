import type { ScanRecord, SessionConfig } from "../types/types";

export type BatchStatus = "scanning" | "saving" | "failed" | "saved";
export interface ScanningSession {
  config: SessionConfig;
  items: ScanRecord[];
  count: number;
  blocked: boolean;
  status: BatchStatus;
}

export function startScanningSession(config: SessionConfig): ScanningSession {
  return { config, items: [], count: 0, blocked: false, status: "scanning" };
}

export function addScan(session: ScanningSession, code: string): ScanningSession {
  if (session.status !== "scanning" || session.blocked || session.count >= session.config.quantity || !code.trim()) {
    return session;
  }
  const isCorrect = code === session.config.partNumber.trim();
  const count = session.count + (isCorrect ? 1 : 0);
  // randomUUID requires a secure browser context; keep local HTTP stations usable.
  const id = crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return {
    ...session,
    items: [{ id, code, isCorrect, timestamp: new Date() }, ...session.items],
    count,
    blocked: !isCorrect,
    status: count === session.config.quantity ? "saving" : "scanning",
  };
}

export function removeScan(session: ScanningSession, id: string): ScanningSession {
  if (session.status !== "scanning" || session.blocked) return session;
  const item = session.items.find((scan) => scan.id === id);
  if (!item) return session;
  return {
    ...session,
    items: session.items.filter((scan) => scan.id !== id),
    count: session.count - (item.isCorrect ? 1 : 0),
  };
}
