import NextAuth, {
  type NextAuthConfig,
  type User,
  type Session,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { createActivityLog } from "@/lib/activity-log";

// ==================
// TYPES
// ==================
type UserWithSlug = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  instance_id: number | null;
  slug: string | null;
};

interface CustomUser extends User {
  role?: string;
  instanceId?: number | null;
  slug?: string | null;
}

interface CustomToken extends JWT {
  role?: string;
  instanceId?: number | null;
  slug?: string | null;
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
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const users = await query(
          `SELECT u.*, i.slug 
           FROM users u 
           LEFT JOIN instances i ON u.instance_id = i.id 
           WHERE u.email = ?`,
          [email],
        );

        const user = (users as UserWithSlug[])[0];
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          instanceId: user.instance_id,
          slug: user.slug,
        } satisfies CustomUser;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }): Promise<JWT> {
      if (user) {
        const u = user as CustomUser;
        (token as CustomToken).role = u.role;
        (token as CustomToken).instanceId = u.instanceId;
        (token as CustomToken).slug = u.slug;
      }
      return token;
    },

    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
      const t = token as CustomToken;

      if (session.user) {
        session.user = {
          ...session.user,
          role: t.role,
          instanceId: t.instanceId,
          slug: t.slug,
        };
      }
      return session;
    },

    async signIn({ user }) {
      if (user?.email) {
        try {
          const users = (await query(
            "SELECT id, instance_id, name FROM users WHERE email = ?",
            [user.email],
          )) as { id: number; instance_id: number | null; name: string }[];

          const dbUser = users[0];
          if (dbUser) {
            await createActivityLog({
              instance_id: dbUser.instance_id,
              user_id: dbUser.id,
              action: "LOGIN",
              table_name: "users",
              record_id: dbUser.id,
              description: `User ${dbUser.name} login`,
              ip_address: undefined,
              user_agent: undefined,
            });
          }
        } catch (error) {
          console.error("Failed to create login activity log:", error);
        }
      }
      return true;
    },
  },

  events: {
    async signOut(params) {
      const token = "token" in params ? params.token : null;

      try {
        const userId = token?.sub ? parseInt(token.sub) : null;

        if (userId) {
          const users = (await query(
            "SELECT id, instance_id, name FROM users WHERE id = ?",
            [userId],
          )) as { id: number; instance_id: number | null; name: string }[];

          const dbUser = users[0];

          if (dbUser) {
            await createActivityLog({
              instance_id: dbUser.instance_id,
              user_id: dbUser.id,
              action: "LOGOUT",
              table_name: "users",
              record_id: dbUser.id,
              description: `User ${dbUser.name} logout`,
              ip_address: undefined,
              user_agent: undefined,
            });
          }
        }
      } catch (error) {
        console.error("Failed to create logout activity log:", error);
      }
    },
  },

  pages: {
    signIn: "/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// ==================
// EXPORT
// ==================
export const { auth, handlers } = NextAuth(authConfig);
