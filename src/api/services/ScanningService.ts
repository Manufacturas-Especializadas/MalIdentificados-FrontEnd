import { API_CONFIG } from "../../config/api";
import type { CompleteBatchPayload, Validation } from "../../types/types";
import { apiClient } from "../client";

class ScanningService {
  private validateApproverEndpoint =
    API_CONFIG.endpoints.scanning.validateApprover;
  private getValidationsEndpoint = API_CONFIG.endpoints.scanning.validations;
  private scanningEndpoint = API_CONFIG.endpoints.scanning.start;

  async validateApprover(payrollNumber: number): Promise<boolean> {
    return apiClient.get<boolean>(
      `${this.validateApproverEndpoint}${payrollNumber}`,
    );
  }

  async getValidations(): Promise<Validation[]> {
    return apiClient.get<Validation[]>(this.getValidationsEndpoint);
  }

  async saveBatch(payload: CompleteBatchPayload): Promise<any> {
    return apiClient.post<any>(this.scanningEndpoint, payload);
  }
}

export const scanningServce = new ScanningService();
