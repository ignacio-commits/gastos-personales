import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  redirect(`/gastos/${year}/${month}`)
}
