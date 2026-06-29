import { redirect } from 'next/navigation'

export default function Home() {
  // For the MVP, we just redirect the root page to the dashboard.
  // The middleware will automatically bounce them to /login if they aren't authenticated.
  redirect('/dashboard')
}
