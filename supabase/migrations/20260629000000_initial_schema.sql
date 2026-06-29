-- Create organizations table
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table (managers)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'manager',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create properties table
CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    unit_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tenants table
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, phone_number)
);

-- Create tickets table
CREATE TABLE public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved_by_ai', 'needs_pro')),
    truck_roll_prevented BOOLEAN DEFAULT false,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    media_urls TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Organizations: A user can see their own organization
CREATE POLICY "Users can view their own organization" 
    ON public.organizations FOR SELECT 
    USING (id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Users: A user can see other users in their organization
CREATE POLICY "Users can view users in same org" 
    ON public.users FOR SELECT 
    USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Properties: A user can manage properties in their organization
CREATE POLICY "Users can view properties in their org" 
    ON public.properties FOR SELECT 
    USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Users can insert properties in their org" 
    ON public.properties FOR INSERT 
    WITH CHECK (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Users can update properties in their org" 
    ON public.properties FOR UPDATE 
    USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Tenants: A user can manage tenants in their organization
CREATE POLICY "Users can view tenants in their org" 
    ON public.tenants FOR SELECT 
    USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Users can insert tenants in their org" 
    ON public.tenants FOR INSERT 
    WITH CHECK (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Users can update tenants in their org" 
    ON public.tenants FOR UPDATE 
    USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Tickets: A user can manage tickets in their organization
CREATE POLICY "Users can view tickets in their org" 
    ON public.tickets FOR SELECT 
    USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Users can insert tickets in their org" 
    ON public.tickets FOR INSERT 
    WITH CHECK (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Users can update tickets in their org" 
    ON public.tickets FOR UPDATE 
    USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Messages: A user can view and manage messages for tickets in their organization
CREATE POLICY "Users can view messages for their org tickets" 
    ON public.messages FOR SELECT 
    USING (ticket_id IN (SELECT id FROM public.tickets WHERE org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid())));
CREATE POLICY "Users can insert messages for their org tickets" 
    ON public.messages FOR INSERT 
    WITH CHECK (ticket_id IN (SELECT id FROM public.tickets WHERE org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid())));
