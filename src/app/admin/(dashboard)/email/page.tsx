'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, Users } from 'lucide-react';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardDescription } from '@/components/ui';

export default function EmailPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [emailType, setEmailType] = useState<'single' | 'multiple' | 'all' | 'filtered'>('single');
  const [formData, setFormData] = useState({ to: '', subject: '', message: '', userIds: '', filter: '' });
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (userId) setFormData((prev) => ({ ...prev, to: userId }));
  }, [userId]);

  const handleSend = async () => {
    setIsSending(true);
    setResult(null);
    try {
      const token = localStorage.getItem('adminToken');
      const body: Record<string, unknown> = { subject: formData.subject, message: formData.message, type: emailType };
      
      if (emailType === 'single') body.to = formData.to;
      else if (emailType === 'multiple') body.userIds = formData.userIds.split(',').map((id) => id.trim());
      else if (emailType === 'filtered') body.filter = formData.filter;

      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult({ success: res.ok, message: data.message || (res.ok ? 'Email sent successfully' : 'Failed to send email') });
    } catch (error) {
      setResult({ success: false, message: 'Failed to send email' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Send Email</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Send emails to users</p>
      </div>

      {result && (
        <div className={`p-4 rounded-[var(--radius-md)] ${result.success ? 'bg-[var(--success-light)] text-[var(--success)]' : 'bg-[var(--error-light)] text-[var(--error)]'}`}>
          {result.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Email Type</CardTitle>
          <CardDescription>Choose who to send the email to</CardDescription>
        </CardHeader>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'single', label: 'Single User', icon: '👤' },
            { value: 'multiple', label: 'Multiple Users', icon: '👥' },
            { value: 'all', label: 'All Users', icon: '🌐' },
            { value: 'filtered', label: 'Filtered Users', icon: '🔍' },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setEmailType(type.value as typeof emailType)}
              className={`p-4 rounded-[var(--radius-md)] border text-left transition-colors ${
                emailType === type.value
                  ? 'border-[var(--primary)] bg-[var(--primary-light)]'
                  : 'border-[var(--border)] hover:border-[var(--primary)]'
              }`}
            >
              <span className="text-2xl">{type.icon}</span>
              <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">{type.label}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compose Email</CardTitle>
        </CardHeader>
        <div className="space-y-4 mt-4">
          {emailType === 'single' && (
            <Input label="Recipient Email or User ID" value={formData.to} onChange={(e) => setFormData({ ...formData, to: e.target.value })} placeholder="user@example.com or user_id" />
          )}
          {emailType === 'multiple' && (
            <Input label="User IDs (comma separated)" value={formData.userIds} onChange={(e) => setFormData({ ...formData, userIds: e.target.value })} placeholder="id1, id2, id3" />
          )}
          {emailType === 'filtered' && (
            <Select
              label="Filter"
              options={[
                { value: 'active', label: 'Active Users' },
                { value: 'inactive', label: 'Inactive Users' },
                { value: 'verified', label: 'Verified Users' },
                { value: 'unverified', label: 'Unverified Users' },
              ]}
              value={formData.filter}
              onChange={(e) => setFormData({ ...formData, filter: e.target.value })}
            />
          )}

          <Input label="Subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="Email subject" />

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Enter your message..."
              rows={8}
              className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-30 focus:border-[var(--primary)]"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button leftIcon={<Send className="w-4 h-4" />} onClick={handleSend} isLoading={isSending}>
              Send Email
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
