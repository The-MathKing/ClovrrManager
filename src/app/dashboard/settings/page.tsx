import { Settings, Database } from 'lucide-react'
import { seedDemoData } from './actions'

export default function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-50">
      <Settings className="w-16 h-16 mb-4 text-slate-400/50" />
      <h2 className="text-2xl font-bold text-slate-800">AI Settings & Data</h2>
      <p className="text-slate-500 mt-2 max-w-md mb-8">Configure your AI's personality, custom property guidelines, and manage demo data.</p>
      
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm max-w-md w-full">
        <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center gap-2 mb-2">
            <Database className="w-5 h-5 text-blue-600" /> Demo Mode
        </h3>
        <p className="text-sm text-slate-500 mb-6">Generate a fake property, tenant, and SMS chat transcript to instantly populate the dashboard for testing or sales pitches.</p>
        <form action={seedDemoData}>
            <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                Generate Demo Data
            </button>
        </form>
      </div>

      <p className="text-sm mt-8 text-blue-600 font-medium border border-blue-200 inline-block px-4 py-2 rounded-md bg-blue-50">More Features Coming Soon</p>
    </div>
  )
}
