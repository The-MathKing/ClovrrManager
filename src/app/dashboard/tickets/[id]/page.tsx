import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MapPin, Truck, Check, Sparkles } from 'lucide-react'

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()

  const resolvedParams = await params
  const ticketId = resolvedParams.id

  const { data: ticketData } = await supabase
    .from('tickets')
    .select(`*, tenants(*), properties(*)`)
    .eq('id', ticketId)
    .single()

  const ticket = ticketData as any
  if (!ticket) notFound()

  const { data: messagesData } = await supabase
    .from('messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  const messages = messagesData as any[]

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-white shrink-0">
          <div className="flex justify-between items-start">
              <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {ticket.status === 'resolved_by_ai' ? 'Resolved by AI' : ticket.status === 'needs_pro' ? 'Escalated to Pro' : 'Active Issue'}
                  </h2>
                  <p className="text-slate-500 mt-1 flex items-center text-sm">
                    <MapPin className="w-3.5 h-3.5 mr-1" /> 
                    Unit {ticket.properties?.unit_number} • {ticket.tenants?.name} • {ticket.tenants?.phone_number}
                  </p>
              </div>
              <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      Contact Tenant
                  </button>
                  <button className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm flex items-center gap-2 transition-colors">
                      <Truck className="w-4 h-4" /> Dispatch Vendor
                  </button>
              </div>
          </div>
      </div>

      {/* Content Area (Scrollable) */}
      <div className="p-6 overflow-y-auto flex-1">
          {/* AI Summary Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-8">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" /> AI Diagnostic Summary
              </h3>
              <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <div><span className="font-semibold text-slate-700">Status:</span> Ticket is {ticket.status.replace('_', ' ')}.</div>
                  </li>
                  {ticket.summary && (
                    <li className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <div><span className="font-semibold text-slate-700">AI Summary:</span> {ticket.summary}</div>
                    </li>
                  )}
                  {ticket.truck_roll_prevented && (
                    <li className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <div><span className="font-semibold text-slate-700">Outcome:</span> Truck roll successfully prevented! Issue resolved remotely.</div>
                    </li>
                  )}
              </ul>
              {ticket.status === 'needs_pro' && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-sm text-red-800"><strong>Recommendation:</strong> Dispatch Handyman. AI could not resolve remotely.</p>
                </div>
              )}
              {ticket.status === 'open' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-800"><strong>Status:</strong> AI is currently interacting with the tenant to diagnose.</p>
                </div>
              )}
          </div>

          {/* SMS Transcript */}
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 px-1">SMS Transcript</h3>
          <div className="space-y-4 px-1 pb-10">
              {messages?.map((msg) => {
                if (msg.role === 'system') return null;
                const isUser = msg.role === 'user';
                const timeStr = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                
                if (isUser) {
                  return (
                    <div key={msg.id} className="flex flex-col items-start max-w-lg">
                        <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm text-sm">
                            {msg.media_urls && msg.media_urls.length > 0 && (
                              <div className="mb-2 flex gap-2 overflow-x-auto">
                                {msg.media_urls.map((url: string, i: number) => (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img key={i} src={url} alt="Tenant Photo" className="rounded-xl w-64 h-auto object-cover border border-slate-200" />
                                ))}
                              </div>
                            )}
                            {msg.content && <div className="whitespace-pre-wrap">{msg.content}</div>}
                        </div>
                        <span className="text-xs text-slate-400 mt-1 ml-1">{ticket.tenants?.name} (Tenant) • {timeStr}</span>
                    </div>
                  )
                } else {
                  return (
                    <div key={msg.id} className="flex flex-col items-end self-end max-w-lg ml-auto">
                        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm text-sm whitespace-pre-wrap">
                            {msg.content}
                        </div>
                        <span className="text-xs text-slate-400 mt-1 mr-1">Clovrr AI • {timeStr}</span>
                    </div>
                  )
                }
              })}
              
              {!messages?.length && (
                <div className="text-center text-slate-500 mt-10">No messages found.</div>
              )}
          </div>
      </div>
    </div>
  )
}
