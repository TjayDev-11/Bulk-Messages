'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Transaction = {
  id: string;
  amount: number;
  type: 'RECHARGE' | 'DEDUCTION';
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  createdAt: string;
};

type TransactionListProps = {
  userId: string;
};

export default function TransactionList({ userId }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transactions?userId=${userId}`, {
          headers: { Authorization: `Bearer ${userId}` },
        });
        if (!res.ok) throw new Error('Failed to fetch transactions');
        const data = await res.json();
        setTransactions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchTransactions();
  }, [userId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-600">No transactions found.</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="border-b py-2">
                <p className="text-sm font-medium">
                  {tx.type === 'RECHARGE' ? 'Recharge' : 'Deduction'}: {tx.amount} KES
                </p>
                <p className="text-xs text-gray-500">
                  Status: {tx.status} • {new Date(tx.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}