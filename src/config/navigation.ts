import { Role } from "@/types/auth.types"
import { ChartBarIcon } from "lucide-react"


interface NavBadge {
  value: number
  variant: 'red' | 'amber' | 'blue'
}

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType
  badge: NavBadge | null
  roles: Role[]           
}

export interface NavSection {
  section: string
  items: NavItem[]
}

export const navigation: NavSection[] = [
  {
    section: 'Reposición',
    items: [
      {
        id: 'analisis',
        label: 'Análisis ventas',
        href: '/analisis',
        icon: ChartBarIcon,
        badge: null,
        roles: ['reposicion', 'admin'],
      },
      {
        id: 'analisis2',
        label: 'Análisis ventas',
        href: '/analisis',
        icon: ChartBarIcon,
        badge: null,
        roles: ['reposicion', 'admin'],
      },
    ]
  }
]