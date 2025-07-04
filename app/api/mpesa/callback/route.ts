import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ResultCode, CheckoutRequestID, CallbackMetadata } = body.Body.stkCallback;

    console.log('✅ MPESA CALLBACK RECEIVED');
    console.log('CheckoutRequestID:', CheckoutRequestID);
    console.log('ResultCode:', ResultCode);
    console.log('CallbackMetadata:', CallbackMetadata);

    const transaction = await prisma.transaction.findUnique({
      where: { checkoutId: CheckoutRequestID },
    });

    if (!transaction) {
      console.error('❌ Transaction not found in DB');
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (ResultCode === 0) {
      const amountItem = CallbackMetadata?.Item?.find((item: any) => item.Name === 'Amount');
      const amountPaid = amountItem?.Value || transaction.amount;

      console.log('✅ Amount Paid:', amountPaid);

      await prisma.transaction.update({
        where: { checkoutId: CheckoutRequestID },
        data: { status: 'SUCCESS' },
      });

      if (!transaction.planId) {
        console.error('❌ No planId associated with transaction:', CheckoutRequestID);
        return NextResponse.json({ error: 'No plan associated with transaction' }, { status: 400 });
      }

      const plan = await prisma.plan.findUnique({
        where: { id: transaction.planId },
      });

      if (!plan) {
        console.error('❌ Plan not found for planId:', transaction.planId);
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }

      console.log('✅ Matching Plan:', plan.name);
      console.log('User ID:', transaction.userId);
      console.log('Plan credits:', plan.credits);

      try {
        await prisma.user.update({
          where: { id: transaction.userId },
          data: {
            credits: { increment: plan.credits },
            planId: plan.id,
          },
        });
        console.log(`✅ User ${transaction.userId} credited with ${plan.credits}`);
      } catch (updateError) {
        if (updateError instanceof Error) {
          console.error(updateError.message);
        } else {
          console.error('Unexpected error:', updateError);
        }}
    } else {
      await prisma.transaction.update({
        where: { checkoutId: CheckoutRequestID },
        data: { status: 'FAILED' },
      });
      console.warn('❌ STK Push failed');
    }

    return NextResponse.json({ message: 'Callback processed' });
  } catch (error: any) {
    console.error('[MPESA_CALLBACK_ERROR]', error.message);
    return NextResponse.json({ error: 'Failed to process callback' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing transaction id' }, { status: 400 });
  }

  const transaction = await prisma.transaction.findUnique({
    where: { checkoutId: id },
    select: { status: true },
  });

  if (!transaction) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  }

  return NextResponse.json({ status: transaction.status.toUpperCase() });
}