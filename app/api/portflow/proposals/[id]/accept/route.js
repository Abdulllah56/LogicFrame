import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { randomUUID } from "crypto";
import { sendNotificationEmail } from "@/lib/portflow/email";

// POST /api/portflow/proposals/[id]/accept — client accepts proposal
export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { clientName, selectedTier, selectedPrice } = body;

  // Use service role or anon client for public access
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch proposal
  const { data: proposal, error: proposalError } = await supabase
    .from("portflow_proposals")
    .select(`
      *,
      client:portflow_clients(id, name, email, company)
    `)
    .eq("id", id)
    .single();

  if (proposalError || !proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  if (proposal.status === "accepted") {
    return NextResponse.json(
      { error: "Proposal already accepted" },
      { status: 400 }
    );
  }

  // Update proposal status to accepted
  await supabase
    .from("portflow_proposals")
    .update({
      status: "accepted",
      responded_at: new Date().toISOString(),
      client_note: selectedTier
        ? `Accepted tier: ${selectedTier} ($${selectedPrice})`
        : null,
    })
    .eq("id", id);

  // Create a new project with portal_token
  const portalToken = randomUUID();
  const { data: project } = await supabase
    .from("portflow_projects")
    .insert({
      user_id: proposal.user_id,
      client_id: proposal.client_id,
      title: proposal.title,
      description: proposal.content?.executive_summary || "",
      budget: selectedPrice || proposal.amount || null,
      currency: proposal.currency || "USD",
      status: "active",
      portal_token: portalToken,
    })
    .select()
    .single();

  // Link proposal to project
  if (project) {
    await supabase
      .from("portflow_proposals")
      .update({ project_id: project.id })
      .eq("id", id);
  }

  // Create notification for freelancer
  await supabase.from("portflow_notifications").insert({
    user_id: proposal.user_id,
    type: "proposal_accepted",
    title: "Proposal accepted!",
    message: `${proposal.client?.name || clientName} accepted "${proposal.title}"`,
    linked_id: id,
    linked_type: "proposal",
  });

  // Try to notify freelancer via email (non-blocking)
  try {
    const { data: freelancer } = await supabase.auth.admin?.getUserById?.(
      proposal.user_id
    ) || {};
    if (freelancer?.user?.email) {
      await sendNotificationEmail({
        to: freelancer.user.email,
        subject: `🎉 Proposal Accepted: ${proposal.title}`,
        message: `Great news! ${proposal.client?.name || clientName} has accepted your proposal "${proposal.title}".`,
      });
    }
  } catch (emailErr) {
    console.log("Could not send acceptance notification email:", emailErr.message);
  }

  return NextResponse.json({
    success: true,
    portalToken,
    projectId: project?.id,
  });
}
