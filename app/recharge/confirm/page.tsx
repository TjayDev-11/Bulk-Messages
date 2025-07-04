'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CreditCard, 
  Phone, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Loader2, 
  Clock,
  MessageSquare,
  DollarSign,
  Calendar,
  Shield,
  Zap,
  AlertTriangle,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

type Plan = {
  id: string;
  name: string;
  credits: number;
  price: number;
  duration: number;
};

export default function ConfirmRechargePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id || '';
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get('planId');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [checkoutId, setCheckoutId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'stk-sent' | 'success' | 'failed' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Log initial component mount and session details
  console.log('ConfirmRechargePage mounted, userId:', userId, 'planId:', planId);

  // Fetch plan details
  useEffect(() => {
    async function fetchPlan() {
      if (!planId || !userId) {
        console.log('fetchPlan skipped: missing planId or userId', { planId, userId });
        return;
      }
      try {
        console.log('Fetching plan for planId:', planId);
        const res = await fetch(`/api/plans?planId=${planId}`, {
          headers: { Authorization: `Bearer ${userId}` },
        });
        if (!res.ok) {
          console.error('fetchPlan failed:', res.status, res.statusText);
          throw new Error('Failed to fetch plan');
        }
        const data = await res.json();
        console.log('fetchPlan response:', data);
        setPlan(data.find((p: Plan) => p.id === planId));
      } catch (error: any) {
        console.error('fetchPlan error:', error.message);
        setMessage({ text: error.message, isError: true });
      }
    }

    fetchPlan();
  }, [planId, userId]);

  // Polling for payment status
  useEffect(() => {
    if (!checkoutId) {
      console.log('Polling useEffect skipped: no checkoutId');
      return;
    }

    console.log('Polling useEffect mounted, checkoutId:', checkoutId, 'userId:', userId);
    setPaymentStatus('processing');
    console.log('Starting polling for checkoutId:', checkoutId);

    const interval = setInterval(async () => {
      console.log('Polling fetch initiated for checkoutId:', checkoutId);
      try {
        const res = await fetch(`/api/mpesa/callback?id=${checkoutId}`, {
          headers: { Authorization: `Bearer ${userId}` },
        });
        console.log('Polling response status:', res.status);
        if (!res.ok) {
          console.error('Polling failed:', res.status, res.statusText);
          setMessage({ text: `Polling failed: ${res.statusText}`, isError: true });
          return;
        }
        const data = await res.json();
        console.log('Polling response data:', data);
        if (data.status === 'SUCCESS') {
          console.log('Payment success detected, updating state');
          clearInterval(interval);
          setPaymentStatus('success');
          setShowConfetti(true);
          setMessage({ text: 'Payment successful! Redirecting to dashboard...', isError: false });
          setTimeout(() => {
            console.log('Redirecting to dashboard');
            setShowConfetti(false);
            router.push('/dashboard');
          }, 5000);
        } else if (data.status === 'FAILED') {
          console.log('Payment failed detected');
          clearInterval(interval);
          setPaymentStatus('failed');
          setMessage({ text: 'Payment failed. Please try again.', isError: true });
        } else {
          console.log('Payment status:', data.status);
        }
      } catch (err) {
        console.error('Polling error:', err);
        setMessage({ text: 'An error occurred while checking payment status.', isError: true });
      }
    }, 5000);

    const timeout = setTimeout(() => {
      console.log('Payment polling timed out');
      clearInterval(interval);
      clearTimeout(timeout);
      setPaymentStatus('failed');
      setMessage({ text: 'Payment timed out. Please try again.', isError: true });
    }, 120000);

    return () => {
      console.log('Polling useEffect cleanup');
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [checkoutId, router, userId]);

  const handleSubscribe = async () => {
    if (!phone) {
      console.log('handleSubscribe failed: missing phone');
      setMessage({ text: 'Phone number is required', isError: true });
      return;
    }
    if (!planId) {
      console.log('handleSubscribe failed: missing planId');
      setMessage({ text: 'No plan selected', isError: true });
      return;
    }
    if (paymentMethod !== 'mpesa') {
      console.log('handleSubscribe failed: invalid payment method', paymentMethod);
      setMessage({ text: 'Only M-Pesa is supported at this time', isError: true });
      return;
    }

    // Normalize phone number (e.g., 0710556990 -> 254710556990)
    let normalizedPhone = phone.trim();
    if (normalizedPhone.startsWith('0') && normalizedPhone.length === 10) {
      normalizedPhone = '254' + normalizedPhone.slice(1);
    } else if (!normalizedPhone.startsWith('254') || normalizedPhone.length !== 12) {
      console.log('handleSubscribe failed: invalid phone format', normalizedPhone);
      setMessage({ text: 'Invalid phone number. Use format 0710556990 or 254710556990', isError: true });
      return;
    }
    console.log('Normalized phone:', normalizedPhone);

    setLoading(true);
    setMessage(null);
    setPaymentStatus('pending');
    console.log('Initiating subscription with planId:', planId, 'phone:', normalizedPhone);

    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify({ planId, phone: normalizedPhone }),
      });

      const data = await res.json();
      console.log('Subscription response:', data);
      if (!res.ok) {
        console.error('Subscription failed:', data.error, res.status);
        throw new Error(data.error || 'Failed to initiate subscription');
      }

      console.log('Setting checkoutId:', data.transactionId);
      setCheckoutId(data.transactionId);
      setPaymentStatus('stk-sent');
      setMessage({ text: 'STK Push sent. Complete payment on your phone.', isError: false });
    } catch (error: any) {
      console.error('Subscription error:', error.message);
      setMessage({ text: error.message, isError: true });
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'stk-sent':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  if (!planId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-2">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="p-4 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white mb-3">
              <XCircle className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">No Plan Selected</h2>
            <p className="text-xs text-gray-600 mb-4 leading-tight">
              Please select a plan to continue with your purchase. Choose from our available SMS credit packages.
            </p>
            <Link href="/recharge">
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-102 flex items-center justify-center gap-1.5">
                <ArrowLeft className="h-3 w-3" />
                Choose a Plan
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" key={paymentStatus}>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />}
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-indigo-600/20"></div>
        <div className="relative max-w-xl mx-auto px-2 sm:px-4 lg:px-6 py-6 sm:py-8">
          <div className="text-center">
            <div className="inline-flex items-center px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[0.65rem] font-medium mb-2">
              <CreditCard className="h-2.5 w-2.5 mr-1" />
              Secure Payment
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-0.5">
              Confirm Your Purchase
            </h1>
            <p className="text-sm text-blue-100">
              Complete your SMS credit purchase securely
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="relative -mt-2 max-w-xl mx-auto px-2 sm:px-4 lg:px-6 pb-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
          
          {/* Plan Summary */}
          {plan && (
            <div className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
                <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-[0.65rem] font-semibold">
                  <Zap className="h-2.5 w-2.5 mr-0.5" />
                  Selected Plan
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-md bg-white shadow-sm border border-gray-100">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white mb-1.5">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <p className="text-[0.65rem] font-medium text-gray-600 mb-0.5">SMS Credits</p>
                  <p className="text-base font-bold text-gray-900">{plan.credits.toLocaleString()}</p>
                </div>
                
                <div className="text-center p-2 rounded-md bg-white shadow-sm border border-gray-100">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white mb-1.5">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <p className="text-[0.65rem] font-medium text-gray-600 mb-0.5">Validity</p>
                  <p className="text-base font-bold text-gray-900">{plan.duration} Days</p>
                </div>
                
                <div className="text-center p-2 rounded-md bg-white shadow-sm border border-gray-100">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white mb-1.5">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <p className="text-[0.65rem] font-medium text-gray-600 mb-0.5">Total Price</p>
                  <p className="text-base font-bold text-gray-900">KES {plan.price}</p>
                </div>
              </div>

              <div className="mt-3 p-2 rounded-md bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-[0.65rem] font-medium text-gray-600">Cost per SMS</span>
                  <span className="text-xs font-bold text-gray-900">
                    KES {(plan.price / plan.credits).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Form */}
          <div className="p-4 space-y-4">
            
            {/* Payment Method */}
            <div className="space-y-2">
              <label className="block text-[0.65rem] font-semibold text-gray-900">
                Payment Method
              </label>
              <div className="relative">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 border-2 border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm appearance-none pr-8 font-medium text-gray-900 transition-all duration-200"
                >
                  <option value="mpesa">🇰🇪 M-Pesa (Safaricom)</option>
                </select>
                <CreditCard className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
              </div>
              <div className="flex items-center gap-1 text-[0.65rem] text-gray-600">
                <Shield className="h-2.5 w-2.5" />
                <span>Secured by M-Pesa encryption</span>
              </div>
            </div>

            {/* Amount Display */}
            <div className="space-y-2">
              <label className="block text-[0.65rem] font-semibold text-gray-900">
                Total Amount
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={plan ? `KES ${plan.price}` : 'Loading...'}
                  readOnly
                  className="w-full p-2 border-2 border-gray-200 rounded-md bg-gray-50 text-gray-900 font-bold text-base text-center cursor-not-allowed"
                />
                <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="block text-[0.65rem] font-semibold text-gray-900">
                M-Pesa Phone Number
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="0710556990"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border-2 border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pl-8 font-medium text-gray-900 transition-all duration-200"
                />
                <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              </div>
              <div className="flex items-start gap-1 text-[0.65rem] text-gray-600">
                <Smartphone className="h-2.5 w-2.5 mt-0.5 flex-shrink-0" />
                <span>Enter your M-Pesa registered phone number (e.g., 0710556990). You'll receive an STK push notification to complete the payment.</span>
              </div>
            </div>

            {/* Status Messages */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`rounded-md p-2 flex items-start gap-1.5 ${
                    message.isError 
                      ? 'bg-red-50 border-2 border-red-200' 
                      : 'bg-green-50 border-2 border-green-200'
                  }`}
                >
                  {getStatusIcon() || (
                    message.isError 
                      ? <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                      : <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`text-xs font-semibold ${
                      message.isError ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {message.isError ? 'Payment Error' : 'Payment Status'}
                    </p>
                    <p className={`text-[0.65rem] ${
                      message.isError ? 'text-red-700' : 'text-green-700'
                    }`}>
                      {message.text}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* STK Push Sent Status */}
            <AnimatePresence>
              {paymentStatus === 'stk-sent' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-green-50 border-2 border-green-200 rounded-md p-3 text-center"
                >
                  <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-green-800 mb-0.5">STK Push Sent!</h3>
                  <p className="text-[0.65rem] text-green-700 mb-2">Check your phone to complete the payment via M-Pesa.</p>
                  <div className="flex items-center justify-center gap-1 text-[0.65rem] text-green-700">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Waiting for your confirmation...</span>
                  </div>
                  <div className="bg-green-100 rounded-full h-1.5 overflow-hidden mt-2">
                    <div className="bg-green-600 h-1.5 rounded-full w-full"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Payment Processing Status */}
            <AnimatePresence>
              {paymentStatus === 'processing' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-blue-50 border-2 border-blue-200 rounded-md p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </motion.div>
                    <div>
                      <p className="text-xs font-semibold text-blue-800">Processing Payment</p>
                      <p className="text-[0.65rem] text-blue-700">Waiting for M-Pesa confirmation...</p>
                    </div>
                  </div>
                  <div className="bg-blue-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                      initial={{ width: '20%' }}
                      animate={{ width: ['20%', '80%', '20%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[0.65rem] text-blue-700">
                    <Clock className="h-2.5 w-2.5" />
                    <span>This usually takes 10-30 seconds</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Status */}
            <AnimatePresence>
              {paymentStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="bg-green-50 border-2 border-green-200 rounded-md p-3 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
                  >
                    <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-2" />
                  </motion.div>
                  <h3 className="text-base font-bold text-green-800 mb-0.5">Payment Successful!</h3>
                  <p className="text-[0.65rem] text-green-700 mb-2">Your SMS credits have been added to your account. Redirecting...</p>
                  <div className="bg-green-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-green-600 h-1.5 rounded-full w-full"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Failed Status */}
            <AnimatePresence>
              {paymentStatus === 'failed' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-red-50 border-2 border-red-200 rounded-md p-3 text-center"
                >
                  <XCircle className="h-10 w-10 text-red-600 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-red-800 mb-0.5">Payment Failed</h3>
                  <p className="text-[0.65rem] text-red-700 mb-2">There was an issue processing your payment. Please try again.</p>
                  <div className="flex items-center gap-1 text-[0.65rem] text-red-700 justify-center">
                    <AlertTriangle className="h-2.5 w-2.5" />
                    <span>No charges were made to your account</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleSubscribe}
                disabled={loading || !plan || paymentStatus === 'processing' || paymentStatus === 'stk-sent' || paymentStatus === 'success'}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-2 px-3 rounded-md transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none transform hover:scale-102 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Initiating Payment...
                  </>
                ) : paymentStatus === 'stk-sent' ? (
                  <>
                    <Smartphone className="h-3 w-3" />
                    Check Your Phone...
                  </>
                ) : paymentStatus === 'processing' ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Waiting for Confirmation...
                  </>
                ) : paymentStatus === 'success' ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    Payment Completed
                  </>
                ) : paymentStatus === 'failed' ? (
                  <>
                    <AlertTriangle className="h-3 w-3" />
                    Try Again
                  </>
                ) : (
                  <>
                    <CreditCard className="h-3 w-3" />
                    Confirm & Pay KES {plan?.price || '0'}
                  </>
                )}
              </button>

              <Link href="/recharge">
                <button
                  className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-semibold py-2 px-3 rounded-md transition-all duration-200 flex items-center justify-center gap-1.5"
                  disabled={paymentStatus === 'processing' || paymentStatus === 'stk-sent'}
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to Plans
                </button>
              </Link>
            </div>

            {/* Security Notice */}
            <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
              <div className="flex items-start gap-1.5">
                <Shield className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 mb-0.5">Secure Payment</h4>
                  <ul className="text-[0.65rem] text-gray-600 space-y-0.5">
                    <li>• Your payment is processed securely through M-Pesa</li>
                    <li>• We never store your payment information</li>
                    <li>• All transactions are encrypted and monitored</li>
                    <li>• 30-day money-back guarantee</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="text-center pt-2 border-t border-gray-100">
              <p className="text-[0.65rem] text-gray-500 flex items-center justify-center gap-1 mb-0.5">
                <Clock className="h-2.5 w-2.5" />
                Payment usually processes within 30 seconds
              </p>
              <p className="text-[0.6rem] text-gray-400">
                Need help? Contact our support team 24/7
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}