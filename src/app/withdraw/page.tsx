'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/lib/dark-mode';
import Navbar from '@/components/Navbar';

interface WithdrawalMethod {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  fee: number;
  processingTime: string;
  icon: string;
}

export default function WithdrawPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const { isDarkMode } = useDarkMode();
  const [userBalance, setUserBalance] = useState({
    available_balance: 0,
    pending_balance: 0,
    total_earned: 0
  });
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/balance?userId=${user.id}`);
        const data = await response.json();

        if (data.success) {
          setUserBalance(data.balance);
        }
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchBalance();
  }, [user]);

  const withdrawalMethods: WithdrawalMethod[] = [
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Withdraw to your PayPal account',
      minAmount: 10,
      fee: 0,
      processingTime: '1-3 business days',
      icon: '🅿️'
    },
    {
      id: 'venmo',
      name: 'Venmo',
      description: 'Withdraw to your Venmo account',
      minAmount: 5,
      fee: 0,
      processingTime: '1-2 business days',
      icon: '💙'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      description: 'Direct deposit to your bank account',
      minAmount: 25,
      fee: 2.99,
      processingTime: '3-5 business days',
      icon: '🏦'
    },
    {
      id: 'giftcard',
      name: 'Gift Card',
      description: 'Receive Amazon or other gift cards',
      minAmount: 15,
      fee: 1.99,
      processingTime: '2-4 business days',
      icon: '🎁'
    }
  ];

  const handleWithdraw = () => {
    setErrorMessage('');
    setSuccessMessage('');

    const numAmount = parseFloat(amount);
    const method = withdrawalMethods.find(m => m.id === selectedMethod);

    if (!method) {
      setErrorMessage('Please select a withdrawal method');
      return;
    }

    if (numAmount < method.minAmount) {
      setErrorMessage(`Minimum withdrawal amount for ${method.name} is ${method.minAmount} ef`);
      return;
    }

    if (numAmount > userBalance.available_balance) {
      setErrorMessage('Insufficient balance');
      return;
    }

    // In a real app, this would process the withdrawal
    setSuccessMessage(`Withdrawal request submitted!\n\nAmount: ${numAmount} ef\nMethod: ${method.name}\nProcessing time: ${method.processingTime}\n\n(This is a demo - in production this would process the actual withdrawal)`);

    // Reset form
    setAmount('');
    setSelectedMethod('');
  };

  const maxWithdrawal = loadingBalance ? 0 : Math.max(...withdrawalMethods.map(m => userBalance.available_balance - m.fee));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  href="/help"
                  className="inline-flex items-center px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Help & FAQ
                </Link>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Withdraw Funds
            </h1>
            <p className="text-secondary">Cash out your earnings to your preferred payment method</p>
          </div>

          {/* Balance Card */}
          <div className="bg-surface-primary rounded-xl shadow-xl border border-divider p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-primary">Available Balance</h2>
                <p className="text-secondary">Points you can withdraw</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-success">
                  {loadingBalance ? '...' : userBalance.available_balance.toFixed(0)} ef
                </div>
                <div className="text-sm text-muted">
                  Available to withdraw
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Withdrawal Methods */}
            <div className="bg-surface-primary rounded-xl shadow-xl border border-divider p-6">
              <h3 className="text-lg font-bold text-primary mb-4">Choose Payment Method</h3>
              <div className="space-y-3">
                {withdrawalMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      selectedMethod === method.id
                        ? 'border-accent bg-surface-secondary'
                        : 'border-divider hover:border-accent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <h4 className="font-semibold text-primary">{method.name}</h4>
                          <p className="text-sm text-secondary">{method.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted">Min: ${method.minAmount}</div>
                        {method.fee > 0 && <div className="text-sm text-error">Fee: ${method.fee}</div>}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted">
                      Processing time: {method.processingTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Withdrawal Form */}
            <div className="bg-surface-primary rounded-xl shadow-xl border border-divider p-6">
              <h3 className="text-lg font-bold text-primary mb-4">Withdrawal Details</h3>

              {selectedMethod && (
                <div className="mb-6 p-4 bg-surface-secondary rounded-lg border border-divider">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">
                      {withdrawalMethods.find(m => m.id === selectedMethod)?.icon}
                    </span>
                    <span className="font-semibold text-primary">
                      {withdrawalMethods.find(m => m.id === selectedMethod)?.name}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-secondary">
                    Processing time: {withdrawalMethods.find(m => m.id === selectedMethod)?.processingTime}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-primary mb-2">
                    Withdrawal Amount (ef)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter ef amount"
                    min="0"
                    step="1"
                    className="w-full px-3 py-2 border border-divider bg-surface-secondary text-primary rounded-lg placeholder-muted focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                  />
                  {selectedMethod && (
                    <div className="mt-2 text-sm text-secondary">
                      Min: {withdrawalMethods.find(m => m.id === selectedMethod)?.minAmount} ef |
                      Max: {Math.max(0, userBalance.available_balance - (withdrawalMethods.find(m => m.id === selectedMethod)?.fee || 0)).toFixed(0)} ef
                    </div>
                  )}
                </div>

                {amount && selectedMethod && (
                  <div className="bg-surface-secondary rounded-lg p-4 border border-divider">
                    <div className="text-sm space-y-1 text-primary">
                      <div className="flex justify-between">
                        <span className="text-secondary">Amount:</span>
                        <span className="font-medium">{parseFloat(amount).toFixed(0)} ef</span>
                      </div>
                      {(() => {
                        const method = withdrawalMethods.find(m => m.id === selectedMethod);
                        return method && method.fee > 0 && (
                          <div className="flex justify-between text-error">
                            <span>Fee:</span>
                            <span>-{method.fee} ef</span>
                          </div>
                        );
                      })()}
                      <div className="border-t border-divider pt-1 flex justify-between font-semibold">
                        <span className="text-secondary">You&apos;ll receive:</span>
                        <span className="text-success">{(() => {
                          const method = withdrawalMethods.find(m => m.id === selectedMethod);
                          return Math.max(0, parseFloat(amount) - (method?.fee || 0)).toFixed(0);
                        })()} ef</span>
                      </div>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="mb-4 p-3 bg-error border border-error text-white rounded-lg">
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="mb-4 p-3 bg-success border border-success text-white rounded-lg whitespace-pre-line">
                    {successMessage}
                  </div>
                )}

                <button
                  onClick={handleWithdraw}
                  disabled={!selectedMethod || !amount || parseFloat(amount) <= 0}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    !selectedMethod || !amount || parseFloat(amount) <= 0
                      ? 'bg-disabled text-muted cursor-not-allowed'
                      : 'bg-success hover:bg-success text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  Request Withdrawal
                </button>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}