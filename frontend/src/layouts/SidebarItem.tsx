import { cn } from "@/utils/cn"
import type { LucideIcon } from "lucide-react"
import { NavLink } from "react-router-dom"

interface SidebarItemProps {
  to: string
  icon: LucideIcon
  label: string
  collapsed?: boolean
}

export const SidebarItem = ({ to, icon: Icon, label, collapsed = false }: SidebarItemProps) => {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      className={({ isActive }) => cn(
        'flex h-11 w-full items-center gap-3 rounded-xl text-text-secondary transition-colors duration-200 hover:bg-card-hover hover:text-text-primary',
        collapsed ? 'justify-center' : 'px-4',
        isActive && 'bg-card-active font-semibold text-accent hover:bg-card-active hover:text-accent'
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  )
}
