'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Ban, CheckCircle } from 'lucide-react';
import {
  Button, Input, Select, Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty,
  StatusBadge, Pagination, PageInfo, Modal, ConfirmDialog,
} from '@/components/ui';

interface VirtualCard {
  _id: string;
  user: { _id: string; name: string; email: string };
  cardNumber: string;
  cardType: string;
  balance: number;
  status: string;
  expiryDate: string;
  createdAt: string;
}

export default function CardsPage() {
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<VirtualCard | null>(null);
  const [showView, setShowView] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const [actionType, setActionType] = useState<'block' | 'activate'>('block');
  const [isProcessing, setIsProcessing] = useState(false);

  const limit = 10;

  useEffect(() => { fetchData(); }, [currentPage, statusFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({ page: currentPage.toString(), limit: limit.toString() });
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/admin/cards?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setCards(data.data || []);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selected) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cardId: selected._id, action: actionType }),
      });
      if (res.ok) {
        fetchData();
        setShowAction(false);
        setSelected(null);
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const maskCard = (num: string) => `**** **** **** ${num.slice(-4)}`;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Virtual Cards</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Manage user virtual cards</p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            options={[{ value: '', label: 'All Status' }, { value: 'active', label: 'Active' }, { value: 'blocked', label: 'Blocked' }, { value: 'expired', label: 'Expired' }]}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-48"
          />
        </div>
      </Card>

      <Card padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Card Number</TableHead>
              <TableHead>Type</TableHead>
              <TableHead align="right">Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead align="right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => <TableRow key={i}><TableCell colSpan={7}><div className="h-12 bg-[var(--bg)] rounded animate-pulse" /></TableCell></TableRow>)
            ) : cards.length === 0 ? (
              <TableEmpty message="No cards found" colSpan={7} />
            ) : (
              cards.map((card) => (
                <TableRow key={card._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{card.user?.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{card.user?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell><span className="font-mono text-sm">{maskCard(card.cardNumber)}</span></TableCell>
                  <TableCell><span className="capitalize">{card.cardType}</span></TableCell>
                  <TableCell align="right"><span className="font-medium">{formatCurrency(card.balance)}</span></TableCell>
                  <TableCell><StatusBadge status={card.status} /></TableCell>
                  <TableCell><span className="text-sm text-[var(--text-secondary)]">{formatDate(card.expiryDate)}</span></TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setSelected(card); setShowView(true); }} className="p-2 rounded-[var(--radius-md)] hover:bg-[var(--bg)] text-[var(--text-secondary)]" title="View"><Eye className="w-4 h-4" /></button>
                      {card.status === 'active' && (
                        <button onClick={() => { setSelected(card); setActionType('block'); setShowAction(true); }} className="p-2 rounded-[var(--radius-md)] hover:bg-[var(--error-light)] text-[var(--error)]" title="Block"><Ban className="w-4 h-4" /></button>
                      )}
                      {card.status === 'blocked' && (
                        <button onClick={() => { setSelected(card); setActionType('activate'); setShowAction(true); }} className="p-2 rounded-[var(--radius-md)] hover:bg-[var(--success-light)] text-[var(--success)]" title="Activate"><CheckCircle className="w-4 h-4" /></button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-[var(--border)]">
            <PageInfo currentPage={currentPage} totalPages={totalPages} totalItems={total} itemsPerPage={limit} />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </Card>

      <Modal isOpen={showView} onClose={() => { setShowView(false); setSelected(null); }} title="Card Details" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-[var(--text-muted)]">Card Number</p><p className="font-mono">{maskCard(selected.cardNumber)}</p></div>
              <div><p className="text-sm text-[var(--text-muted)]">Status</p><StatusBadge status={selected.status} /></div>
              <div><p className="text-sm text-[var(--text-muted)]">Type</p><p className="capitalize">{selected.cardType}</p></div>
              <div><p className="text-sm text-[var(--text-muted)]">Balance</p><p className="font-semibold">{formatCurrency(selected.balance)}</p></div>
              <div><p className="text-sm text-[var(--text-muted)]">Expiry Date</p><p>{formatDate(selected.expiryDate)}</p></div>
              <div><p className="text-sm text-[var(--text-muted)]">User</p><p>{selected.user?.name}</p></div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={showAction}
        onClose={() => { setShowAction(false); setSelected(null); }}
        onConfirm={handleAction}
        title={actionType === 'block' ? 'Block Card' : 'Activate Card'}
        message={actionType === 'block' ? `Block this card? The user will not be able to use it.` : `Activate this card? The user will be able to use it again.`}
        confirmText={actionType === 'block' ? 'Block' : 'Activate'}
        variant={actionType === 'block' ? 'danger' : 'primary'}
        isLoading={isProcessing}
      />
    </div>
  );
}
