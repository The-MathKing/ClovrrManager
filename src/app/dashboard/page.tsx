import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get current user's org
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch tickets with tenant and property info
  const { data: ticketsData } = await supabase
    .from('tickets')
    .select(`
      id,
      status,
      summary,
      created_at,
      truck_roll_prevented,
      tenants(name, phone_number),
      properties(address, unit_number)
    `)
    .order('created_at', { ascending: false })

  const tickets = ticketsData as any[]

  // Calculate metrics
  const totalTickets = tickets?.length || 0
  const preventedCount = tickets?.filter(t => t.truck_roll_prevented).length || 0
  const openCount = tickets?.filter(t => t.status === 'open').length || 0
  const needsProCount = tickets?.filter(t => t.status === 'needs_pro').length || 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your properties' maintenance requests.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTickets}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-100 bg-blue-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Truck Rolls Prevented</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{preventedCount}</div>
            <p className="text-xs text-blue-600/70 mt-1">Resolved by AI</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">Open with AI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{openCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently interacting</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Needs Pro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{needsProCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires technician</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
          <CardDescription>All maintenance tickets across your properties.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets?.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <Badge variant={ticket.status === 'needs_pro' ? 'destructive' : ticket.status === 'resolved_by_ai' ? 'default' : 'secondary'}>
                        {ticket.status === 'resolved_by_ai' ? 'Resolved (AI)' : ticket.status === 'needs_pro' ? 'Needs Pro' : 'Open'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ticket.properties?.address} {ticket.properties?.unit_number ? `Apt ${ticket.properties.unit_number}` : ''}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{ticket.tenants?.name}</div>
                      <div className="text-xs text-slate-500">{ticket.tenants?.phone_number}</div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">
                      {ticket.summary || 'Interacting with AI...'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/tickets/${ticket.id}`} className="text-blue-600 font-medium hover:underline text-sm">
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {!tickets?.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                      No tickets found. When a tenant texts the Twilio number, they will appear here.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
