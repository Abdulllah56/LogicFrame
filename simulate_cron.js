
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const TZ_OFFSETS = {
    'UTC': 0,
    'GMT': 0,
    'PST': -8,
    'EST': -5,
    'PKT': 5
};

async function testCronLogic() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: invoices, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .in("status", ["unpaid", "pending"])
        .eq("auto_chase", true);

    if (invoiceError) throw invoiceError;

    console.log(`Found ${invoices.length} invoices for auto-chase.`);

    for (const invoice of invoices) {
        const dueDate = new Date(invoice.due_date);
        dueDate.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - dueDate.getTime();
        const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        console.log(`Invoice #${invoice.invoice_number}: daysOverdue=${daysOverdue}`);

        const timezone = invoice.reminder_timezone || 'UTC';
        const reminderTime = invoice.reminder_time || '09:00';
        const offset = TZ_OFFSETS[timezone] || 0;
        
        const now = new Date();
        const nowInTz = new Date(now.getTime() + (offset * 60 * 60 * 1000));
        const currentHour = nowInTz.getUTCHours();
        const currentMinute = nowInTz.getUTCMinutes();
        
        const [scheduledHour, scheduledMinute] = reminderTime.split(':').map(Number);
        
        console.log(`  Checking Time: Tz=${timezone}, Current=${currentHour}:${currentMinute}, Scheduled=${scheduledHour}:${scheduledMinute}`);

        if (currentHour < scheduledHour || (currentHour === scheduledHour && currentMinute < scheduledMinute)) {
            console.log(`  Result: SKIP (Not time yet)`);
            continue;
        }

        const r1 = invoice.reminder_day_1 || 3;
        const r2 = invoice.reminder_day_2 || 7;
        const r3 = invoice.reminder_day_3 || 14;

        let type = null;
        if (daysOverdue >= r3 && (invoice.reminders_sent || 0) < 3) {
            type = 'final';
        } else if (daysOverdue >= r2 && (invoice.reminders_sent || 0) < 2) {
            type = 'firm';
        } else if (daysOverdue >= r1 && (invoice.reminders_sent || 0) < 1) {
            type = 'friendly';
        }

        console.log(`  Result: TYPE=${type || 'NONE'}`);
    }
}

testCronLogic();
