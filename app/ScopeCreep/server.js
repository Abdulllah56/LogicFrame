// Import dependencies
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
let supabase;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  console.log('✅ Supabase JS Client initialized');
} else {
  console.error('❌ FATAL: SUPABASE_URL or SUPABASE_ANON_KEY missing in .env');
  console.error('   Please check your .env file.');
  process.exit(1);
}

// Gemini AI Client
if (!process.env.API_KEY || process.env.API_KEY === 'your_gemini_api_key_here') {
  console.warn('\x1b[33m%s\x1b[0m', '⚠️  WARNING: API_KEY is missing. AI features will not work.');
} else {
  console.log('✅ Gemini API Key found');
}

const ai = (process.env.API_KEY && process.env.API_KEY !== 'your_gemini_api_key_here')
  ? new GoogleGenerativeAI(process.env.API_KEY)
  : null;

// Helper to convert DB snake_case to Frontend camelCase
const toCamel = (o) => {
  if (o === null || typeof o !== 'object') return o;
  if (Array.isArray(o)) return o.map(toCamel);
  const n = {};
  Object.keys(o).forEach((k) => {
    const camel = k.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    n[camel] = toCamel(o[k]);
  });
  return n;
};

// Status Check
app.get('/', (req, res) => {
  res.send('Scope Creep Protector Backend (Supabase Client + Email + AI) is Running.');
});

// --- AUTH ENDPOINTS ---

