import { NextResponse } from 'next/server';

// TEMPORARY IN-MEMORY STORAGE (same as above)
let invoices = [];

// PATCH update invoice (mark as paid, update reminders)
export async function PATCH(request, { params }) {
  const id = parseInt(params.id);
  const updates = await request.json();

  const index = invoices.findIndex(inv => inv.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  invoices[index] = { ...invoices[index], ...updates };

  return NextResponse.json(invoices[index]);
}

// DELETE invoice
export async function DELETE(request, { params }) {
  const id = parseInt(params.id);

  invoices = invoices.filter(inv => inv.id !== id);

  return NextResponse.json({ success: true });
}
