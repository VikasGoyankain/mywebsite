declare module 'nodemailer' {
  export interface SendMailOptions {
    from?: string;
    to?: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject?: string;
    text?: string;
    html?: string;
    [key: string]: any;
  }

  export interface SentMessageInfo {
    messageId: string;
    envelope: any;
    accepted: string[];
    rejected: string[];
    pending: string[];
    response: string;
  }

  export interface Transport {
    sendMail(options: SendMailOptions): Promise<SentMessageInfo>;
  }

  export interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user?: string;
      pass?: string;
    };
    [key: string]: any;
  }

  export function createTransport(options: TransportOptions): Transport;
} 