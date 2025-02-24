// app/api/teams/[id]/metrics/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: Request, context: unknown) {
  const { params } = context as { params: { id: string } };

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // No need to await params here; destructure directly:
  const { id: teamId } = params;
  
  try {
    // Ensure the team belongs to the current admin
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });
    if (!team || team.managerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    // Get all repair orders for team members
    const memberIds = team.members.map((member) => member.id);
    const orders = await prisma.repairOrder.findMany({
      where: { userId: { in: memberIds } },
    });
    // For demonstration, compute simple metrics:
    let countDay = 0,
      countWeek = 0,
      countMonth = 0;
    let totalLabor = 0;
    const today = new Date().toISOString().split('T')[0];
    orders.forEach((order) => {
      totalLabor += order.labor;
      const orderDay = new Date(order.createdAt).toISOString().split('T')[0];
      if (orderDay === today) countDay++;
      // For simplicity, use total orders for week/month metrics
      countWeek = orders.length;
      countMonth = orders.length;
    });
    const metrics = {
      efficiency: totalLabor, // Replace with your efficiency calculation logic
      countDay,
      countWeek,
      countMonth,
    };
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching team metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch team metrics' }, { status: 500 });
  }
}

