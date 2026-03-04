import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to convert DB snake_case to Frontend camelCase
const toCamel = (o: any): any => {
    if (o === null || typeof o !== 'object') return o;
    if (Array.isArray(o)) return o.map(toCamel);
    const n: any = {};
    Object.keys(o).forEach((k) => {
        const camel = k.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        n[camel] = toCamel(o[k]);
    });
    return n;
};

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Fetch Projects
        const { data: projectsData, error: projError } = await supabase
            .from('projects')
            .select(`
        id, project_name, client_name, client_email, project_price, 
        hourly_rate, currency,
        timeline, start_date, end_date, status, created_at
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (projError) throw projError;

        const projects: any[] = toCamel(projectsData);

        // Fetch Deliverables & Requests for these projects
        for (let p of projects) {
            // Deliverables
            const { data: delData, error: delError } = await supabase
                .from('deliverables')
                .select('id, description, category, status, scope_type')
                .eq('project_id', p.id);

            if (delError) throw delError;

            p.deliverables = delData.map((d: any) => ({
                ...toCamel(d),
                type: d.scope_type === 'in_scope' ? 'IN_SCOPE' : 'OUT_SCOPE'
            }));

            // Requests
            const { data: reqData, error: reqError } = await supabase
                .from('requests')
                .select(`
          id, request_text, request_date, category, 
          scope_status, estimated_hours, estimated_cost, timeline_impact, 
          notes, status
        `)
                .eq('project_id', p.id)
                .order('created_at', { ascending: false });

            if (reqError) throw reqError;

            p.requests = reqData.map((r: any) => ({
                ...toCamel(r),
                date: r.request_date,
                dateRequested: r.request_date,
                justification: r.notes,
                note: r.notes,
                scopeStatus: r.scope_status === 'in_scope' ? 'IN_SCOPE' : r.scope_status === 'out_of_scope' ? 'OUT_SCOPE' : 'UNCLEAR'
            }));

            // Ensure defaults if missing
            p.hourlyRate = p.hourlyRate || 100;
            p.currency = p.currency || '$';
        }

        return NextResponse.json(projects, { status: 200 });

    } catch (err: any) {
        console.error("Fetch Projects Error:", err);
        return NextResponse.json({ error: 'Failed to fetch projects', details: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId, project } = await req.json();

        // 1. Upsert Project
        const { error: projError } = await supabase
            .from('projects')
            .upsert({
                id: project.id,
                user_id: userId,
                project_name: project.projectName,
                client_name: project.clientName,
                client_email: project.clientEmail,
                project_price: project.projectPrice,
                hourly_rate: project.hourlyRate || 0,
                currency: project.currency || '$',
                timeline: project.timeline,
                start_date: project.startDate,
                end_date: project.endDate,
                status: project.status
            }, { onConflict: 'id' });

        if (projError) throw projError;

        // 2. Sync Deliverables (Delete all and re-insert)
        await supabase.from('deliverables').delete().eq('project_id', project.id);

        if (project.deliverables && project.deliverables.length > 0) {
            const { error: delError } = await supabase
                .from('deliverables')
                .insert(project.deliverables.map((d: any) => ({
                    id: d.id,
                    project_id: project.id,
                    description: d.description,
                    category: d.category,
                    status: d.status,
                    scope_type: d.type === 'IN_SCOPE' ? 'in_scope' : 'out_of_scope'
                })));
            if (delError) throw delError;
        }

        // 3. Sync Requests (Delete all and re-insert)
        await supabase.from('requests').delete().eq('project_id', project.id);

        if (project.requests && project.requests.length > 0) {
            const { error: reqError } = await supabase
                .from('requests')
                .insert(project.requests.map((r: any) => ({
                    id: r.id,
                    project_id: project.id,
                    request_text: r.requestText,
                    request_date: r.date || r.dateRequested,
                    category: r.category,
                    scope_status: r.scopeStatus === 'IN_SCOPE' ? 'in_scope' : r.scopeStatus === 'OUT_SCOPE' ? 'out_of_scope' : 'unclear',
                    estimated_hours: r.estimatedHours || 0,
                    estimated_cost: r.estimatedCost || 0,
                    timeline_impact: r.timelineImpact || '',
                    notes: r.justification || r.note || '',
                    status: r.status
                })));
            if (reqError) throw reqError;
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (e: any) {
        console.error("Save Project Error:", e);
        return NextResponse.json({ error: 'Transaction failed', details: e.message }, { status: 500 });
    }
}
