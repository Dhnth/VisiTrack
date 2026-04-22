import NextAuth from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      instanceId?: number | null
      slug?: string | null
    }
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