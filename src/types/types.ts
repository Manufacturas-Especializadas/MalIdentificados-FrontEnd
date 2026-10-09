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
  releasedByPayroll?: number | null;
}

export type ValidationMode = "shopOrder" | "container";

export type SessionConfig = {
  payroll: number;
  partNumber: string;
  quantity: number;
} & (
  | { validationMode: "shopOrder"; shopOrder: string; containerNumber?: never }
  | { validationMode: "container"; containerNumber: string; shopOrder?: never }
);

export type ScanningContract =
  | { version: "legacy" }
  | { version: "line-container"; lineId: number };

export type CompleteBatchPayload = {
  payrollNumber: number;
  expectedPartCode: string;
  requiredQuantity: number;
  scans: ScanDetailPayload[];
} & (
  | { shopOrder: string; validationMode?: never; lineId?: never; containerNumber?: never }
  | { shopOrder: string; validationMode: "shopOrder"; lineId: number; containerNumber?: never }
  | { containerNumber: string; validationMode: "container"; lineId: number; shopOrder?: never }
);

export interface CompleteBatchResponse {
  validationId: number;
  message: string;
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
