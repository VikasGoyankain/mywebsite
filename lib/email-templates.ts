/**
 * Email Templates
 * 
 * This file contains email templates used throughout the application.
 */

/**
 * Welcome email template sent to new subscribers
 */
export const getWelcomeEmailHtml = (fullName: string) => {
  const currentYear = new Date().getFullYear();
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Vikas Goyanka's Newsletter</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; background-color: #f9f9f9;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
                     <td style="padding: 30px 0; text-align: center; background-color: #1a365d;">
             <h1 style="margin: 0; color: white; font-size: 32px; font-weight: bold;">Vikas Goyanka</h1>
           </td>
        </tr>
        <tr>
          <td style="padding: 40px 20px; background-color: #ffffff;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 0 auto;">
              <tr>
                <td style="padding-bottom: 30px; text-align: center;">
                  <h1 style="margin: 0; color: #1a365d; font-size: 28px; font-weight: bold;">Welcome, ${fullName}!</h1>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 20px; line-height: 1.6; font-size: 16px;">
                  <p>Thank you for subscribing to my newsletter. I'm delighted to have you join our community of legal professionals and enthusiasts.</p>
                  <p>As a subscriber, you'll receive:</p>
                  <ul style="padding-left: 20px; color: #444444;">
                    <li>Updates on my latest legal research and publications</li>
                    <li>Insights on current legal developments</li>
                    <li>Invitations to exclusive webinars and events</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td style="padding: 25px 0; text-align: center;">
                  <a href="https://vikasgoyanka.in/posts" style="background-color: #1a365d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600; display: inline-block;">Explore My Blog</a>
                </td>
              </tr>
              <tr>
                <td style="padding-top: 20px; line-height: 1.6; font-size: 16px;">
                  <p>If you have any questions or would like to discuss potential collaborations, please don't hesitate to reach out.</p>
                  <p>Looking forward to sharing valuable legal insights with you!</p>
                </td>
              </tr>
              <tr>
                <td style="padding-top: 30px; border-top: 1px solid #eeeeee; font-style: italic; color: #666666;">
                  <p>Best regards,</p>
                  <p style="font-weight: bold; font-style: normal; color: #333333;">Vikas Goyanka</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px; text-align: center; background-color: #f2f2f2; font-size: 14px; color: #666666;">
            <p>&copy; ${currentYear} Vikas Goyanka. All rights reserved.</p>
            <p>
              <a href="https://vikasgoyanka.in/contact" style="color: #1a365d; text-decoration: none;">Contact</a> &bull;
              <a href="https://vikasgoyanka.in/privacy-policy" style="color: #1a365d; text-decoration: none;">Privacy Policy</a> &bull;
              <a href="https://vikasgoyanka.in/unsubscribe" style="color: #1a365d; text-decoration: none;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Plain text version of the welcome email for email clients that don't support HTML
 */
export const getWelcomeEmailText = (fullName: string) => {
  const currentYear = new Date().getFullYear();
  
  return `
Welcome, ${fullName}!

Thank you for subscribing to my newsletter. I'm delighted to have you join our community of legal professionals and enthusiasts.

As a subscriber, you'll receive:
- Updates on my latest legal research and publications
- Insights on current legal developments
- Invitations to exclusive webinars and events

Visit my Blog page: https://vikasgoyanka.in/posts

If you have any questions or would like to discuss potential collaborations, please don't hesitate to reach out.

Looking forward to sharing valuable legal insights with you!

Best regards,
Vikas Goyanka

© ${currentYear} Vikas Goyanka. All rights reserved.
Contact: https://vikasgoyanka.in/contact
Privacy Policy: https://vikasgoyanka.in/privacy-policy
Unsubscribe: https://vikasgoyanka.in/unsubscribe
  `.trim();
};

/**
 * Welcome email subject line
 */
export const welcomeEmailSubject = "Welcome to Vikas Goyanka's Newsletter"; 