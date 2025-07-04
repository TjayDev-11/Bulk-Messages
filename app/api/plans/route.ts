import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const planId = req.nextUrl.searchParams.get('planId');

    if (planId) {
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
        select: { id: true, name: true, credits: true, price: true, duration: true },
      });

      if (!plan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }

      return NextResponse.json([plan], { status: 200 });
    }

    const plans = await prisma.plan.findMany({
      select: { id: true, name: true, credits: true, price: true, duration: true },
    });

    return NextResponse.json(plans, { status: 200 });
  } catch (error: any) {
    console.error('[PLANS_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing Bearer token' }, { status: 401 });
    }

    const userId = authHeader.split(' ')[1];
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Incoming body:', body);

    const { planId, phone } = body;

    if (!planId || typeof planId !== 'string') {
      console.error('❌ Invalid or missing planId:', planId);
      return NextResponse.json({ error: 'Invalid or missing planId' }, { status: 400 });
    }

    if (!phone || typeof phone !== 'string' || !/^254\d{9}$/.test(phone)) {
      console.error('❌ Invalid phone number:', phone);
      return NextResponse.json({ error: 'Invalid phone number format. Use format 2547XXXXXXXX' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const plan = await prisma.plan.findUnique({ where: { id: planId } });

    if (!user) {
      console.error('❌ User not found for userId:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (!plan) {
      console.error('❌ Plan not found for planId:', planId);
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const mpesaResponse = await initiateMpesaPayment(phone, plan.price, userId, planId);
    console.log('M-Pesa Response:', mpesaResponse);

    if (!mpesaResponse.CheckoutRequestID) {
      console.error('❌ Failed to initiate M-Pesa payment:', mpesaResponse);
      return NextResponse.json({ error: 'Failed to initiate M-Pesa payment' }, { status: 500 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        checkoutId: mpesaResponse.CheckoutRequestID,
        userId,
        planId,
        amount: plan.price,
        type: 'PLAN_SUBSCRIPTION',
        status: 'PENDING',
      },
    });

    console.log('✅ Transaction created with planId:', planId);

    return NextResponse.json(
      { message: 'Subscription initiated', transactionId: transaction.checkoutId },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[PLANS_SUBSCRIBE_ERROR]', error);
    return NextResponse.json(
      { error: error?.response?.data || error.message || 'Failed to initiate subscription' },
      { status: 500 }
    );
  }
}

async function initiateMpesaPayment(phone: string, amount: number, userId: string, planId: string) {
  try {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const shortCode = process.env.MPESA_SHORT_CODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;

    if (!consumerKey || !consumerSecret || !shortCode || !passkey || !callbackUrl) {
      throw new Error('Missing one or more required MPESA environment variables');
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    const tokenResponse = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );

    const accessToken = tokenResponse.data.access_token;
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: shortCode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: `Plan_${planId}_${userId}`,
      TransactionDesc: 'Plan subscription',
    };

    console.log('STK Push Payload:', payload);

    const stkPushResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    return stkPushResponse.data;
  } catch (err: any) {
    console.error('[MPESA_ERROR]', err.response?.data || err.message || err);
    throw new Error('M-Pesa STK Push failed');
  }
}