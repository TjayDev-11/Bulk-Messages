'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BalanceDisplay from '@/components/BalanceDisplay';
import DashboardStats from '@/components/DashboardStats';
import MessageHistory from '@/components/MessageHistory';

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <div className="text-xl font-medium text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 px-4">
        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 max-w-md w-full">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600 mb-6">Please sign in to access your dashboard.</p>
          <Link href="/login">
            <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const userId = session.user.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Dashboard
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome Section */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">Here's your account overview and quick actions.</p>
        </div>

        {/* Balance and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="transform hover:scale-[1.02] transition-transform duration-200">
            <BalanceDisplay userId={userId} />
          </div>
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-indigo-50/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:gap-4">
              <Link href="/send-sms">
                <Button className="w-full h-12 bg-black text-white hover:bg-gray-900 transition-all duration-200 group font-medium">
                  Send SMS
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Button>
              </Link>
              <Link href="/recharge">
                <Button variant="outline" className="w-full h-12 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group font-medium">
                  Recharge Credits  
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Button>
              </Link>
              <Link href="/transactions">
                <Button variant="outline" className="w-full h-12 border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 group font-medium">
                  View Transactions
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stats and Message History */}
        <div className="space-y-6 sm:space-y-8">
          <div className="transform hover:scale-[1.01] transition-transform duration-200">
            <DashboardStats userId={userId} />
          </div>
          <div className="transform hover:scale-[1.01] transition-transform duration-200">
            <MessageHistory userId={userId} />
          </div>
        </div>
      </main>
    </div>
  );
}