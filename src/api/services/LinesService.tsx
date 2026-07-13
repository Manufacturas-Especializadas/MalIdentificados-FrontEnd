import { API_CONFIG } from "../../config/api";
import type { Line } from "../../types/types";
import { apiClient } from "../client";

class LinesService {
  private getLinesEndpoint = API_CONFIG.endpoints.lines.getLines;

  async getLines(): Promise<Line[]> {
    return apiClient.get<Line[]>(this.getLinesEndpoint);
  }
}

export const linesService = new LinesService();
