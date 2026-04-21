import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role?: string
      instanceId?: number | null
      slug?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role?: string
    instanceId?: number | null
    slug?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    instanceId?: number | null
    slug?: string | null
  }
}