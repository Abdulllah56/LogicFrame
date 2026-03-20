import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  generateProposal,
  fetchVoiceSamples,
} from "@/lib/portflow/gemini";

// POST /api/portflow/proposals/generate — AI generate proposal content
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
  const { brief, client_id, title, amount, currency } = body;

  if (!brief) {
    return NextResponse.json(
      { error: "Brief is required" },
      { status: 400 }
    );
  }

  // Fetch client info for personalization
  let clientName = "the client";
  if (client_id) {
    const { data: clientData } = await supabase
      .from("portflow_clients")
      .select("name")
      .eq("id", client_id)
      .single();
    if (clientData) {
      clientName = clientData.name;
    }
  }

  // Fetch voice samples for tone matching
  const voiceSamples = await fetchVoiceSamples(supabase, user.id);

  try {
    const content = await generateProposal({
      brief,
      clientName,
      projectTitle: title || "the project",
      amount: amount ? parseFloat(amount) : undefined,
      currency: currency || "USD",
      voiceSamples,
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Proposal generation error:", error);
    const isRateLimit = error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED");
    const userMessage = isRateLimit
      ? "AI rate limit reached. Please wait a moment and try again."
      : "Failed to generate proposal. Please try again.";
    return NextResponse.json(
      { error: userMessage },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}
