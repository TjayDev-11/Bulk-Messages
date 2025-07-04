'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type RechargeFormProps = {
  userId: string;
};

export default function RechargeForm({ userId }: RechargeFormProps) {
  const [formData, setFormData] = useState({ phone: '', amount: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/recharge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify({
          phone: formData.phone,
          amount: parseInt(formData.amount),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate recharge');

      setStatus('Recharge request sent! Please complete the M-Pesa payment.');
      setFormData({ phone: '', amount: '' });
    } catch (err: any) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Recharge Credits via M-Pesa</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="phone">M-Pesa Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="e.g. +254700000001"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount (KES)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              placeholder="e.g. 1000"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>
          {status && <p className={`text-sm ${status.includes('Failed') ? 'text-red-600' : 'text-blue-600'}`}>{status}</p>}
          <Button type="submit" className="w-full" disabled={loading || !formData.phone || !formData.amount}>
            {loading ? 'Processing...' : 'Recharge'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}