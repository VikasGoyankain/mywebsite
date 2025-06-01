import { SMSForm } from "@/components/SMSForm";
import { SendSMSDemo } from "@/components/SendSMSDemo";
import { BulkSMSForm } from "@/components/BulkSMSForm";

export default function SMSPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">SMS Integration</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Form-Based Sending</h2>
          <SMSForm />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Programmatic Sending</h2>
          <SendSMSDemo />
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Bulk SMS Sending</h2>
        <BulkSMSForm />
      </div>
      
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md dark:bg-slate-900">
        <h2 className="text-xl font-semibold mb-4">Integration Documentation</h2>
        
        <div className="space-y-4">
          <p>
            This SMS integration uses the Message Central API to send SMS messages. 
            Below are the key components of this integration:
          </p>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">SMS Service</h3>
            <p className="text-gray-700 dark:text-gray-300">
              The service is implemented in <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">lib/services/sms-service.ts</code> 
              and provides methods for sending individual and bulk SMS messages.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">API Endpoints</h3>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
              <li>
                <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">app/api/sms/route.ts</code> - 
                Handles HTTP POST requests for sending individual SMS messages.
              </li>
              <li>
                <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">app/api/sms/bulk/route.ts</code> - 
                Handles HTTP POST requests for sending bulk SMS messages.
              </li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Usage in Components</h3>
            <p className="text-gray-700 dark:text-gray-300">
              To send SMS from a component, make a POST request to the <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">/api/sms</code> 
              endpoint for single SMS or <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">/api/sms/bulk</code> for bulk SMS with the required parameters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 