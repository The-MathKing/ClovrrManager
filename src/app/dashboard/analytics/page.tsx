import { PieChart } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-50">
      <PieChart className="w-16 h-16 mb-4 text-purple-500/50" />
      <h2 className="text-2xl font-bold text-slate-800">ROI Analytics</h2>
      <p className="text-slate-500 mt-2 max-w-md">Detailed breakdown of maintenance costs, AI resolution rates, and total money saved on truck rolls.</p>
      <p className="text-sm mt-8 text-blue-600 font-medium border border-blue-200 inline-block px-4 py-2 rounded-md bg-blue-50">Feature Coming Soon</p>
    </div>
  )
}
