import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET /api/invoicemaker/invoices/[id] — fetch single invoice
export async function GET(request, { params }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("invoicemaker_invoices")
    .select("*, items:invoicemaker_items(*)")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PATCH /api/invoicemaker/invoices/[id] — update invoice
export async function PATCH(request, { params }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { items, ...invoiceData } = body;

  // 1. Update invoice header
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoicemaker_invoices")
    .update({
      invoice_number: invoiceData.invoiceNumber,
      custom_prefix: invoiceData.customPrefix,
      business_name: invoiceData.businessName,
      business_email: invoiceData.businessEmail,
      business_city: invoiceData.businessCity,
      client_name: invoiceData.clientName,
      client_email: invoiceData.clientEmail,
      project_name: invoiceData.projectName,
      description: invoiceData.description,
      status: invoiceData.status,
      due_date: new Date(invoiceData.dueDate).toISOString(),
      tax_rate: parseFloat(invoiceData.taxRate || 0),
      tax_amount: parseFloat(invoiceData.taxAmount || 0),
      total: parseFloat(invoiceData.total || 0),
      subtotal: parseFloat(invoiceData.subtotal || 0),
      is_recurring: invoiceData.isRecurring,
      frequency: invoiceData.frequency,
      notes: invoiceData.notes,
      payment_instructions: invoiceData.paymentInstructions,
      auto_chase: invoiceData.autoChase,
      late_fee_percent: parseFloat(invoiceData.lateFeePercent || 0),
      late_fee_days: parseInt(invoiceData.lateFeeDays || 0)
    })
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (invoiceError) {
    return NextResponse.json({ error: invoiceError.message }, { status: 500 });
  }

  // 2. Update items (simplified: delete and replace)
  if (items) {
    const { error: deleteError } = await supabase
      .from("invoicemaker_items")
      .delete()
      .eq("invoice_id", params.id);

    if (deleteError) {
        console.error("Error deleting items during update:", deleteError);
    } else {
        const itemsToInsert = items.map(item => ({
            invoice_id: params.id,
            description: item.description,
            quantity: parseFloat(item.quantity || 0),
            rate: parseFloat(item.rate || 0),
            amount: parseFloat(item.amount || 0)
        }));

        await supabase.from("invoicemaker_items").insert(itemsToInsert);
    }
  }

  return NextResponse.json(invoice);
}

// DELETE /api/invoicemaker/invoices/[id] — delete invoice
export async function DELETE(request, { params }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("invoicemaker_invoices")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
