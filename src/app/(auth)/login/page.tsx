'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — desktop only */}
      <div className="hidden md:flex md:w-1/2 gradient-balance flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💎</span>
            <span className="font-bold text-xl tracking-tight">FinanceMe</span>
          </div>
          <p className="text-blue-100 text-sm">Your personal finance companion</p>
        </div>
        <div>
          <blockquote className="text-2xl font-semibold leading-relaxed mb-4">
            &ldquo;A budget is telling your money where to go instead of wondering where it went.&rdquo;
          </blockquote>
          <p className="text-blue-200 text-sm">— Dave Ramsey</p>
        </div>
        <div className="flex gap-4">
          {[
            { label: 'Track Spending', icon: '📊' },
            { label: 'Budget Goals',   icon: '🎯' },
            { label: 'Save More',      icon: '💰' },
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-1">
              <span className="text-2xl">{f.icon}</span>
              <span className="text-xs text-blue-100">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[var(--color-surface-muted)]">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <span className="text-2xl">💎</span>
            <span className="font-bold text-xl text-[var(--color-heading)]">FinanceMe</span>
          </div>

          <h1 className="text-2xl font-bold text-[var(--color-heading)] mb-1">Welcome back</h1>
          <p className="text-sm text-[var(--color-muted)] mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              autoComplete="current-password"
            />

            {error && (
              <div className="rounded-lg bg-[var(--color-expense-bg)] border border-[var(--color-expense-light)] px-4 py-3 text-sm text-[var(--color-expense)]">
                {error}
              </div>
            )}

            <Button type="submit" isLoading={isLoading} size="lg" className="mt-2 w-full">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[var(--color-primary-500)] font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
