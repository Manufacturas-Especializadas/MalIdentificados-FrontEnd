import type { LucideIcon } from "lucide-react";

export type ViewState =
  | "dashboard"
  | "history"
  | "lines_crud"
  | "clients_crud"
  | "parts_crud";

export interface ScanRecord {
  id: string;
  code: string;
  isCorrect: boolean;
  timestamp: Date;
}

export interface ScanDetailPayload {
  scannedPartCode: string;
  isCorrect: boolean;
  scanDate: string;
}

export interface CompleteBatchPayload {
  payrollNumber: number;
  expectedPartCode: string;
  requiredQuantity: number;
  scans: ScanDetailPayload[];
}

export interface Line {
  id: number;
  lineName: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminModule {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  viewTarget: ViewState;
}
