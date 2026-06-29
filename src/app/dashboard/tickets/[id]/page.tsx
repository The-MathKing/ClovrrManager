import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()

  // Ensure params is fully resolved before accessing properties in App Router Next 15+
  const resolvedParams = await params
  const ticketId = resolvedParams.id

  const { data: ticketData } = await supabase
    .from('tickets')
    .select(`
      *,
      tenants(*),
      properties(*)
    `)
    .eq('id', ticketId)
    .single()

  const ticket = ticketData as any

  if (!ticket) {
    notFound()
  }

  const { data: messagesData } = await supabase
    .from('messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  const messages = messagesData as any[]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 transition-colors bg-white p-2 rounded-full border shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ticket Details</h1>
          <p className="text-slate-500 text-sm mt-1">Property: {ticket.properties?.address}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center flex-wrap gap-2">
                <Badge variant={ticket.status === 'needs_pro' ? 'destructive' : ticket.status === 'resolved_by_ai' ? 'default' : 'secondary'} className="px-3 py-1 text-sm">
                  {ticket.status === 'resolved_by_ai' ? 'Resolved (AI)' : ticket.status === 'needs_pro' ? 'Needs Pro' : 'Open'}
                </Badge>
                {ticket.truck_roll_prevented && (
                  <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 px-3 py-1 text-sm">
                    Truck Roll Prevented
                  </Badge>
                )}
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">AI Summary</div>
                <div className="text-sm leading-relaxed text-slate-700">{ticket.summary || 'No summary generated yet.'}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tenant Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500 font-medium">Name</span> 
                <span className="font-medium text-slate-900">{ticket.tenants?.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500 font-medium">Phone</span> 
                <span className="font-medium text-slate-900">{ticket.tenants?.phone_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Unit</span> 
                <span className="font-medium text-slate-900">{ticket.properties?.unit_number || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-[650px] flex flex-col shadow-sm">
            <CardHeader className="border-b bg-slate-50/50 pb-4">
              <CardTitle className="text-lg">SMS Transcript</CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1 p-4 bg-slate-50/30">
              <div className="space-y-6 pb-4">
                {messages?.map((msg) => {
                  if (msg.role === 'system') return null; // Don't show system prompts
                  const isUser = msg.role === 'user';
                  return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${isUser ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border text-slate-900 rounded-bl-sm'}`}>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                        {msg.media_urls && msg.media_urls.length > 0 && (
                          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                            {msg.media_urls.map((url: string, i: number) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img key={i} src={url} alt="MMS Attachment" className="h-48 rounded-lg object-cover border border-black/10" />
                            ))}
                          </div>
                        )}
                        <div className={`text-[11px] mt-2 font-medium ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!messages?.length && (
                  <div className="text-center text-slate-500 mt-10">No messages found in this transcript.</div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}
