import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.id;

    const messages = await prisma.message.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
      select: {
        id: true,
        to: true,
        message: true,
        status: true,
        sentAt: true,
      },
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error: any) {
    console.error('[SMS_HISTORY_ERROR]', error.message);
    return NextResponse.json({ error: 'Failed to fetch message history' }, { status: 500 });
  }
}
