import React from 'react';
import { 
  Navigation, CheckCircle, Shield, AlertTriangle, Play, Check, MapPin, 
  User, Phone, ChevronRight, DollarSign 
} from 'lucide-react';
import { Order } from '../types';

interface RiderAppProps {
  orders: Order[];
  onUpdateOrder: (updatedOrder: Order) => void;
}

export default function RiderApp({ orders, onUpdateOrder }: RiderAppProps) {
  // Filter active delivery orders for the rider
  const activeDeliveries = orders.filter(
    ord => ['Pending', 'Approved', 'Packed', 'Dispatched', 'InTransit'].includes(ord.status)
  );

  const handleUpdateStatus = (order: Order, nextStatus: Order['status']) => {
    let estTime = order.estimatedDeliveryTime;
    if (nextStatus === 'Dispatched') {
      estTime = '25 mins';
    } else if (nextStatus === 'InTransit') {
      estTime = '12 mins';
    } else if (nextStatus === 'Delivered') {
      estTime = 'Completed';
    }

    onUpdateOrder({
      ...order,
      status: nextStatus,
      riderPosition: nextStatus === 'Delivered' ? 100 : order.riderPosition,
      estimatedDeliveryTime: estTime
    });
  };

  const handleSliderChange = (order: Order, val: number) => {
    let estTime = order.estimatedDeliveryTime;
    if (val >= 100) {
      estTime = 'Arrived';
    } else {
      const remainingMinutes = Math.max(1, Math.round(25 * (1 - val / 100)));
      estTime = `${remainingMinutes} mins`;
    }

    onUpdateOrder({
      ...order,
      riderPosition: val,
      status: val >= 100 ? 'Delivered' : 'InTransit',
      estimatedDeliveryTime: estTime
    });
  };

  return (
    <div id="rider-app-root" className="flex flex-col h-full bg-slate-900 text-slate-100">
      
      {/* Phone Header */}
      <div className="bg-slate-950 px-4 py-3 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 text-slate-950 rounded-lg p-1">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">Rider Desk</h2>
            <p className="text-[10px] text-slate-400">SilkGlow Express Logistics</p>
          </div>
        </div>
        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
          ● Online
        </span>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Statistics Bar */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-800 border border-slate-700/50 p-3 rounded-2xl">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Pending Runs</p>
            <p className="text-xl font-black mt-1 text-amber-500">{activeDeliveries.length}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700/50 p-3 rounded-2xl">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Today Earnings</p>
            <p className="text-xl font-black mt-1 text-emerald-400">PKR 1,450</p>
          </div>
        </div>

        <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Active Delivery Queue</h3>

        {activeDeliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-3">
            <CheckCircle className="w-12 h-12 text-slate-600 stroke-1" />
            <p className="text-xs font-bold">No pending deliveries found</p>
            <p className="text-[10px] text-slate-500 text-center max-w-xs">
              Place a new customer order from the 🛒 <strong>Customer App</strong> to generate an active route.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeDeliveries.map(order => (
              <div 
                key={order.id}
                className="bg-slate-800 border border-slate-700/60 rounded-2xl p-4 space-y-4 shadow-md hover:border-slate-600 transition-colors"
              >
                {/* Header detail */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-black tracking-widest bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase">
                      ID: {order.orderNumber}
                    </span>
                    <h4 className="font-extrabold text-sm text-white mt-1.5 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {order.customerName}
                    </h4>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400">Est. Collectable</p>
                    <p className="font-extrabold text-emerald-400 text-xs">
                      PKR {order.total.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Delivery Location detail */}
                <div className="space-y-1.5 border-t border-b border-slate-700/50 py-3 text-xs">
                  <p className="text-slate-400 flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{order.deliveryAddress}</span>
                  </p>
                  {order.notes && (
                    <p className="text-[10px] text-amber-400 bg-amber-400/5 border border-amber-500/10 px-2.5 py-1.5 rounded-xl flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Note: {order.notes}
                    </p>
                  )}
                </div>

                {/* Active Milestones Actions */}
                <div className="space-y-3">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Update Delivery Stage:
                  </p>
                  
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      id="dispatch-btn"
                      disabled={order.status !== 'Pending' && order.status !== 'Approved' && order.status !== 'Packed'}
                      onClick={() => handleUpdateStatus(order, 'Dispatched')}
                      className={`py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${
                        order.status === 'Dispatched' || order.status === 'InTransit' || order.status === 'Delivered'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30'
                      }`}
                    >
                      <Play className="w-3 h-3" />
                      Dispatch
                    </button>

                    <button
                      id="transit-btn"
                      disabled={order.status !== 'Dispatched'}
                      onClick={() => handleUpdateStatus(order, 'InTransit')}
                      className={`py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${
                        order.status === 'InTransit' || order.status === 'Delivered'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-30'
                      }`}
                    >
                      <Navigation className="w-3 h-3" />
                      Transit
                    </button>

                    <button
                      id="delivered-btn"
                      disabled={order.status !== 'InTransit' && order.status !== 'Dispatched'}
                      onClick={() => handleUpdateStatus(order, 'Delivered')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 disabled:opacity-30 transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      Complete
                    </button>
                  </div>

                  {/* REAL-TIME SIMULATED GPS TRACKER */}
                  {(order.status === 'Dispatched' || order.status === 'InTransit') && (
                    <div className="bg-slate-900 border border-slate-700 p-3 rounded-2xl space-y-2">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400 font-bold flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-indigo-400" />
                          Simulate GPS Route Progress
                        </span>
                        <span className="text-indigo-400 font-mono font-bold">{order.riderPosition}%</span>
                      </div>
                      
                      <input 
                        id="gps-slider"
                        type="range" 
                        min="0" 
                        max="100" 
                        value={order.riderPosition} 
                        onChange={(e) => handleSliderChange(order, parseInt(e.target.value))}
                        className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                      
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                        <span>Centaurus Shop</span>
                        <span>F-10 Apartments</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 text-center text-[10px] text-slate-500">
        Secured Mobile Delivery Client v2.1 • SSL Enabled
      </div>
    </div>
  );
}
