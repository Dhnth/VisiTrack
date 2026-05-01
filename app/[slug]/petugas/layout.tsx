import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/db"
import PetugasClientLayout from "./client-layout"
import { SessionProvider } from "next-auth/react"

interface Props {
  children: React.ReactNode
  params: { slug: string }
}

export default async function PetugasLayout({ children, params }: Props) {
  const session = await auth()

  // ❌ belum login
  if (!session?.user?.email) {
    redirect("/signin")
  }
  
  const userRole = session.user.role ?? null
  if (userRole !== 'petugas') {
    redirect("/forbidden")
  }


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

  // Cek apakah user petugas di instansi ini
  const users = await query(
    "SELECT id, name, email, role FROM users WHERE email = ? AND instance_id = ? AND role = 'petugas'",
    [email, instance.id]
  ) as { id: number; name: string; email: string; role: string }[]

  if (users.length === 0) {
    redirect("/")
  }

  const petugasUser = users[0]

  return (
    <SessionProvider session={session}>
      <PetugasClientLayout 
        userRole={userRole}
        slug={slug}
        instanceName={instance.name}
        instanceLogo={instance.logo || null}
        petugasName={petugasUser.name}
        petugasEmail={petugasUser.email}
      >
        {children}
      </PetugasClientLayout>
    </SessionProvider>
  )
}