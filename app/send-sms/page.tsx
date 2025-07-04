'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function SendBulkSms() {
  const [recipientsText, setRecipientsText] = useState('');
  const [cleanNumbers, setCleanNumbers] = useState<string[]>([]);
  const [invalidNumbers, setInvalidNumbers] = useState<string[]>([]);
  const [messageBody, setMessageBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Clean & validate numbers
  useEffect(() => {
    const split = recipientsText
      .split(/[\s,]+/)
      .map(s => s.trim())
      .filter(Boolean);

    const unique = Array.from(new Set(split));
    const valid: string[] = [];
    const invalid: string[] = [];

    unique.forEach(num => {
      const cleaned = num.replace(/\D/g, ''); // remove non-digits
      if (/^2547\d{8}$/.test(cleaned)) {
        valid.push(cleaned);
      } else {
        invalid.push(num);
      }
    });

    setCleanNumbers(valid);
    setInvalidNumbers(invalid);
  }, [recipientsText]);

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const rows = results.data as string[][];
        const allNumbers = rows.flat().join(',');
        setRecipientsText(prev => (prev ? prev + ',' : '') + allNumbers);
      }
    });
  }

  async function handleSend() {
    if (!messageBody.trim() || cleanNumbers.length === 0) {
      setFeedback('Please enter a message and at least one valid recipient.');
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: cleanNumbers,
          message: messageBody,
        })
      });

      if (!res.ok) throw new Error('Failed to send messages');

      setFeedback('✅ Messages sent successfully!');
      setRecipientsText('');
      setMessageBody('');
    } catch (err) {
      setFeedback('❌ Error sending messages. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Send Bulk SMS</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipients (copy–paste or CSV upload)
          </label>
          <textarea
            rows={4}
            placeholder="Paste numbers here: 2547xxxxxxx, separated by commas, spaces or newlines"
            value={recipientsText}
            onChange={(e) => setRecipientsText(e.target.value)}
            className="w-full border rounded p-2"
          />
          <div className="text-sm text-gray-500 mt-1">
            Or upload a <code>.csv</code>:
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="ml-2"
            />
          </div>
          {invalidNumbers.length > 0 && (
            <div className="mt-2 text-xs text-red-600">
              Invalid numbers detected: {invalidNumbers.join(', ')}
            </div>
          )}
          <div className="mt-1 text-xs text-green-600">
            Valid recipients: {cleanNumbers.length}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            rows={3}
            placeholder="Type your message here"
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={loading || cleanNumbers.length === 0 || !messageBody.trim()}
          className="px-4 py-2 bg-black text-white hover:bg-gray-900 rounded disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Messages'}
        </button>

        {feedback && (
          <div className="mt-2 text-sm">
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
}
