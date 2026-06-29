'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Inbox, CheckCheck, PieChart, Settings } from 'lucide-react'

export function SidebarNav() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard/tickets', label: 'Active Tickets', icon: Inbox },
    { href: '/dashboard/resolved', label: 'Resolved (AI)', icon: CheckCheck },
    { href: '/dashboard/analytics', label: 'ROI Analytics', icon: PieChart },
    { href: '/dashboard/settings', label: 'AI Settings', icon: Settings },
  ]

  return (
    <nav className="flex-1 p-4 space-y-2">
      {links.map((link) => {
        const Icon = link.icon
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`) || (pathname === '/dashboard' && link.href === '/dashboard/tickets')
        
        return (
          <Link 
            key={link.href}
            href={link.href} 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              isActive 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" /> {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
