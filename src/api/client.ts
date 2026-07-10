import axios, {
  type AxiosInstance,
  AxiosError,
  type AxiosRequestConfig,
} from "axios";
import { API_CONFIG } from "../config/api";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response && error.response.data) {
          const data = error.response.data as any;
          (error as any).customMessage =
            data.message || data.title || "Error en el servidor";
        }

        return Promise.reject(error);
      },
    );
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(endpoint, config);
    return response.data;
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const isFormData = data instanceof FormData;

    const response = await this.client.post<T>(endpoint, data, {
      ...config,
      headers: {
        ...config?.headers,
        ...(isFormData
          ? { "Content-Type": undefined }
          : { "Content-Type": "application/json" }),
      },
    });

    return response.data;
  }

  async put<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const isFormData = data instanceof FormData;

    const response = await this.client.put<T>(endpoint, data, {
      ...config,
      headers: {
        ...config?.headers,
        ...(isFormData
          ? { "Content-Type": undefined }
          : { "Content-Type": "application/json" }),
      },
    });

    return response.data;
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.patch<T>(endpoint, data, config);
    return response.data;
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(endpoint, config);
    return response.data;
  }

  async downloadFile(
    endpoint: string,
    filename: string,
    data?: any,
  ): Promise<void> {
    const config: AxiosRequestConfig = {
      responseType: "blob",
    };

    let response;

    if (data) {
      response = await this.client.post(endpoint, data, config);
    } else {
      response = await this.client.get(endpoint, config);
    }

    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

export const apiClient = new ApiClient();
