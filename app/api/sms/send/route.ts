import { NextRequest, NextResponse } from 'next/server';
import africastalking from 'africastalking';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto'; // Ensure this is imported

const prisma = new PrismaClient();

const at = africastalking({
  username: process.env.AT_USERNAME as string,
  apiKey: process.env.AT_API_KEY as string,
});

const sms = at.SMS;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authHeader.split(' ')[1];
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { to, message } = body;

    if (!Array.isArray(to) || to.length === 0 || !message) {
      return NextResponse.json(
        { error: 'Provide a list of recipients and a message' },
        { status: 400 }
      );
    }

    // Check user credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user || user.credits < to.length) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
    }

    // Send SMS using Africa's Talking
    const response = await sms.send({ to, message });
    const recipients = response.SMSMessageData.Recipients;

    // Save each sent message to DB
    await Promise.all(
      recipients.map(async (recipient: any) => {
        try {
          await prisma.message.create({
            data: {
              userId,
              to: recipient.number,
              message,
              status: recipient.status.toUpperCase(), // e.g., "SUCCESS" or "FAILED"
              sentAt: new Date(), // Optionally use recipient.timestamp if needed
            },
          });
        } catch (err) {
          console.error('Failed to save message:', err);
        }
      })
    );

    // Deduct credits
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: to.length } },
    });

    // Record transaction
    await prisma.transaction.create({
      data: {
        userId,
        amount: to.length,
        type: 'DEDUCTION',
        status: 'SUCCESS',
        createdAt: new Date(),
        checkoutId: crypto.randomUUID(),
      },
    });

    return NextResponse.json({ success: true, data: response }, { status: 200 });
  } catch (error: any) {
    console.error('[SMS_SEND_ERROR]', error.message);
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
  }
}
