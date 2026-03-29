import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST /api/invoicemaker/invoices/[id]/view — record a view
export async function POST(request, { params }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // We don't check for 'user' here because anyone with the link can view (public link feature)
  // However, for security in a real app, we'd use a public_token/magic_link.
  // For now, we update viewed_at if it's not already set or just refresh it.

  const { error } = await supabase
    .from("invoicemaker_invoices")
    .update({ viewed_at: new Date().toISOString() })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
