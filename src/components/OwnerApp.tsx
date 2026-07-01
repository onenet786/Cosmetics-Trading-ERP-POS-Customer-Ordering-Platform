import React, { useState } from 'react';
import { 
  BarChart3, ShieldAlert, Check, X, Bell, Eye, Search, Smartphone, 
  MapPin, DollarSign, ArrowUpRight, ArrowDownRight, Fingerprint, Lock, 
  Unlock, Sparkles 
} from 'lucide-react';
import { ReturnRequest, Order, Branch, Notification } from '../types';

interface OwnerAppProps {
  branches: Branch[];
  orders: Order[];
  returnRequests: ReturnRequest[];
  onApproveReturn: (id: string) => void;
  onRejectReturn: (id: string, reason: string) => void;
  notifications: Notification[];
  onMarkNotificationsRead: () => void;
}

export default function OwnerApp({
  branches, orders, returnRequests, onApproveReturn, onRejectReturn, notifications, onMarkNotificationsRead
}: OwnerAppProps) {
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'approvals' | 'notifications'>('dashboard');
  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);
  
  // Biometric auth popup simulation
  const [isBiometricOpen, setIsBiometricOpen] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [isPressingScanner, setIsPressingScanner] = useState(false);
  const [scannerProgress, setScannerProgress] = useState(0);

  // Filter orders by branch
  const filteredOrders = selectedBranchId === 'all' 
    ? orders 
    : orders.filter(o => o.branchId === selectedBranchId);

  // Compute stats
  const totalSales = filteredOrders.reduce((sum, o) => sum + o.total, 0) + 1485000; // adding baseline
  const activeDeliveries = filteredOrders.filter(o => ['Pending', 'Approved', 'Packed', 'Dispatched', 'InTransit'].includes(o.status)).length;
  const pendingApprovals = returnRequests.filter(r => r.status === 'Pending').length;

  const startScannerSimulation = () => {
    setIsPressingScanner(true);
    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      setScannerProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setBiometricSuccess(true);
        setTimeout(() => {
          setIsBiometricOpen(false);
          setIsPressingScanner(false);
          setScannerProgress(0);
          setBiometricSuccess(false);
          if (selectedRequest) {
            onApproveReturn(selectedRequest.id);
            setSelectedRequest(null);
          }
        }, 800);
      }
    }, 150);

    return interval;
  };

  const cancelScanner = () => {
    setIsPressingScanner(false);
    setScannerProgress(0);
  };

  const handleApproveClick = (req: ReturnRequest) => {
    setSelectedRequest(req);
    setIsBiometricOpen(true);
  };

  const handleRejectClick = (req: ReturnRequest) => {
    const reason = prompt('Please enter rejection reason:');
    if (reason !== null) {
      onRejectReturn(req.id, reason || 'Rejected by supervisor');
    }
  };

  return (
    <div id="owner-app-root" className="flex flex-col h-full bg-slate-950 text-slate-100 relative">
      
      {/* Phone Header */}
      <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500 text-slate-950 rounded-lg p-1">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">Owner Portal</h2>
            <p className="text-[10px] text-slate-400">SilkGlow Group ERP Mobile</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setActiveTab('notifications'); onMarkNotificationsRead(); }} 
            className="relative p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"
          >
            <Bell className="w-5 h-5" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-red-500 text-white font-bold text-[8px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Branch Selector */}
      <div className="bg-slate-900/50 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold text-slate-400">Shop Scope:</span>
        <select
          id="owner-branch-select"
          value={selectedBranchId}
          onChange={(e) => setSelectedBranchId(e.target.value)}
          className="bg-slate-850 border border-slate-700 text-xs rounded-xl px-3 py-1 outline-none text-amber-400 font-bold"
        >
          <option value="all">Consolidated (All Branches)</option>
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            
            {/* Quick KPI Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between">
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Gross Sales (MTD)</p>
                  <p className="text-base font-black text-emerald-400 mt-1">PKR {totalSales.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold mt-2">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>+14.2% vs last month</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between">
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Unresolved Returns</p>
                  <p className="text-base font-black text-amber-500 mt-1">{pendingApprovals} pending</p>
                </div>
                <button 
                  onClick={() => setActiveTab('approvals')}
                  className="text-left text-[10px] text-amber-400 font-bold mt-2 hover:underline"
                >
                  Action approvals →
                </button>
              </div>
            </div>

            {/* Delivery Stats Bar */}
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/10 p-4 rounded-2xl flex items-center justify-between shadow-md">
              <div className="space-y-1">
                <span className="bg-indigo-500/20 text-indigo-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase tracking-wider">
                  Live Logistics
                </span>
                <h4 className="font-extrabold text-sm text-white">Active Delivery Runs</h4>
                <p className="text-[10px] text-indigo-200">Riders currently in-transit across branches.</p>
              </div>
              <div className="bg-indigo-600 text-white font-black text-lg h-10 w-10 flex items-center justify-center rounded-xl shadow-lg shadow-indigo-500/15">
                {activeDeliveries}
              </div>
            </div>

            {/* Inventory & Expiry Snapshot */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Critical Inventory Alerts
              </h3>
              
              <div className="space-y-2 divide-y divide-slate-800 text-xs">
                <div className="flex justify-between items-center py-2">
                  <div>
                    <p className="font-bold text-slate-200">03 Rich Tan Foundation</p>
                    <p className="text-[10px] text-slate-500">Stock: 180 Pieces (Reorder level: 200)</p>
                  </div>
                  <span className="bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/20">
                    Low Stock
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div>
                    <p className="font-bold text-slate-200">Hyaluronic B5 Serum (Batch 99)</p>
                    <p className="text-[10px] text-slate-500">Expiring 2026-12-31</p>
                  </div>
                  <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                    Near Expiry
                  </span>
                </div>
              </div>
            </div>

            {/* Mini Sales Analytics Chart */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-300">Daily Sales Trends (Consolidated)</h3>
              
              {/* Custom SVG line chart to guarantee rendering without any package problems */}
              <svg className="w-full h-24" viewBox="0 0 300 80">
                <path d="M 10,70 Q 50,55 90,60 T 170,45 T 250,25 T 290,15" stroke="#10b981" strokeWidth="2.5" fill="none" />
                <path d="M 10,70 Q 50,55 90,60 T 170,45 T 250,25 T 290,15 L 290,75 L 10,75 Z" fill="url(#chart-grad)" opacity="0.15" />
                
                <defs>
                  <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="10" y1="75" x2="290" y2="75" stroke="#1e293b" strokeWidth="1" />
                
                {/* Dots */}
                <circle cx="90" cy="60" r="3" fill="#10b981" />
                <circle cx="170" cy="45" r="3" fill="#10b981" />
                <circle cx="250" cy="25" r="3" fill="#10b981" />
                <circle cx="290" cy="15" r="4" fill="#10b981" />
              </svg>
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>Jun 25</span>
                <span>Jun 27</span>
                <span>Jun 29</span>
                <span>Today</span>
              </div>
            </div>
          </div>
        )}

        {/* Unified Approvals Center Tab */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
              Pending Authorization Queue
            </h3>

            {returnRequests.filter(r => r.status === 'Pending').length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
                <Unlock className="w-12 h-12 text-slate-600 stroke-1" />
                <p className="text-xs font-bold">No active approval requests</p>
                <p className="text-[10px] text-slate-500 text-center max-w-xs">
                  A return or discount beyond the threshold triggered at any shop floor till registers will appear here instantly for approval.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {returnRequests.filter(r => r.status === 'Pending').map(req => (
                  <div 
                    key={req.id}
                    className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-amber-500/10 text-amber-400 text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase">
                          POS Sales Return
                        </span>
                        <h4 className="font-extrabold text-sm mt-2 text-white">{req.itemName}</h4>
                        <p className="text-[10px] text-slate-400">
                          Till: {req.sessionNo} • Cashier: {req.cashierName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400">Refund Amount</p>
                        <p className="font-black text-rose-400 text-sm">PKR {req.refundAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl text-[11px] text-slate-400 border border-slate-850">
                      <span className="font-bold text-slate-300">Reason:</span> {req.reason}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        id="owner-reject-btn"
                        onClick={() => handleRejectClick(req)}
                        className="bg-slate-800 hover:bg-slate-700 text-red-400 font-bold py-2 rounded-xl text-xs border border-red-500/10 transition-colors flex items-center justify-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                      
                      <button
                        id="owner-approve-btn"
                        onClick={() => handleApproveClick(req)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">System Logs & Alerts</h3>
            
            <div className="space-y-2">
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`p-3.5 rounded-2xl border flex gap-3 ${
                    n.read ? 'bg-slate-900/50 border-slate-850 text-slate-400' : 'bg-slate-900 border-indigo-900/30 text-slate-200'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    n.type === 'alert' ? 'bg-red-500' : 
                    n.type === 'warning' ? 'bg-amber-500' : 
                    n.type === 'success' ? 'bg-emerald-500' : 'bg-indigo-400'
                  }`} />
                  <div>
                    <h4 className="font-bold text-xs text-white">{n.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{n.message}</p>
                    <span className="text-[9px] text-slate-500 block mt-1 font-mono">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* BIOMETRIC AUTHORIZATION POPUP */}
      {isBiometricOpen && selectedRequest && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm text-center space-y-6 animate-scale-up">
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Supervisory Authorization Required</h3>
              <p className="text-xs text-slate-400 px-4">
                Verify return of <strong>{selectedRequest.itemName}</strong> worth <strong className="text-rose-400">PKR {selectedRequest.refundAmount.toLocaleString()}</strong>.
              </p>
            </div>

            {/* Simulated Fingerprint Scanner Button */}
            <div className="space-y-4 py-4">
              <button
                id="fingerprint-scan-btn"
                onMouseDown={startScannerSimulation}
                onMouseUp={cancelScanner}
                onMouseLeave={cancelScanner}
                onTouchStart={startScannerSimulation}
                onTouchEnd={cancelScanner}
                className={`mx-auto w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all outline-none ${
                  isPressingScanner 
                    ? 'bg-amber-500/20 text-amber-400 scale-95 border-2 border-amber-500/50' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                }`}
              >
                <Fingerprint className="w-12 h-12" />
                <span className="text-[8px] font-bold uppercase mt-1 tracking-widest text-slate-500">
                  {isPressingScanner ? `${scannerProgress}%` : 'Hold to Scan'}
                </span>
              </button>
              
              <p className="text-[10px] text-slate-400">
                {biometricSuccess 
                  ? 'Biometric Key Verified!' 
                  : isPressingScanner 
                    ? 'Scanning and validating securely...' 
                    : 'Press and hold scanner button to verify.'
                }
              </p>
            </div>

            <button
              onClick={() => setIsBiometricOpen(false)}
              className="text-slate-500 hover:text-slate-300 text-xs font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="bg-slate-900 border-t border-slate-800 px-6 py-2.5 flex justify-between text-slate-400 shadow-lg">
        {[
          { id: 'dashboard', label: 'Overview', icon: BarChart3 },
          { id: 'approvals', label: 'Approvals', icon: ShieldAlert, badge: pendingApprovals },
          { id: 'notifications', label: 'Logs', icon: Bell }
        ].map(tab => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
                isSelected ? 'text-amber-500 font-bold' : 'hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{tab.label}</span>
              {tab.badge && tab.badge > 0 && (
                <span className="absolute top-1 right-2 bg-red-500 text-white font-bold text-[8px] w-4.5 h-4.5 flex items-center justify-center rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
