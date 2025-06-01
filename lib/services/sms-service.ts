export interface SendSMSParams {
  countryCode: string;
  mobileNumber: string;
  message: string;
  senderId?: string;
  customerId?: string;
  flowType?: string;
  messageType?: string;
}

export interface SMSResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Service for sending SMS messages using the Message Central API
 */
export class SMSService {
  private readonly baseUrl = 'https://cpaas.messagecentral.com/verification/v3';
  private readonly authToken = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDLTUwRUI3RDQ2N0Q2NTQyQSIsImlhdCI6MTc0ODcwNDk0NywiZXhwIjoxOTA2Mzg0OTQ3fQ.RIOjgnK8DDBIr6gdfoacjs0nHkZJXQmmoIjqnODJnMcRm3d3IHCqyTVz3mLFOuP1X-h-KguCtSTQSF1sWUTNIA';
  private readonly customerId = 'C-50EB7D467D6542A';
  private readonly defaultSenderId = 'UTOMOB';

  /**
   * Sends a single SMS message
   */
  public async sendSMS(params: SendSMSParams): Promise<SMSResponse> {
    try {
      // Make sure phone is just the 10 digits
      let normalizedPhone = params.mobileNumber.replace(/[\s\-\(\)]/g, '')
      
      // Remove +91 or 91 prefix if present
      if (normalizedPhone.startsWith('+91')) {
        normalizedPhone = normalizedPhone.substring(3)
      } else if (normalizedPhone.startsWith('91') && normalizedPhone.length > 10) {
        normalizedPhone = normalizedPhone.substring(2)
      }
      
      // Create the URL with parameters embedded directly in the string
      const url = `${this.baseUrl}/send?countryCode=${params.countryCode || '91'}&customerId=${params.customerId || this.customerId}&senderId=${params.senderId || this.defaultSenderId}&type=SMS&flowType=${params.flowType || 'SMS'}&mobileNumber=${normalizedPhone}&message=${encodeURIComponent(params.message)}&messageType=${params.messageType || 'PROMOTIONAL'}`;
      
      // Make the API call
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'authToken': this.authToken
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      // Check the response format from Message Central API
      if (data && (data.responseCode === 200 || data.responseCode === '200')) {
        console.log('SMS sent successfully:', data);
        return {
          success: true,
          data
        };
      } else {
        console.error('SMS sending failed:', data);
        return {
          success: false,
          error: data?.message || 'Unknown error from SMS service'
        };
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while sending SMS'
      };
    }
  }

  /**
   * Sends SMS to multiple recipients
   */
  public async sendBulkSMS(phoneNumbers: string[], message: string, senderId?: string): Promise<SMSResponse> {
    try {
      // Process phone numbers to format them correctly
      const formattedNumbers = phoneNumbers.map(phone => {
        // Format phone number
        let normalizedPhone = phone.replace(/[\s\-\(\)]/g, '')
        
        // Remove +91 or 91 prefix if present
        if (normalizedPhone.startsWith('+91')) {
          normalizedPhone = normalizedPhone.substring(3)
        } else if (normalizedPhone.startsWith('91') && normalizedPhone.length > 10) {
          normalizedPhone = normalizedPhone.substring(2)
        }
        
        return normalizedPhone;
      }).join(',');
      
      // Create the URL with parameters embedded directly in the string
      const url = `${this.baseUrl}/send?countryCode=91&customerId=${this.customerId}&senderId=${senderId || this.defaultSenderId}&type=SMS&flowType=SMS&mobileNumber=${formattedNumbers}&message=${encodeURIComponent(message)}&messageType=PROMOTIONAL`;
      
      // Make the API call
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'authToken': this.authToken
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      // Check the response from Message Central API
      if (data && (data.responseCode === 200 || data.responseCode === '200')) {
        console.log('Bulk SMS sent successfully:', data);
        return {
          success: true,
          data
        };
      } else {
        console.error('Bulk SMS sending failed:', data);
        return {
          success: false,
          error: data?.message || 'Unknown error from SMS service'
        };
      }
    } catch (error) {
      console.error('Error sending bulk SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while sending bulk SMS'
      };
    }
  }
}

// Create a singleton instance of the SMS service
export const smsService = new SMSService();

export default smsService; 