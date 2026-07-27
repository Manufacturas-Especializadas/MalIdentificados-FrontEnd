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
  releasedBy?: number;
}

export interface ScanDetailPayload {
  scannedPartCode: string;
  isCorrect: boolean;
  scanDate: string;
}

export interface CompleteBatchPayload {
  payrollNumber: number;
  shopOrder: string;
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

export interface Validation {
  id: number;
  containerNumber: string;
  payrollNumber: number;
  expectedPartCode: string;
  requiredQuantity: number;
  scannedQuantity: number;
  status: string;
  scanDetails: ScanDetails[];
}

export interface ScanDetails {
  id: number;
  scannedPartCode: string;
  isCorrect: boolean;
  scanDate: string;
  releasedByPayroll: number;
}