app.post('/api/signup', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    // Check if user exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (checkError) throw checkError;

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        email,
        name,
        password, // Note: In production, hash this password!
        settings: { name, email, defaultHourlyRate: 100, currency: 'USD' }
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json(toCamel(newUser));
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: 'Signup failed', details: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (error) throw error;

    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json(toCamel(user));
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// --- DATA ENDPOINTS ---

app.get('/api/projects', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'User ID required' });

  try {
    // Fetch Projects
    const { data: projectsData, error: projError } = await supabase
      .from('projects')
      .select(`
        id, project_name, client_name, client_email, project_price, 
        hourly_rate, currency,
        timeline, start_date, end_date, status, created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (projError) throw projError;

    const projects = toCamel(projectsData);

    // Fetch Deliverables & Requests for these projects
    for (let p of projects) {
      // Deliverables
      const { data: delData, error: delError } = await supabase
        .from('deliverables')
        .select('id, description, category, status, scope_type')
        .eq('project_id', p.id);

      if (delError) throw delError;

      p.deliverables = delData.map(d => ({
        ...toCamel(d),
        type: d.scope_type === 'in_scope' ? 'IN_SCOPE' : 'OUT_SCOPE'
      }));

      // Requests
      const { data: reqData, error: reqError } = await supabase
        .from('requests')
        .select(`
          id, request_text, request_date, category, 
          scope_status, estimated_hours, estimated_cost, timeline_impact, 
          notes, status
        `)
        .eq('project_id', p.id)
        .order('created_at', { ascending: false });

      if (reqError) throw reqError;

      p.requests = reqData.map(r => ({
        ...toCamel(r),
        date: r.request_date,
        dateRequested: r.request_date,
        justification: r.notes,
        note: r.notes,
        scopeStatus: r.scope_status === 'in_scope' ? 'IN_SCOPE' : r.scope_status === 'out_of_scope' ? 'OUT_SCOPE' : 'UNCLEAR'
      }));

      // Ensure defaults if missing
      p.hourlyRate = p.hourlyRate || 100;
      p.currency = p.currency || '$';
    }

    res.json(projects);
  } catch (err) {
    console.error("Fetch Projects Error:", err);
    res.status(500).json({ error: 'Failed to fetch projects', details: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  const { userId, project } = req.body;

  try {
    // 1. Upsert Project
    const { error: projError } = await supabase
      .from('projects')
      .upsert({
        id: project.id,
        user_id: userId,
        project_name: project.projectName,
        client_name: project.clientName,
        client_email: project.clientEmail,
        project_price: project.projectPrice,
        hourly_rate: project.hourlyRate || 0,
        currency: project.currency || '$',
        timeline: project.timeline,
        start_date: project.startDate,
        end_date: project.endDate,
        status: project.status
      }, { onConflict: 'id' });

    if (projError) throw projError;

    // 2. Sync Deliverables (Delete all and re-insert)
    await supabase.from('deliverables').delete().eq('project_id', project.id);

    if (project.deliverables.length > 0) {
      const { error: delError } = await supabase
        .from('deliverables')
        .insert(project.deliverables.map(d => ({
          id: d.id,
          project_id: project.id,
          description: d.description,
          category: d.category,
          status: d.status,
          scope_type: d.type === 'IN_SCOPE' ? 'in_scope' : 'out_of_scope'
        })));
      if (delError) throw delError;
    }

    // 3. Sync Requests (Delete all and re-insert)
    await supabase.from('requests').delete().eq('project_id', project.id);

    if (project.requests.length > 0) {
      const { error: reqError } = await supabase
        .from('requests')
        .insert(project.requests.map(r => ({
          id: r.id,
          project_id: project.id,
          request_text: r.requestText,
          request_date: r.date || r.dateRequested,
          category: r.category,
          scope_status: r.scopeStatus === 'IN_SCOPE' ? 'in_scope' : r.scopeStatus === 'OUT_SCOPE' ? 'out_of_scope' : 'unclear',
          estimated_hours: r.estimatedHours || 0,
          estimated_cost: r.estimatedCost || 0,
          timeline_impact: r.timelineImpact || '',
          notes: r.justification || r.note || '',
          status: r.status
        })));
      if (reqError) throw reqError;
    }

    res.json({ success: true });
  } catch (e) {
    console.error("Save Project Error:", e);
    res.status(500).json({ error: 'Transaction failed', details: e.message });
  }
});

// --- EMAIL ENDPOINT ---
app.post('/api/send-email', async (req, res) => {
  const { to, subject, body, userEmail, userPass, senderName } = req.body;

  if (!to || !subject || !body || !userEmail || !userPass) {
    return res.status(400).json({ error: 'Missing required fields or credentials' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: userEmail, pass: userPass },
      tls: { rejectUnauthorized: false }
    });
    await transporter.verify();
    const fromField = senderName ? `"${senderName}" <${userEmail}>` : userEmail;
    const info = await transporter.sendMail({ from: fromField, to, subject, text: body });
    res.status(200).json({ message: 'Email sent successfully', messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

// --- AI GENERATION ENDPOINT ---
app.post('/api/ai/generate-email', async (req, res) => {
  const { project, requests, config, senderName } = req.body;

  if (!ai) {
    return res.status(500).json({ error: 'Server API_KEY not configured for AI' });
  }

  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-pro',
    });

    const context = `
      You are a professional project manager writing an email to a client.

      SENDER: ${senderName || 'The Project Manager'}
      CLIENT: ${project.clientName}
      PROJECT: ${project.projectName}
      
      CONTEXT OF CHANGES:
      ${requests.map(r => `- ${r.requestText} (Cost: $${r.estimatedCost}, Impact: ${r.timelineImpact})`).join('\n')}
      
      TOTAL EXTRA COST: $${requests.reduce((sum, r) => sum + r.estimatedCost, 0)}
      
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
    res.json(json);

  } catch (error) {
    console.error('AI Generation Error:', error);
    if (error.response) {
      console.error('AI Error Response:', JSON.stringify(error.response, null, 2));
    }

    if (error.status === 429 || (error.message && error.message.includes('429'))) {
      return res.status(429).json({ error: 'AI Quota Exceeded. Please try again in a minute.' });
    }

    res.status(500).json({ error: 'AI generation failed', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://127.0.0.1:${PORT}`);
  console.log(`   Please verify by opening http://127.0.0.1:${PORT} in your browser.`);
});