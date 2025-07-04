import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import axios from 'axios';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone, amount } = await req.json();
    if (!phone || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Phone number and valid amount required' }, { status: 400 });
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    
    const mpesaResponse = await initiateMpesaPayment(userId, phone, amount);
    if (!mpesaResponse.CheckoutRequestID) {
      throw new Error('Failed to initiate M-Pesa payment');
    }

    
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount,
        type: 'RECHARGE',
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      { message: 'Recharge initiated', transactionId: transaction.id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[RECHARGE_ERROR]', error.message);
    return NextResponse.json({ error: 'Failed to initiate recharge' }, { status: 500 });
  }
}

async function initiateMpesaPayment(userId: string, phone: string, amount: number) {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const shortCode = process.env.MPESA_SHORT_CODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const tokenResponse = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } }
  );
  const accessToken = tokenResponse.data.access_token;

  // Prepare STK Push request
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

  const stkPushResponse = await axios.post(
    'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: shortCode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: `Recharge_${userId}`,
      TransactionDesc: 'Recharge credits',
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return stkPushResponse.data;
}