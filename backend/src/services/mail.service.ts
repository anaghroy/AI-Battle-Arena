import { BrevoClient, BrevoEnvironment } from "@getbrevo/brevo";
import config from "../config/config.js";

// 1. Initialize client
const client = new BrevoClient({
  apiKey: config.BREVO_API_KEY as string,
  environment: BrevoEnvironment.Default,
});

// 2. Types for function params
interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

// 3. Function
export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<any> => {
  if (!to || !subject) {
    throw new Error("sendEmail: 'to' and 'subject' are required");
  }

  const emailData = {
    sender: {
      name: "AI Battle Arena",
      email: config.BREVO_SENDER_EMAIL as string,
    },
    to: [{ email: to }],
    subject,
    ...(html && { htmlContent: html }),
    ...(text && { textContent: text }),
  };

  const data = await client.transactionalEmails.sendTransacEmail(emailData);

  return data;
};