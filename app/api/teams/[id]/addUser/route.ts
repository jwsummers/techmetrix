// app/api/teams/[id]/addUser/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request, context: unknown) {
  const { params } = context as { params: { id: string } };

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Prevent demo admin from adding real users
  if (session.user.username === 'demoadmin') {
    return NextResponse.json({ error: 'Demo Admin cannot modify users' }, { status: 403 });
  }

  const { userId } = await request.json();
  try {
    const updatedTeam = await prisma.team.update({
      where: { id: params.id },
      data: {
        members: { connect: { id: userId } },
      },
    });
    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error('Error adding user to team:', error);
    return NextResponse.json({ error: 'Failed to add user' }, { status: 500 });
  }
}
