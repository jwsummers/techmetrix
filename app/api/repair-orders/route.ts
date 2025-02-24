// app/api/repair-orders/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    // Fetch only the orders for the logged-in user
    const orders = await prisma.repairOrder.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching repair orders:', error);
    return NextResponse.json({ error: 'Failed to fetch repair orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const { year, make, model, roNumber, labor } = body;
  try {
    const repairOrder = await prisma.repairOrder.create({
      data: {
        year,
        make,
        model,
        roNumber,
        labor,
        userId: session.user.id, // Link order to the current user
      },
    });
    return NextResponse.json(repairOrder);
  } catch (error) {
    console.error('Error saving repair order:', error);
    return NextResponse.json({ error: 'Failed to save repair order' }, { status: 500 });
  }
}
