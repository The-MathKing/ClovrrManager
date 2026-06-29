import { Inbox } from 'lucide-react'

export default function TicketsEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
      <Inbox className="w-16 h-16 mb-4 opacity-20" />
      <p className="text-lg font-medium text-slate-500">No Ticket Selected</p>
      <p className="text-sm mt-1">Select a ticket from the queue to view details.</p>
    </div>
  )
}
