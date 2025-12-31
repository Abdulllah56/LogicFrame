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
        sent: true,
      });
    }
  }

  return NextResponse.json({
    success: true,
    remindersProcessed: results.length,
    details: results,
  });
}
