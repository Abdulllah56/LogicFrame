import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET /api/invoicemaker/invoices — list user's invoices
export async function GET(request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("invoicemaker_invoices")
    .select("*, items:invoicemaker_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// POST /api/invoicemaker/invoices — create new invoice
export async function POST(request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { items, ...invoiceData } = body;

  // Fallback for invoice number if not provided
  const invoiceNumber = invoiceData.invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`;

  // 1. Insert invoice header
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoicemaker_invoices")
    .insert({
      user_id: user.id,
      invoice_number: invoiceNumber,
      custom_prefix: invoiceData.customPrefix,
      business_name: invoiceData.businessName,
      business_email: invoiceData.businessEmail,
      business_city: invoiceData.businessCity,
      client_name: invoiceData.clientName,
      client_email: invoiceData.clientEmail,
      project_name: invoiceData.projectName,
      description: invoiceData.description || "",
      due_date: new Date(invoiceData.dueDate).toISOString(),
      status: invoiceData.status || "pending",
      subtotal: parseFloat(invoiceData.subtotal || 0),
      tax_rate: parseFloat(invoiceData.taxRate || 0),
      tax_amount: parseFloat(invoiceData.taxAmount || 0),
      total: parseFloat(invoiceData.total || 0),
      is_recurring: invoiceData.isRecurring || false,
      frequency: invoiceData.frequency || null,
      next_generation_date: invoiceData.nextGenerationDate || null,
      notes: invoiceData.notes || "",
      payment_instructions: invoiceData.paymentInstructions || "",
      auto_chase: invoiceData.autoChase || false,
      late_fee_percent: parseFloat(invoiceData.lateFeePercent || 0),
      late_fee_days: parseInt(invoiceData.lateFeeDays || 0)
    })
    .select()
    .single();

  if (invoiceError) {
    return NextResponse.json({ error: invoiceError.message }, { status: 500 });
  }

  // 2. Insert items
  if (items && items.length > 0) {
    const itemsToInsert = items.map(item => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: parseFloat(item.quantity || 0),
      rate: parseFloat(item.rate || 0),
      amount: parseFloat(item.amount || 0)
    }));

    const { error: itemsError } = await supabase
      .from("invoicemaker_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Error inserting items:", itemsError);
    }
  }

  // 3. Smart Follow-up (Auto-chase integration)
  if (invoiceData.autoChase) {
    const { error: chaseError } = await supabase
      .from("invoices") // This is the InvoiceChase table
      .insert({
        user_id: user.id,
        invoice_number: invoice.invoice_number,
        client_name: invoice.client_name,
        client_email: invoice.client_email,
        amount: invoice.total,
        due_date: invoice.due_date,
        description: invoice.description || `Synced from InvoiceMaker: ${invoice.project_name}`,
        status: 'unpaid'
      });
    
    if (chaseError) {
      console.error("Error syncing to InvoiceChase:", chaseError);
    }
  }

  return NextResponse.json(invoice, { status: 201 });
}
