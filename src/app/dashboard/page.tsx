'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Gauge,
  Eye,
  EyeOff,
  Shield,
  Activity,
  Building2,
  Send,
  Plus,
  History,
  CreditCard,
  ChevronRight,
  User,
  Globe,
  HelpCircle,
  MessageCircle,
  Inbox,
  Clock,
  ArrowDown,
  MoreHorizontal,
  Bitcoin,
  Bell,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { SendMoneyModal, AccountInfoModal } from '@/components/dashboard/modals';
import { getUserCurrencySymbol } from '@/lib/currency';

interface Transaction {
  id: string;
  _id?: string;
  amount: number;
  type: string;
  status: string;
  reference?: string;
  description?: string;
  createdAt: string;
}

// Map transaction types to credit/debit for display
const isCredit = (type: string): boolean => {
  const creditTypes = ['deposit', 'transfer_in', 'bonus', 'loan'];
  return creditTypes.includes(type?.toLowerCase() || '');
};

interface QuickAction {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'gray' | 'cyan' | 'green' | 'purple';
  action?: string;
  href?: string;
}

const quickActions: QuickAction[] = [
  { name: 'Account Info', icon: Building2, color: 'gray', action: 'account-info' },
  { name: 'Send Money', icon: Send, color: 'cyan', action: 'send-money' },
  { name: 'Deposit', icon: Plus, color: 'green', href: '/dashboard/deposit' },
  { name: 'History', icon: History, color: 'purple', href: '/dashboard/transactions' },
];

const transferLinks = [
  { name: 'Local Transfer', description: '0% Handling charges', icon: User, href: '/dashboard/transfer/local' },
  { name: 'International Transfer', description: 'Global reach, 0% fee', icon: Globe, href: '/dashboard/transfer/international' },
];

