import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReminderRequest {
  invoiceId: number;
  reminderType: 'friendly' | 'firm' | 'final';
  daysOverdue: number;
  customSubject?: string;
  customBody?: string;
}

const getEmailTemplate = (
  reminderType: string,
  invoiceNumber: string,
  clientName: string,
  amount: number,
  dueDate: string,
  daysOverdue: number,
  description: string
) => {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

  const formattedDate = new Date(dueDate).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  if (reminderType === 'friendly') {
    return {
      subject: `Friendly Reminder: Invoice #${invoiceNumber} Payment`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi ${clientName},</p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">I hope this message finds you well!</p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            I wanted to send a quick reminder that Invoice #${invoiceNumber} for ${formattedAmount} was due on ${formattedDate}.
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            If you've already processed the payment, please disregard this message. Otherwise, I'd greatly appreciate payment at your earliest convenience.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4CAF50;">
            <h3 style="margin-top: 0; color: #333; font-size: 18px;">Invoice Details:</h3>
            <ul style="list-style: none; padding: 0; color: #555; font-size: 15px; line-height: 1.8;">
              <li>• <strong>Invoice Number:</strong> #${invoiceNumber}</li>
              <li>• <strong>Amount Due:</strong> ${formattedAmount}</li>
              <li>• <strong>Original Due Date:</strong> ${formattedDate}</li>
              ${description ? `<li>• <strong>Description:</strong> ${description}</li>` : ''}
            </ul>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            If you have any questions about this invoice or need alternative payment arrangements, please don't hesitate to reach out.
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Thank you for your business!</p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Best regards
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            This is an automated reminder for your pending invoice.
          </p>
        </div>
      `,
    };
  }

  if (reminderType === 'firm') {
    return {
      subject: `Payment Required: Invoice #${invoiceNumber} - ${daysOverdue} Days Overdue`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d97706;">Hi ${clientName},</h2>
          <p>Invoice #${invoiceNumber} for ${formattedAmount} is now <strong>${daysOverdue} days overdue</strong> (due date: ${formattedDate}).</p>
          <p><strong>Please process payment within the next 48 hours to avoid late fees.</strong></p>
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #d97706; margin: 20px 0;">
            <h3 style="margin-top: 0;">Invoice Details:</h3>
            <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
            <p><strong>Amount:</strong> ${formattedAmount}</p>
            <p><strong>Days Overdue:</strong> ${daysOverdue}</p>
            <p><strong>Original Due Date:</strong> ${formattedDate}</p>
          </div>
          <p>If there's an issue preventing payment, please contact me immediately.</p>
          <p>Best regards</p>
        </div>
      `,
    };
  }

  // Final notice
  return {
    subject: `FINAL NOTICE: Invoice #${invoiceNumber} - Immediate Payment Required`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">FINAL NOTICE</h2>
        <h3 style="color: #333;">Hi ${clientName},</h3>
        <p>This is a final notice that invoice #${invoiceNumber} for ${formattedAmount} is now <strong>${daysOverdue} days overdue</strong>.</p>
        <p><strong style="color: #dc2626;">Payment must be received immediately to avoid further action, including:</strong></p>
        <ul style="color: #dc2626;">
          <li>Late payment fees</li>
          <li>Suspension of services</li>
          <li>Escalation to collections</li>
        </ul>
        <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
          <h3 style="margin-top: 0;">Invoice Details:</h3>
          <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
          <p><strong>Amount:</strong> ${formattedAmount}</p>
          <p><strong>Days Overdue:</strong> ${daysOverdue}</p>
          <p><strong>Original Due Date:</strong> ${formattedDate}</p>
        </div>
        <p>Please remit payment today or contact me immediately if there are extenuating circumstances.</p>
        <p>Sincerely</p>
      </div>
    `,
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured. Please add your Resend API key.');
    }

    const resend = new Resend(resendApiKey);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { invoiceId, reminderType, daysOverdue, customSubject, customBody }: ReminderRequest = await req.json();

    console.log(`Processing reminder for invoice ${invoiceId}, type: ${reminderType}`);

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, user_id')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error(`Invoice not found: ${invoiceError?.message}`);
    }

    // Get user's email settings for from name (optional)
    const { data: emailSettings } = await supabase
      .from('email_settings')
      .select('from_name, from_email')
      .eq('user_id', invoice.user_id)
      .single();

    const fromName = emailSettings?.from_name || 'Invoice Reminder';
    
    // Use custom content if provided, otherwise use template
    let emailContent;
    if (customSubject && customBody) {
      const htmlBody = customBody
        .split('\n')
        .map((line: string) => `<p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">${line || '&nbsp;'}</p>`)
        .join('');
      
      emailContent = {
        subject: customSubject,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">${htmlBody}</div>`,
      };
    } else {
      emailContent = getEmailTemplate(
        reminderType,
        invoice.invoice_number,
        invoice.client_name,
        invoice.amount,
        invoice.due_date,
        daysOverdue,
        invoice.description || ''
      );
    }

    console.log('Sending email via Resend...');
    console.log('To:', invoice.client_email);
    console.log('Subject:', emailContent.subject);

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: `${fromName} <onboarding@resend.dev>`,
      to: [invoice.client_email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log('Email sent successfully:', emailResponse);

    // Update reminders_sent count
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ reminders_sent: (invoice.reminders_sent || 0) + 1 })
      .eq('id', invoiceId);

    if (updateError) {
      console.error('Failed to update reminders_sent:', updateError);
    }

    // Log the reminder
    const { error: logError } = await supabase
      .from('reminder_logs')
      .insert({
        invoice_id: invoiceId,
        reminder_type: reminderType,
        email_sent_to: invoice.client_email,
      });

    if (logError) {
      console.error('Failed to log reminder:', logError);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully!' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-reminder:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});