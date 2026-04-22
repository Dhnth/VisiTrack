import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/db"
import AdminClientLayout from "./client-layout"
import { SessionProvider } from "next-auth/react"

interface Props {
  children: React.ReactNode
  params: { slug: string }
}

export default async function AdminLayout({ children, params }: Props) {
  const session = await auth()

  // ❌ belum login
  if (!session?.user?.email) {
    redirect("/signin")
  }
  
  const userRole = session.user.role ?? null

  const email = session.user.email
  const { slug } = await params

  // Validasi slug tidak kosong
  if (!slug) {
    redirect("/")
  }

  // Ambil instance dari slug
  const instances = await query(
    "SELECT id, name, logo FROM instances WHERE slug = ?",
    [slug]
  ) as { id: number; name: string; logo: string | null }[]

  if (instances.length === 0) {
    redirect("/")
  }

  const instance = instances[0]

  // Cek apakah user admin di instansi ini
  const users = await query(
    "SELECT id, name, email, role FROM users WHERE email = ? AND instance_id = ? AND role = 'admin'",
    [email, instance.id]
  ) as { id: number; name: string; email: string; role: string }[]

  if (users.length === 0) {
    redirect("/")
  }

  const adminUser = users[0]

  return (
    <SessionProvider session={session}>
      <AdminClientLayout 
        userRole={userRole}
        slug={slug}
        instanceName={instance.name}
        instanceLogo={instance.logo || null}
        adminName={adminUser.name}
        adminEmail={adminUser.email}
      >
        {children}
      </AdminClientLayout>
    </SessionProvider>
  )
}