import axios, { AxiosError, AxiosInstance } from 'axios'
import Cookies from 'js-cookie'
import qs from 'qs'
import { useAuthStore } from '@/stores/auth.store'
import { hardLogout } from '@/lib/hard-logout'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }

  /** Extract detail from response data if available */
  static fromResponse(status: number, data: unknown): ApiError {
    let message = `Error ${status}`

    if (data && typeof data === 'object') {
      const body = data as Record<string, unknown>
      const detail = body.detail ?? body.message ?? body.error ?? body.msg
      if (typeof detail === 'string' && detail) {
        message = detail
      }
    }

    return new ApiError(status, data, message)
  }
}

// ── Raw instance (no interceptors) for refresh token calls ──────
const rawInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Main instance ────────────────────────────────────────────────
const apiInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  paramsSerializer: (params) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
    )
    return qs.stringify(clean, { arrayFormat: 'repeat' })
  },
})

// ── Request interceptor: inject access token ─────────────────────
apiInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: auto-refresh on 401 ────────────────────
let isRefreshing = false
type FailedRequest = {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}
let failedQueue: FailedRequest[] = []

const processQueue = (error: unknown | null, token: string | null) => {
  for (const req of failedQueue) {
    if (error) req.reject(error)
    else if (token) req.resolve(token)
  }
  failedQueue = []
}

apiInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosError['config'] & { _retry?: boolean }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Don't retry on auth endpoints themselves
      const url = originalRequest.url ?? ''
      if (url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/register')) {
        throw ApiError.fromResponse(error.response.status, error.response.data)
      }

      originalRequest._retry = true

      if (isRefreshing) {
        // Another request is already refreshing — queue this one
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest!.headers!.Authorization = `Bearer ${token}`
              resolve(apiInstance(originalRequest))
            },
            reject,
          })
        })
      }

      isRefreshing = true

      try {
        const refreshToken = Cookies.get('refresh_token')
        if (!refreshToken) throw new Error('No refresh token')

        const res = await rawInstance.post('/auth/refresh', { refresh_token: refreshToken })
        const { access_token, refresh_token: newRefresh } = res.data

        // Update cookies
        Cookies.set('auth_token', access_token, { expires: 7 })
        if (newRefresh) Cookies.set('refresh_token', newRefresh, { expires: 7 })

        // Keep Zustand store in sync (used by UI like session-expiry warning)
        const currentRefresh = newRefresh ?? Cookies.get('refresh_token')
        if (currentRefresh) {
          useAuthStore.getState().setTokens(access_token, currentRefresh)
        }

        processQueue(null, access_token)
        originalRequest.headers!.Authorization = `Bearer ${access_token}`

        return apiInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        // Clear auth cookies — user must re-login
        Cookies.remove('auth_token')
        Cookies.remove('refresh_token')
        Cookies.remove('auth_user')
        hardLogout()
        throw ApiError.fromResponse(401, { detail: 'Sesión expirada. Inicia sesión nuevamente.' })
      } finally {
        isRefreshing = false
      }
    }

    if (error.response) {
      throw ApiError.fromResponse(error.response.status, error.response.data)
    }
    throw new ApiError(500, null, 'Error de conexión. Verifica tu red.')
  }
)

export const api = {
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const res = await apiInstance.get<T>(endpoint, { params })
    return res.data
  },

  async post<T>(endpoint: string, body: unknown, params?: Record<string, any>): Promise<T> {
    const res = await apiInstance.post<T>(endpoint, body, { params })
    return res.data
  },

  async patch<T>(endpoint: string, body: unknown): Promise<T> {
    const res = await apiInstance.patch<T>(endpoint, body)
    return res.data
  },

  async put<T>(endpoint: string, body: unknown, params?: Record<string, any>): Promise<T> {
    const res = await apiInstance.put<T>(endpoint, body, { params })
    return res.data
  },

  async delete<T>(endpoint: string): Promise<T> {
    const res = await apiInstance.delete<T>(endpoint)
    return res.data
  },
}
