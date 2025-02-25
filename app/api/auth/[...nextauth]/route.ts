// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET(request: Request, context: unknown) {
  // Call NextAuth on each request so that the exported function doesn't carry extra properties.
  return await NextAuth(authOptions)(request, context);
}

export async function POST(request: Request, context: unknown) {
  return await NextAuth(authOptions)(request, context);
}
