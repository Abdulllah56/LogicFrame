import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { sendNotificationEmail } from "@/lib/portflow/email";

// POST /api/portflow/proposals/[id]/decline — client declines proposal
export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { feedback } = body;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch proposal
  const { data: proposal, error: proposalError } = await supabase
    .from("portflow_proposals")
    .select(`
      *,
      client:portflow_clients(id, name, email)
    `)
    .eq("id", id)
    .single();

  if (proposalError || !proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  // Update proposal status to declined
  await supabase
    .from("portflow_proposals")
    .update({
      status: "declined",
      responded_at: new Date().toISOString(),
      client_note: feedback || null,
    })
    .eq("id", id);

  // Save feedback as a message if project exists
  if (proposal.project_id && feedback) {
    await supabase.from("portflow_messages").insert({
      project_id: proposal.project_id,
      sender_type: "client",
      sender_name: proposal.client?.name || "Client",
      content: `Proposal declined. Feedback: ${feedback}`,
    });
  }

  // Notify freelancer
  await supabase.from("portflow_notifications").insert({
    user_id: proposal.user_id,
    type: "proposal_declined",
    title: "Proposal declined",
    message: `${proposal.client?.name || "A client"} declined "${proposal.title}"${feedback ? `: "${feedback}"` : ""}`,
    linked_id: id,
    linked_type: "proposal",
  });

  // Try to notify via email (non-blocking)
  try {
    const { data: freelancer } = await supabase.auth.admin?.getUserById?.(
      proposal.user_id
    ) || {};
    if (freelancer?.user?.email) {
      await sendNotificationEmail({
        to: freelancer.user.email,
        subject: `Proposal Declined: ${proposal.title}`,
        message: `${proposal.client?.name || "A client"} has declined your proposal "${proposal.title}".${feedback ? ` Their feedback: "${feedback}"` : ""}`,
      });
    }
  } catch (emailErr) {
    console.log("Could not send decline notification email:", emailErr.message);
  }

  return NextResponse.json({ success: true });
}
