import { cn } from "@/utils/cn"
import type { LucideIcon } from "lucide-react"
import { NavLink } from "react-router-dom"

interface SidebarItemProps {
  to: string
  icon: LucideIcon
  label: string
}

export const SidebarItem = ({ to, icon: Icon, label }: SidebarItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        'flex items-start w-full min-w-36 gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-400 hover:text-white hover:bg-white/10',
        isActive && 'bg-[#1f232d] text-blue-500 font-semibold bg-white/5 hover:text-blue-400'
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </NavLink>
  )
}