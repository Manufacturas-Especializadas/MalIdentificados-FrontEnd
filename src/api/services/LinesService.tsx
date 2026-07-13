import { API_CONFIG } from "../../config/api";
import type { Line } from "../../types/types";
import { apiClient } from "../client";

class LinesService {
  private getLinesEndpoint = API_CONFIG.endpoints.lines.getLines;
  private createEndpoint = API_CONFIG.endpoints.lines.create;

  async getLines(): Promise<Line[]> {
    return apiClient.get<Line[]>(this.getLinesEndpoint);
  }

  async create(lineName: string): Promise<any> {
    return apiClient.post<any>(this.createEndpoint, {
      lineName,
    });
  }
}

export const linesService = new LinesService();
