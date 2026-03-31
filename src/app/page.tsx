import { redirect } from 'next/navigation'

export default function Home() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  redirect(`/gastos/${year}/${month}`)
}
