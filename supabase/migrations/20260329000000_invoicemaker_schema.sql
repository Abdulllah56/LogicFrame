-- Migration for InvoiceMaker Tables
-- Date: 2026-03-29

-- 1. Create invoicemaker_invoices table
CREATE TABLE IF NOT EXISTS public.invoicemaker_invoices (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  custom_prefix TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, overdue
  
  -- Business Info
  business_name TEXT NOT NULL,
  business_email TEXT NOT NULL,
  business_city TEXT NOT NULL,
  
  -- Client Info
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  project_name TEXT NOT NULL,
  description TEXT,
  
  -- Date & Financials
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  total NUMERIC(15, 2) NOT NULL DEFAULT 0,
  
  -- Feature: Recurring Invoices
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  frequency TEXT, -- weekly, monthly, quarterly
  next_generation_date TIMESTAMP WITH TIME ZONE,
  
  -- Feature: Notes & Payment Instructions
  notes TEXT,
  payment_instructions TEXT,
  
  -- Feature: Smart Follow-up (auto_chase)
  auto_chase BOOLEAN NOT NULL DEFAULT false,
  
  -- Feature: Late Fee Auto-calculator
  late_fee_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  late_fee_days INTEGER NOT NULL DEFAULT 0,
  
  -- Feature: Viewed Tracking
  viewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create invoicemaker_items table
CREATE TABLE IF NOT EXISTS public.invoicemaker_items (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoicemaker_invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(15, 2) NOT NULL DEFAULT 1,
  rate NUMERIC(15, 2) NOT NULL DEFAULT 0,
  amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.invoicemaker_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoicemaker_items ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for invoicemaker_invoices
CREATE POLICY "Users can view their own invoicemaker invoices"
  ON public.invoicemaker_invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoicemaker invoices"
  ON public.invoicemaker_invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoicemaker invoices"
  ON public.invoicemaker_invoices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoicemaker invoices"
  ON public.invoicemaker_invoices FOR DELETE
  USING (auth.uid() = user_id);

-- 5. RLS Policies for invoicemaker_items
-- Since items are children of invoices, we'll check permission via the invoice
CREATE POLICY "Users can view their own invoicemaker items"
  ON public.invoicemaker_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.invoicemaker_invoices 
    WHERE public.invoicemaker_invoices.id = public.invoicemaker_items.invoice_id 
    AND public.invoicemaker_invoices.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own invoicemaker items"
  ON public.invoicemaker_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.invoicemaker_invoices 
    WHERE public.invoicemaker_invoices.id = public.invoicemaker_items.invoice_id 
    AND public.invoicemaker_invoices.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own invoicemaker items"
  ON public.invoicemaker_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.invoicemaker_invoices 
    WHERE public.invoicemaker_invoices.id = public.invoicemaker_items.invoice_id 
    AND public.invoicemaker_invoices.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own invoicemaker items"
  ON public.invoicemaker_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.invoicemaker_invoices 
    WHERE public.invoicemaker_invoices.id = public.invoicemaker_items.invoice_id 
    AND public.invoicemaker_invoices.user_id = auth.uid()
  ));

-- 6. Updated_at triggers
CREATE TRIGGER update_invoicemaker_invoices_updated_at
  BEFORE UPDATE ON public.invoicemaker_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoicemaker_items_updated_at
  BEFORE UPDATE ON public.invoicemaker_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
