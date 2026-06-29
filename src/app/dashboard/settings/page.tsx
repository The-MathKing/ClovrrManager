import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-50">
      <Settings className="w-16 h-16 mb-4 text-slate-400/50" />
      <h2 className="text-2xl font-bold text-slate-800">AI Settings</h2>
      <p className="text-slate-500 mt-2 max-w-md">Configure your AI's personality, custom property guidelines, and emergency fallback protocols.</p>
      <p className="text-sm mt-8 text-blue-600 font-medium border border-blue-200 inline-block px-4 py-2 rounded-md bg-blue-50">Feature Coming Soon</p>
    </div>
  )
}
