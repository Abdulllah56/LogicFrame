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


// API routes moved to /app/api/invoices/route.js


// API routes moved to /app/api/invoices/[id]/route.js


// Cron job moved to /app/api/cron/check-reminders/route.js


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







