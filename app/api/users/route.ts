// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { search } = Object.fromEntries(new URL(request.url).searchParams);
  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: search ? String(search) : '',
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        username: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}
