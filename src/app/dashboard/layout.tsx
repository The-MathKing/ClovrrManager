import { logout } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user details
  const { data: profile } = await supabase
    .from('users')
    .select('role, organizations(name)')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <span className="font-bold text-xl tracking-tight text-blue-600">Clovrr</span>
            {(profile?.organizations as any)?.name && (
              <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {(profile?.organizations as any).name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:inline-block">{user.email}</span>
            <form action={logout}>
              <Button variant="outline" size="sm">Log out</Button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8 px-4 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  )
}
