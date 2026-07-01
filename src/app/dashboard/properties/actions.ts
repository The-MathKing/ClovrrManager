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

export async function addProperty(formData: FormData) {
  const supabase = await createClient()
  const address = formData.get('address') as string
  if (!address) throw new Error('Address is required')
  
  const org_id = await getOrgId()
  
  const { error } = await supabase
    .from('properties')
    .insert({ org_id, address })
    
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/properties')
}

export async function addTenant(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const property_id = formData.get('property_id') as string
  
  if (!name || !phone || !property_id) throw new Error('Name, phone, and property are required')
  
  const org_id = await getOrgId()
  
  const { error } = await supabase
    .from('tenants')
    .insert({ org_id, property_id, name, phone })
    
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/properties')
}
