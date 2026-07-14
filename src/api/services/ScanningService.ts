import { API_CONFIG } from "../../config/api";
import type { CompleteBatchPayload } from "../../types/types";
import { apiClient } from "../client";

class ScanningService {
  private scanningEndpoint = API_CONFIG.endpoints.scanning.start;

  async saveBatch(payload: CompleteBatchPayload): Promise<any> {
    return apiClient.post<any>(this.scanningEndpoint, payload);
  }
}

export const scanningServce = new ScanningService();
