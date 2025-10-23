import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      avatar?: string;
      bio?: string;
      status?: string;
    } & DefaultSession["user"];
  }

  interface User {
    accessToken?: string;
    avatar?: string;
    bio?: string;
    status?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string;
    avatar?: string;
    bio?: string;
    status?: string;
  }
}
