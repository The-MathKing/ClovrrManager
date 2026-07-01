-- Create organizations table
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    twilio_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tenants table
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, phone)
);

-- Create tickets table
CREATE TABLE public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dispatch_needed')),
    truck_roll_prevented BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('tenant', 'ai')),
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's org_id
CREATE OR REPLACE FUNCTION public.get_current_org_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT org_id FROM public.profiles WHERE id = auth.uid();
$$;

-- RLS Policies

-- Organizations
CREATE POLICY "Users can view their own organization" ON public.organizations FOR SELECT USING (id = public.get_current_org_id());
CREATE POLICY "Users can update their own organization" ON public.organizations FOR UPDATE USING (id = public.get_current_org_id());

-- Profiles
CREATE POLICY "Users can view profiles in their org" ON public.profiles FOR SELECT USING (org_id = public.get_current_org_id());
CREATE POLICY "Users can update profiles in their org" ON public.profiles FOR UPDATE USING (org_id = public.get_current_org_id());

-- Properties
CREATE POLICY "Users can view properties in their org" ON public.properties FOR SELECT USING (org_id = public.get_current_org_id());
CREATE POLICY "Users can insert properties in their org" ON public.properties FOR INSERT WITH CHECK (org_id = public.get_current_org_id());
CREATE POLICY "Users can update properties in their org" ON public.properties FOR UPDATE USING (org_id = public.get_current_org_id());
CREATE POLICY "Users can delete properties in their org" ON public.properties FOR DELETE USING (org_id = public.get_current_org_id());

-- Tenants
CREATE POLICY "Users can view tenants in their org" ON public.tenants FOR SELECT USING (org_id = public.get_current_org_id());
CREATE POLICY "Users can insert tenants in their org" ON public.tenants FOR INSERT WITH CHECK (org_id = public.get_current_org_id());
CREATE POLICY "Users can update tenants in their org" ON public.tenants FOR UPDATE USING (org_id = public.get_current_org_id());
CREATE POLICY "Users can delete tenants in their org" ON public.tenants FOR DELETE USING (org_id = public.get_current_org_id());

-- Tickets
CREATE POLICY "Users can view tickets in their org" ON public.tickets FOR SELECT USING (org_id = public.get_current_org_id());
CREATE POLICY "Users can insert tickets in their org" ON public.tickets FOR INSERT WITH CHECK (org_id = public.get_current_org_id());
CREATE POLICY "Users can update tickets in their org" ON public.tickets FOR UPDATE USING (org_id = public.get_current_org_id());
CREATE POLICY "Users can delete tickets in their org" ON public.tickets FOR DELETE USING (org_id = public.get_current_org_id());

-- Messages (joins through tickets to check org_id)
CREATE POLICY "Users can view messages for their org" ON public.messages FOR SELECT USING (
    ticket_id IN (SELECT id FROM public.tickets WHERE org_id = public.get_current_org_id())
);
CREATE POLICY "Users can insert messages for their org" ON public.messages FOR INSERT WITH CHECK (
    ticket_id IN (SELECT id FROM public.tickets WHERE org_id = public.get_current_org_id())
);
CREATE POLICY "Users can update messages for their org" ON public.messages FOR UPDATE USING (
    ticket_id IN (SELECT id FROM public.tickets WHERE org_id = public.get_current_org_id())
);
CREATE POLICY "Users can delete messages for their org" ON public.messages FOR DELETE USING (
    ticket_id IN (SELECT id FROM public.tickets WHERE org_id = public.get_current_org_id())
);
