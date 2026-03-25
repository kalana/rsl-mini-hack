'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { updateUserProfile } from '@/lib/firebase/firestore';
import { logout } from '@/hooks/useAuth';
import { parseCents, centsToDecimalString } from '@/lib/utils/currency';
import { CategoryManager } from '@/components/categories/CategoryManager';
import { useRouter } from 'next/navigation';

type Tab = 'profile' | 'budget' | 'categories' | 'account';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const toast = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Profile state
  const [name, setName] = useState(user?.name ?? '');
  const [currency, setCurrency] = useState(user?.currency ?? 'USD');

  // Budget state
  const [monthlyIncomeStr, setMonthlyIncomeStr] = useState(
    user?.monthlyIncome ? centsToDecimalString(user.monthlyIncome) : ''
  );
  const [monthlyBudgetStr, setMonthlyBudgetStr] = useState(
    user?.monthlyBudget ? centsToDecimalString(user.monthlyBudget) : ''
  );
  const [savingsTargetStr, setSavingsTargetStr] = useState(
    user?.savingsTarget ? centsToDecimalString(user.savingsTarget) : ''
  );

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setCurrency(user.currency);
      setMonthlyIncomeStr(user.monthlyIncome ? centsToDecimalString(user.monthlyIncome) : '');
      setMonthlyBudgetStr(user.monthlyBudget ? centsToDecimalString(user.monthlyBudget) : '');
      setSavingsTargetStr(user.savingsTarget ? centsToDecimalString(user.savingsTarget) : '');
    }
  }, [user]);

  async function saveProfile() {
    if (!user) return;
    setIsSaving(true);
    const updates = { name: name.trim(), currency };
    try {
      await updateUserProfile(user.id, updates);
      setUser({ ...user, ...updates });
      toast.success('Profile saved');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  }

  async function saveBudget() {
    if (!user) return;
    setIsSaving(true);
    const updates = {
      monthlyIncome:  parseCents(monthlyIncomeStr),
      monthlyBudget:  parseCents(monthlyBudgetStr),
      savingsTarget:  parseCents(savingsTargetStr),
    };
    try {
      await updateUserProfile(user.id, updates);
      setUser({ ...user, ...updates });
      toast.success('Budget settings saved');
    } catch {
      toast.error('Failed to save budget');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'profile',    label: 'Profile',     emoji: '👤' },
    { id: 'budget',     label: 'Budget',      emoji: '🎯' },
    { id: 'categories', label: 'Categories',  emoji: '🏷️' },
    { id: 'account',    label: 'Account',     emoji: '⚙️' },
  ];

  return (
    <div className="page-container">
      <div className="hidden md:block mb-5">
        <h1 className="text-xl font-bold text-[var(--color-heading)]">Settings</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-[var(--color-surface)] rounded-xl p-1 mb-5 border border-[var(--color-border)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--color-heading)] text-white'
                : 'text-[var(--color-muted)] hover:text-[var(--color-body)]'
            }`}
          >
            <span className="text-base">{tab.emoji}</span>
            <span className="hidden sm:block">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'profile' && (
        <div className="card p-5 space-y-4">
          <h2 className="text-base font-semibold text-[var(--color-heading)]">Profile</h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-[var(--color-muted)] uppercase tracking-wide mb-1 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-[var(--radius-btn)] border border-[var(--color-border)] px-3 py-2.5 text-sm text-[var(--color-heading)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--color-muted)] uppercase tracking-wide mb-1 block">Email</label>
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className="w-full rounded-[var(--radius-btn)] border border-[var(--color-border)] px-3 py-2.5 text-sm text-[var(--color-muted)] bg-[var(--color-surface-muted)] cursor-not-allowed"
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="text-xs text-[var(--color-muted)] uppercase tracking-wide mb-1 block">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-[var(--radius-btn)] border border-[var(--color-border)] px-3 py-2.5 text-sm text-[var(--color-heading)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
              >
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="JPY">JPY — Japanese Yen</option>
                <option value="CAD">CAD — Canadian Dollar</option>
                <option value="AUD">AUD — Australian Dollar</option>
              </select>
            </div>
          </div>
          <button
            onClick={saveProfile}
            disabled={isSaving}
            className="btn-primary w-full py-2.5 text-sm disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="card p-5 space-y-4">
          <h2 className="text-base font-semibold text-[var(--color-heading)]">Budget & Goals</h2>
          <p className="text-sm text-[var(--color-muted)]">
            Set your financial targets to enable budget tracking and savings insights.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Monthly Income', state: monthlyIncomeStr, set: setMonthlyIncomeStr, placeholder: '5000.00', hint: 'Your expected monthly income' },
              { label: 'Monthly Budget Limit', state: monthlyBudgetStr, set: setMonthlyBudgetStr, placeholder: '3000.00', hint: 'Maximum spending per month' },
              { label: 'Savings Target', state: savingsTargetStr, set: setSavingsTargetStr, placeholder: '1000.00', hint: 'Monthly savings goal' },
            ].map(({ label, state, set, placeholder, hint }) => (
              <div key={label}>
                <label className="text-xs text-[var(--color-muted)] uppercase tracking-wide mb-1 block">{label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-muted)]">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={state}
                    onChange={(e) => set(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-7 pr-3 py-2.5 rounded-[var(--radius-btn)] border border-[var(--color-border)] text-sm text-[var(--color-heading)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] font-[var(--font-mono)]"
                  />
                </div>
                <p className="text-xs text-[var(--color-muted)] mt-1">{hint}</p>
              </div>
            ))}
          </div>
          <button
            onClick={saveBudget}
            disabled={isSaving}
            className="btn-primary w-full py-2.5 text-sm disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Budget'}
          </button>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="card p-5 space-y-4">
          <h2 className="text-base font-semibold text-[var(--color-heading)]">Categories</h2>
          <p className="text-sm text-[var(--color-muted)]">Manage your transaction categories.</p>
          <CategoryManager />
        </div>
      )}

      {activeTab === 'account' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="text-base font-semibold text-[var(--color-heading)] mb-1">Account</h2>
            <p className="text-sm text-[var(--color-muted)] mb-4">{user?.email}</p>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-[var(--radius-btn)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-body)] hover:bg-[var(--color-surface-muted)] transition-colors"
            >
              Sign out
            </button>
          </div>
          <div className="card p-5 border border-[var(--color-expense-light)]">
            <h3 className="text-sm font-semibold text-[var(--color-expense)] mb-1">Danger Zone</h3>
            <p className="text-xs text-[var(--color-muted)] mb-3">This action is irreversible.</p>
            <button className="w-full py-2.5 rounded-[var(--radius-btn)] bg-[var(--color-expense-bg)] border border-[var(--color-expense-light)] text-sm font-semibold text-[var(--color-expense)] hover:bg-[var(--color-expense-light)] transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
