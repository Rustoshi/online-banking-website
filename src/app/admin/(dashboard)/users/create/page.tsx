'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardDescription } from '@/components/ui';

export default function CreateUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    country: '',
    accountType: 'savings',
    initialBalance: '0',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          initialBalance: parseFloat(formData.initialBalance) || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      router.push('/admin/users');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="p-2 rounded-[var(--radius-md)] hover:bg-[var(--surface)] text-[var(--text-secondary)]"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Create User</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Add a new user to the platform</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-[var(--radius-md)] bg-[var(--error-light)] text-[var(--error)] text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic user details</CardDescription>
              </CardHeader>
              <div className="space-y-4 mt-4">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  hint="Minimum 8 characters"
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                  <Input
                    label="Country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="United States"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Configure the user account</CardDescription>
              </CardHeader>
              <div className="space-y-4 mt-4">
                <Select
                  label="Account Type"
                  options={[
                    { value: 'savings', label: 'Savings Account' },
                    { value: 'checking', label: 'Checking Account' },
                    { value: 'business', label: 'Business Account' },
                  ]}
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                />
                <Input
                  label="Initial Balance ($)"
                  type="number"
                  value={formData.initialBalance}
                  onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                  placeholder="0.00"
                  hint="Starting balance for the account"
                />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <div className="space-y-3 mt-4">
                <Button
                  type="submit"
                  fullWidth
                  leftIcon={<Save className="w-4 h-4" />}
                  isLoading={isLoading}
                >
                  Create User
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => router.push('/admin/users')}
                >
                  Cancel
                </Button>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <div className="mt-4 text-sm text-[var(--text-muted)] space-y-2">
                <p>• User will receive an email with login credentials</p>
                <p>• Account number will be auto-generated</p>
                <p>• User can change password after first login</p>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
