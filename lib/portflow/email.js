import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Generate a branded HTML email template for a proposal.
 *
 * @param {object} options
 * @param {string} options.proposalTitle - Title of the proposal
 * @param {string} options.clientName - Client's name
 * @param {string} options.freelancerName - Freelancer's name
 * @param {string} options.amount - Formatted amount string
 * @param {string} options.summary - Brief proposal summary
 * @param {string} options.portalUrl - Full URL to the client portal proposal view
 * @returns {string} HTML email content
 */
function buildProposalEmailHtml({
  proposalTitle,
  clientName,
  freelancerName,
  amount,
  summary,
  portalUrl,
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#030712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#3b82f6);padding:12px 16px;border-radius:12px;margin-bottom:16px;">
        <span style="color:#030712;font-weight:900;font-size:18px;letter-spacing:-0.5px;">Portflow</span>
      </div>
      <p style="color:#64748b;font-size:13px;margin:0;">Proposal from ${freelancerName}</p>
    </div>
    
    <!-- Main Card -->
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:32px;margin-bottom:24px;">
      <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:0 0 8px 0;">${proposalTitle}</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0 0 24px 0;">
        Hi ${clientName}, a new proposal has been prepared for you.
      </p>
      
      <!-- Amount Badge -->
      ${
        amount
          ? `<div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:16px;margin-bottom:24px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:1px;">Proposed Investment</p>
              <p style="color:#10b981;font-size:28px;font-weight:800;margin:0;">${amount}</p>
            </div>`
          : ""
      }
      
      <!-- Summary -->
      ${
        summary
          ? `<div style="background:rgba(255,255,255,0.02);border-radius:12px;padding:16px;margin-bottom:24px;">
              <p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0;">${summary}</p>
            </div>`
          : ""
      }
      
      <!-- CTA Button -->
      <div style="text-align:center;">
        <a href="${portalUrl}" style="display:inline-block;background:linear-gradient(135deg,#06b6d4,#3b82f6);color:#ffffff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;box-shadow:0 4px 24px rgba(6,182,212,0.3);">
          View Full Proposal →
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align:center;padding-top:16px;">
      <p style="color:#475569;font-size:12px;margin:0;">
        Sent via <span style="color:#22d3ee;font-weight:700;">Portflow</span> by <span style="color:#22d3ee;font-weight:700;">LogicFrame</span>
      </p>
      <p style="color:#334155;font-size:11px;margin:8px 0 0 0;">
        If you didn't expect this email, you can safely ignore it.
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Send a proposal email to a client via Resend.
 *
 * @param {object} options
 * @param {string} options.to - Client's email address
 * @param {string} options.proposalTitle - Title of the proposal
 * @param {string} options.clientName - Client's name
 * @param {string} options.freelancerName - Freelancer's name
 * @param {string} options.freelancerEmail - Freelancer's email (for reply-to)
 * @param {string} [options.amount] - Formatted amount string
 * @param {string} [options.summary] - Brief proposal summary
 * @param {string} options.portalUrl - Full URL to the proposal portal
 * @returns {Promise<object>} Resend API response
 */
export async function sendProposalEmail({
  to,
  proposalTitle,
  clientName,
  freelancerName,
  freelancerEmail,
  amount,
  summary,
  portalUrl,
}) {
  const html = buildProposalEmailHtml({
    proposalTitle,
    clientName,
    freelancerName,
    amount,
    summary,
    portalUrl,
  });

  try {
    const { data, error } = await resend.emails.send({
      from: "Portflow <onboarding@resend.dev>",
      to: [to],
      replyTo: freelancerEmail,
      subject: `New Proposal: ${proposalTitle}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(`Email send failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
}

/**
 * Send a notification email (generic).
 *
 * @param {object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Plain text message
 * @returns {Promise<object>} Resend API response
 */
export async function sendNotificationEmail({ to, subject, message }) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Portflow <onboarding@resend.dev>",
      to: [to],
      subject,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#030712;color:#fff;border-radius:12px;">
          <h2 style="color:#22d3ee;margin:0 0 16px 0;">${subject}</h2>
          <p style="color:#cbd5e1;line-height:1.6;">${message}</p>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:24px 0;" />
          <p style="color:#475569;font-size:12px;">Sent via Portflow by LogicFrame</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend notification error:", error);
      throw new Error(`Notification email failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Notification email error:", error);
    throw error;
  }
}
