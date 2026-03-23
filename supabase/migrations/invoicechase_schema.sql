-- Create invoices table
CREATE TABLE public.invoices (
  id BIGSERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid')),
  reminders_sent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX idx_status_due_date ON public.invoices(status, due_date);
CREATE INDEX idx_invoice_number ON public.invoices(invoice_number);

-- Create reminder_logs table for tracking
CREATE TABLE public.reminder_logs (
  id BIGSERIAL PRIMARY KEY,
  invoice_id BIGINT REFERENCES public.invoices(id) ON DELETE CASCADE,
  reminder_type TEXT CHECK (reminder_type IN ('friendly', 'firm', 'final')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  email_sent_to TEXT NOT NULL
);

-- Fix security warning: Update function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add custom reminder schedule fields to invoices table
ALTER TABLE invoices 
ADD COLUMN reminder_day_1 INTEGER DEFAULT 3,
ADD COLUMN reminder_day_2 INTEGER DEFAULT 7,
ADD COLUMN reminder_day_3 INTEGER DEFAULT 14;

-- Create profiles table for user data IF NOT EXISTS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email_settings table IF NOT EXISTS
CREATE TABLE IF NOT EXISTS public.email_settings (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'gmail',
  smtp_host TEXT NOT NULL DEFAULT 'smtp.gmail.com',
  smtp_port INTEGER NOT NULL DEFAULT 587,
  smtp_user TEXT NOT NULL,
  smtp_password TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  domain_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  CONSTRAINT email_settings_provider_check CHECK (provider IN ('gmail', 'outlook', 'yahoo', 'custom'))
);

-- Add user_id to invoices table
ALTER TABLE public.invoices ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_settings_updated_at ON public.email_settings;
CREATE TRIGGER update_email_settings_updated_at
  BEFORE UPDATE ON public.email_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Email settings policies
DROP POLICY IF EXISTS "Users can view their own email settings" ON public.email_settings;
CREATE POLICY "Users can view their own email settings" ON public.email_settings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own email settings" ON public.email_settings;
CREATE POLICY "Users can insert their own email settings" ON public.email_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own email settings" ON public.email_settings;
CREATE POLICY "Users can update their own email settings" ON public.email_settings FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own email settings" ON public.email_settings;
CREATE POLICY "Users can delete their own email settings" ON public.email_settings FOR DELETE USING (auth.uid() = user_id);

-- Invoices policies
DROP POLICY IF EXISTS "Allow all operations on invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
CREATE POLICY "Users can view their own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own invoices" ON public.invoices;
CREATE POLICY "Users can insert their own invoices" ON public.invoices FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
CREATE POLICY "Users can update their own invoices" ON public.invoices FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;
CREATE POLICY "Users can delete their own invoices" ON public.invoices FOR DELETE USING (auth.uid() = user_id);

-- Reminder logs policies
DROP POLICY IF EXISTS "Allow all operations on reminder_logs" ON public.reminder_logs;
CREATE POLICY "Allow all operations on reminder_logs" ON public.reminder_logs FOR ALL USING (true) WITH CHECK (true);

-- Add a composite unique constraint for user_id and invoice_number
ALTER TABLE invoices ADD CONSTRAINT invoices_user_id_invoice_number_key UNIQUE (user_id, invoice_number);
