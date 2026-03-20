import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET /api/portflow/clients — fetch user's clients
export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch clients with project count
  const { data: clients, error } = await supabase
    .from("portflow_clients")
    .select(
      `
      *,
      projects:portflow_projects(id, budget)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Compute project count and total revenue
  const enriched = (clients || []).map((c) => ({
    ...c,
    project_count: c.projects?.length || 0,
    total_revenue: c.projects?.reduce(
      (sum, p) => sum + (parseFloat(p.budget) || 0),
      0
    ) || 0,
  }));

  return NextResponse.json({ clients: enriched });
}

// POST /api/portflow/clients — create a new client
export async function POST(request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, email, company, phone, notes } = body;

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("portflow_clients")
    .insert({
      user_id: user.id,
      name,
      email,
      company: company || null,
      phone: phone || null,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ client: data }, { status: 201 });
}
