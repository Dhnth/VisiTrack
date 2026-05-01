import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import SuperAdminClientLayout from "./client-layout"
import { SessionProvider } from "next-auth/react"

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // ❌ belum login
  if (!session) {
    redirect("/signin")
  }

  // ❌ bukan super admin
  if (session.user?.role !== "super_admin") {
    redirect("/forbidden") // atau bikin /forbidden
  }
  console.log("SESSION:", session)

  // ✅ lolos
  return (
    <SessionProvider session={session}>
      <SuperAdminClientLayout>{children}</SuperAdminClientLayout>
    </SessionProvider>
  )
}