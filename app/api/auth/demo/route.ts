import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { type } = await req.json();
    const username = type === 'admin' ? 'demoadmin' : 'demouser';

    // Fetch the demo user from the database
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: 'Demo user not found' }, { status: 404 });
    }

    // Return username and the *actual hashed* password from the database
    return NextResponse.json({
      username: user.username,
      password: user.password, // Now returning the hashed password
    });
  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
