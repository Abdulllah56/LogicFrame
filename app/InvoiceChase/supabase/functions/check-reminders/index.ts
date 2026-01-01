import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting reminder check...');

    // Get all unpaid invoices
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .eq('status', 'unpaid');

    if (invoicesError) {
      throw new Error(`Failed to fetch invoices: ${invoicesError.message}`);
    }

    console.log(`Found ${invoices?.length || 0} unpaid invoices`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const remindersToSend = [];

    for (const invoice of invoices || []) {
      const dueDate = new Date(invoice.due_date);
      dueDate.setHours(0, 0, 0, 0);

      const daysOverdue = Math.floor(
        (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      console.log(`Invoice ${invoice.invoice_number}: ${daysOverdue} days overdue, ${invoice.reminders_sent} reminders sent`);

      // Check if we should send a reminder
      let reminderType: 'friendly' | 'firm' | 'final' | null = null;

      if (daysOverdue === invoice.reminder_day_1 && invoice.reminders_sent === 0) {
        reminderType = 'friendly';
      } else if (daysOverdue === invoice.reminder_day_2 && invoice.reminders_sent === 1) {
        reminderType = 'firm';
      } else if (daysOverdue === invoice.reminder_day_3 && invoice.reminders_sent === 2) {
        reminderType = 'final';
      }

      if (reminderType) {
        console.log(`Sending ${reminderType} reminder for invoice ${invoice.invoice_number}`);

        // Call send-reminder function
        const reminderResponse = await supabase.functions.invoke('send-reminder', {
          body: {
            invoiceId: invoice.id,
            reminderType,
            daysOverdue,
          },
        });

        if (reminderResponse.error) {
          console.error(`Failed to send reminder for invoice ${invoice.invoice_number}:`, reminderResponse.error);
        } else {
          remindersToSend.push({
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
            client_email: invoice.client_email,
            reminder_type: reminderType,
            days_overdue: daysOverdue,
          });
        }
      }
    }

    console.log(`Reminder check complete. Sent ${remindersToSend.length} reminders.`);

    return new Response(
      JSON.stringify({
        success: true,
        checked: invoices?.length || 0,
        sent: remindersToSend.length,
        details: remindersToSend,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in check-reminders:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});