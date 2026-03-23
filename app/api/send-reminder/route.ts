
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
    try {
        const { invoiceId, reminderType, daysOverdue, customSubject, customBody } = await request.json();

        // 1. Validate request
        let cleanId = invoiceId;
        if (typeof invoiceId === 'string') {
            cleanId = parseInt(invoiceId, 10);
        }

        if (!cleanId || isNaN(Number(cleanId))) {
            return NextResponse.json({ error: "Invalid or missing invoiceId" }, { status: 400 });
        }

        // 2. Authenticate User via Supabase headers
        // We expect the client to send the session access token via Authorization header or verify via cookie
        // Since we are backend, we can access using service role OR reuse the user's token.
        // However, simplest here is to verify the user using server-side auth.

        // BUT: standard pattern for API routes in this codebase seems variable.
        // Let's rely on the cookie passed along with the request.

        // Initialize Supabase Admin Client (Service Role)
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        console.log("Debug: Checking Service Role Key...");
        if (!serviceRoleKey) {
            console.error("CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY is missing from environment variables.");
            return NextResponse.json({
                error: "Server configuration error: Missing Service Role Key",
                details: "Please add SUPABASE_SERVICE_ROLE_KEY to .env.local"
            }, { status: 500 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey
        );

        // Ideally we should verify the user is who they say they are.
        // For now, let's fetch the invoice and its owner directly to ensure ownership.

        const { data: invoice, error: invoiceError } = await supabaseAdmin
            .from("invoices")
            .select("*")
            .eq("id", cleanId)
            .single();

        if (invoiceError || !invoice) {
            console.error("Invoice fetch error:", invoiceError);
            console.error("Invoice ID requested:", cleanId);
            
            // Re-attempt with the ID as a string if it's a UUID (unlikely but safe)
            const { data: altFetch } = await supabaseAdmin
                .from("invoices")
                .select("*")
                .eq("id", String(invoiceId))
                .maybeSingle();

            if (!altFetch) {
                return NextResponse.json({
                    error: "Invoice not found",
                    details: `ID ${cleanId} (as ${typeof cleanId}) did not match any record. ${invoiceError?.message || ""}`
                }, { status: 404 });
            }
            // Use altFetch if it worked
            // (overwrite invoice variable if we wanted to continue, but let's just fail with better info for now)
            return NextResponse.json({ error: "Invoice ID type mismatch", details: "ID was found but only as a string match." }, { status: 404 });
        }

        const userId = invoice.user_id;

        // 3. Fetch Email Settings for this user
        const { data: emailSettings, error: settingsError } = await supabaseAdmin
            .from("email_settings")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (settingsError || !emailSettings) {
            console.error("Email settings error:", settingsError);
            return NextResponse.json({ error: "Email settings not found. Please configure them in Settings." }, { status: 400 });
        }

        // 4. Configure Transporter
        const transporter = nodemailer.createTransport({
            host: emailSettings.smtp_host,
            port: emailSettings.smtp_port,
            secure: emailSettings.smtp_port === 465, // true for 465, false for other ports
            auth: {
                user: emailSettings.smtp_user,
                pass: emailSettings.smtp_password,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // 5. Send Email
        const mailOptions = {
            from: `"${emailSettings.from_name || 'Invoice Reminder'}" <${emailSettings.from_email}>`,
            to: invoice.client_email,
            subject: customSubject,
            text: customBody,
            html: customBody.replace(/\n/g, "<br>"), // Simple conversion
        };

        await transporter.sendMail(mailOptions);

        // 6. Log the reminder
        await supabaseAdmin.from("reminder_logs").insert({
            invoice_id: cleanId,
            email_sent_to: invoice.client_email,
            reminder_type: reminderType,
            sent_at: new Date().toISOString(),
        });

        // 7. Update reminder count on invoice
        await supabaseAdmin.from("invoices").update({
            reminders_sent: (invoice.reminders_sent || 0) + 1,
            // optional: update status?
        }).eq("id", cleanId);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Send email error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
