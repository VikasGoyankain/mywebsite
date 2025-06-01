"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export function SendSMSDemo() {
  const [isLoading, setIsLoading] = useState(false);
  
  async function handleSendSMS() {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          countryCode: "91",
          mobileNumber: "7597441305", // Example number from the provided API example
          message: "This is a test message from the SMS API integration. - Powered by U2opia"
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Demo SMS sent successfully");
      } else {
        toast.error(`Failed to send demo SMS: ${data.error}`);
      }
    } catch (error) {
      console.error("Error sending demo SMS:", error);
      toast.error("Failed to send demo SMS. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-slate-900">
      <h2 className="text-2xl font-bold mb-4">Programmatic SMS Demo</h2>
      <p className="mb-4">
        This demonstrates how to send SMS programmatically from your code without user input.
      </p>
      <Button 
        onClick={handleSendSMS} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Sending Demo SMS..." : "Send Demo SMS"}
      </Button>
    </div>
  );
} 