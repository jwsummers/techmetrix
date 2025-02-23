// app/api/teams/[id]/removeUser/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id: teamId } = params;
  const body = await request.json();
  const { userId } = body;
  try {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.managerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        members: {
          disconnect: { id: userId },
        },
      },
    });
    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error('Error removing user from team:', error);
    return NextResponse.json({ error: 'Failed to remove user from team' }, { status: 500 });
  }
}
