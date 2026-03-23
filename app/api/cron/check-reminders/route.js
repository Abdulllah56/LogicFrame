import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Define the email templates manually or import if it was a shared lib
const getTemplate = (type, invoice, daysOverdue) => {
    const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.amount);
    const dueDate = new Date(invoice.due_date).toLocaleDateString();

    if (type === 'friendly') {
        return {
            subject: `Friendly Reminder: Invoice #${invoice.invoice_number} Payment`,
            body: `Hi ${invoice.client_name},\n\nI wanted to send a quick reminder that Invoice #${invoice.invoice_number} for ${amount} was due on ${dueDate}.\n\nIf you've already sent payment, please disregard this message.\n\nThanks!`
        };
    } else if (type === 'firm') {
        return {
            subject: `Payment Required: Invoice #${invoice.invoice_number} - ${daysOverdue} Days Overdue`,
            body: `Hi ${invoice.client_name},\n\nInvoice #${invoice.invoice_number} for ${amount} is now ${daysOverdue} days overdue.\n\nPlease process payment at your earliest convenience to avoid late fees.\n\nBest regards`
        };
    } else {
        return {
            subject: `FINAL NOTICE: Invoice #${invoice.invoice_number} - Immediate Payment Required`,
            body: `Hi ${invoice.client_name},\n\nThis is a final notice that invoice #${invoice.invoice_number} for ${amount} is now ${daysOverdue} days overdue.\n\nPlease remit payment TODAY to avoid further action.\n\nSincerely`
        };
    }
};

const TZ_OFFSETS = {
    'UTC': 0,
    'GMT': 0,
    'PST': -8,
    'EST': -5,
    'PKT': 5
};

export async function GET(request) {
    // 1. Verify Cron Secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // For testing purposes, you might want to allow access if no secret is set, 
        // but for production this is critical.
        if (process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    try {
        console.log("Using Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log("Service Role Key ends with:", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(-4));

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 2. Fetch all unpaid/pending invoices where auto-chase is enabled
        const { data: invoices, error: invoiceError } = await supabaseAdmin
            .from("invoices")
            .select("*")
            .in("status", ["unpaid", "pending"])
            .eq("auto_chase", true);

        if (invoiceError) throw invoiceError;

        const results = [];

        for (const invoice of invoices) {
            const dueDate = new Date(invoice.due_date);
            dueDate.setHours(0, 0, 0, 0);
            const diffTime = today.getTime() - dueDate.getTime();
            const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            console.log(`Processing ${invoice.invoice_number}: daysOverdue=${daysOverdue}`);
            if (daysOverdue <= 0) {
                console.log(`  Skipping: Not overdue yet.`);
                continue;
            }

            // 3. Timezone and Time Check
            const timezone = invoice.reminder_timezone || 'UTC';
            const reminderTime = invoice.reminder_time || '09:00';
            const offset = TZ_OFFSETS[timezone] || 0;
            
            // Get current hour in the target timezone
            const now = new Date();
            const nowInTz = new Date(now.getTime() + (offset * 60 * 60 * 1000));
            const currentHour = nowInTz.getUTCHours();
            const currentMinute = nowInTz.getUTCMinutes();
            
            const [scheduledHour, scheduledMinute] = reminderTime.split(':').map(Number);
            
            // If it's not yet time in that timezone, skip
            if (currentHour < scheduledHour || (currentHour === scheduledHour && currentMinute < scheduledMinute)) {
                console.log(`  Skipping: Scheduled for ${reminderTime} ${timezone}. Current time in Tz: ${currentHour}:${currentMinute}`);
                continue;
            }

            // 4. Calculate Reminder Type
            let type = null;
            let reminderLevel = 0;

            const r1 = invoice.reminder_day_1 || 3;
            const r2 = invoice.reminder_day_2 || 7;
            const r3 = invoice.reminder_day_3 || 14;

            // Catch-up logic: Send the most urgent reminder that hasn't been sent yet
            if (daysOverdue >= r3 && (invoice.reminders_sent || 0) < 3) {
                type = 'final';
                reminderLevel = 3;
            } else if (daysOverdue >= r2 && (invoice.reminders_sent || 0) < 2) {
                type = 'firm';
                reminderLevel = 2;
            } else if (daysOverdue >= r1 && (invoice.reminders_sent || 0) < 1) {
                type = 'friendly';
                reminderLevel = 1;
            }
            
            console.log(`  Reminder level: ${type || 'None'}`);

            if (type) {
                // 3. Check if we already sent a reminder TODAY for this invoice to prevent duplicates
                const { data: recentLogs } = await supabaseAdmin
                    .from("reminder_logs")
                    .select("id")
                    .eq("invoice_id", invoice.id)
                    .gte("sent_at", today.toISOString());

                if (recentLogs && recentLogs.length > 0) {
                    continue; // Already sent today
                }

                // 4. Fetch Email Settings for this user
                const { data: settings } = await supabaseAdmin
                    .from("email_settings")
                    .select("*")
                    .eq("user_id", invoice.user_id)
                    .single();

                if (!settings) {
                    results.push({ invoiceId: invoice.id, status: "skipped", reason: "No email settings configured" });
                    continue;
                }

                // 5. Send Email
                const template = getTemplate(type, invoice, daysOverdue);
                const transporter = nodemailer.createTransport({
                    host: settings.smtp_host,
                    port: settings.smtp_port,
                    secure: settings.smtp_port === 465,
                    auth: {
                        user: settings.smtp_user,
                        pass: settings.smtp_password,
                    },
                    tls: { rejectUnauthorized: false }
                });

                await transporter.sendMail({
                    from: `"${settings.from_name || 'Invoice Reminder'}" <${settings.from_email}>`,
                    to: invoice.client_email,
                    subject: template.subject,
                    text: template.body,
                    html: template.body.replace(/\n/g, "<br>"),
                });

                // 6. Log and Update
                await supabaseAdmin.from("reminder_logs").insert({
                    invoice_id: invoice.id,
                    email_sent_to: invoice.client_email,
                    reminder_type: type,
                    sent_at: new Date().toISOString(),
                });

                await supabaseAdmin.from("invoices").update({
                    reminders_sent: (invoice.reminders_sent || 0) + 1,
                }).eq("id", invoice.id);

                results.push({ invoiceId: invoice.id, status: "sent", type });
            }
        }

        return NextResponse.json({ success: true, processed: results });

    } catch (error) {
        console.error("Cron error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
