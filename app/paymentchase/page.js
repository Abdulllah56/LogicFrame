// ============================================
// PAYMENT CHASE APP - COMPLETE MODULE
// ============================================
// This is a self-contained module you can drop into your Next.js app
// File structure needed:
// /app/invoices/page.js (this file)
// /app/api/invoices/route.js (API endpoints below)
// /app/api/invoices/[id]/route.js (Single invoice operations)
// /app/api/cron/check-reminders/route.js (Automated reminders)

// ============================================
// 1. MAIN INVOICES PAGE - /app/invoices/page.js
// ============================================

'use client';
import { useState, useEffect } from 'react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    amount: '',
    dueDate: '',
    description: ''
  });

  // Fetch invoices on load
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const res = await fetch('/api/invoices');
    const data = await res.json();
    setInvoices(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    // Reset form and refresh
    setFormData({ clientName: '', clientEmail: '', amount: '', dueDate: '', description: '' });
    setShowForm(false);
    fetchInvoices();
  };

  const markAsPaid = async (id) => {
    await fetch(`/api/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid' })
    });
    fetchInvoices();
  };

  const deleteInvoice = async (id) => {
    if (confirm('Delete this invoice?')) {
      await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      fetchInvoices();
    }
  };

  const getDaysOverdue = (dueDate, status) => {
    if (status === 'paid') return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.floor((today - due) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Chase</h1>
            <p className="text-gray-600 mt-1">Automated invoice reminders</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : '+ New Invoice'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Total Unpaid</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ${invoices.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + i.amount, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Overdue Invoices</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {invoices.filter(i => i.status === 'unpaid' && getDaysOverdue(i.dueDate, i.status) > 0).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Paid This Month</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              ${invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* New Invoice Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">Create Invoice</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Client Name"
                value={formData.clientName}
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                className="border border-gray-300 rounded-lg px-4 py-2"
                required
              />
              <input
                type="email"
                placeholder="Client Email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                className="border border-gray-300 rounded-lg px-4 py-2"
                required
              />
              <input
                type="number"
                placeholder="Amount ($)"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="border border-gray-300 rounded-lg px-4 py-2"
                required
                step="0.01"
              />
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="border border-gray-300 rounded-lg px-4 py-2"
                required
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="border border-gray-300 rounded-lg px-4 py-2 col-span-2"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 col-span-2"
              >
                Create Invoice
              </button>
            </form>
          </div>
        )}

        {/* Invoices List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Client</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Due Date</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Reminders Sent</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No invoices yet. Create your first one!
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => {
                  const daysOverdue = getDaysOverdue(invoice.dueDate, invoice.status);
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{invoice.clientName}</p>
                          <p className="text-sm text-gray-500">{invoice.clientEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold">${invoice.amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-gray-900">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                          {daysOverdue > 0 && (
                            <p className="text-sm text-red-600 font-medium">{daysOverdue} days overdue</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : daysOverdue > 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status === 'paid' ? 'Paid' : daysOverdue > 0 ? 'Overdue' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{invoice.remindersSent || 0}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {invoice.status === 'unpaid' && (
                          <button
                            onClick={() => markAsPaid(invoice.id)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => deleteInvoice(invoice.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


// ============================================
// 2. API ROUTES - INVOICE CRUD
// ============================================

// FILE: /app/api/invoices/route.js
// This handles GET (all invoices) and POST (create invoice)

import { NextResponse } from 'next/server';

// TEMPORARY IN-MEMORY STORAGE (replace with database later)
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
    createdAt: new Date().toISOString()
  };
  
  invoices.push(newInvoice);
  
  return NextResponse.json(newInvoice, { status: 201 });
}


// ============================================
// 3. API ROUTES - SINGLE INVOICE OPERATIONS
// ============================================

// FILE: /app/api/invoices/[id]/route.js
// This handles PATCH (update) and DELETE operations

import { NextResponse } from 'next/server';

// TEMPORARY IN-MEMORY STORAGE (same as above)
// In production, import from database
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


// ============================================
// 4. AUTOMATED REMINDER SYSTEM (CRON JOB)
// ============================================

// FILE: /app/api/cron/check-reminders/route.js
// This runs daily to check for overdue invoices and send reminders

import { NextResponse } from 'next/server';

// TEMPORARY IN-MEMORY STORAGE
let invoices = [];

// Email templates
const emailTemplates = {
  friendly: {
    subject: (invoice) => `Friendly Reminder: Invoice for ${invoice.clientName}`,
    body: (invoice) => `
      Hi ${invoice.clientName},
      
      I hope you're doing well! This is a friendly reminder that invoice for $${invoice.amount} 
      was due on ${new Date(invoice.dueDate).toLocaleDateString()}.
      
      If you've already sent payment, please disregard this message. 
      Otherwise, I'd appreciate payment at your earliest convenience.
      
      Thanks!
    `
  },
  firm: {
    subject: (invoice) => `Payment Required: Invoice Overdue`,
    body: (invoice, daysOverdue) => `
      Hi ${invoice.clientName},
      
      Invoice for $${invoice.amount} is now ${daysOverdue} days overdue.
      
      Please process payment within 48 hours to avoid late fees.
      
      Thank you for your prompt attention to this matter.
    `
  },
  final: {
    subject: (invoice) => `Final Notice: Immediate Payment Required`,
    body: (invoice, daysOverdue) => `
      Hi ${invoice.clientName},
      
      This is a final notice that invoice for $${invoice.amount} is ${daysOverdue} days overdue.
      
      Please remit payment immediately to avoid further action.
      
      If there are any issues preventing payment, please contact me immediately.
    `
  }
};

// Function to send email (using SendGrid or similar)
async function sendEmail(to, subject, body) {
  // REPLACE WITH YOUR EMAIL SERVICE (SendGrid, Resend, etc.)
  console.log('Sending email:', { to, subject, body });
  
  // Example with SendGrid:
  // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     personalizations: [{ to: [{ email: to }] }],
  //     from: { email: 'your-email@example.com' },
  //     subject: subject,
  //     content: [{ type: 'text/plain', value: body }]
  //   })
  // });
  
  return true;
}

// Main cron job function
export async function GET(request) {
  // Security: Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const today = new Date();
  const results = [];
  
  // Check each unpaid invoice
  for (const invoice of invoices) {
    if (invoice.status === 'paid') continue;
    
    const dueDate = new Date(invoice.dueDate);
    const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    
    // Skip if not yet overdue
    if (daysOverdue <= 0) continue;
    
    let shouldSend = false;
    let templateType = null;
    
    // Escalation logic
    if (daysOverdue === 3 && invoice.remindersSent === 0) {
      shouldSend = true;
      templateType = 'friendly';
    } else if (daysOverdue === 7 && invoice.remindersSent === 1) {
      shouldSend = true;
      templateType = 'firm';
    } else if (daysOverdue === 14 && invoice.remindersSent === 2) {
      shouldSend = true;
      templateType = 'final';
    }
    
    if (shouldSend && templateType) {
      const template = emailTemplates[templateType];
      const subject = template.subject(invoice);
      const body = template.body(invoice, daysOverdue);
      
      await sendEmail(invoice.clientEmail, subject, body);
      
      // Update reminder count
      invoice.remindersSent++;
      
      results.push({
        invoiceId: invoice.id,
        client: invoice.clientName,
        daysOverdue,
        reminderType: templateType,
        sent: true
      });
    }
  }
  
  return NextResponse.json({
    success: true,
    remindersProcessed: results.length,
    details: results
  });
}


// ============================================
// 5. SETUP INSTRUCTIONS
// ============================================

/*

INTEGRATION STEPS:

1. CREATE FILE STRUCTURE:
   /app/invoices/page.js (main UI component above)
   /app/api/invoices/route.js (GET & POST)
   /app/api/invoices/[id]/route.js (PATCH & DELETE)
   /app/api/cron/check-reminders/route.js (automated reminders)

2. INSTALL DEPENDENCIES (if not already installed):
   npm install (you already have Next.js + Tailwind)

3. REPLACE IN-MEMORY STORAGE WITH DATABASE:
   
   Option A - Supabase (Recommended, Free):
   - Sign up at supabase.com
   - Create a new project
   - Create 'invoices' table with columns:
     * id (int, primary key, auto-increment)
     * clientName (text)
     * clientEmail (text)
     * amount (decimal)
     * dueDate (date)
     * description (text)
     * status (text, default 'unpaid')
     * remindersSent (int, default 0)
     * createdAt (timestamp)
   
   - Install Supabase client:
     npm install @supabase/supabase-js
   
   - Create /lib/supabase.js:
     import { createClient } from '@supabase/supabase-js'
     export const supabase = createClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
     )
   
   - Replace in-memory arrays with:
     const { data } = await supabase.from('invoices').select('*')

4. SETUP EMAIL SERVICE:
   
   Option A - Resend (Easiest):
   - Sign up at resend.com (free 100 emails/day)
   - Get API key
   - npm install resend
   - Replace sendEmail function with:
     import { Resend } from 'resend';
     const resend = new Resend(process.env.RESEND_API_KEY);
     await resend.emails.send({
       from: 'onboarding@resend.dev',
       to: to,
       subject: subject,
       html: body
     });

5. SETUP CRON JOB (Automated Reminders):
   
   Option A - Vercel Cron (Free):
   - Create /vercel.json in project root:
     {
       "crons": [{
         "path": "/api/cron/check-reminders",
         "schedule": "0 9 * * *"
       }]
     }
   - This runs daily at 9am
   
   Option B - External Cron Service:
   - Use cron-job.org or EasyCron
   - Set URL: https://yourdomain.com/api/cron/check-reminders
   - Add header: Authorization: Bearer YOUR_CRON_SECRET

6. ENVIRONMENT VARIABLES (.env.local):
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   RESEND_API_KEY=your_resend_key
   CRON_SECRET=random_secret_string_12345

7. ADD TO YOUR MAIN APP:
   - Add link in navigation: <Link href="/invoices">Invoices</Link>
   - That's it! The module is self-contained

8. CUSTOMIZE:
   - Edit email templates in emailTemplates object
   - Adjust reminder timing (currently 3, 7, 14 days)
   - Change colors/styling to match your brand

DEPLOYMENT:
- Push to Vercel/Railway
- Cron job will run automatically
- Emails will send automatically

*/


// okay okay , now give me a full detailed prompt for AI to create this fully functional app , tell it the first focus on functionalitiy and simple UI . tell it the main function of the app . make sure  it fulfills the needs of the user's complains . give it instructions from functionality to tack stack and evey nessaccary detail







