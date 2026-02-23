import { redirect } from 'next/navigation';

export default function Home() {
  // Always redirect to dashboard, the middleware will catch the unauthenticated user and push them to /login
  redirect('/dashboard');
}
