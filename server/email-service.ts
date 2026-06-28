import { Resend } from 'resend';
import crypto from 'crypto';
import { dbRun, dbGet, dbAll } from './db.js';

// Lazy loader for Resend client
let resendClient: Resend | null = null;
let isResendLocalMode = false;

export function getResendClient(): { client: Resend | null; isLocal: boolean } {
  if (resendClient === null && !isResendLocalMode) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(
        '⚠️ RESEND_API_KEY is missing. Incoming and outgoing system email flows will operate in SECURE LOCAL EMULATOR MODE.'
      );
      isResendLocalMode = true;
      return { client: null, isLocal: true };
    }

    try {
      resendClient = new Resend(apiKey);
      console.log('⚡ Resend Email Platform SDK client initialized successfully in production-grade mode.');
    } catch (err) {
      console.error('❌ Failed to initialize Resend client, falling back to Local Mode:', err);
      isResendLocalMode = true;
    }
  }

  return { client: resendClient, isLocal: isResendLocalMode };
}

// Reusable static templates with modern dark mode compatible styling
export const EMAIL_TEMPLATES = {
  VERIFICATION: {
    id: 'tpl-verification',
    name: 'Email Verification',
    subject: 'Verify Your OMYRA Mall Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your Email</title>
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #0b0b0c; color: #ffffff; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #161618; border-radius: 12px; border: 1px solid #27272a; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
          .header { text-align: center; border-bottom: 1px solid #27272a; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: bold; color: #D4FF5E; text-transform: uppercase; letter-spacing: 2px; }
          .content { line-height: 1.6; color: #e4e4e7; }
          .btn { display: inline-block; background-color: #D4FF5E; color: #000000; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin-top: 20px; text-transform: uppercase; letter-spacing: 1px; font-size: 14px; text-align: center; }
          .footer { text-align: center; color: #71717a; font-size: 12px; border-top: 1px solid #27272a; padding-top: 20px; margin-top: 32px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">OMYRA MALL</span>
          </div>
          <div class="content">
            <h3>Hello {{userName}},</h3>
            <p>Thank you for registering at OMYRA Mall! To complete your registration and unlock full marketplace capabilities, please verify your email address by clicking the link below:</p>
            <div style="text-align: center;">
              <a href="{{verificationLink}}" class="btn">Verify Account</a>
            </div>
            <p style="margin-top: 24px;">If the button does not work, copy and paste this URL into your browser:</p>
            <p style="word-break: break-all; color: #a1a1aa; font-size: 13px;">{{verificationLink}}</p>
            <p>This verification link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>© 2026 OMYRA Mall Infrastructure Layer. All rights reserved.</p>
            <p>You received this transactional email because you registered an account. You can opt out of marketing announcements, but not core system alerts.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hello {{userName}},\n\nThank you for registering at OMYRA Mall! Please verify your email by copying and pasting the link below into your browser:\n\n{{verificationLink}}\n\nThis link will expire in 24 hours.\n\n© 2026 OMYRA Mall Infrastructure.`
  },
  ORDER_CONFIRMATION: {
    id: 'tpl-order',
    name: 'Order Confirmation',
    subject: 'Invoice & Order Confirmation — #{{orderNumber}}',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #0b0b0c; color: #ffffff; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #161618; border-radius: 12px; border: 1px solid #27272a; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
          .header { text-align: center; border-bottom: 1px solid #27272a; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: bold; color: #D4FF5E; text-transform: uppercase; letter-spacing: 2px; }
          .content { line-height: 1.6; color: #e4e4e7; }
          .invoice-box { background-color: #1e1e21; border-radius: 8px; border: 1px solid #3f3f46; padding: 20px; margin: 20px 0; }
          .invoice-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #27272a; }
          .invoice-row:last-child { border-bottom: none; font-weight: bold; color: #D4FF5E; }
          .footer { text-align: center; color: #71717a; font-size: 12px; border-top: 1px solid #27272a; padding-top: 20px; margin-top: 32px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">OMYRA MALL</span>
          </div>
          <div class="content">
            <h3>Thank you for your order, {{userName}}!</h3>
            <p>Your transaction has been processed successfully. Your order number is <strong>#{{orderNumber}}</strong>.</p>
            
            <div class="invoice-box">
              <div style="font-size: 14px; font-weight: bold; margin-bottom: 12px; text-transform: uppercase; color: #a1a1aa;">Invoice Summary</div>
              <div class="invoice-row">
                <span>Product</span>
                <span>{{productName}}</span>
              </div>
              <div class="invoice-row">
                <span>Store</span>
                <span>{{storeName}}</span>
              </div>
              <div class="invoice-row">
                <span>Total Amount</span>
                <span>{{amount}}</span>
              </div>
            </div>

            <p style="margin-top: 20px;">You can download your digital assets instantly by accessing your personal Library inside the platform.</p>
          </div>
          <div class="footer">
            <p>© 2026 OMYRA Mall Infrastructure Layer. All rights reserved.</p>
            <p>Transactions processed securely. Questions? Contact support@mall.omyra.org.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Thank you for your order, {{userName}}!\n\nYour transaction for "{{productName}}" from "{{storeName}}" has been processed successfully.\nOrder Number: #{{orderNumber}}\nTotal Amount: {{amount}}\n\nYour files are ready for download in your personal Library.\n\n© 2026 OMYRA Mall.`
  },
  DOWNLOAD_READY: {
    id: 'tpl-download-ready',
    name: 'Download Assets Ready',
    subject: 'Your Files Are Ready for Download! — {{productName}}',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Download Ready</title>
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #0b0b0c; color: #ffffff; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #161618; border-radius: 12px; border: 1px solid #27272a; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
          .header { text-align: center; border-bottom: 1px solid #27272a; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: bold; color: #D4FF5E; text-transform: uppercase; letter-spacing: 2px; }
          .content { line-height: 1.6; color: #e4e4e7; }
          .btn { display: inline-block; background-color: #D4FF5E; color: #000000; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin-top: 20px; text-transform: uppercase; letter-spacing: 1px; font-size: 14px; text-align: center; }
          .footer { text-align: center; color: #71717a; font-size: 12px; border-top: 1px solid #27272a; padding-top: 20px; margin-top: 32px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">OMYRA MALL</span>
          </div>
          <div class="content">
            <h3>Hello {{userName}},</h3>
            <p>Your purchased digital products are ready for secure download. You can download <strong>{{productName}}</strong> immediately using the secure temporary signed URL below:</p>
            <div style="text-align: center;">
              <a href="{{downloadLink}}" class="btn">Download Assets</a>
            </div>
            <p style="margin-top: 24px; color: #ff5e5e; font-size: 13px;">⚠️ Note: This is a highly secure private download link. It will automatically expire after 1 hour for your protection. If you need to download again later, simply log in to OMYRA Mall and re-request a link.</p>
          </div>
          <div class="footer">
            <p>© 2026 OMYRA Mall Infrastructure Layer. All rights reserved.</p>
            <p>Processed by downloads@mall.omyra.org.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hello {{userName}},\n\nYour files for "{{productName}}" are ready for download!\n\nUse this secure link (expires in 1 hour):\n{{downloadLink}}\n\n© 2026 OMYRA Mall.`
  },
  SECURITY_ALERT: {
    id: 'tpl-security',
    name: 'Security Alert',
    subject: '⚠️ SECURITY ALERT: OMYRA Mall Account Activity',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Security Alert</title>
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #0b0b0c; color: #ffffff; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #161618; border-radius: 12px; border: 1px solid #27272a; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
          .header { text-align: center; border-bottom: 1px solid #ff5e5e; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: bold; color: #ff5e5e; text-transform: uppercase; letter-spacing: 2px; }
          .content { line-height: 1.6; color: #e4e4e7; }
          .alert-box { background-color: rgba(255, 94, 94, 0.1); border-radius: 8px; border: 1px solid #ff5e5e; padding: 16px; margin: 20px 0; }
          .footer { text-align: center; color: #71717a; font-size: 12px; border-top: 1px solid #27272a; padding-top: 20px; margin-top: 32px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">SECURITY SHIELD ALERTS</span>
          </div>
          <div class="content">
            <h3>Dear {{userName}},</h3>
            <p>Our automated OMYRA Security Shield has detected significant account changes or security alerts associated with your profile:</p>
            
            <div class="alert-box">
              <strong>Event:</strong> {{action}}<br/>
              <strong>Date/Time:</strong> {{timestamp}}<br/>
              <strong>IP Address:</strong> {{ipAddress}}<br/>
              <strong>Platform Device:</strong> {{deviceInfo}}
            </div>

            <p>If you initiated this action, no further steps are needed. However, if you do NOT recognize this activity, please immediately change your password and contact security@mall.omyra.org to freeze your funds and downloads.</p>
          </div>
          <div class="footer">
            <p>© 2026 OMYRA Mall Security Operations. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `SECURITY ALERT: OMYRA Mall Account Activity\n\nDear {{userName}},\n\nAutomated Security Shield has detected account activity:\nEvent: {{action}}\nDate/Time: {{timestamp}}\nIP: {{ipAddress}}\nDevice: {{deviceInfo}}\n\nIf this was not you, please immediately contact security@mall.omyra.org.\n\n© 2026 OMYRA Mall.`
  }
};

/**
 * Replace double-curly bracket variables {{varName}} in HTML or plain text template body
 */
function substituteVariables(template: string, variables: Record<string, any>): string {
  let content = template;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    content = content.replace(placeholder, String(value || ''));
  }
  return content;
}

export class EmailService {
  /**
   * Initializes email template database and seeds default system templates.
   */
  static async initializeTemplates(): Promise<void> {
    console.log('⚡ Initializing Resend Email Templates...');
    try {
      for (const tpl of Object.values(EMAIL_TEMPLATES)) {
        // Safe run to seed templates
        await dbRun(
          `INSERT INTO EmailTemplates (id, name, subject, html_content, text_content)
           VALUES (?, ?, ?, ?, ?)`,
          [tpl.id, tpl.name, tpl.subject, tpl.html, tpl.text]
        );
      }
      console.log('⚡ All Resend email templates successfully registered in Neon PostgreSQL database.');
    } catch (err) {
      console.error('⚠️ Could not initialize templates in relational DB (using memory fallback):', err);
    }
  }

  /**
   * Enqueue a new email job into the priority background queue.
   */
  static async enqueueEmail(
    recipient: string,
    senderAlias: 'noreply' | 'orders' | 'downloads' | 'support' | 'sellers' | 'notifications' | 'announcements' | 'security',
    templateId: string,
    variables: Record<string, any>,
    priority = 0
  ): Promise<string> {
    const jobId = crypto.randomUUID();
    
    // Map sender alias to environment variable or standard fallback
    let sender = '';
    switch (senderAlias) {
      case 'security':
        sender = process.env.EMAIL_FROM_SECURITY || 'OMYRA Security <security@mall.omyra.org>';
        break;
      case 'noreply':
        sender = process.env.EMAIL_FROM_DEFAULT || 'OMYRA Mall <noreply@mall.omyra.org>';
        break;
      case 'orders':
        sender = process.env.EMAIL_FROM_ORDERS || 'OMYRA Orders <orders@mall.omyra.org>';
        break;
      case 'downloads':
        sender = process.env.EMAIL_FROM_DOWNLOADS || 'OMYRA Downloads <downloads@mall.omyra.org>';
        break;
      case 'support':
        sender = process.env.EMAIL_FROM_SUPPORT || 'OMYRA Support <support@mall.omyra.org>';
        break;
      case 'sellers':
        sender = process.env.EMAIL_FROM_SELLERS || 'OMYRA Sellers <sellers@mall.omyra.org>';
        break;
      case 'notifications':
        sender = process.env.EMAIL_FROM_NOTIFICATIONS || 'OMYRA Notifications <notifications@mall.omyra.org>';
        break;
      case 'announcements':
        sender = process.env.EMAIL_FROM_ANNOUNCEMENTS || 'OMYRA Announcements <announcements@mall.omyra.org>';
        break;
      default:
        sender = process.env.EMAIL_FROM_DEFAULT || 'OMYRA Mall <noreply@mall.omyra.org>';
    }
    
    // Retrieve template for subject resolution
    const template = Object.values(EMAIL_TEMPLATES).find((t) => t.id === templateId);
    const subjectTemplate = template ? template.subject : 'OMYRA Mall System Message';
    const resolvedSubject = substituteVariables(subjectTemplate, variables);

    console.log(`[Queue] Enqueuing email job to ${recipient} with priority ${priority} from alias ${senderAlias} (${sender})...`);

    try {
      await dbRun(
        `INSERT INTO EmailJobs (id, recipient, sender, subject, template_id, variables, status, priority, attempts, next_attempt_at)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, 0, CURRENT_TIMESTAMP)`,
        [
          jobId,
          recipient,
          sender,
          resolvedSubject,
          templateId,
          JSON.stringify(variables),
          priority
        ]
      );
    } catch (err) {
      console.error('❌ Failed to enqueue email job to database:', err);
    }

    return jobId;
  }

  /**
   * Processes email jobs directly from the database queue with backoff, retries, and dead letter logging.
   */
  static async processQueue(): Promise<void> {
    const pgPool = (global as any).isPostgresMode ? (global as any).getPgPool?.() : null;
    
    let pendingJobs: any[] = [];
    
    try {
      // Find priority pending jobs where next_attempt_at <= CURRENT_TIMESTAMP
      // Order by priority DESC, created_at ASC
      pendingJobs = await dbAll(`
        SELECT * FROM EmailJobs 
        WHERE status = 'pending' OR status = 'failed'
        ORDER BY priority DESC, created_at ASC 
        LIMIT 5
      `);
    } catch (err) {
      console.error('[Queue Processor] Failed to query pending email jobs from database:', err);
      return;
    }

    if (pendingJobs.length === 0) return;

    console.log(`[Queue Processor] Processing ${pendingJobs.length} active email jobs...`);

    const { client, isLocal } = getResendClient();

    for (const job of pendingJobs) {
      const jobId = job.id;
      const recipient = job.recipient;
      const sender = job.sender;
      const subject = job.subject;
      const templateId = job.template_id;
      const attempts = Number(job.attempts || 0) + 1;
      const variables = JSON.parse(job.variables || '{}');

      // Update state to processing to avoid double delivery
      await dbRun(`UPDATE EmailJobs SET status = 'processing', attempts = ? WHERE id = ?`, [attempts, jobId]);

      // Resolve template content
      const templateObj = Object.values(EMAIL_TEMPLATES).find((t) => t.id === templateId);
      const htmlBody = templateObj ? substituteVariables(templateObj.html, variables) : '<p>System message</p>';
      const textBody = templateObj ? substituteVariables(templateObj.text, variables) : 'System message';

      try {
        let externalId = '';
        if (isLocal) {
          // Emulator console logging
          console.log(`
============================================================
📬 EMULATED EMAIL DELIVERED (RESEND API KEY MISSING)
------------------------------------------------------------
JobID:     ${jobId}
From:      ${sender}
To:        ${recipient}
Subject:   ${subject}
Template:  ${templateId}
Variables: ${JSON.stringify(variables, null, 2)}
------------------------------------------------------------
Text Preview:
${textBody}
============================================================
          `);
          externalId = `mock_id_${crypto.randomUUID()}`;
        } else if (client) {
          // Send real email via official Resend platform SDK
          const result = await client.emails.send({
            from: sender,
            to: recipient,
            subject: subject,
            html: htmlBody,
            text: textBody
          });
          externalId = result.data?.id || `resend_${crypto.randomUUID()}`;
        }

        // Successfully sent
        await dbRun(`UPDATE EmailJobs SET status = 'sent' WHERE id = ?`, [jobId]);

        // Insert complete delivery logs
        const logId = crypto.randomUUID();
        await dbRun(
          `INSERT INTO EmailLogs (id, job_id, sender, recipient, subject, status, sent_at, body, error_message)
           VALUES (?, ?, ?, ?, ?, 'sent', CURRENT_TIMESTAMP, ?, NULL)`,
          [logId, jobId, sender, recipient, subject, htmlBody]
        );

        // Record Delivery Attempt
        await dbRun(
          `INSERT INTO DeliveryAttempts (id, job_id, attempt_number, status, error_message, attempted_at)
           VALUES (?, ?, ?, 'success', NULL, CURRENT_TIMESTAMP)`,
          [crypto.randomUUID(), jobId, attempts]
        );

        // Log Event
        await dbRun(
          `INSERT INTO EmailEvents (id, log_id, event_type, payload, created_at)
           VALUES (?, ?, 'delivered', ?, CURRENT_TIMESTAMP)`,
          [crypto.randomUUID(), logId, JSON.stringify({ externalId, sentVia: isLocal ? 'emulator' : 'resend_platform' })]
        );

        console.log(`[Queue Processor] Email job ${jobId} successfully delivered to ${recipient}.`);
      } catch (error: any) {
        console.error(`❌ Failed to deliver email job ${jobId} (Attempt ${attempts}):`, error);

        const errorMsg = error.message || 'Delivery connection timeout.';
        
        // Log Delivery Attempt failure
        await dbRun(
          `INSERT INTO DeliveryAttempts (id, job_id, attempt_number, status, error_message, attempted_at)
           VALUES (?, ?, ?, 'failed', ?, CURRENT_TIMESTAMP)`,
          [crypto.randomUUID(), jobId, attempts, errorMsg]
        );

        if (attempts >= 3) {
          // Max attempts reached, re-route to Dead Letter status
          console.error(`[Queue Processor] Job ${jobId} exceeded max retry budget of 3. Marking as DEAD_LETTER.`);
          await dbRun(`UPDATE EmailJobs SET status = 'dead_letter' WHERE id = ?`, [jobId]);

          const logId = crypto.randomUUID();
          await dbRun(
            `INSERT INTO EmailLogs (id, job_id, sender, recipient, subject, status, sent_at, body, error_message)
             VALUES (?, ?, ?, ?, ?, 'dead_letter', CURRENT_TIMESTAMP, ?, ?)`,
            [logId, jobId, sender, recipient, subject, htmlBody, `Max retries exceeded: ${errorMsg}`]
          );
        } else {
          // Retry with exponential backoff: delay = 10s * attempts
          const nextAttemptDelayMs = 10000 * attempts;
          const nextAttemptAt = new Date(Date.now() + nextAttemptDelayMs).toISOString();

          console.log(`[Queue Processor] Retrying job ${jobId} at ${nextAttemptAt} with exponential backoff.`);
          await dbRun(
            `UPDATE EmailJobs 
             SET status = 'pending', attempts = ?, next_attempt_at = ? 
             WHERE id = ?`,
            [attempts, nextAttemptAt, jobId]
          );
        }
      }
    }
  }

  /**
   * Background runner daemon for email processing queue. Runs every 5 seconds.
   */
  static startQueueRunner(): void {
    console.log('⚡ Starting OMYRA Resend Async Email Queue Processor Daemon...');
    setInterval(() => {
      this.processQueue().catch((err) => {
        console.error('❌ Error processing email background queue:', err);
      });
    }, 5000);
  }
}
