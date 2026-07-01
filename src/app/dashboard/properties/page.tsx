import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { addProperty, addTenant } from './actions'
import { Building2, Users } from 'lucide-react'

export default async function PropertiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.org_id

  if (!orgId) return <div className="p-8">Please join an organization.</div>

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('org_id', orgId)

  const { data: tenants } = await supabase
    .from('tenants')
    .select('*, properties(address)')
    .eq('org_id', orgId)

  return (
    <div className="p-8 w-full max-w-6xl mx-auto overflow-y-auto h-full bg-slate-50">
      <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Building2 className="w-6 h-6 text-blue-600" /> Properties & Tenants
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Properties Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Add New Property</h2>
            <form action={addProperty} className="flex gap-2">
              <input 
                type="text" 
                name="address" 
                placeholder="123 Main St" 
                required 
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Add Property
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Managed Properties</h3>
            </div>
            <ul className="divide-y divide-slate-100">
              {properties?.map(prop => (
                <li key={prop.id} className="p-4 hover:bg-slate-50">
                  <p className="text-sm font-medium text-slate-900">{prop.address}</p>
                </li>
              ))}
              {!properties?.length && <li className="p-4 text-sm text-slate-500">No properties found.</li>}
            </ul>
          </div>
        </div>

        {/* Tenants Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" /> Add New Tenant
            </h2>
            <form action={addTenant} className="space-y-4">
              <input 
                type="text" 
                name="name" 
                placeholder="John Doe" 
                required 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <input 
                type="tel" 
                name="phone" 
                placeholder="+15551234567" 
                required 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <select 
                name="property_id" 
                required 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="">Select Property...</option>
                {properties?.map(prop => (
                  <option key={prop.id} value={prop.id}>{prop.address}</option>
                ))}
              </select>
              <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Add Tenant
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Current Tenants</h3>
            </div>
            <ul className="divide-y divide-slate-100">
              {tenants?.map(tenant => (
                <li key={tenant.id} className="p-4 hover:bg-slate-50">
                  <p className="text-sm font-medium text-slate-900">{tenant.name}</p>
                  <p className="text-xs text-slate-500">{tenant.phone} • {(tenant.properties as any)?.address}</p>
                </li>
              ))}
              {!tenants?.length && <li className="p-4 text-sm text-slate-500">No tenants found.</li>}
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
