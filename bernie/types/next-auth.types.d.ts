import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string | null;
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    id: string;
    role?: string | null;
  }
  interface AdapterUser extends User {}
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string | null;
    name?: string;
  }
}
