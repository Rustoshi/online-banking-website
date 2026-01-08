import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender configuration
const DEFAULT_FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@example.com';
const DEFAULT_FROM_NAME = process.env.EMAIL_FROM_NAME || '';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  tags?: { name: string; value: string }[];
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const {
    to,
    subject,
    html,
    from = `${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>`,
    replyTo,
    cc,
    bcc,
    tags,
  } = options;

  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn('[EMAIL] RESEND_API_KEY not configured. Email not sent.');
    console.log(`[EMAIL] Would send to: ${Array.isArray(to) ? to.join(', ') : to}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo,
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
      tags,
    });

    if (error) {
      console.error('[EMAIL] Resend error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(`[EMAIL] Sent successfully to ${Array.isArray(to) ? to.join(', ') : to}. ID: ${data?.id}`);
    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('[EMAIL] Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send multiple emails in batch
 */
export async function sendBatchEmails(
  emails: SendEmailOptions[]
): Promise<{ sent: number; failed: number; results: SendEmailResult[] }> {
  const results: SendEmailResult[] = [];
  let sent = 0;
  let failed = 0;

  // Process emails in batches of 10 to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(sendEmail));
    
    for (const result of batchResults) {
      results.push(result);
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }

    // Add a small delay between batches to respect rate limits
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return { sent, failed, results };
}

export { resend };
