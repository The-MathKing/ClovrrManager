'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateTicketStatus(ticketId: string, status: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tickets')
    .update({ status })
    .eq('id', ticketId)
    
  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard', 'layout')
}

export async function toggleTruckRollPrevented(ticketId: string, currentValue: boolean) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tickets')
    .update({ truck_roll_prevented: !currentValue })
    .eq('id', ticketId)
    
  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard', 'layout')
}
