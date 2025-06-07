import nodemailer from 'nodemailer';
import { getWelcomeEmailHtml, getWelcomeEmailText, welcomeEmailSubject } from './email-templates';

/**
 * Creates a transporter for sending emails via Zoho Mail
 */
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST || "smtp.zeptomail.in",
    port: parseInt(process.env.EMAIL_SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SMTP_USER || "emailapikey",
      pass: process.env.EMAIL_SMTP_PASS || "PHtE6r0FF7rogmUvoRFW4KS6F5P3N4snrOI2LlFE4o9CDKVVSk1Xot4qkzCz/RksXPATHfGdzN1q5b6bu+3TIT3oPTpLX2qyqK3sx/VYSPOZsbq6x00Ys14ccETZXY/octdp0yLQvdrdNA=="
    }
  });
};

/**
 * Sends a welcome email to a new subscriber
 * 
 * @param email The subscriber's email address
 * @param fullName The subscriber's full name
 * @returns Object with success status and message ID or error
 */
export const sendWelcomeEmail = async (email: string, fullName: string) => {
  if (!email) return { success: false, error: 'No email provided' };
  
  try {
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Vikas Goyanka'}" <${process.env.EMAIL_FROM_ADDRESS || 'contact@vikasgoyanka.in'}>`,
      to: email,
      subject: welcomeEmailSubject,
      html: getWelcomeEmailHtml(fullName),
      text: getWelcomeEmailText(fullName)
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Welcome email sent successfully to:', email, info.messageId);
    return { 
      success: true, 
      messageId: info.messageId
    };
  } catch (error: any) {
    console.error('Error sending welcome email:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send welcome email' 
    };
  }
};

/**
 * Determines if a welcome email should be sent
 * 
 * @param isNewSubscription Whether this is a new subscription
 * @param emailChanged Whether the email was updated
 * @returns Boolean indicating if welcome email should be sent
 */
export const shouldSendWelcomeEmail = (isNewSubscription: boolean, emailChanged: boolean = false) => {
  return isNewSubscription || emailChanged;
}; 