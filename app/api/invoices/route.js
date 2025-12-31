import { NextResponse } from 'next/server';

// Temporary in-memory storage
let invoices = [];
let nextId = 1;

// GET all invoices
export async function GET() {
  return NextResponse.json(invoices);
}

// POST create new invoice
export async function POST(request) {
  const data = await request.json();

  const newInvoice = {
    id: nextId++,
    ...data,
    amount: parseFloat(data.amount),
    status: 'unpaid',
    remindersSent: 0,
    createdAt: new Date().toISOString(),
  };

  invoices.push(newInvoice);

  return NextResponse.json(newInvoice, { status: 201 });
}
