
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function checkInvoices() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: invoices, error } = await supabase
        .from('invoices')
        .select('*');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Total Invoices:', invoices.length);
    invoices.forEach(inv => {
        console.log(`Invoice #${inv.invoice_number}: id=${inv.id}`);
        console.log(`  auto_chase: ${inv.auto_chase}`);
        console.log(`  due_date: ${inv.due_date}`);
        console.log(`  reminder_day_1: ${inv.reminder_day_1}, day_2: ${inv.reminder_day_2}, day_3: ${inv.reminder_day_3}`);
        console.log(`  reminder_time: ${inv.reminder_time}, timezone: ${inv.reminder_timezone}`);
        console.log(`  reminders_sent: ${inv.reminders_sent}`);
    });
}

checkInvoices();
