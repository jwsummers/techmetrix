import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    username: string;
    role: string;
  }
  interface AdapterUser {
    username: string;
    role: string;
  }
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
  }
}
