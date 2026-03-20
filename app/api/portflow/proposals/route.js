import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { randomUUID } from "crypto";

// GET /api/portflow/proposals — fetch user's proposals
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
    .from("portflow_proposals")
    .select(
      `
      *,
      client:portflow_clients(id, name, email, company)
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

  // Flatten client info for the frontend
  const proposals = (data || []).map((p) => ({
    ...p,
    client_name: p.client?.name || "",
    client_email: p.client?.email || "",
  }));

  return NextResponse.json({ proposals });
}

// POST /api/portflow/proposals — create a new proposal
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
  const { title, client_id, project_id, content, amount, currency, status } =
    body;

  if (!title || !client_id) {
    return NextResponse.json(
      { error: "Title and client_id are required" },
      { status: 400 }
    );
  }

  const magicToken = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  const { data, error } = await supabase
    .from("portflow_proposals")
    .insert({
      user_id: user.id,
      title,
      client_id,
      project_id: project_id || null,
      content: content || {},
      amount: amount || null,
      currency: currency || "USD",
      status: status || "draft",
      magic_token: magicToken,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ proposal: data }, { status: 201 });
}
