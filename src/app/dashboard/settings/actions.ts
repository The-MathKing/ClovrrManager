'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getOrgId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) throw new Error('No organization found')
  return profile.org_id
}

export async function seedDemoData() {
  const supabase = await createClient()
  const org_id = await getOrgId()

  // 1. Create a dummy property
  const { data: property, error: propErr } = await supabase
    .from('properties')
    .insert({ org_id, address: '456 Fake Street' })
    .select()
    .single()

  if (propErr) throw new Error(propErr.message)

  // 2. Create a dummy tenant
  // Use a unique fake phone to avoid UNIQUE constraint violation if clicked twice
  const fakePhone = `+1555${Math.floor(1000 + Math.random() * 9000)}`
  
  const { data: tenant, error: tenErr } = await supabase
    .from('tenants')
    .insert({ org_id, property_id: property.id, name: 'Alice Smith (Demo)', phone: fakePhone })
    .select()
    .single()

  if (tenErr) throw new Error(tenErr.message)

  // 3. Create a ticket
  const { data: ticket, error: tickErr } = await supabase
    .from('tickets')
    .insert({
      org_id,
      tenant_id: tenant.id,
      title: 'Water leaking from the ceiling',
      status: 'dispatch_needed',
      truck_roll_prevented: false
    })
    .select()
    .single()

  if (tickErr) throw new Error(tickErr.message)

  // 4. Create messages simulating an AI conversation
  const messages = [
    { ticket_id: ticket.id, sender: 'tenant', content: 'There is water leaking from the ceiling in my bathroom!' },
    { ticket_id: ticket.id, sender: 'ai', content: 'I am sorry to hear that. Could you please take a photo of the leak so I can assess the severity?' },
    { ticket_id: ticket.id, sender: 'tenant', content: 'Here is the photo. It is dripping pretty fast.', image_url: 'https://images.unsplash.com/photo-1585058178120-e4a834927fbf?w=500&h=500&fit=crop' },
    { ticket_id: ticket.id, sender: 'ai', content: 'Thank you for the photo. Since the leak is active and coming from the ceiling, this requires immediate professional attention. I have escalated this to a work order and a plumber will be dispatched.' }
  ]

  for (const msg of messages) {
    await supabase.from('messages').insert(msg as any)
    await new Promise(r => setTimeout(r, 100)) // delay for timestamp ordering
  }

  revalidatePath('/dashboard')
}
