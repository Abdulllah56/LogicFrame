import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { sendProposalEmail } from "@/lib/portflow/email";

// POST /api/portflow/proposals/[id]/send — send proposal to client
export async function POST(request, { params }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch proposal with client data
  const { data: proposal, error: proposalError } = await supabase
    .from("portflow_proposals")
    .select(`
      *,
      client:portflow_clients(id, name, email)
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (proposalError || !proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  if (!proposal.client?.email) {
    return NextResponse.json(
      { error: "Client has no email address" },
      { status: 400 }
    );
  }

  // Build the portal URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000";
  const proposalUrl = `${baseUrl}/portal/proposals/${proposal.magic_token}`;

  // Format amount
  const formattedAmount = proposal.amount
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: proposal.currency || "USD",
      }).format(proposal.amount)
    : null;

  const summary = proposal.content?.executive_summary?.substring(0, 300) || "";

  try {
    // Send email
    await sendProposalEmail({
      to: proposal.client.email,
      proposalTitle: proposal.title,
      clientName: proposal.client.name,
      freelancerName: user.user_metadata?.full_name || "A freelancer",
      freelancerEmail: user.email,
      amount: formattedAmount,
      summary,
      portalUrl: proposalUrl,
    });

    // Update proposal status to sent
    await supabase
      .from("portflow_proposals")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", id);

    // Create notification
    await supabase.from("portflow_notifications").insert({
      user_id: user.id,
      type: "proposal_sent",
      title: "Proposal sent",
      message: `"${proposal.title}" was sent to ${proposal.client.name}`,
      linked_id: id,
      linked_type: "proposal",
    });

    return NextResponse.json({
      success: true,
      magicToken: proposal.magic_token,
      proposalUrl,
    });
  } catch (error) {
    console.error("Send proposal error:", error);
    return NextResponse.json(
      { error: "Failed to send email. Please try again." },
      { status: 500 }
    );
  }
}
