'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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
  const [userBalance, setUserBalance] = useState({
    available_balance: 0,
    pending_balance: 0,
    total_earned: 0
  });
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
      <Navbar />
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  href="/help"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Help & FAQ
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Withdraw Funds
                </h1>
                <p className="text-gray-600 dark:text-gray-300">Cash out your earnings to your preferred payment method</p>
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 001.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Available Balance</h2>
                <p className="text-gray-600">Points you can withdraw</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  {loadingBalance ? '...' : userBalance.available_balance.toFixed(0)} ef
                </div>
                <div className="text-sm text-gray-500">
                  Available to withdraw
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Withdrawal Methods */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Choose Payment Method</h3>
              <div className="space-y-3">
                {withdrawalMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{method.name}</h4>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Min: ${method.minAmount}</div>
                        {method.fee > 0 && <div className="text-sm text-red-600">Fee: ${method.fee}</div>}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Processing time: {method.processingTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Withdrawal Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Withdrawal Details</h3>

              {selectedMethod && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">
                      {withdrawalMethods.find(m => m.id === selectedMethod)?.icon}
                    </span>
                    <span className="font-semibold text-blue-900">
                      {withdrawalMethods.find(m => m.id === selectedMethod)?.name}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-blue-700">
                    Processing time: {withdrawalMethods.find(m => m.id === selectedMethod)?.processingTime}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {selectedMethod && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Min: {withdrawalMethods.find(m => m.id === selectedMethod)?.minAmount} ef |
                      Max: {Math.max(0, userBalance.available_balance - (withdrawalMethods.find(m => m.id === selectedMethod)?.fee || 0)).toFixed(0)} ef
                    </div>
                  )}
                </div>

                {amount && selectedMethod && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm space-y-1 text-gray-900 dark:text-gray-100">
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Amount:</span>
                        <span className="font-medium">{parseFloat(amount).toFixed(0)} ef</span>
                      </div>
                      {(() => {
                        const method = withdrawalMethods.find(m => m.id === selectedMethod);
                        return method && method.fee > 0 && (
                          <div className="flex justify-between text-red-600 dark:text-red-400">
                            <span>Fee:</span>
                            <span>-{method.fee} ef</span>
                          </div>
                        );
                      })()}
                      <div className="border-t border-gray-300 dark:border-gray-600 pt-1 flex justify-between font-semibold">
                        <span className="text-gray-700 dark:text-gray-300">You'll receive:</span>
                        <span className="text-green-600 dark:text-green-400">{(() => {
                          const method = withdrawalMethods.find(m => m.id === selectedMethod);
                          return Math.max(0, parseFloat(amount) - (method?.fee || 0)).toFixed(0);
                        })()} ef</span>
                      </div>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg whitespace-pre-line">
                    {successMessage}
                  </div>
                )}

                <button
                  onClick={handleWithdraw}
                  disabled={!selectedMethod || !amount || parseFloat(amount) <= 0}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    !selectedMethod || !amount || parseFloat(amount) <= 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
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

function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2 group hover:opacity-80 transition-opacity duration-200">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EarnFlow
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-blue-50"
            >
              Dashboard
            </Link>
            <Link
              href="/withdraw"
              className="text-purple-600 bg-purple-50 px-3 py-2 rounded-lg text-sm font-medium"
            >
              Withdraw
            </Link>
            <Link
              href="/help"
              className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-purple-50"
            >
              Help
            </Link>
            <button
              onClick={() => signOut()}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}