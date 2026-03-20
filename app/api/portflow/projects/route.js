import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { randomUUID } from "crypto";

// GET /api/portflow/projects — fetch user's projects
export async function GET(request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = supabase
    .from("portflow_projects")
    .select(
      `
      *,
      client:portflow_clients(id, name, email, company),
      milestones:portflow_milestones(id, status)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten client info and compute milestone stats
  const projects = (data || []).map((p) => ({
    ...p,
    client_name: p.client?.name || "",
    client_email: p.client?.email || "",
    milestones_total: p.milestones?.length || 0,
    milestones_done: p.milestones?.filter((m) => m.status === "completed").length || 0,
  }));

  return NextResponse.json({ projects });
}

// POST /api/portflow/projects — create a new project
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
  const { title, client_id, description, budget, currency, deadline, status } =
    body;

  if (!title || !client_id) {
    return NextResponse.json(
      { error: "Title and client_id are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("portflow_projects")
    .insert({
      user_id: user.id,
      title,
      client_id,
      description: description || null,
      budget: budget || null,
      currency: currency || "USD",
      deadline: deadline || null,
      status: status || "active",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data }, { status: 201 });
}
