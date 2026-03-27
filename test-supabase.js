const { createClient } = require('@supabase/supabase-js');
const url = 'https://onxittqxvkzwetazcimx.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ueGl0dHF4dmt6d2V0YXpjaW14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODYyMzczNCwiZXhwIjoyMDg0MTk5NzM0fQ.dDm9-zGQdPgDcUwYi_tBQC1CncAZqO_djtxLOLmu5Ew';
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('projects').select('id').limit(1);
  console.log('projects error:', error ? error.message : 'exists');
  const { data: d2, error: e2 } = await supabase.from('deliverables').select('id').limit(1);
  console.log('deliverables error:', e2 ? e2.message : 'exists');
  const { data: d3, error: e3 } = await supabase.from('requests').select('id').limit(1);
  console.log('requests error:', e3 ? e3.message : 'exists');
}
test();