interface DashboardData {
  balance: number;
  bitcoinBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  transactionLimit: number;
  pendingTransactions: number;
  transactionVolume: number;
  recentTransactions: Transaction[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showSendMoneyModal, setShowSendMoneyModal] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    balance: 0,
    bitcoinBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    transactionLimit: 50000,
    pendingTransactions: 0,
    transactionVolume: 0,
    recentTransactions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeBalanceCard, setActiveBalanceCard] = useState(0);
  const balanceCardsRef = useRef<HTMLDivElement>(null);

  // Handle swipe for balance cards
  const handleBalanceScroll = () => {
    if (balanceCardsRef.current) {
      const scrollLeft = balanceCardsRef.current.scrollLeft;
      const cardWidth = balanceCardsRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveBalanceCard(newIndex);
    }
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('/api/user/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            // Balance comes from user object in dashboard response
            const userData = data.data.user || {};
            // Map and sort transactions by date (most recent first)
            const rawTransactions = data.data.recentTransactions || [];
            const mappedTransactions: Transaction[] = rawTransactions
              .map((t: Record<string, unknown>) => {
                // Handle createdAt which could be string or Date object
                let createdAtStr = new Date().toISOString();
                if (t.createdAt) {
                  createdAtStr = typeof t.createdAt === 'string' 
                    ? t.createdAt 
                    : new Date(t.createdAt as Date).toISOString();
                }
                return {
                  id: (t._id as string) || (t.id as string) || '',
                  amount: (t.amount as number) || 0,
                  type: (t.type as string) || '',
                  status: (t.status as string) || 'pending',
                  reference: (t.reference as string) || (t.description as string) || 'Transaction',
                  description: (t.description as string) || '',
                  createdAt: createdAtStr,
                };
              })
              .sort((a: Transaction, b: Transaction) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );

            setDashboardData({
              balance: userData.balance || 0,
              bitcoinBalance: userData.bitcoinBalance || 0,
              monthlyIncome: data.data.stats?.totalDeposits || 0,
              monthlyExpenses: data.data.stats?.totalWithdrawals || 0,
              transactionLimit: userData.transactionLimit || 50000,
              pendingTransactions: data.data.pendingTransactions || 0,
              transactionVolume: data.data.stats?.totalTransfers || 0,
              recentTransactions: mappedTransactions,
            });
            setTransactions(mappedTransactions);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const { balance: accountBalance, bitcoinBalance, monthlyIncome, monthlyExpenses, transactionLimit } = dashboardData;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      
      // Set greeting
      if (hours < 12) {
        setGreeting('Good Morning');
      } else if (hours < 18) {
        setGreeting('Good Afternoon');
      } else {
        setGreeting('Good Evening');
      }

      // Format time
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
      }));

      // Format date
      setCurrentDate(now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // BTC price state
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [btcLoading, setBtcLoading] = useState(true);

  // User's currency with fallback to USD
  const userCurrency = user?.currency || 'USD';
  const currencySymbol = getUserCurrencySymbol(userCurrency);

  // Fetch BTC price from CoinGecko API
  useEffect(() => {
    const fetchBtcPrice = async () => {
      try {
        // Use user's currency for BTC price conversion
        const currencyCode = userCurrency.toLowerCase();
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currencyCode}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const price = data.bitcoin?.[currencyCode];
          if (price) {
            setBtcPrice(price);
          }
        }
      } catch (error) {
        console.error('Failed to fetch BTC price:', error);
      } finally {
        setBtcLoading(false);
      }
    };

    fetchBtcPrice();
    // Refresh BTC price every 60 seconds
    const interval = setInterval(fetchBtcPrice, 60000);
    return () => clearInterval(interval);
  }, [userCurrency]);

  const formatBtc = (amount: number) => {
    if (!btcPrice || btcPrice === 0) return '---';
    const btcAmount = amount / btcPrice;
    return btcAmount.toFixed(8);
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completed</span>;
      case 'pending':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'rejected':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      case 'on-hold':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">On-hold</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div>
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold">
              {user?.name ? getInitials(user.name) : 'U'}
            </div>
            <div>
              <p className="text-sm text-gray-400">{greeting} 👋</p>
              <p className="text-lg font-bold text-white">{user?.name || 'User'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/notifications" className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
              <Bell className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </div>

        {/* KYC Verification Banner - Show if not verified */}
        {user?.kycStatus !== 'verified' && (
          <Link 
            href="/dashboard/kyc"
            className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-amber-500/20 border border-amber-500/30"
          >
            <div className="h-10 w-10 rounded-full bg-amber-500/30 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-300">Complete Your Verification</p>
              <p className="text-xs text-amber-400/70">Verify your identity to unlock all features</p>
            </div>
            <ChevronRight className="h-5 w-5 text-amber-400" />
          </Link>
        )}

        {/* Swipeable Balance Cards */}
        <div 
          ref={balanceCardsRef}
          onScroll={handleBalanceScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-0 -mx-4 px-4 mb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Fiat Account Card */}
          <div className="min-w-full snap-center px-1">
            <div 
              className="rounded-2xl p-5 text-white"
              style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #1e3a5f 100%)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-white/70 uppercase tracking-wide">{settings.siteName}</p>
                  <p className="text-sm text-white/90">{user?.name || 'User'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/70">Fiat Account</p>
                  <p className="text-sm font-mono">•••• {user?.accountNumber?.slice(-4) || '0000'}</p>
                </div>
              </div>
              
              <div className="text-center py-4">
                <p className="text-xs text-white/60 mb-1">Available Balance</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-4xl font-bold">
                    {balanceVisible ? `${currencySymbol}${formatCurrency(accountBalance)}` : '••••••'}
                  </p>
                  <button
                    onClick={() => setBalanceVisible(!balanceVisible)}
                    className="text-white/60 hover:text-white"
                  >
                    {balanceVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300">Active</span>
                </div>
                <p className="text-xs text-white/60">
                  Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
              </div>
            </div>
          </div>

          {/* BTC Account Card */}
          <div className="min-w-full snap-center px-1">
            <div 
              className="rounded-2xl p-5 text-white"
              style={{ background: 'linear-gradient(135deg, #f7931a 0%, #c77800 50%, #1a1a2e 100%)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-white/70 uppercase tracking-wide">{settings.siteName}</p>
                  <p className="text-sm text-white/90">{user?.name || 'User'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/70">BTC Account</p>
                  <div className="flex items-center gap-1">
                    <Bitcoin className="h-4 w-4 text-orange-300" />
                    <p className="text-sm font-mono">Bitcoin</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center py-4">
                <p className="text-xs text-white/60 mb-1">Available Balance</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-4xl font-bold">
                    {balanceVisible ? `${bitcoinBalance.toFixed(6)}` : '••••••'}
                  </p>
                  <span className="text-lg text-white/70">BTC</span>
                </div>
                <p className="text-sm text-white/50 mt-1">
                  ≈ {currencySymbol}{btcPrice ? formatCurrency(bitcoinBalance * btcPrice) : '0'}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-400" />
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-300">
                    1 BTC = {currencySymbol}{btcPrice ? formatCurrency(btcPrice) : '---'}
                  </span>
                </div>
                <p className="text-xs text-white/60">Live Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Swipe Indicator Dots */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className={`h-2 w-2 rounded-full transition-colors ${activeBalanceCard === 0 ? 'bg-white' : 'bg-gray-600'}`} />
          <div className={`h-2 w-2 rounded-full transition-colors ${activeBalanceCard === 1 ? 'bg-white' : 'bg-gray-600'}`} />
        </div>
        <p className="text-center text-xs text-gray-500 mb-6 flex items-center justify-center gap-1">
          <span>👆</span> Swipe to switch between accounts
        </p>

        {/* Mobile Quick Actions */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <button onClick={() => setShowSendMoneyModal(true)} className="flex flex-col items-center">
            <div className="h-14 w-14 rounded-full bg-cyan-600 flex items-center justify-center mb-2 shadow-lg">
              <Send className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs text-gray-300">Send</span>
          </button>
          <Link href="/dashboard/deposit" className="flex flex-col items-center">
            <div className="h-14 w-14 rounded-full bg-gray-700 flex items-center justify-center mb-2">
              <ArrowDown className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs text-gray-300">Receive</span>
          </Link>
          <Link href="/dashboard/transactions" className="flex flex-col items-center">
            <div className="h-14 w-14 rounded-full bg-gray-700 flex items-center justify-center mb-2">
              <History className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs text-gray-300">History</span>
          </Link>
          <button onClick={() => setShowAccountModal(true)} className="flex flex-col items-center">
            <div className="h-14 w-14 rounded-full bg-gray-700 flex items-center justify-center mb-2">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs text-gray-300">Account</span>
          </button>
        </div>

        {/* Mobile Quick Transfer Links */}
        <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'rgb(31 41 55)' }}>
          <h3 className="text-sm font-medium text-white mb-3" style={{color: "white"}}>Quick Transfer</h3>
          <div className="space-y-3">
            {transferLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: 'rgb(55 65 81)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <link.icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{link.name}</p>
                    <p className="text-xs text-gray-400">{link.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-500" />
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Recent Transactions */}
        <div className="rounded-xl overflow-hidden mb-6" style={{ backgroundColor: 'rgb(31 41 55)' }}>
          <div className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: '1px solid rgb(55 65 81)' }}>
            <h3 className="text-sm font-medium text-white" style={{color: "white"}}>Recent Transactions</h3>
            <Link href="/dashboard/transactions" className="text-xs text-cyan-400">View all</Link>
          </div>
          <div className="p-4">
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => {
                  const isCreditTx = isCredit(transaction.type);
                  const formattedDate = new Date(transaction.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          isCreditTx ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {isCreditTx ? (
                            <TrendingUp className="h-5 w-5 text-green-400" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-white">{transaction.reference || transaction.description || 'Transaction'}</p>
                          <p className="text-xs text-gray-400">{formattedDate}</p>
                        </div>
                      </div>
                      <p className={`text-sm font-medium ${
                        isCreditTx ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isCreditTx ? '+' : '-'}{currencySymbol}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Inbox className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No recent transactions</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Cards Section */}
        <div className="rounded-xl overflow-hidden mb-6" style={{ backgroundColor: 'rgb(31 41 55)' }}>
          <div className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: '1px solid rgb(55 65 81)' }}>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-white" />
              <h3 className="text-sm font-medium text-white" style={{color: "white"}}>Your Cards</h3>
            </div>
            <Link href="/dashboard/cards" className="text-xs text-cyan-400">View all</Link>
          </div>
          <div className="p-4">
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <div className="rounded-full p-3 mb-3" style={{ backgroundColor: 'rgb(55 65 81)' }}>
                <CreditCard className="h-6 w-6 text-gray-500" />
              </div>
              <p className="text-sm font-medium text-white" style={{color: "white"}}>No cards yet</p>
              <p className="text-xs text-gray-400 mt-1 mb-3">Apply for a virtual card for secure payments</p>
              <Link
                href="/dashboard/cards/apply"
                className="inline-flex items-center px-4 py-2 text-xs font-medium rounded-lg text-white bg-cyan-600 hover:bg-cyan-700"
              >
                <Plus className="h-4 w-4 mr-1" /> Apply for Card
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      {/* Top Stats Summary Bar - Desktop Only */}
      <div className="hidden lg:grid grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl p-4 flex items-center justify-between" style={{ backgroundColor: 'rgb(31 41 55)' }}>
          <div>
            <p className="text-xs text-white">Current Balance</p>
            <p className="text-lg font-bold text-white">{currencySymbol}{formatCurrency(accountBalance)}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-cyan-400" />
          </div>
        </div>
        <div className="rounded-xl p-4 flex items-center justify-between" style={{ backgroundColor: 'rgb(31 41 55)' }}>
          <div>
            <p className="text-xs text-white">Monthly Income</p>
            <p className="text-lg font-bold text-white">{currencySymbol}{formatCurrency(monthlyIncome)}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
        </div>
        <div className="rounded-xl p-4 flex items-center justify-between" style={{ backgroundColor: 'rgb(31 41 55)' }}>
          <div>
            <p className="text-xs text-white">Monthly Outgoing</p>
            <p className="text-lg font-bold text-white">{currencySymbol}{formatCurrency(monthlyExpenses)}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-red-400" />
          </div>
        </div>
        <div className="rounded-xl p-4 flex items-center justify-between" style={{ backgroundColor: 'rgb(31 41 55)' }}>
          <div>
            <p className="text-xs text-white">Transaction Limit</p>
            <p className="text-lg font-bold text-white">{currencySymbol}{formatCurrency(transactionLimit)}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Gauge className="h-5 w-5 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid - Desktop Only */}
      <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Balance and Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance Card */}
          <div className="rounded-2xl shadow-lg text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #020617 100%)' }}>
            {/* Card Header */}
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white" style={{ color: "white" }}>{settings.siteName}</h3>
                    <p className="text-xs text-white/60" style={{ color: "white" }}>Primary Account</p>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur border border-white/20">
                  <p className="text-xs text-white/60" style={{ color: "white" }}>ACCOUNT NUMBER</p>
                  <p className="text-sm font-mono font-medium text-white">•••••• {user?.accountNumber?.slice(-4) || '0000'}</p>
                </div>
              </div>
            </div>

            {/* Card Body - Balances */}
            <div className="p-5 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
                {/* Account Holder */}
                <div>
                  <p className="text-xs text-white/60 mb-1">Account Holder</p>
                  <p className="font-semibold text-white text-lg">{user?.name || 'User'}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="inline-flex items-center text-xs">
                      <span className="h-2 w-2 rounded-full bg-green-400 mr-1.5" />
                      <span className="text-green-300">Account Active</span>
                    </span>
                  </div>
                  {user?.kycStatus !== 'approved' && (
                    <Link href="/dashboard/kyc" className="flex items-center gap-2 mt-1 group">
                      <span className="inline-flex items-center text-xs">
                        <span className="h-2 w-2 rounded-full bg-orange-400 mr-1.5" />
                        <span className="text-orange-300 group-hover:text-orange-200">Verification Required</span>
                      </span>
                    </Link>
                  )}
                </div>

                {/* Fiat Balance */}
                <div className="text-center">
                  <p className="text-xs text-white/60 mb-1">Fiat Balance</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-3xl font-bold text-white">
                      {balanceVisible ? `${currencySymbol}${formatCurrency(accountBalance)}` : '••••••'}
                    </p>
                    <button
                      onClick={() => setBalanceVisible(!balanceVisible)}
                      className="text-white/60 hover:text-white focus:outline-none transition-all"
                    >
                      {balanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-white/50 mt-1">{userCurrency} Balance</p>
                </div>

                {/* Bitcoin Balance */}
                <div className="text-center">
                  <p className="text-xs text-white/60 mb-1">Bitcoin Balance</p>
                  <p className="text-2xl font-bold text-white">
                    {balanceVisible ? `${bitcoinBalance.toFixed(6)} BTC` : '••••••••'}
                  </p>
                  <p className="text-xs text-white/50 mt-1">
                    ≈ {currencySymbol}{btcPrice ? formatCurrency(bitcoinBalance * btcPrice) : '0'}
                  </p>
                  <p className="text-xs text-cyan-300 flex items-center justify-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    1 BTC = {currencySymbol}{btcPrice ? formatCurrency(btcPrice) : '---'}
                  </p>
                </div>
              </div>

              {/* Total Portfolio & Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <div className="bg-white/10 backdrop-blur px-5 py-3 rounded-xl border border-white/10">
                  <p className="text-xs text-white/60">Total Portfolio</p>
                  <p className="text-xl font-bold text-cyan-300">
                    {balanceVisible 
                      ? `${currencySymbol}${formatCurrency(accountBalance + bitcoinBalance * (btcPrice || 0))}`
                      : '••••••'
                    }
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSendMoneyModal(true)}
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-white/10 backdrop-blur border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <Send className="h-4 w-4 mr-2" /> Send Money
                  </button>
                  <button
                    onClick={() => setShowAccountModal(true)}
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-white text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Money
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: 'rgb(31 41 55)' }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold mb-1 text-white" style={{ color: "white" }}>Quick Actions</h1>
                <p className="text-white" style={{ color: "white" }}>Choose from our popular actions below</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const handleClick = () => {
                  if (action.action === 'account-info') {
                    setShowAccountModal(true);
                  } else if (action.action === 'send-money') {
                    setShowSendMoneyModal(true);
                  }
                };

                const iconBgColor = 
                  action.color === 'gray' ? 'bg-gray-500/20' :
                  action.color === 'cyan' ? 'bg-cyan-500/20' :
                  action.color === 'green' ? 'bg-green-500/20' :
                  'bg-purple-500/20';

                const iconColor = 
                  action.color === 'gray' ? 'text-white' :
                  action.color === 'cyan' ? 'text-cyan-400' :
                  action.color === 'green' ? 'text-green-400' :
                  'text-purple-400';

                // If action has an action handler, render as button
                if (action.action) {
                  return (
                    <button
                      key={action.name}
                      onClick={handleClick}
                      className="flex flex-col items-center justify-center p-4 rounded-xl transition-all cursor-pointer hover:bg-white/5"
                      style={{ backgroundColor: 'rgb(55 65 81)' }}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${iconBgColor}`}>
                        <action.icon className={`h-6 w-6 ${iconColor}`} />
                      </div>
                      <span className="font-medium text-white text-sm">{action.name}</span>
                    </button>
                  );
                }

                // Otherwise render as Link
                return (
                  <Link
                    key={action.name}
                    href={action.href || '#'}
                    className="flex flex-col items-center justify-center p-4 rounded-xl transition-all cursor-pointer hover:bg-white/5"
                    style={{ backgroundColor: 'rgb(55 65 81)' }}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${iconBgColor}`}>
                      <action.icon className={`h-6 w-6 ${iconColor}`} />
                    </div>
                    <span className="font-medium text-white text-sm">{action.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Cards Section */}
          <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'rgb(31 41 55)' }}>
            <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid rgb(55 65 81)' }}>
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-white mr-2" />
                <h3 className="text-lg font-medium text-white" style={{ color: "white" }}>Your Cards</h3>
              </div>
              <Link href="/dashboard/cards" className="text-sm font-medium text-cyan-400 hover:text-cyan-300 flex items-center">
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="p-6">
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="rounded-full p-3 mb-4" style={{ backgroundColor: 'rgb(55 65 81)' }}>
                  <CreditCard className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-white" style={{ color: "white" }}>No cards yet</h3>
                <p className="text-white text-sm mt-2 mb-4 max-w-md">
                  You haven&apos;t applied for any virtual cards yet. Apply for a new card to get started with secure online payments.
                </p>
                <Link
                  href="/dashboard/cards/apply"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700"
                >
                  <Plus className="h-4 w-4 mr-2" /> Apply for Card
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'rgb(31 41 55)' }}>
            <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid rgb(55 65 81)' }}>
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-white mr-2" />
                <h3 className="text-lg font-medium text-white" style={{
                  color: "white"
                }}>Recent Transactions</h3>
              </div>
              <Link href="/dashboard/transactions" className="text-sm font-medium text-cyan-400 hover:text-cyan-300 flex items-center">
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              {transactions.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => {
                      const isCreditTx = isCredit(transaction.type);
                      const formattedDate = new Date(transaction.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      return (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              isCreditTx ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {isCreditTx ? (
                                <Plus className={`h-5 w-5 text-green-600`} />
                              ) : (
                                <TrendingDown className={`h-5 w-5 text-red-600`} />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${isCreditTx ? 'text-green-600' : 'text-red-600'}`}>
                              {isCreditTx ? '+' : '-'}{currencySymbol}{formatCurrency(transaction.amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              isCreditTx ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {isCreditTx ? 'Credit' : 'Debit'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(transaction.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.reference || transaction.description || 'Transaction'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formattedDate}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center">
                  <Inbox className="h-16 w-16 text-gray-600 mb-4" />
                  <p className="text-lg font-medium text-white">No recent transactions</p>
                  <p className="text-sm text-white mt-1 mb-4">Your transaction history will appear here</p>
                  <Link
                    href="/dashboard/deposit"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700"
                  >
                    Make your first deposit
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Stats and Notices */}
        <div className="space-y-6">
          {/* Account Stats Card */}
          <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'rgb(31 41 55)' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid rgb(55 65 81)' }}>
              <h3 className="text-lg font-medium text-white" style={{
                color: "white"
              }}>Account Statistics</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center mr-4">
                  <CreditCard className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">Transaction Limit</p>
                  <p className="text-lg font-bold text-white truncate">{currencySymbol}{formatCurrency(transactionLimit)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center mr-4">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">Pending Transactions</p>
                  <p className="text-lg font-bold text-white truncate">{currencySymbol}{formatCurrency(dashboardData.pendingTransactions)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">Transaction Volume</p>
                  <p className="text-lg font-bold text-white truncate">{currencySymbol}{formatCurrency(dashboardData.transactionVolume)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-4">
                  <History className="h-5 w-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">Account Age</p>
                  <p className="text-lg font-bold text-white truncate">New Account</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Transfer Links */}
          <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'rgb(31 41 55)' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid rgb(55 65 81)' }}>
              <h3 className="text-lg font-medium text-white" style={{ color: "white" }}>Quick Transfer</h3>
            </div>
            <div className="p-6 space-y-4">
              {transferLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-colors"
                  style={{ backgroundColor: 'rgb(55 65 81)' }}
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-cyan-500/20 rounded-full flex items-center justify-center mr-4">
                      <link.icon className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white" style={{ color: "white" }}>{link.name}</h4>
                      <p className="text-sm text-white" style={{ color: "white" }}>{link.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                </Link>
              ))}
            </div>
          </div>

          {/* Help & Support Card */}
          <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'rgb(31 41 55)' }}>
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <HelpCircle className="h-10 w-10 text-cyan-400" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-white text-center mb-2" style={{ color: "white" }}>Need Help?</h3>
              <p className="text-sm text-white text-center mb-4" style={{ color: "white" }}>Our support team is here to assist you 24/7</p>
              <div className="flex justify-center">
                <Link
                  href="/dashboard/support"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700"
                >
                  <MessageCircle className="h-4 w-4 mr-2" /> Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AccountInfoModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
      <SendMoneyModal
        isOpen={showSendMoneyModal}
        onClose={() => setShowSendMoneyModal(false)}
      />
    </div>
  );
}
