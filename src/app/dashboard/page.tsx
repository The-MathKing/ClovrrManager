import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Inbox, CheckCircle, PieChart, DollarSign } from 'lucide-react'

export default async function DashboardIndex() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.org_id

  if (!orgId) {
    return <div className="p-8">Please join an organization.</div>
  }

  // Fetch metrics
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('status, truck_roll_prevented')
    .eq('org_id', orgId)

  if (error) {
    console.error('Error fetching dashboard tickets:', error)
  }

  const activeTickets = tickets?.filter(t => t.status === 'open').length || 0
  const preventedCount = tickets?.filter(t => t.truck_roll_prevented).length || 0
  const estSavings = preventedCount * 200

  return (
    <div className="p-8 w-full max-w-6xl mx-auto overflow-y-auto h-full bg-slate-50">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">KPI Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-100 rounded-lg text-blue-600">
            <Inbox className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Tickets</p>
            <p className="text-3xl font-bold text-slate-900">{activeTickets}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-100 rounded-lg text-green-600">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Truck Rolls Prevented</p>
            <p className="text-3xl font-bold text-slate-900">{preventedCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-100 rounded-lg text-emerald-600">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Est. Savings</p>
            <p className="text-3xl font-bold text-slate-900">${estSavings.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-slate-400" /> System Overview
        </h2>
        <p className="text-slate-600">
            Welcome to Clovrr Manager. Your AI agent is actively triaging incoming SMS requests. 
            Use the sidebar to view active tickets, check resolved issues, or configure AI settings.
        </p>
      </div>
    </div>
  )
}
