


export enum RolesEnum {
  Reposicion = 'reposicion',
  Pedidos = 'pedidos',
  Almacen = 'almacen',
  Admin = 'admin',
}

export interface User {
  id: string
  nombre: string
  email: string
  role: RolesEnum
}

export interface Session {
  user: User
  token: string
  expiresAt: string
}