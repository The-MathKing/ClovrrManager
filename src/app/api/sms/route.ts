import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { Database } from '../../../../../types/supabase';

const SYSTEM_PROMPT = `You are an AI maintenance assistant for a property management company. Ask for photos of the issue. Walk the tenant through basic fixes (e.g., reset GFCI, unjam disposal). If it requires a professional, state that a work order has been submitted. Keep replies under 2 sentences.`;

export async function POST(req: Request) {
  try {
    // Twilio sends application/x-www-form-urlencoded
    const formData = await req.formData();
    const fromPhone = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const mediaUrl0 = formData.get('MediaUrl0') as string | null;

    if (!fromPhone || !body) {
      return NextResponse.json({ error: 'Missing From or Body' }, { status: 400 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize Supabase Admin client to bypass RLS for webhooks
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Lookup Tenant
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('phone', fromPhone)
      .single();

    if (tenantError || !tenant) {
      const xml = `<Response><Message>Sorry, this phone number is not recognized by property management.</Message></Response>`;
      return new NextResponse(xml, {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // 2. Ticket Management - check for an open ticket
    let { data: ticket } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('tenant_id', tenant.id)
      .eq('status', 'open')
      .single();

    if (!ticket) {
      // Create new ticket
      const { data: newTicket, error: newTicketError } = await supabaseAdmin
        .from('tickets')
        .insert({
          org_id: tenant.org_id,
          tenant_id: tenant.id,
          title: body.substring(0, 50) + (body.length > 50 ? '...' : ''),
          status: 'open',
        })
        .select()
        .single();

      if (newTicketError) {
        throw new Error(`Failed to create ticket: ${newTicketError.message}`);
      }
      ticket = newTicket;
    }

    if (!ticket) {
      throw new Error('Ticket could not be created or found.');
    }

    // 3. Save Inbound Message
    await supabaseAdmin
      .from('messages')
      .insert({
        ticket_id: ticket.id,
        sender: 'tenant',
        content: body,
        image_url: mediaUrl0,
      });

    // 4. Fetch Context (Last 10 messages)
    const { data: messagesContext } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('ticket_id', ticket.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Reorder to ascending for OpenAI context
    const orderedMessages = (messagesContext || []).reverse();

    // 5. OpenAI Integration
    const messagesPayload: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    for (const msg of orderedMessages) {
      if (msg.sender === 'ai') {
        messagesPayload.push({ role: 'assistant', content: msg.content });
      } else {
        const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
          { type: 'text', text: msg.content }
        ];
        if (msg.image_url) {
          userContent.push({
            type: 'image_url',
            image_url: { url: msg.image_url }
          });
        }
        messagesPayload.push({ role: 'user', content: userContent });
      }
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messagesPayload,
      max_tokens: 150,
    });

    const aiResponseText = completion.choices[0]?.message?.content || 'I am currently unavailable to help. Please try again later.';

    // 6. Save AI Response
    await supabaseAdmin
      .from('messages')
      .insert({
        ticket_id: ticket.id,
        sender: 'ai',
        content: aiResponseText,
      });

    // 7. Twilio TwiML Response
    const xml = `<Response><Message>${aiResponseText}</Message></Response>`;
    return new NextResponse(xml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error: any) {
    console.error('Error processing SMS webhook:', error);
    const xml = `<Response><Message>An error occurred while processing your request. Please try again later.</Message></Response>`;
    return new NextResponse(xml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
