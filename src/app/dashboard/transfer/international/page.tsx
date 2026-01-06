'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { getUserCurrencySymbol } from '@/lib/currency';
import {
  Globe,
  ChevronRight,
  Wallet,
  User,
  Hash,
  Building2,
  MapPin,
  Code,
  CreditCard,
  MessageSquare,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  MoreHorizontal,
  Bitcoin,
} from 'lucide-react';

type TransferMethod = 
  | 'wire'
  | 'crypto'
  | 'paypal'
  | 'wise'
  | 'cashapp'
  | 'zelle'
  | 'venmo'
  | 'revolut'
  | '';

interface TransferMethodOption {
  id: TransferMethod;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const transferMethods: TransferMethodOption[] = [
  { id: 'wire', name: 'Wire Transfer', description: 'Transfer funds directly to international bank accounts.', icon: '🏦', color: 'bg-blue-500/20' },
  { id: 'crypto', name: 'Cryptocurrency', description: 'Send funds to your cryptocurrency wallet.', icon: '₿', color: 'bg-orange-500/20' },
  { id: 'paypal', name: 'PayPal', description: 'Transfer funds to your PayPal account.', icon: '💳', color: 'bg-indigo-500/20' },
  { id: 'wise', name: 'Wise Transfer', description: 'Transfer with lower fees using Wise.', icon: '🌐', color: 'bg-green-500/20' },
  { id: 'cashapp', name: 'Cash App', description: 'Quick transfers to your Cash App account.', icon: '💵', color: 'bg-emerald-500/20' },
];

const moreTransferMethods: TransferMethodOption[] = [
  { id: 'zelle', name: 'Zelle', description: 'Quick transfers to your Zelle account.', icon: '⚡', color: 'bg-purple-500/20' },
  { id: 'venmo', name: 'Venmo', description: 'Send funds to your Venmo account.', icon: '💸', color: 'bg-cyan-500/20' },
  { id: 'revolut', name: 'Revolut', description: 'Transfer to your Revolut account with low fees.', icon: '🔄', color: 'bg-pink-500/20' },
];

const cryptoCurrencies = [
  { value: 'BTC', label: 'Bitcoin (BTC)' },
  { value: 'ETH', label: 'Ethereum (ETH)' },
  { value: 'USDT', label: 'Tether (USDT)' },
  { value: 'USDC', label: 'USD Coin (USDC)' },
  { value: 'LTC', label: 'Litecoin (LTC)' },
];

const cryptoNetworks = [
  { value: 'native', label: 'Native Network' },
  { value: 'erc20', label: 'ERC-20 (Ethereum)' },
  { value: 'trc20', label: 'TRC-20 (Tron)' },
  { value: 'bep20', label: 'BEP-20 (BSC)' },
];

export default function InternationalTransferPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  
  const [selectedMethod, setSelectedMethod] = useState<TransferMethod>('');
  const [showMoreMethods, setShowMoreMethods] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');

