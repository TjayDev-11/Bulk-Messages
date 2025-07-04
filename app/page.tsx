'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Shield, Zap, Users } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
            Send SMS Messages
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">At Scale</span>
          </h1>
          {isAuthenticated ? (
            <>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Welcome, {session.user?.name || session.user?.email || 'User'}! Start sending messages or manage your campaigns from your dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto bg-black text-white hover:bg-gray-900 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-102">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/send-sms">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-gray-200 hover:bg-blue-50 hover:border-blue-300 font-semibold px-8 py-3 transition-all duration-200 transform hover:scale-102">
                    Send SMS
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Reliable bulk SMS service powered by Africa's Talking. Send messages to your customers across Kenya with ease.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-102">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-gray-200 hover:bg-blue-50 hover:border-blue-300 font-semibold px-8 py-3 transition-all duration-200 transform hover:scale-102">
                    Sign In
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg hover:shadow-lg transition-all duration-200">
            <CardHeader className="p-6">
              <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg font-bold text-gray-900">Easy Messaging</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <CardDescription className="text-sm text-gray-600">
                Send SMS messages with a simple, intuitive interface
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg hover:shadow-lg transition-all duration-200">
            <CardHeader className="p-6">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg font-bold text-gray-900">Secure & Reliable</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <CardDescription className="text-sm text-gray-600">
                Your data is protected with enterprise-grade security
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg hover:shadow-lg transition-all duration-200">
            <CardHeader className="p-6">
              <Zap className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
              <CardTitle className="text-lg font-bold text-gray-900">Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <CardDescription className="text-sm text-gray-600">
                Messages delivered instantly across Kenya
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg hover:shadow-lg transition-all duration-200">
            <CardHeader className="p-6">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg font-bold text-gray-900">Bulk Support</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <CardDescription className="text-sm text-gray-600">
                Send to multiple recipients efficiently
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            {isAuthenticated ? 'Manage Your SMS Campaigns' : 'Ready to get started?'}
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            {isAuthenticated
              ? 'Access your dashboard to send messages and track campaigns.'
              : 'Join thousands of businesses using our SMS platform.'}
          </p>
          <Link href={isAuthenticated ? '/dashboard' : '/signup'}>
            <Button size="lg" className="w-full sm:w-auto bg-black text-white hover:bg-gray-900 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-102">
              {isAuthenticated ? 'Go to Dashboard' : 'Create Your Account'}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}