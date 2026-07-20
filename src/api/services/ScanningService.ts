import { API_CONFIG } from "../../config/api";
import type { CompleteBatchPayload } from "../../types/types";
import { apiClient } from "../client";

class ScanningService {
  private validateApproverEndpoint =
    API_CONFIG.endpoints.scanning.validateApprover;
  private scanningEndpoint = API_CONFIG.endpoints.scanning.start;

  async validateApprover(payrollNumber: number): Promise<boolean> {
    return apiClient.get<boolean>(
      `${this.validateApproverEndpoint}${payrollNumber}`,
    );
  }

  async saveBatch(payload: CompleteBatchPayload): Promise<any> {
    return apiClient.post<any>(this.scanningEndpoint, payload);
  }
}

export const scanningServce = new ScanningService();
