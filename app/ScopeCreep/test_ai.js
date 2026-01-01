const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function testAI() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return;

    const ai = new GoogleGenAI({ apiKey: apiKey });
    const context = "Write a short email to a client saying hello.";

    try {
        console.log('Attempting to generate content with gemini-1.5-flash-002...');
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash-002',
            contents: context,
            config: {
                responseMimeType: "application/json"
            }
        });

        console.log('Response:', response);
        console.log('Text:', response.text());
    } catch (error) {
        console.error('Error:', error);
    }
}

testAI();
