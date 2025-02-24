// app/types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

console.log(NextAuth);
console.log(DefaultSession);

// Extend the default User type
declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: string;
    username: string;
  }

  interface Session {
    user: User;
  }
}

// Extend the JWT type to include custom properties
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    username: string;
  }
}
