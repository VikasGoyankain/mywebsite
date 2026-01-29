# Email Integration with Zoho Mail

This document explains how the email functionality is integrated into the website using Zoho Mail.

## Overview

The website uses Zoho Mail's SMTP service to send emails to subscribers from the admin panel. Emails are sent from the `contact@vikasgoyanka.in` address.

## Configuration

Email configuration is stored in environment variables:

```
EMAIL_SMTP_HOST=smtp.zeptomail.in
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=emailapikey
EMAIL_SMTP_PASS=your-api-key-here
EMAIL_FROM_ADDRESS=contact@vikasgoyanka.in
EMAIL_FROM_NAME=Vikas Goyanka
```

## Implementation

The email sending functionality is implemented in `app/api/send-message/route.ts` using the Nodemailer library.

### Key Components:

1. **Transporter Creation**: A Nodemailer transporter is created using Zoho Mail SMTP credentials.

2. **Email Sending Function**: The `sendEmail` function handles formatting and sending emails to subscribers.

3. **HTML Template**: Emails are sent with a responsive HTML template that includes:
   - Personalized greeting with the subscriber's name
   - Main message content
   - Professional signature

## Usage

Emails can be sent to subscribers from the Admin Subscribers page:

1. Navigate to `/admin/subscribers`
2. Click "Send Message"
3. Select "Email Only" or "Both SMS & Email" as the message type
4. Enter a subject and message content
5. Click "Send Message"

## Vercel Deployment

When deploying to Vercel, make sure to add all email-related environment variables to your project settings.

## Troubleshooting

If emails are not being sent:

1. Check that the SMTP credentials are correct
2. Verify that the environment variables are properly set in both local and production environments
3. Check the server logs for any error messages from Nodemailer
4. Ensure the sender email domain (vikasgoyanka.in) has proper SPF and DKIM records set up 