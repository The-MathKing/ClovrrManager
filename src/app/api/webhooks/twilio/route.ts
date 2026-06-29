import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are a friendly, highly-skilled maintenance triage AI for a property management company.
Your job is to diagnose issues tenants report via SMS. 
If it's a simple issue (like a tripped GFCI, jammed garbage disposal, or clogged toilet), try to walk them through safely fixing it themselves.
If they need a professional or the issue is severe (e.g., flooding, no heat in winter, electrical sparks), call the "escalate_to_pro" tool immediately to create a ticket for a technician.
Be polite, concise, and helpful. Ask for photos if it helps diagnose the issue.`

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const from = formData.get('From') as string
    const body = formData.get('Body') as string
    
    // Handle MMS images
    const numMedia = parseInt((formData.get('NumMedia') as string) || '0')
    const mediaUrls: string[] = []
    for (let i = 0; i < numMedia; i++) {
      const mediaUrl = formData.get(`MediaUrl${i}`) as string
      if (mediaUrl) mediaUrls.push(mediaUrl)
    }

    const supabase = createServiceClient()

    // 1. Find the tenant by phone number
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('phone_number', from)
      .single()

    if (tenantError || !tenant) {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Sorry, this phone number is not registered for maintenance support. Please contact your property manager to update your contact info.</Message></Response>`,
        { headers: { 'Content-Type': 'text/xml' } }
      )
    }

    // 2. Find an open ticket or create a new one
    let { data: ticket } = await supabase
      .from('tickets')
      .select('*')
      .eq('tenant_id', tenant.id)
      .eq('status', 'open')
      .single()

    if (!ticket) {
      const { data: newTicket, error: createError } = await supabase
        .from('tickets')
        .insert({
          org_id: tenant.org_id,
          property_id: tenant.property_id,
          tenant_id: tenant.id,
          status: 'open',
        })
        .select()
        .single()
        
      if (createError) throw createError
      ticket = newTicket
    }

    // 3. Save incoming user message
    await supabase.from('messages').insert({
      ticket_id: ticket.id,
      role: 'user',
      content: body,
      media_urls: mediaUrls.length > 0 ? mediaUrls : null,
    })

    // 4. Fetch conversation history for OpenAI
    const { data: history } = await supabase
      .from('messages')
      .select('*')
      .eq('ticket_id', ticket.id)
      .order('created_at', { ascending: true })

    const messagesForOpenAI: any[] = [
      { role: 'system', content: SYSTEM_PROMPT }
    ]

    for (const msg of history || []) {
      if (msg.role === 'user' && msg.media_urls && msg.media_urls.length > 0) {
        // Construct vision payload
        const content = [{ type: 'text', text: msg.content }]
        for (const url of msg.media_urls) {
          content.push({ type: 'image_url', image_url: { url } })
        }
        messagesForOpenAI.push({ role: msg.role, content })
      } else if (msg.role !== 'system') {
        messagesForOpenAI.push({ role: msg.role, content: msg.content })
      }
    }

    // 5. Call OpenAI
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messagesForOpenAI,
      tools: [
        {
          type: 'function',
          function: {
            name: 'escalate_to_pro',
            description: 'Escalate the ticket to a human property manager or maintenance technician if the AI cannot resolve it.',
            parameters: {
              type: 'object',
              properties: {
                summary: { type: 'string', description: 'A short summary of the issue for the technician.' },
                reason: { type: 'string', description: 'Why it needs a pro.' }
              },
              required: ['summary', 'reason']
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'mark_resolved',
            description: 'Mark the ticket as resolved if the tenant successfully fixed it with your help.',
            parameters: {
              type: 'object',
              properties: {
                summary: { type: 'string', description: 'A short summary of what was fixed.' },
              },
              required: ['summary']
            }
          }
        }
      ]
    })

    const responseMessage = aiResponse.choices[0].message
    let replyText = responseMessage.content || ""

    // Handle tool calls
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const toolCall = responseMessage.tool_calls[0]
      const args = JSON.parse(toolCall.function.arguments)

      if (toolCall.function.name === 'escalate_to_pro') {
        await supabase.from('tickets').update({
          status: 'needs_pro',
          summary: args.summary
        }).eq('id', ticket.id)
        replyText = "I've escalated this issue to your property manager. A maintenance technician will be in touch shortly."
      } else if (toolCall.function.name === 'mark_resolved') {
        await supabase.from('tickets').update({
          status: 'resolved_by_ai',
          summary: args.summary,
          truck_roll_prevented: true
        }).eq('id', ticket.id)
        replyText = "I'm glad we could get that fixed! I'll close this ticket. Let me know if you need anything else."
      }
    }

    // 6. Save AI reply to DB
    if (replyText) {
      await supabase.from('messages').insert({
        ticket_id: ticket.id,
        role: 'assistant',
        content: replyText,
      })
    }

    // 7. Return TwiML
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${replyText}</Message></Response>`,
      { headers: { 'Content-Type': 'text/xml' } }
    )

  } catch (error) {
    console.error('Twilio Webhook Error:', error)
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Message>We're experiencing technical difficulties. Please try again later.</Message></Response>`,
      { headers: { 'Content-Type': 'text/xml' } }
    )
  }
}