  // Wire Transfer fields
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAddress, setBankAddress] = useState('');
  const [country, setCountry] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [iban, setIban] = useState('');
  const [accountType, setAccountType] = useState('savings');

  // Crypto fields
  const [cryptoCurrency, setCryptoCurrency] = useState('BTC');
  const [cryptoNetwork, setCryptoNetwork] = useState('native');
  const [walletAddress, setWalletAddress] = useState('');

  // PayPal fields
  const [paypalEmail, setPaypalEmail] = useState('');

  // Wise fields
  const [wiseFullName, setWiseFullName] = useState('');
  const [wiseEmail, setWiseEmail] = useState('');
  const [wiseCountry, setWiseCountry] = useState('');

  // Cash App fields
  const [cashAppTag, setCashAppTag] = useState('');
  const [cashAppFullName, setCashAppFullName] = useState('');

  // Zelle fields
  const [zelleEmail, setZelleEmail] = useState('');
  const [zellePhone, setZellePhone] = useState('');
  const [zelleName, setZelleName] = useState('');

  // Venmo fields
  const [venmoUsername, setVenmoUsername] = useState('');
  const [venmoPhone, setVenmoPhone] = useState('');

  // Revolut fields
  const [revolutFullName, setRevolutFullName] = useState('');
  const [revolutEmail, setRevolutEmail] = useState('');
  const [revolutPhone, setRevolutPhone] = useState('');

  // Use user's currency with fallback to USD
  const userCurrency = user?.currency || 'USD';
  const currencySymbol = getUserCurrencySymbol(userCurrency);
  const accountBalance = user?.balance || 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const getMethodTitle = () => {
    switch (selectedMethod) {
      case 'wire': return 'International Wire Transfer';
      case 'crypto': return 'Cryptocurrency Withdrawal';
      case 'paypal': return 'PayPal Withdrawal';
      case 'wise': return 'Wise Transfer';
      case 'cashapp': return 'Cash App Withdrawal';
      case 'zelle': return 'Zelle Withdrawal';
      case 'venmo': return 'Venmo Withdrawal';
      case 'revolut': return 'Revolut Withdrawal';
      default: return 'International Transfer';
    }
  };

  const getMethodDescription = () => {
    switch (selectedMethod) {
      case 'wire': return 'Funds will reflect in the Beneficiary Account within 72 hours.';
      case 'crypto': return 'Withdrawals are typically processed within 1-3 hours.';
      case 'paypal': return 'Funds will be sent to your PayPal account within 24 hours.';
      case 'wise': return 'Your funds will be processed within 1-2 business days.';
      case 'cashapp': return 'Withdrawals to Cash App are typically processed within 24 hours.';
      case 'zelle': return 'Funds will be sent to your Zelle account typically within a few hours.';
      case 'venmo': return 'Funds will be transferred to your Venmo account within 24 hours.';
      case 'revolut': return 'Funds will be transferred to your Revolut account within 1-2 business days.';
      default: return 'Select a withdrawal method to proceed.';
    }
  };

  const validateForm = () => {
    const amountValue = parseFloat(amount);
    
    if (!amount || amountValue <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }
    
    if (amountValue > accountBalance) {
      toast.error('Insufficient balance. Please check your available balance and try a smaller amount.');
      return false;
    }
    
    if (!pin || pin.length !== 4) {
      toast.error('Please enter your 4-digit transaction PIN');
      return false;
    }

    // Method-specific validation
    switch (selectedMethod) {
      case 'wire':
        if (!accountName || !accountNumber || !bankName || !country || !swiftCode) {
          toast.error('Please fill in all required wire transfer fields');
          return false;
        }
        break;
      case 'crypto':
        if (!walletAddress) {
          toast.error('Please enter your wallet address');
          return false;
        }
        break;
      case 'paypal':
        if (!paypalEmail) {
          toast.error('Please enter your PayPal email');
          return false;
        }
        break;
      case 'wise':
        if (!wiseFullName || !wiseEmail || !wiseCountry) {
          toast.error('Please fill in all Wise transfer fields');
          return false;
        }
        break;
      case 'cashapp':
        if (!cashAppTag || !cashAppFullName) {
          toast.error('Please fill in all Cash App fields');
          return false;
        }
        break;
      case 'zelle':
        if (!zelleEmail || !zelleName) {
          toast.error('Please fill in all Zelle fields');
          return false;
        }
        break;
      case 'venmo':
        if (!venmoUsername) {
          toast.error('Please enter your Venmo username');
          return false;
        }
        break;
      case 'revolut':
        if (!revolutFullName || !revolutEmail) {
          toast.error('Please fill in all Revolut fields');
          return false;
        }
        break;
    }
    
    return true;
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  const getDetailedErrorMessage = (errorMsg: string, statusCode?: number): string => {
    const errorMappings: Record<string, string> = {
      'Invalid PIN': 'The transaction PIN you entered is incorrect. Please check your PIN and try again.',
      'Insufficient': 'Your account balance is insufficient to complete this transfer.',
      'not found': 'The recipient account could not be found. Please verify the details are correct.',
      'Cannot transfer': 'This transfer cannot be processed. The recipient account may be restricted.',
      'limit exceeded': 'You have exceeded your daily transfer limit. Please try again tomorrow.',
      'account is dormant': 'Your account is currently dormant. Please contact customer support.',
      'account is blocked': 'Your account has been temporarily blocked. Please contact support.',
      'verification required': 'Additional verification is required. Please complete your KYC verification.',
      'Unauthorized': 'Your session has expired. Please log in again to continue.',
    };

    // Check for matching error patterns first (before status code check)
    for (const [pattern, message] of Object.entries(errorMappings)) {
      if (errorMsg.toLowerCase().includes(pattern.toLowerCase())) {
        return message;
      }
    }

    // Handle HTTP status codes only if no error message pattern matched
    if (statusCode === 401 && !errorMsg) return 'Your session has expired. Please log in again.';
    if (statusCode === 403) return 'You do not have permission to perform this transfer.';
    if (statusCode === 429) return 'Too many transfer attempts. Please wait before trying again.';
    if (statusCode === 500) return 'Our servers are experiencing issues. Please try again later.';

    return errorMsg || 'An unexpected error occurred. Please try again or contact support.';
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: 'international',
          accountNumber: selectedMethod === 'wire' ? accountNumber : walletAddress || paypalEmail || wiseEmail || cashAppTag || zelleEmail || venmoUsername || revolutEmail,
          accountName: selectedMethod === 'wire' ? accountName : wiseFullName || cashAppFullName || zelleName || revolutFullName || 'N/A',
          bankName: selectedMethod === 'wire' ? bankName : selectedMethod.toUpperCase(),
          country: selectedMethod === 'wire' ? country : wiseCountry || 'International',
          swiftCode: swiftCode || undefined,
          routingNumber: iban || undefined,
          amount: parseFloat(amount),
          description: description || `${getMethodTitle()} - ${new Date().toLocaleDateString()}`,
          pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // API returns error in 'error' field, not 'message'
        const apiError = data.error || data.message || 'Transfer failed';
        const detailedError = getDetailedErrorMessage(apiError, response.status);
        throw new Error(detailedError);
      }

      setShowPreview(false);
      
      toast.success(
        <div>
          <p className="font-semibold">Transfer Initiated Successfully!</p>
          <p className="text-sm mt-1">Your {getMethodTitle()} of {currencySymbol}{parseFloat(amount).toLocaleString()} is being processed.</p>
        </div>,
        { duration: 5000 }
      );
      
      setTimeout(() => {
        router.push('/dashboard/transactions');
      }, 2000);
      
    } catch (err) {
      setShowPreview(false);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      toast.error(
        <div>
          <p className="font-semibold">Transfer Failed</p>
          <p className="text-sm mt-1">{errorMessage}</p>
        </div>,
        { duration: 8000 }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const amountValue = parseFloat(amount) || 0;
  const newBalance = accountBalance - amountValue;

  const renderMethodFields = () => {
    switch (selectedMethod) {
      case 'wire':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Beneficiary Account Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter beneficiary's full name"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Account Number *</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter account number"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Bank Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter bank name"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Bank Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={bankAddress}
                    onChange={(e) => setBankAddress(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter bank address"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Country *</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter country"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>SWIFT Code *</label>
                <div className="relative">
                  <Code className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={swiftCode}
                    onChange={(e) => setSwiftCode(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter SWIFT/BIC code"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>IBAN</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter IBAN number"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Account Type</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="savings">Savings Account</option>
                <option value="checking">Checking Account</option>
                <option value="business">Business Account</option>
              </select>
            </div>
          </div>
        );

      case 'crypto':
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Cryptocurrency *</label>
                <select
                  value={cryptoCurrency}
                  onChange={(e) => setCryptoCurrency(e.target.value)}
                  className="block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {cryptoCurrencies.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Network *</label>
                <select
                  value={cryptoNetwork}
                  onChange={(e) => setCryptoNetwork(e.target.value)}
                  className="block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {cryptoNetworks.map(n => (
                    <option key={n.value} value={n.value}>{n.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Wallet Address *</label>
              <div className="relative">
                <Bitcoin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter your wallet address"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'paypal':
        return (
          <div className="space-y-5">
            <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>PayPal Email *</label>
            <input
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              className="block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter your PayPal email"
              required
            />
          </div>
        );

      case 'wise':
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Full Name *</label>
                <input
                  type="text"
                  value={wiseFullName}
                  onChange={(e) => setWiseFullName(e.target.value)}
                  className="block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Email *</label>
                <input
                  type="email"
                  value={wiseEmail}
                  onChange={(e) => setWiseEmail(e.target.value)}
                  className="block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter your Wise email"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Country *</label>
              <input
                type="text"
                value={wiseCountry}
                onChange={(e) => setWiseCountry(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your country"
                required
              />
            </div>
          </div>
        );

      case 'cashapp':
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>$Cashtag *</label>
              <input
                type="text"
                value={cashAppTag}
                onChange={(e) => setCashAppTag(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your $Cashtag"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Full Name *</label>
              <input
                type="text"
                value={cashAppFullName}
                onChange={(e) => setCashAppFullName(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>
        );

      case 'zelle':
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Email *</label>
                <input
                  type="email"
                  value={zelleEmail}
                  onChange={(e) => setZelleEmail(e.target.value)}
                  className="block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter your Zelle email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Phone</label>
                <input
                  type="tel"
                  value={zellePhone}
                  onChange={(e) => setZellePhone(e.target.value)}
                  className="block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Full Name *</label>
              <input
                type="text"
                value={zelleName}
                onChange={(e) => setZelleName(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>
        );

      case 'venmo':
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Venmo Username *</label>
              <input
                type="text"
                value={venmoUsername}
                onChange={(e) => setVenmoUsername(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your Venmo username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Phone</label>
              <input
                type="tel"
                value={venmoPhone}
                onChange={(e) => setVenmoPhone(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your phone number"
              />
            </div>
          </div>
        );

      case 'revolut':
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Full Name *</label>
                <input
                  type="text"
                  value={revolutFullName}
                  onChange={(e) => setRevolutFullName(e.target.value)}
                  className="block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Email *</label>
                <input
                  type="email"
                  value={revolutEmail}
                  onChange={(e) => setRevolutEmail(e.target.value)}
                  className="block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter your Revolut email"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Phone</label>
              <input
                type="tel"
                value={revolutPhone}
                onChange={(e) => setRevolutPhone(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your phone number"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-bold text-white mb-1" style={{color: "white"}}>International Transfer</h1>
        <div className="flex items-center text-sm text-gray-400">
          <Link href="/dashboard" className="hover:text-cyan-400 transition-colors" style={{color: "white"}}>Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-white">International Transfer</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Method Selection */}
        {!selectedMethod && !showMoreMethods && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4" style={{color: "white"}}>Select Transfer Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {transferMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className="cursor-pointer rounded-xl p-4 hover:ring-2 hover:ring-cyan-500 transition-all"
                  style={{ backgroundColor: 'rgb(31 41 55)' }}
                >
                  <div className="flex items-center mb-3">
                    <div className={`h-10 w-10 rounded-full ${method.color} flex items-center justify-center text-xl`}>
                      {method.icon}
                    </div>
                    <h3 className="ml-3 font-medium text-white" style={{color: "white"}}>{method.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400" style={{color: "white"}}>{method.description}</p>
                </div>
              ))}
              <div
                onClick={() => setShowMoreMethods(true)}
                className="cursor-pointer rounded-xl p-4 hover:ring-2 hover:ring-cyan-500 transition-all"
                style={{ backgroundColor: 'rgb(31 41 55)' }}
              >
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <MoreHorizontal className="h-5 w-5 text-amber-400" />
                  </div>
                  <h3 className="ml-3 font-medium text-white" style={{color: "white"}}>More Options</h3>
                </div>
                <p className="text-sm text-gray-400" style={{color: "white"}}>Zelle, Venmo, Revolut, and more.</p>
              </div>
            </div>
          </div>
        )}

        {/* More Methods */}
        {showMoreMethods && !selectedMethod && (
          <div className="mb-8">
            <div className="flex items-center mb-6" style={{color: "white"}}>
              <button
                onClick={() => setShowMoreMethods(false)}
                className="mr-3 rounded-full p-2 text-gray-400 hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-bold text-white" style={{color: "white"}}>Additional Transfer Methods</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {moreTransferMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => { setSelectedMethod(method.id); setShowMoreMethods(false); }}
                  className="cursor-pointer rounded-xl p-4 hover:ring-2 hover:ring-cyan-500 transition-all"
                  style={{ backgroundColor: 'rgb(31 41 55)' }}
                >
                  <div className="flex items-center mb-3">
                    <div className={`h-10 w-10 rounded-full ${method.color} flex items-center justify-center text-xl`}>
                      {method.icon}
                    </div>
                    <h3 className="ml-3 font-medium text-white" style={{color: "white"}}>{method.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400" style={{color: "white"}}>{method.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transfer Form */}
        {selectedMethod && (
          <div className="rounded-xl shadow-lg overflow-hidden" style={{ backgroundColor: 'rgb(31 41 55)' }}>
            {/* Header */}
            <div className="relative px-6 py-8" style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #020617 100%)' }}>
              <button
                onClick={() => setSelectedMethod('')}
                className="absolute top-4 left-4 bg-white/20 rounded-full p-2 text-white hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex flex-col items-center">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full mb-4">
                  <Globe className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white" style={{color: "white"}}>{getMethodTitle()}</h2>
                <p className="text-white/80 mt-1 text-center" style={{color: "white"}}>{getMethodDescription()}</p>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 md:p-8">
              <form onSubmit={handlePreview}>
                {/* Balance Card */}
                <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: 'rgb(55 65 81)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-cyan-500/20 mr-3">
                        <Wallet className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400" style={{color: "white"}}>Available Balance</p>
                        <p className="text-xl font-bold text-white" style={{color: "white"}}>{currencySymbol}{formatCurrency(accountBalance)}</p>
                      </div>
                    </div>
                    <div className="text-xs py-1 px-3 bg-green-500/20 text-green-400 rounded-full">Available</div>
                  </div>
                </div>

                {/* Amount */}
                <div className="mb-6 p-5 rounded-xl" style={{ backgroundColor: 'rgb(55 65 81)' }}>
                  <label className="block text-sm font-medium text-white mb-2" style={{color: "white"}}>Amount to Transfer</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-bold">{currencySymbol}</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                      max={accountBalance}
                      step="any"
                      className="block w-full pl-12 pr-4 py-4 rounded-lg bg-gray-800 border border-gray-600 text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[100, 500, 1000].map(val => (
                      <button key={val} type="button" onClick={() => handleQuickAmount(val)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium text-white transition-colors">
                        {currencySymbol}{val.toLocaleString()}
                      </button>
                    ))}
                    <button type="button" onClick={() => handleQuickAmount(Math.floor(accountBalance))} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium text-white transition-colors">
                      Max
                    </button>
                  </div>
                </div>

                {/* Method-specific fields */}
                <div className="mb-6 p-5 rounded-xl" style={{ backgroundColor: 'rgb(55 65 81)' }}>
                  <h3 className="text-lg font-medium text-white mb-4" style={{color: "white"}}>Transfer Details</h3>
                  {renderMethodFields()}
                </div>

                {/* Description & PIN */}
                <div className="mb-6 p-5 rounded-xl" style={{ backgroundColor: 'rgb(55 65 81)' }}>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Description/Memo</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                        placeholder="Enter transaction description"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1" style={{color: "white"}}>Transaction PIN *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPin ? 'text' : 'password'}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        maxLength={4}
                        className="block w-full pl-10 pr-10 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Enter your 4-digit PIN"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-400" style={{color: "white"}}>This is your transaction PIN, not your login password</p>
                  </div>
                </div>

                {/* Summary */}
                {amountValue > 0 && (
                  <div className="mb-6 p-5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                    <div className="flex items-center mb-3">
                      <CheckCircle className="h-5 w-5 text-cyan-400 mr-2" />
                      <h3 className="text-sm font-medium text-white" style={{color: "white"}}>Transaction Summary</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount</span>
                        <span className="font-medium text-white" style={{color: "white"}}>{currencySymbol}{formatCurrency(amountValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fee</span>
                        <span className="font-medium text-white" style={{color: "white"}}>{currencySymbol}0.00</span>
                      </div>
                      <div className="border-t border-gray-600 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-white font-medium">Total</span>
                          <span className="font-bold text-xl text-white" style={{color: "white"}}>{currencySymbol}{formatCurrency(amountValue)}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-400" style={{color: "white"}}>New Balance</span>
                          <span className="font-medium text-white" style={{color: "white"}}>{currencySymbol}{formatCurrency(newBalance)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={!amount || !pin}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3.5 rounded-lg text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    Preview Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('')}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3.5 rounded-lg text-base font-medium text-white bg-gray-600 hover:bg-gray-500 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-6 p-5 rounded-lg" style={{ backgroundColor: 'rgb(31 41 55)' }}>
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-white" style={{color: "white"}}>Secure Transaction</h3>
              <p className="text-xs text-gray-400 mt-1" style={{color: "white"}}>All transfers are encrypted and processed securely. Your financial information is never stored on our servers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-black/70" onClick={() => !isSubmitting && setShowPreview(false)} />
            <div className="relative z-10 inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform rounded-2xl shadow-xl sm:align-middle sm:max-w-lg" style={{ backgroundColor: 'rgb(31 41 55)' }}>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-600">
                <h3 className="text-lg font-bold text-white flex items-center" style={{color: "white"}}>
                  <CheckCircle className="h-5 w-5 mr-2 text-cyan-400" />
                  Confirm Transfer Details
                </h3>
                <button type="button" onClick={() => !isSubmitting && setShowPreview(false)} className="text-gray-400 hover:text-white" disabled={isSubmitting}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg p-4" style={{ backgroundColor: 'rgb(55 65 81)' }}>
                  <div className="mb-3 pb-2 border-b border-gray-600">
                    <h4 className="text-sm font-medium text-white" style={{color: "white"}}>Transfer Summary</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Method</span>
                      <span className="font-medium text-white">{getMethodTitle()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount</span>
                      <span className="font-medium text-white">{currencySymbol}{formatCurrency(amountValue)}</span>
                    </div>
                    <div className="border-t border-gray-600 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-white font-medium">Total</span>
                        <span className="font-bold text-white">{currencySymbol}{formatCurrency(amountValue)}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-gray-400">New Balance</span>
                        <span className="font-medium text-white">{currencySymbol}{formatCurrency(newBalance)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start text-sm p-3 bg-amber-500/20 border-l-4 border-amber-400 rounded-r-md">
                  <AlertTriangle className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0" />
                  <p className="text-amber-200">
                    Please verify the transfer details carefully. Once confirmed, transfers cannot be reversed.
                  </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    disabled={isSubmitting}
                    className="flex-1 inline-flex justify-center items-center px-4 py-3 rounded-lg text-base font-medium text-white bg-gray-600 hover:bg-gray-500 transition-colors disabled:opacity-50"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 inline-flex justify-center items-center px-4 py-3 rounded-lg text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Confirm Transfer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
