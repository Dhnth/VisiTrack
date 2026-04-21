import NextAuth, { type NextAuthConfig, type User, type Session } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { JWT } from "next-auth/jwt"
import bcrypt from "bcryptjs"
import { query } from "@/lib/db"

// ==================
// TYPES
// ==================
type UserWithSlug = {
  id: number
  name: string
  email: string
  password: string
  role: string
  instance_id: number | null
  slug: string | null
}

interface CustomUser extends User {
  role?: string
  instanceId?: number | null
  slug?: string | null
}

interface CustomToken extends JWT {
  role?: string
  instanceId?: number | null
  slug?: string | null
}

// ==================
// CONFIG
// ==================
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const users = await query(
          `SELECT u.*, i.slug 
           FROM users u 
           LEFT JOIN instances i ON u.instance_id = i.id 
           WHERE u.email = ?`,
          [email]
        )

        const user = (users as UserWithSlug[])[0]
        if (!user) return null

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          instanceId: user.instance_id,
          slug: user.slug,
        } satisfies CustomUser
      },
    }),
  ],

  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT
      user?: User
    }): Promise<JWT> {
      if (user) {
        const u = user as CustomUser
        ;(token as CustomToken).role = u.role
        ;(token as CustomToken).instanceId = u.instanceId
        ;(token as CustomToken).slug = u.slug
      }

      return token
    },

    async session({
      session,
      token,
    }: {
      session: Session
      token: JWT
    }): Promise<Session> {
      const t = token as CustomToken

      if (session.user) {
        // extend user safely
        session.user = {
          ...session.user,
          role: t.role,
          instanceId: t.instanceId,
          slug: t.slug,
        }
      }

      return session
    },
  },

  pages: {
    signIn: "/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
}

// ==================
// EXPORT
// ==================
export const { auth, handlers } = NextAuth(authConfig)