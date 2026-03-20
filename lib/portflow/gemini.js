import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: 'v1beta',
});

/**
 * Fetch the user's voice samples from Supabase for tone matching.
 * @param {object} supabase - Supabase client (server-side)
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<string[]>} Array of sample texts
 */
export async function fetchVoiceSamples(supabase, userId) {
  const { data, error } = await supabase
    .from("portflow_voice_samples")
    .select("sample_text, context")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching voice samples:", error);
    return [];
  }

  return data || [];
}

/**
 * Build the voice context block for the AI prompt.
 * @param {Array} voiceSamples - Array of { sample_text, context } objects
 * @returns {string} Formatted voice context string
 */
function buildVoiceContext(voiceSamples) {
  if (!voiceSamples || voiceSamples.length === 0) {
    return `
Write in a warm, professional, and conversational tone.
Avoid corporate jargon. Sound human and approachable.
`;
  }

  const samplesText = voiceSamples
    .map(
      (s, i) =>
        `--- Sample ${i + 1} (${s.context || "general"}) ---\n${s.sample_text}`
    )
    .join("\n\n");

  return `
IMPORTANT — VOICE MATCHING INSTRUCTIONS:
The following are real writing samples from this freelancer.
You MUST match their exact tone, vocabulary, sentence length,
level of formality, and personality in every section.
Do not write like a generic AI. Write like THIS person:

${samplesText}

Now write the proposal sounding exactly like the samples above.
`;
}

/**
 * Generate a full proposal using Gemini AI with voice context injection.
 *
 * @param {object} options
 * @param {string} options.brief - The project brief / description
 * @param {string} [options.clientName] - Client's name for personalization
 * @param {string} [options.projectTitle] - Title of the project
 * @param {number} [options.amount] - Proposed budget amount
 * @param {string} [options.currency] - Currency code (USD, EUR, etc.)
 * @param {Array}  [options.voiceSamples] - Array of { sample_text, context }
 * @returns {Promise<object>} Generated proposal content as structured sections
 */
export async function generateProposal({
  brief,
  clientName = "the client",
  projectTitle = "the project",
  amount,
  currency = "USD",
  voiceSamples = [],
}) {
  const voiceContext = buildVoiceContext(voiceSamples);

  const amountStr = amount
    ? `The proposed budget is ${new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).format(amount)}.`
    : "";

  const prompt = `You are a professional proposal writer for a freelancer.
Your job is to generate a compelling, detailed project proposal.

${voiceContext}

## PROJECT DETAILS
- **Project Title**: ${projectTitle}
- **Client**: ${clientName}
- **Brief**: ${brief}
${amountStr}

## INSTRUCTIONS
Generate a professional proposal with these exact sections (return JSON with these keys):

1. "executive_summary" — A compelling 2-3 paragraph overview of the project. Hook the client immediately.
2. "scope_of_work" — Detailed breakdown of deliverables, organized in numbered phases.
3. "timeline" — A realistic timeline broken into weeks or phases with clear milestones.
4. "investment" — Budget breakdown and payment terms. ${amountStr ? `Use the budget of ${amount} ${currency}.` : "Suggest a reasonable budget."}
5. "why_us" — A persuasive section on why the client should choose this freelancer. Highlight experience, approach, and value.

CRITICAL: Output ONLY valid JSON with the 5 keys above. Each value should be a string.
Do NOT include markdown code fences or any text outside the JSON object.
${voiceSamples.length > 0 ? "CRITICAL: Match the writing style from the voice samples EXACTLY." : "Use a professional, confident, and approachable tone."}`;

  try {
    console.log("[Portflow AI] Generating proposal with gemini-pro...");

    let result;
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const model = ai.getGenerativeModel({ model: "gemini-pro" });
        result = await model.generateContent(prompt);
        break; // Success — exit retry loop
      } catch (retryError) {
        const isRateLimit =
          retryError.status === 429 ||
          retryError.message?.includes("RESOURCE_EXHAUSTED") ||
          retryError.message?.includes("429");

        if (isRateLimit && attempt < maxRetries - 1) {
          // Try to parse retry delay from error, default to exponential backoff
          let waitMs = (attempt + 1) * 15000; // 15s, 30s, 45s
          const retryMatch = retryError.message?.match(/retry in ([\d.]+)s/i);
          if (retryMatch) {
            waitMs = Math.ceil(parseFloat(retryMatch[1]) * 1000) + 1000;
          }
          console.log(
            `[Portflow AI] Rate limited (attempt ${attempt + 1}/${maxRetries}). Retrying in ${Math.round(waitMs / 1000)}s...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitMs));
        } else {
          throw retryError;
        }
      }
    }

    if (!result) {
      throw new Error("Failed to get response from Gemini after retries.");
    }
    
    const response = await result.response;
    let text = response.text().trim();

    // Strip markdown code fences if present
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    console.log("[Portflow AI] Proposal generated successfully.");
    const parsed = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.error("Gemini proposal generation error:", error);
    throw new Error(`AI Generation Failed: ${error.message}`);
  }
}

/**
 * Generate a quick proposal summary for previews.
 *
 * @param {string} brief - The project brief
 * @param {Array} voiceSamples - Voice samples for tone matching
 * @returns {Promise<string>} A short summary paragraph
 */
export async function generateProposalSummary(brief, voiceSamples = []) {
  const voiceContext = buildVoiceContext(voiceSamples);

  const prompt = `You are a freelancer writing a one-paragraph proposal summary.
${voiceContext}
Brief: ${brief}

Write a compelling 2-3 sentence summary of what you would propose for this project.
${voiceSamples.length > 0 ? "Match the writing style from the samples." : "Be professional and confident."}
Output only the summary text, no formatting.`;

  try {
    const model = ai.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text.trim();
  } catch (error) {
    console.error("Gemini summary generation error:", error);
    throw new Error(`Summary Generation Failed: ${error.message}`);
  }
}
