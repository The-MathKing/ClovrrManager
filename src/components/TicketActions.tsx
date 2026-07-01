'use client'

import { ShieldCheck } from 'lucide-react'
import { useState, useTransition } from 'react'
import { updateTicketStatus, toggleTruckRollPrevented } from '@/app/dashboard/tickets/actions'

export function TicketActions({ 
  ticketId, 
  initialStatus, 
  initialPrevented 
}: { 
  ticketId: string, 
  initialStatus: string, 
  initialPrevented: boolean 
}) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState(initialStatus)
  const [prevented, setPrevented] = useState(initialPrevented)

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setStatus(newStatus)
    startTransition(async () => {
      await updateTicketStatus(ticketId, newStatus)
    })
  }

  const handleTogglePrevented = () => {
    const newValue = !prevented
    setPrevented(newValue)
    startTransition(async () => {
      await toggleTruckRollPrevented(ticketId, !newValue) // pass the old value so action toggles it
    })
  }

  return (
    <div className="flex gap-2 items-center">
      <select 
        value={status}
        onChange={handleStatusChange}
        disabled={isPending}
        className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
      >
        <option value="open">Status: Active Issue</option>
        <option value="resolved">Status: Resolved by AI</option>
        <option value="dispatch_needed">Status: Escalated to Pro</option>
      </select>
      
      <button 
        onClick={handleTogglePrevented}
        disabled={isPending}
        className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50 ${
          prevented 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
        }`}
      >
        <ShieldCheck className="w-4 h-4" /> 
        {prevented ? 'Truck Roll Prevented' : 'Mark as Prevented'}
      </button>
    </div>
  )
}
