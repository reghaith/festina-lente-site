'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Hero Section */}
      <main className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-surface-primary sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32 transition-colors duration-300">
          <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="text-center lg:w-full lg:max-w-4xl lg:text-left xl:w-full">
              <h1 className="text-4xl font-extrabold text-primary sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block xl:inline">Earn Real Money with</span>{' '}
                <span className="block text-accent xl:inline">
                  EarnFlow
                </span>
              </h1>
              <p className="mt-3 text-base text-secondary sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 lg:text-lg xl:text-xl">
                Complete surveys, take offers, and earn real money from home. Join over <span className="font-semibold text-accent">10,000+ users</span> already earning with EarnFlow.
              </p>

                {/* CTA Buttons */}
                <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                    <Link
                      href="/register"
                      className="group w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-xl text-white bg-accent hover:bg-accent-hover transition-all duration-200 md:py-5 md:text-lg md:px-12 shadow-lg"
                    >
                      <span className="mr-2">🚀</span>
                      Start Earning Now
                      <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-4">
                    <Link
                      href="/login"
                      className="group w-full flex items-center justify-center px-8 py-4 border-2 border-divider text-base font-semibold rounded-xl text-primary bg-surface-primary hover:bg-surface-secondary hover:border-accent transition-all duration-200 md:py-5 md:text-lg md:px-12 shadow-md hover:shadow-lg"
                    >
                      Sign In
                      <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Trust indicators */}
                <div className="mt-8 flex justify-center lg:justify-start">
                  <div className="flex items-center text-sm text-secondary">
                    <svg className="w-5 h-5 text-success mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Secure & Verified</span>
                    <span className="mx-2 text-muted">•</span>
                    <svg className="w-5 h-5 text-accent mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Instant Payouts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Animated background elements */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="w-96 h-96 bg-gradient-to-r from-pink-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 bg-surface-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
               <h2 className="text-base text-accent font-semibold tracking-wide uppercase">How it works</h2>
               <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-primary sm:text-4xl">
                 Earn money in 3 simple steps
               </p>
               <p className="mt-4 max-w-2xl text-xl text-secondary lg:mx-auto">
                 Start earning today with our easy-to-use platform
               </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-accent rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-surface-secondary p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-xl">1️⃣</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-primary">Sign Up</h3>
                        <p className="mt-2 text-sm text-secondary">
                          Create your free account and verify your email
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-success rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-surface-secondary p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-xl">2️⃣</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-primary">Complete Tasks</h3>
                        <p className="mt-2 text-sm text-secondary">
                          Take surveys and offers from our verified partners
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-warning rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-surface-secondary p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-warning rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-xl">3️⃣</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-primary">Get Paid</h3>
                        <p className="mt-2 text-sm text-secondary">
                          Withdraw your earnings to PayPal, bank, or crypto
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-accent">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Join our growing community
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
                <div>
                  <div className="text-4xl font-bold text-white">10K+</div>
                  <div className="mt-2 text-white opacity-90">Active Users</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white">$500K+</div>
                  <div className="mt-2 text-white opacity-90">Paid Out</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white">50K+</div>
                  <div className="mt-2 text-white opacity-90">Tasks Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
