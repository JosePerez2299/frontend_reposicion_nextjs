import axios, { AxiosError, AxiosInstance } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const apiInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      throw new ApiError(
        error.response.status,
        error.response.data,
        `Error ${error.response.status}`
      )
    }

    throw new ApiError(500, null, 'Network Error')
  }
)

export const api = {
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const res = await apiInstance.get<T>(endpoint, { params })
    return res.data
  },

  async post<T>(endpoint: string, body: unknown, params?: Record<string, any>): Promise<T> {
    const res = await apiInstance.post<T>(endpoint, body, { ...params })
    return res.data
  },

  async patch<T>(endpoint: string, body: unknown): Promise<T> {
    const res = await apiInstance.patch<T>(endpoint, body)
    return res.data
  },

  async delete<T>(endpoint: string): Promise<T> {
    const res = await apiInstance.delete<T>(endpoint)
    return res.data
  },
}