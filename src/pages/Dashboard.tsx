import React from 'react';
import { User, Settings, CreditCard, Activity, Box, BookOpen, Link as LinkIcon, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
      {/* Sidebar - Represents Top-Left in a responsive way */}
      <aside className="w-full md:w-64 bg-white border-r border-neutral-200 p-6 flex flex-col">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            JD
          </div>
          <div>
            <h2 className="font-semibold text-neutral-900">John Doe</h2>
            <p className="text-sm text-neutral-500">Merchant</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          <a href="#" className="flex items-center space-x-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
            <Activity className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 text-neutral-600 hover:bg-neutral-50 rounded-lg">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </a>
          <Link to="/checkout" className="flex items-center space-x-3 px-3 py-2 text-neutral-600 hover:bg-neutral-50 rounded-lg">
            <LinkIcon className="w-5 h-5" />
            <span className="font-medium">View Checkout Flow</span>
          </Link>
          <Link to="/blueprint" className="flex items-center space-x-3 px-3 py-2 text-neutral-600 hover:bg-neutral-50 rounded-lg">
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">Architecture Blueprint</span>
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-neutral-200">
          <button className="flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 flex flex-col lg:flex-row gap-8 overflow-y-auto">
        
        {/* Center: Payment Hub */}
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Payment Hub</h1>
            <p className="text-neutral-500">Manage your payment methods and monitor transactions in real-time.</p>
          </div>

          {/* Smart Limits & Numbers */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Active Numbers & Smart Limits
              </h3>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Add Number</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold text-xs">
                    bKash
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">017XXXXXXX1</p>
                    <p className="text-xs text-neutral-500">Primary • Personal</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-900">৳ 12,500 / 25,000</p>
                  <div className="w-32 h-2 bg-neutral-200 rounded-full mt-1.5">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xs">
                    Nagad
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">019XXXXXXX2</p>
                    <p className="text-xs text-neutral-500">Backup • Personal</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-900">৳ 1,200 / 25,000</p>
                  <div className="w-32 h-2 bg-neutral-200 rounded-full mt-1.5">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Transactions */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">Recent Transactions</h3>
              <span className="flex items-center gap-2 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Live Sync
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-500">
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Method</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  <tr>
                    <td className="py-4">
                      <p className="font-medium text-neutral-900">Robiul Islam</p>
                      <p className="text-xs text-neutral-500">017...1234</p>
                    </td>
                    <td className="py-4 font-medium text-neutral-900">৳ 1,500</td>
                    <td className="py-4 text-neutral-600">bKash (Auto)</td>
                    <td className="py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Success
                      </span>
                    </td>
                    <td className="py-4 text-neutral-500">Just now</td>
                  </tr>
                  <tr>
                    <td className="py-4">
                      <p className="font-medium text-neutral-900">Ahmed Hasan</p>
                      <p className="text-xs text-neutral-500">TrxID: 9J2K1...</p>
                    </td>
                    <td className="py-4 font-medium text-neutral-900">৳ 500</td>
                    <td className="py-4 text-neutral-600">Nagad (Manual)</td>
                    <td className="py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Success
                      </span>
                    </td>
                    <td className="py-4 text-neutral-500">5 mins ago</td>
                  </tr>
                  <tr>
                    <td className="py-4">
                      <p className="font-medium text-neutral-900">Anonymous</p>
                      <p className="text-xs text-neutral-500">Pending Auth</p>
                    </td>
                    <td className="py-4 font-medium text-neutral-900">৳ 2,000</td>
                    <td className="py-4 text-neutral-600">bKash (Auto)</td>
                    <td className="py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                        10m Session
                      </span>
                    </td>
                    <td className="py-4 text-neutral-500">Active</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Service & Upsell Loop */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-neutral-900 rounded-2xl p-6 text-white shadow-xl">
            <h3 className="text-lg font-bold mb-2">Grow Your Business</h3>
            <p className="text-neutral-400 text-sm mb-6">Upgrade to our pro ecosystem and unlock automated e-commerce tools.</p>
            
            <div className="space-y-3">
              <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors rounded-xl p-3 flex items-center gap-3 text-left">
                <Box className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="font-medium text-sm">Reseller Hosting</div>
                  <div className="text-xs text-neutral-400">Start your own agency</div>
                </div>
              </button>
              
              <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors rounded-xl p-3 flex items-center gap-3 text-left">
                <LinkIcon className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="font-medium text-sm">Buy Domain</div>
                  <div className="text-xs text-neutral-400">Get a custom web address</div>
                </div>
              </button>
              
              <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors rounded-xl p-3 flex items-center gap-3 text-left">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="font-medium text-sm">Zero-Coding Guide</div>
                  <div className="text-xs text-neutral-400">Learn to build e-commerce</div>
                </div>
              </button>
            </div>
          </div>
        </div>
        
      </main>
    </div>
  );
}
