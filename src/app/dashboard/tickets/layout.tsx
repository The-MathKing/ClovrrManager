import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Bot, Clock, AlertCircle, CheckCircle } from 'lucide-react'

export default async function TicketsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: ticketsData } = await supabase
    .from('tickets')
    .select(`
      id, status, summary, created_at, truck_roll_prevented,
      tenants(name, phone_number),
      properties(address, unit_number)
    `)
    .order('created_at', { ascending: false })

  const tickets = ticketsData as any[]

  function getTimeAgo(dateString: string) {
    const minutes = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 60000)
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return `${Math.floor(minutes / 1440)}d ago`
  }

  return (
    <>
      {/* Ticket List (Left Pane) */}
      <div className="w-1/3 bg-white border-r border-slate-200 overflow-y-auto shrink-0 flex flex-col min-w-[320px] max-w-[400px]">
        {tickets?.map((ticket) => {
          let badgeColor = "bg-slate-100 text-slate-800"
          let Icon = Clock
          let statusText = "Active"
          
          if (ticket.status === 'needs_pro') {
            badgeColor = "bg-red-100 text-red-800"
            Icon = AlertCircle
            statusText = "Needs Vendor"
          } else if (ticket.status === 'resolved_by_ai') {
            badgeColor = "bg-green-100 text-green-800"
            Icon = CheckCircle
            statusText = "Resolved by AI"
          }

          return (
            <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`} className="block p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer border-l-4 border-l-transparent focus:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${badgeColor}`}>
                      {ticket.status === 'needs_pro' ? 'Critical' : ticket.status === 'resolved_by_ai' ? 'Resolved' : 'Active'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{getTimeAgo(ticket.created_at)}</span>
              </div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">{ticket.properties?.address}</h3>
              <p className="text-xs text-slate-600 truncate">Unit {ticket.properties?.unit_number} - {ticket.tenants?.name}</p>
              <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${ticket.status === 'needs_pro' ? 'text-red-700' : ticket.status === 'resolved_by_ai' ? 'text-green-700' : 'text-blue-700'}`}>
                  <Icon className="w-3.5 h-3.5" /> 
                  <span className="truncate">{ticket.summary || 'Interacting with AI...'}</span>
              </div>
            </Link>
          )
        })}
        
        {!tickets?.length && (
          <div className="p-8 text-center text-slate-500 text-sm">
            No active tickets.
          </div>
        )}
      </div>

      {/* Ticket Detail (Right Pane) */}
      <div className="flex-1 bg-slate-50 flex flex-col relative overflow-hidden">
        {children}
      </div>
    </>
  )
}
