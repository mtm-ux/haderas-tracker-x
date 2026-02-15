import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

export class ApiClient {
  private client: AxiosInstance;
  private onStatusChange?: (status: 'connected' | 'connecting' | 'error') => void;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      ...config,
    });

    // Request Interceptor
    this.client.interceptors.request.use(
      (config) => {
        this.onStatusChange?.('connecting');
        return config;
      },
      (error) => {
        this.onStatusChange?.('error');
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.client.interceptors.response.use(
      (response) => {
        this.onStatusChange?.('connected');
        return response;
      },
      (error: AxiosError) => {
        this.onStatusChange?.('error');
        console.error('API Error:', error.message);
        return Promise.reject(error);
      }
    );
  }

  setStatusCallback(callback: (status: 'connected' | 'connecting' | 'error') => void): void {
    this.onStatusChange = callback;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }
}
