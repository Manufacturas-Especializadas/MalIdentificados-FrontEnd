import { API_CONFIG } from "../../config/api";
import { apiClient } from "../client";

class ScanningService {
  private scanningEndpoint = API_CONFIG.endpoints.scanning.start;

  async scanning(
    payrollNumber: number,
    partNumberScanned: string,
    quantity: number,
  ): Promise<any> {
    return apiClient.post<any>(this.scanningEndpoint, {
      payrollNumber,
      partNumberScanned,
      quantity,
    });
  }
}

export const scanningServce = new ScanningService();
