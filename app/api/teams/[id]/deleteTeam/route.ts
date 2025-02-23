import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function DELETE(
    _request: Request,
    { params }: { params: { id: string } }
  ) {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id: teamId } = await Promise.resolve(params);
    try {
      // Verify the team exists and that the current user is its manager
      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });
      if (!team || team.managerId !== session.user.id) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
  
      // Disconnect all team members from this team (set teamId to null)
      await prisma.user.updateMany({
        where: { teamId },
        data: { teamId: null },
      });
  
      // Delete the team record
      await prisma.team.delete({
        where: { id: teamId },
      });
  
      return NextResponse.json({ message: 'Team deleted successfully' });
    } catch (error) {
      console.error('Error deleting team:', error);
      return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
    }
  }