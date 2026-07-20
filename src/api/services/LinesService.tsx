import { API_CONFIG } from "../../config/api";
import type { Line } from "../../types/types";
import { apiClient } from "../client";

class LinesService {
  private getLinesEndpoint = API_CONFIG.endpoints.lines.getLines;
  private createEndpoint = API_CONFIG.endpoints.lines.create;
  private updateEndpoint = API_CONFIG.endpoints.lines.update;

  async getLines(): Promise<Line[]> {
    return apiClient.get<Line[]>(this.getLinesEndpoint);
  }

  async create(lineName: string): Promise<any> {
    return apiClient.post<any>(this.createEndpoint, {
      lineName,
    });
  }

  async update(id: number, lineName: string, isActive: boolean): Promise<any> {
    return apiClient.put<any>(`${this.updateEndpoint}${id}`, {
      id,
      lineName,
      isActive,
    });
  }
}

export const linesService = new LinesService();
