"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { toast } from "sonner";

const formSchema = z.object({
  phoneNumbers: z.string().min(1, "Phone numbers are required"),
  message: z.string().min(1, "Message is required").max(160, "Message cannot exceed 160 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export function BulkSMSForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumbers: "",
      message: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    
    try {
      // Parse phone numbers from comma or newline separated text
      const phoneNumbers = values.phoneNumbers
        .split(/[\n,]/)
        .map(num => num.trim())
        .filter(num => num.length > 0);
        
      if (phoneNumbers.length === 0) {
        toast.error("Please enter at least one valid phone number");
        setIsLoading(false);
        return;
      }
      
      const response = await fetch("/api/sms/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumbers,
          message: values.message,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`SMS sent successfully to ${phoneNumbers.length} recipients`);
        form.reset({
          phoneNumbers: "",
          message: "",
        });
      } else {
        toast.error(`Failed to send SMS: ${data.error}`);
      }
    } catch (error) {
      console.error("Error sending bulk SMS:", error);
      toast.error("Failed to send bulk SMS. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-slate-900">
      <h2 className="text-2xl font-bold mb-4">Send Bulk SMS</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="phoneNumbers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Numbers</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter phone numbers (one per line or comma-separated)" 
                    className="h-32"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Format: 91 9876543210, 91 9876123456 or one number per line
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter your message here"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <div className="text-xs text-muted-foreground text-right">
                  {field.value.length}/160 characters
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Bulk SMS"}
          </Button>
        </form>
      </Form>
    </div>
  );
} 