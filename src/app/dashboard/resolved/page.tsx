import { CheckCheck } from 'lucide-react'

export default function ResolvedPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-50">
      <CheckCheck className="w-16 h-16 mb-4 text-green-500/50" />
      <h2 className="text-2xl font-bold text-slate-800">Resolved Tickets</h2>
      <p className="text-slate-500 mt-2 max-w-md">A historical log of all tickets the AI successfully resolved without requiring a vendor dispatch.</p>
      <p className="text-sm mt-8 text-blue-600 font-medium border border-blue-200 inline-block px-4 py-2 rounded-md bg-blue-50">Feature Coming Soon</p>
    </div>
  )
}
