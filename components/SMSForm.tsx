'use client';

import { useState, useEffect } from 'react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Send, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SMSFormProps = {
  userId: string;
};

export default function SMSForm({ userId }: SMSFormProps) {
  const [formData, setFormData] = useState({ to: '', message: '' });
  const [status, setStatus] = useState<{ text: string; isError: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const maxMessageLength = 160; // Standard SMS character limit

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (status && !status.isError) {
      const timer = setTimeout(() => {
        setStatus(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'message' && value.length > maxMessageLength) {
      return; // Prevent exceeding max length
    }
    setFormData({ ...formData, [name]: value });
    setStatus(null); // Clear status on input change
  };

  const formatPhoneNumbers = (input: string): string[] => {
    return input
      .split(',')
      .map((num) => num.trim())
      .filter(Boolean)
      .map((num) => {
        // Convert 07... to +2547...
        if (num.startsWith('07') && num.length === 10) {
          return `+254${num.slice(1)}`;
        }
        return num;
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setIsLoading(true);

    const recipients = formatPhoneNumbers(formData.to);

    if (recipients.length === 0) {
      setStatus({ text: 'Please enter at least one valid phone number.', isError: true });
      setIsLoading(false);
      return;
    }

    // Basic validation for phone numbers
    const invalidNumbers = recipients.filter(
      (num) => !num.match(/^\+2547\d{8}$/) && !num.match(/^07\d{8}$/)
    );
    if (invalidNumbers.length > 0) {
      setStatus({ text: 'Some phone numbers are invalid. Use format: 0712345678', isError: true });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify({
          to: recipients,
          message: formData.message,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send SMS');

      setStatus({ text: 'Message sent successfully', isError: false });
      setFormData({ to: '', message: '' });
    } catch (err: any) {
      setStatus({ text: err.message, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl shadow-lg max-w-lg mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-2">
        <Label htmlFor="to" className="text-gray-900 font-semibold">
          Recipient Phone Numbers
        </Label>
        <p className="text-xs text-gray-600">Enter numbers starting with 07 (e.g., 0712345678), comma-separated</p>
        <Input
          id="to"
          name="to"
          placeholder="e.g. 0712345678, 0712345679"
          value={formData.to}
          onChange={handleChange}
          required
          className="border-blue-200/50 focus:ring-blue-400 text-gray-900 placeholder-Warplaceholder-gray-400 rounded-lg"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message" className="text-gray-900 font-semibold">
          Message
        </Label>
        <p className="text-xs text-gray-600">Max {maxMessageLength} characters</p>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="w-full rounded-lg border border-blue-200/50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message..."
          value={formData.message}
          onChange={handleChange}
          required
        />
        <div className="text-right text-xs text-gray-600">
          {formData.message.length}/{maxMessageLength}
        </div>
      </div>
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-2 p-3 rounded-lg ${
              status.isError
                ? 'bg-red-50 border border-red-200'
                : 'bg-green-50 border border-green-200'
            }`}
          >
            {status.isError ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <p
              className={`text-sm font-medium ${
                status.isError ? 'text-red-700' : 'text-green-700'
              }`}
            >
              {status.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        type="submit"
        className="w-full bg-black text-white hover:bg-gray-900 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg rounded-lg flex items-center justify-center gap-2"
        disabled={!formData.to || !formData.message || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send Message
          </>
        )}
      </Button>
    </motion.form>
  );
}