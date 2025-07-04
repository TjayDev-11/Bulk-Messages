'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type BalanceDisplayProps = {
  userId: string;
};

interface Balance {
  credits: number;
}

export default function BalanceDisplay({ userId }: BalanceDisplayProps) {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/balance`, {
          headers: { Authorization: `Bearer ${userId}` },
        });
        if (!res.ok) throw new Error('Failed to fetch balance');
        const data = await res.json();
        setBalance(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchBalance();
  }, [userId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Credits</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <p className="text-2xl font-bold text-blue-600">{balance?.credits || 0} Credits</p>
        )}
      </CardContent>
    </Card>
  );
}