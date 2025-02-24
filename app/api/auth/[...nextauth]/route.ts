// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/auth";

const nextAuthHandler = NextAuth(authOptions);

export async function GET(request: Request, context: unknown) {
  return nextAuthHandler(request, context);
}

export async function POST(request: Request, context: unknown) {
  return nextAuthHandler(request, context);
}
