'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    try {
      await register(name, email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('email-already-in-use')) {
        setError('An account with this email already exists.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden md:flex md:w-1/2 gradient-balance flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💎</span>
            <span className="font-bold text-xl tracking-tight">FinanceMe</span>
          </div>
          <p className="text-blue-100 text-sm">Your personal finance companion</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Start your financial journey today</h2>
          <ul className="space-y-3 text-blue-100 text-sm">
            {[
              'Track every dollar with ease',
              'Visualize spending by category',
              'Set and achieve savings goals',
              'Get insights on your habits',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-green-300">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="text-blue-200 text-xs">Free forever. No credit card required.</div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[var(--color-surface-muted)]">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <span className="text-2xl">💎</span>
            <span className="font-bold text-xl text-[var(--color-heading)]">FinanceMe</span>
          </div>

          <h1 className="text-2xl font-bold text-[var(--color-heading)] mb-1">Create account</h1>
          <p className="text-sm text-[var(--color-muted)] mb-8">Start tracking your finances</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
              required
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              hint="Minimum 6 characters"
            />

            {error && (
              <div className="rounded-lg bg-[var(--color-expense-bg)] border border-[var(--color-expense-light)] px-4 py-3 text-sm text-[var(--color-expense)]">
                {error}
              </div>
            )}

            <Button type="submit" isLoading={isLoading} size="lg" className="mt-2 w-full">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--color-primary-500)] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
