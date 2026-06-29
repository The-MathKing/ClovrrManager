'use client'

import { Truck, Phone } from 'lucide-react'

export function TicketActions() {
  return (
    <div className="flex gap-2">
      <button 
        onClick={() => alert('Feature coming soon: This will open a direct SMS/Call interface with the tenant.')}
        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
      >
        <Phone className="w-4 h-4" /> Contact Tenant
      </button>
      <button 
        onClick={() => alert('Feature coming soon: This will open a dispatch modal to assign a vendor and schedule a truck roll.')}
        className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm flex items-center gap-2 transition-colors"
      >
        <Truck className="w-4 h-4" /> Dispatch Vendor
      </button>
    </div>
  )
}
