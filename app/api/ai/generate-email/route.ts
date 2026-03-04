import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
    try {
        const { project, requests, config, senderName } = await req.json();

        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            return NextResponse.json({ error: 'Server API_KEY not configured for AI' }, { status: 500 });
        }

        const ai = new GoogleGenerativeAI(apiKey);

        const model = ai.getGenerativeModel({
            model: 'gemini-pro',
        });

        const context = `
      You are a professional project manager writing an email to a client.

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
      Your entire response must be only the raw JSON object, without any markdown formatting like \`\`\`json or \`\`\`.
    `;

        const result = await model.generateContent(context);
        const response = await result.response;
        let text = response.text();

        // Clean the response to ensure it is valid JSON
        // It might be wrapped in ```json ... ``` or have other artifacts
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid JSON response from AI');
        }
        text = jsonMatch[0];

        const json = JSON.parse(text);
        return NextResponse.json(json, { status: 200 });

    } catch (error: any) {
        console.error('AI Generation Error:', error);

        if (error.status === 429 || (error.message && error.message.includes('429'))) {
            return NextResponse.json({ error: 'AI Quota Exceeded. Please try again in a minute.' }, { status: 429 });
        }

        return NextResponse.json({ error: 'AI generation failed', details: error.message }, { status: 500 });
    }
}
