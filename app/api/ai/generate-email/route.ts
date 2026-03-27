import { NextResponse } from 'next/server';

// Strictly use the OpenRouter API Key (DO NOT fallback to API_KEY as that is the Google Gemini key and causes 401 format errors)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Support both email generation and scope import modes
        const { mode } = body;

        if (mode === 'scope-import') {
            return await handleScopeImport(body);
        }

        return await handleEmailGeneration(body);

    } catch (error: any) {
        console.error('AI Generation Error:', error);

        if (error.status === 429 || (error.message && error.message.includes('429'))) {
            return NextResponse.json({ error: 'AI Quota Exceeded. Please try again in a minute.' }, { status: 429 });
        }

        return NextResponse.json({ error: 'AI generation failed', details: error.message }, { status: 500 });
    }
}

async function callOpenRouter(prompt: string) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
            // "HTTP-Referer": "YOUR_APP_URL", // Optional
            // "X-Title": "ScopeCreep", // Optional
        },
        body: JSON.stringify({
            model: "google/gemini-2.0-flash-lite-001", // Stable OpenRouter model ID for Gemini 2.0 Flash Lite
            messages: [
                { role: "user", content: prompt }
            ]
        })
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(`OpenRouter Error: ${response.status} ${JSON.stringify(errData)}`);
    }

    const json = await response.json();
    return json.choices[0].message.content;
}

async function handleEmailGeneration(body: any) {
    const { project, requests, config, senderName } = body;

    const context = `You are a professional project manager writing an email to a client.

SENDER: ${senderName || 'The Project Manager'}
CLIENT: ${project.clientName}
PROJECT: ${project.projectName}

CONTEXT OF CHANGES:
${requests.map((r: any) => `- ${r.requestText} (Cost: $${r.estimatedCost}, Impact: ${r.timelineImpact})`).join('\n')}

TOTAL EXTRA COST: $${requests.reduce((sum: number, r: any) => sum + r.estimatedCost, 0)}

USER INSTRUCTIONS:
- Tone: ${config.tone}
- Intent: ${config.intent}
- Length: ${config.length}
- Custom Instructions: ${config.customInstructions}

TASK:
Write a valid JSON object with "subject" and "body" fields.
The body should be a string with newline characters for formatting.
Do not include placeholders like [Your Name]; use the Sender Name provided or sign off generically if it's missing.
Your entire response must be only the raw JSON object, without any markdown formatting.`;

    let text = await callOpenRouter(context);
    text = text?.trim() || '';

    // Strip markdown code fences if present
    if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
    }

    const json = JSON.parse(jsonMatch[0]);
    return NextResponse.json(json, { status: 200 });
}

async function handleScopeImport(body: any) {
    const { text: projectText } = body;

    if (!projectText || projectText.trim().length < 10) {
        return NextResponse.json({ error: 'Please provide project text to analyze.' }, { status: 400 });
    }

    const prompt = `You are a project scope analyzer. Extract ALL deliverables from the following project brief/contract text.

PROJECT TEXT:
${projectText}

TASK:
Extract deliverables and categorize each as either IN_SCOPE or OUT_SCOPE based on the text.
For each deliverable, provide:
- description: A concise description of the deliverable
- category: One of "Design", "Development", "Content", "Marketing", "Other"
- type: "IN_SCOPE" if it's included/promised, "OUT_SCOPE" if it's explicitly excluded or mentioned as not included

Return a valid JSON object with this exact structure:
{
  "inScope": [{ "description": "...", "category": "..." }],
  "outScope": [{ "description": "...", "category": "..." }]
}

Be thorough — extract every distinct deliverable mentioned. If something is ambiguous, include it as IN_SCOPE.
Your entire response must be only the raw JSON object, without any markdown formatting.`;

    let text = await callOpenRouter(prompt);
    text = text?.trim() || '';

    if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
    }

    const json = JSON.parse(jsonMatch[0]);
    return NextResponse.json(json, { status: 200 });
}
