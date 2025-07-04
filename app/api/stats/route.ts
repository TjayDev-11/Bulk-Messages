import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.id;

    const messages = await prisma.message.findMany({
      where: { userId },
      select: { status: true },
    });

    const totalMessages = messages.length;
    const successfulMessages = messages.filter((m) =>
      m.status.toLowerCase() === 'success'
    ).length;
    const failedMessages = messages.filter((m) =>
      m.status.toLowerCase() !== 'success'
    ).length;

    return NextResponse.json(
      {
        totalMessages,
        successfulMessages,
        failedMessages,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[STATS_ERROR]', error.message);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
