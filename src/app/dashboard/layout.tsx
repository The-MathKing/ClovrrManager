import { logout } from '@/app/login/actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Wrench, LogOut } from 'lucide-react'
import { SidebarNav } from '@/components/SidebarNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user details
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, organizations(name)')
    .eq('id', user.id)
    .single()

  // Fetch metrics for sidebar
  const { data: ticketsData } = await supabase
    .from('tickets')
    .select('truck_roll_prevented')
  
  const tickets = ticketsData as any[]
  const preventedCount = tickets?.filter(t => t.truck_roll_prevented).length || 0
  const estSavings = preventedCount * 200 // Assuming $200 per truck roll

  return (
    <div className="bg-slate-50 h-screen flex overflow-hidden font-sans text-slate-800">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex shrink-0 z-20 shadow-xl">
        <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-bold flex items-center gap-2">
                <Wrench className="text-blue-400 w-5 h-5" /> Clovrr Triage
            </h1>
            {(profile?.organizations as any)?.name && (
              <p className="text-xs text-slate-400 mt-1 font-medium">{(profile?.organizations as any).name}</p>
            )}
        </div>
        <SidebarNav />
        
        <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Truck Rolls Prevented</p>
                <p className="text-2xl font-bold text-green-400">{preventedCount} <span className="text-xs font-normal text-slate-400">all time</span></p>
                <p className="text-xs text-slate-400 mt-2">Est. Savings: <span className="text-white font-medium">${estSavings.toLocaleString()}</span></p>
            </div>
            <form action={logout}>
              <button className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" /> Log Out
              </button>
            </form>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">Maintenance Queue</h2>
            <div className="flex items-center gap-4">
                <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                    Export Logs
                </button>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase shadow-sm border border-blue-200">
                    {user.email?.[0] || 'PM'}
                </div>
            </div>
        </header>

        {/* Split Pane Area */}
        <div className="flex-1 flex overflow-hidden">
          {children}
        </div>
      </main>

    </div>
  )
}
