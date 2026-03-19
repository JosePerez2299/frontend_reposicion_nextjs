
export type Role = 'reposicion' | 'pedidos' | 'almacen' | 'admin'

export interface User {
  id: string
  nombre: string
  email: string
  role: Role
}

export interface Session {
  user: User
  token: string
  expiresAt: string
}