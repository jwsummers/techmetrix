// app/api/repair-orders/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await Promise.resolve(params);
  try {
    // Ensure the order belongs to the logged-in user
    const order = await prisma.repairOrder.findUnique({ where: { id } });
    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    await prisma.repairOrder.delete({ where: { id } });
    return NextResponse.json({ message: 'Repair order deleted' });
  } catch (error) {
    console.error('Error deleting repair order:', error);
    return NextResponse.json({ error: 'Failed to delete repair order' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await Promise.resolve(params);
  try {
    // Ensure the order belongs to the logged-in user
    const order = await prisma.repairOrder.findUnique({ where: { id } });
    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    const body = await request.json();
    const updatedOrder = await prisma.repairOrder.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating repair order:', error);
    return NextResponse.json({ error: 'Failed to update repair order' }, { status: 500 });
  }
}
