'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  Zap, 
  CheckCircle, 
  Star,
  ArrowRight,
  Loader2,
  AlertCircle,
  Crown,
  Sparkles
} from 'lucide-react';

type Plan = {
  id: string;
  name: string;
  credits: number;
  price: number;
  duration: number;
};

export default function RechargePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id || '';
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch('/api/plans', {
          headers: { Authorization: `Bearer ${userId}` },
        });
        if (!res.ok) throw new Error('Failed to fetch plans');
        const data = await res.json();
        setPlans(data);
      } catch (error: any) {
        setMessage({ text: error.message, isError: true });
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchPlans();
  }, [userId]);

  const getPlanBadge = (index: number) => {
    if (index === 1) return { text: 'Most Popular', color: 'bg-gradient-to-r from-blue-500 to-purple-600', icon: Star };
    if (index === 2) return { text: 'Best Value', color: 'bg-gradient-to-r from-green-500 to-emerald-600', icon: Crown };
    return { text: 'Starter', color: 'bg-gradient-to-r from-gray-500 to-gray-600', icon: Sparkles };
  };

  const getPlanStyle = (index: number) => {
    if (index === 1) return {
      card: 'ring-2 ring-blue-200 shadow-2xl scale-105 bg-gradient-to-br from-blue-50 via-white to-purple-50',
      button: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl',
      price: 'text-blue-600',
      accent: 'text-blue-600'
    };
    if (index === 2) return {
      card: 'ring-2 ring-green-200 shadow-xl bg-gradient-to-br from-green-50 via-white to-emerald-50',
      button: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl',
      price: 'text-green-600',
      accent: 'text-green-600'
    };
    return {
      card: 'shadow-lg hover:shadow-xl bg-white',
      button: 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 shadow-md hover:shadow-lg',
      price: 'text-gray-700',
      accent: 'text-gray-600'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Loading Plans</h2>
          <p className="text-sm text-gray-600">Please wait while we fetch the latest pricing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-indigo-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium mb-4">
              <Zap className="h-3 w-3 mr-1.5" />
              Instant SMS Credits
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Choose Your
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                SMS Plan
              </span>
            </h1>
            <p className="text-base text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Select the perfect plan for your messaging needs. All plans include instant activation, 
              reliable delivery, and 24/7 support.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>

      {/* Plans Section */}
      <div className="relative -mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Error Message */}
        {message && (
          <div className={`mb-6 rounded-lg p-3 flex items-center gap-2 ${
            message.isError 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-green-50 border border-green-200'
          }`}>
            <AlertCircle className={`h-4 w-4 flex-shrink-0 ${
              message.isError ? 'text-red-600' : 'text-green-600'
            }`} />
            <p className={`text-sm font-medium ${
              message.isError ? 'text-red-700' : 'text-green-700'
            }`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid gap-6 lg:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const badge = getPlanBadge(index);
            const style = getPlanStyle(index);
            const BadgeIcon = badge.icon;

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 ${style.card}`}
              >
                {/* Popular Badge */}
                <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded-full text-white text-xs font-semibold flex items-center gap-1.5 ${badge.color}`}>
                  <BadgeIcon className="h-3 w-3" />
                  {badge.text}
                </div>

                {/* Plan Header */}
                <div className="text-center mb-6 pt-2">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-xs font-medium text-gray-500">KES</span>
                    <span className={`text-4xl font-bold ${style.price}`}>{plan.price}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                    <div className={`p-1.5 rounded-lg ${style.accent === 'text-blue-600' ? 'bg-blue-100' : style.accent === 'text-green-600' ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <MessageSquare className={`h-4 w-4 ${style.accent}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{plan.credits.toLocaleString()} SMS Credits</p>
                      <p className="text-xs text-gray-600">High-quality message delivery</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                    <div className={`p-1.5 rounded-lg ${style.accent === 'text-blue-600' ? 'bg-blue-100' : style.accent === 'text-green-600' ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Calendar className={`h-4 w-4 ${style.accent}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{plan.duration} Days Validity</p>
                      <p className="text-xs text-gray-600">Credits never expire during period</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                    <div className={`p-1.5 rounded-lg ${style.accent === 'text-blue-600' ? 'bg-blue-100' : style.accent === 'text-green-600' ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <CheckCircle className={`h-4 w-4 ${style.accent}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Instant Activation</p>
                      <p className="text-xs text-gray-600">Start sending immediately</p>
                    </div>
                  </div>
                </div>

                {/* Value Indicator */}
                <div className="mb-4 p-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Cost per SMS</span>
                    <span className="text-sm font-bold text-gray-900">
                      KES {(plan.price / plan.credits).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link href={`/recharge/confirm?planId=${plan.id}`}>
                  <button className={`w-full text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-1.5 ${style.button}`}>
                    <DollarSign className="h-4 w-4" />
                    Choose This Plan
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </Link>

                {/* Money Back Guarantee */}
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    30-day money-back guarantee
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Why Choose Our SMS Service?</h2>
          <p className="text-base text-gray-600 mb-8 max-w-3xl mx-auto">
            Trusted by thousands of businesses for reliable, fast, and affordable SMS delivery
          </p>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-3">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Lightning Fast</h3>
              <p className="text-sm text-gray-600">Messages delivered in seconds with 99.9% uptime guarantee</p>
            </div>
            
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white mb-3">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Reliable Delivery</h3>
              <p className="text-sm text-gray-600">Advanced routing ensures your messages reach their destination</p>
            </div>
            
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white mb-3">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Best Pricing</h3>
              <p className="text-sm text-gray-600">Competitive rates with no hidden fees or setup costs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}