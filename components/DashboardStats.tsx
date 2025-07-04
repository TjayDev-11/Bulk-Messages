'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Stats = {
  totalMessages: number;
  successfulMessages: number;
  failedMessages: number;
};

type DashboardStatsProps = {
  userId: string;
};

export default function DashboardStats({ userId }: DashboardStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/stats?userId=${userId}`, {
          headers: { Authorization: `Bearer ${userId}` },
        });
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchStats();
  }, [userId]);

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-12">
      <Card>
        <CardHeader>
          <CardTitle>Total Messages Sent</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <p className="text-2xl font-bold text-blue-600">{stats?.totalMessages || 0}</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Successful Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <p className="text-2xl font-bold text-green-600">{stats?.successfulMessages || 0}</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Failed Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <p className="text-2xl font-bold text-red-600">{stats?.failedMessages || 0}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}