import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        type: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(transactions, { status: 200 });
  } catch (error: any) {
    console.error('[TRANSACTIONS_ERROR]', error.message);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}