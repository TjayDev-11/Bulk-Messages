'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

interface Message {
  id: string;
  to: string;
  message: string;
  status: string;
  sentAt: string;
}

type MessageHistoryProps = {
  userId: string;
};

export default function MessageHistory({ userId }: MessageHistoryProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `/api/sms/history`
        );

        const data = await res.json();
        if (res.ok) {
          setMessages(data);
        }
      } catch (error) {
        console.error('Failed to fetch message history:', error);
      }
    };

    if (userId) {
      fetchMessages();
    }
  }, [userId]);

  return (
    <div className="mt-8 grid gap-4">
      {messages.length === 0 ? (
        <p className="text-gray-600">No message history found.</p>
      ) : (
        messages.map((msg) => (
          <Card key={msg.id}>
            <CardHeader>
              <CardTitle>To: {msg.to}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-2">{msg.message}</p>
              <p className="text-xs text-gray-500">
                Status: {msg.status} • Sent at:{' '}
                {new Date(msg.sentAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
