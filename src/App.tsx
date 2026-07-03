/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2
} from 'lucide-react';

import { 
  Branch, Product, ProductVariant, Batch, COAAccount, Party, Order, 
  ReturnRequest, Notification, StockTransfer, Voucher 
} from './types';

import { 
  INITIAL_BRANCHES, INITIAL_PRODUCTS, INITIAL_VARIANTS, INITIAL_BATCHES, 
  INITIAL_COA, INITIAL_PARTIES, INITIAL_ORDERS, INITIAL_NOTIFICATIONS 
} from './data/initialData';

// Import our modular components
import CustomerApp from './components/CustomerApp';
import RiderApp from './components/RiderApp';
import OwnerApp from './components/OwnerApp';
import POSCashier from './components/POSCashier';
import ERPAdmin from './components/ERPAdmin';

// Import our database service
import { firebaseService } from './apiService';

export default function App() {
  // Shared Live Database State from Firestore
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [coaAccounts, setCoaAccounts] = useState<COAAccount[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  
  // Active Customer Order for tracking
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Perspective Control
  const [perspective, setPerspective] = useState<'customer' | 'rider' | 'owner' | 'pos' | 'erp'>('customer');

  // Real-time syncing with Firestore & Seeding
  useEffect(() => {
    async function initAndSync() {
      // 1. Fetch current live data to check if seeding is needed
      const bLive = await firebaseService.getCollection<Branch>('branches');
      const pLive = await firebaseService.getCollection<Product>('products');
      const vLive = await firebaseService.getCollection<ProductVariant>('variants');
      const btLive = await firebaseService.getCollection<Batch>('batches');
      const coaLive = await firebaseService.getCollection<COAAccount>('coaAccounts');
      const ptyLive = await firebaseService.getCollection<Party>('parties');
      const ordLive = await firebaseService.getCollection<Order>('orders');
      const notLive = await firebaseService.getCollection<Notification>('notifications');
      const retLive = await firebaseService.getCollection<ReturnRequest>('returnRequests');

      // 2. Perform Seeding for empty collections to guarantee out-of-the-box rich usability
      if (bLive.length === 0) {
        for (const item of INITIAL_BRANCHES) {
          await firebaseService.saveDoc('branches', item);
        }
      }
      if (pLive.length === 0) {
        for (const item of INITIAL_PRODUCTS) {
          await firebaseService.saveDoc('products', item);
        }
      }
      if (vLive.length === 0) {
        for (const item of INITIAL_VARIANTS) {
          await firebaseService.saveDoc('variants', item);
        }
      }
      if (btLive.length === 0) {
        for (const item of INITIAL_BATCHES) {
          await firebaseService.saveDoc('batches', item);
        }
      }
      if (coaLive.length === 0) {
        for (const item of INITIAL_COA) {
          await firebaseService.saveDoc('coaAccounts', item);
        }
      }
      if (ptyLive.length === 0) {
        for (const item of INITIAL_PARTIES) {
          await firebaseService.saveDoc('parties', item);
        }
      }
      if (ordLive.length === 0) {
        for (const item of INITIAL_ORDERS) {
          await firebaseService.saveDoc('orders', item);
        }
      }
      if (notLive.length === 0) {
        for (const item of INITIAL_NOTIFICATIONS) {
          await firebaseService.saveDoc('notifications', item);
        }
      }
      if (retLive.length === 0) {
        const initialReturn: ReturnRequest = {
          id: 'ret-80912',
          sessionNo: 'SESS-8091',
          cashierName: 'Zainab Fatima',
          branchId: 'b-01',
          originalInvoiceNo: 'INV-309142',
          itemName: 'Velvet Matte Cushion Lipstick (Rosewood Blush)',
          qty: 1,
          uom: 'Piece',
          reason: 'Customer shade did not match expectation',
          refundAmount: 1400,
          status: 'Pending',
          requestedAt: '12:45 PM'
        };
        await firebaseService.saveDoc('returnRequests', initialReturn);
      }

      // 3. Set up active realtime snapshot listeners
      const unsubBranches = firebaseService.subscribeCollection<Branch>('branches', setBranches);
      const unsubProducts = firebaseService.subscribeCollection<Product>('products', setProducts);
      const unsubVariants = firebaseService.subscribeCollection<ProductVariant>('variants', setVariants);
      const unsubBatches = firebaseService.subscribeCollection<Batch>('batches', setBatches);
      const unsubCoa = firebaseService.subscribeCollection<COAAccount>('coaAccounts', (data) => {
        const sorted = [...data].sort((a, b) => (a.code || '').localeCompare(b.code || ''));
        setCoaAccounts(sorted);
      });
      const unsubParties = firebaseService.subscribeCollection<Party>('parties', setParties);
      const unsubOrders = firebaseService.subscribeCollection<Order>('orders', (data) => {
        const sorted = [...data].sort((a, b) => (b.id || '').localeCompare(a.id || ''));
        setOrders(sorted);
      });
      const unsubNotifications = firebaseService.subscribeCollection<Notification>('notifications', (data) => {
        const sorted = [...data].sort((a, b) => (b.id || '').localeCompare(a.id || ''));
        setNotifications(sorted);
      });
      const unsubReturns = firebaseService.subscribeCollection<ReturnRequest>('returnRequests', (data) => {
        const sorted = [...data].sort((a, b) => (b.id || '').localeCompare(a.id || ''));
        setReturnRequests(sorted);
      });
      const unsubTransfers = firebaseService.subscribeCollection<StockTransfer>('stockTransfers', setStockTransfers);
      const unsubVouchers = firebaseService.subscribeCollection<Voucher>('vouchers', setVouchers);

      return () => {
        unsubBranches();
        unsubProducts();
        unsubVariants();
        unsubBatches();
        unsubCoa();
        unsubParties();
        unsubOrders();
        unsubNotifications();
        unsubReturns();
        unsubTransfers();
        unsubVouchers();
      };
    }

    let unsubFn: (() => void) | undefined;
    initAndSync().then(unsub => {
      unsubFn = unsub;
    });

    return () => {
      if (unsubFn) unsubFn();
    };
  }, []);

  // Load the first in-transit order as the active tracking order initially if exists
  useEffect(() => {
    const transitOrder = orders.find(o => o.status === 'InTransit' || o.status === 'Dispatched');
    if (transitOrder) {
      setActiveOrder(transitOrder);
    }
  }, [orders]);

  // STATE HANDLERS (Now fully writing directly to Firebase)

  // 1. Placing order from Customer App
  const handlePlaceOrder = async (newOrder: Order) => {
    await firebaseService.saveDoc('orders', newOrder);
    setActiveOrder(newOrder);

    // Create a system alert notification
    const newAlert: Notification = {
      id: `not-${Date.now()}`,
      title: 'New Online Order Placed',
      message: `${newOrder.customerName} ordered ${newOrder.items.length} cosmetics items worth PKR ${newOrder.total.toLocaleString()} from Centaurus Mall.`,
      time: 'Just now',
      type: 'success',
      read: false
    };
    await firebaseService.saveDoc('notifications', newAlert);

    // Update Accounts Receivable COA control balance if unpaid or Cash if paid
    const updatedAccounts = coaAccounts.map(acc => {
      let balance = acc.balance;
      if (newOrder.paymentStatus === 'Paid') {
        if (acc.id === 'a-1110') balance += newOrder.total;
      } else {
        if (acc.id === 'a-1130') balance += newOrder.total;
      }
      if (acc.id === 'a-4100') balance -= newOrder.subtotal;
      if (acc.id === 'a-2120') balance -= newOrder.tax;
      return { ...acc, balance };
    });

    for (const acc of updatedAccounts) {
      const original = coaAccounts.find(x => x.id === acc.id);
      if (original && original.balance !== acc.balance) {
        await firebaseService.updateDoc('coaAccounts', acc.id, { balance: acc.balance });
      }
    }
  };

  // 2. Updating order status (Rider App or ERP)
  const handleUpdateOrder = async (updatedOrder: Order) => {
    await firebaseService.saveDoc('orders', updatedOrder);
    if (activeOrder && activeOrder.id === updatedOrder.id) {
      setActiveOrder(updatedOrder);
    }

    // Trigger notification on milestones
    if (updatedOrder.status === 'Dispatched') {
      const dispatchAlert: Notification = {
        id: `not-${Date.now()}`,
        title: 'Delivery Dispatched',
        message: `Rider has picked up cosmetics order ${updatedOrder.orderNumber} for ${updatedOrder.customerName}.`,
        time: 'Just now',
        type: 'info',
        read: false
      };
      await firebaseService.saveDoc('notifications', dispatchAlert);
    } else if (updatedOrder.status === 'Delivered') {
      const deliveryAlert: Notification = {
        id: `not-${Date.now()}`,
        title: 'Delivery Completed',
        message: `Order ${updatedOrder.orderNumber} successfully delivered to ${updatedOrder.customerName}. Funds reconciled.`,
        time: 'Just now',
        type: 'success',
        read: false
      };
      await firebaseService.saveDoc('notifications', deliveryAlert);
      
      // Reconcile accounts receivable if paid on delivery
      if (updatedOrder.paymentMethod === 'Cash') {
        const updatedAccounts = coaAccounts.map(acc => {
          let balance = acc.balance;
          if (acc.id === 'a-1110') balance += updatedOrder.total; // cash in
          if (acc.id === 'a-1130' && updatedOrder.paymentStatus !== 'Paid') balance -= updatedOrder.total; // reduce AR
          return { ...acc, balance };
        });

        for (const acc of updatedAccounts) {
          const original = coaAccounts.find(x => x.id === acc.id);
          if (original && original.balance !== acc.balance) {
            await firebaseService.updateDoc('coaAccounts', acc.id, { balance: acc.balance });
          }
        }
      }
    }
  };

  // 3. POS Cashier initiates a Return
  const handleInitiateReturn = async (newRequest: ReturnRequest) => {
    await firebaseService.saveDoc('returnRequests', newRequest);

    const returnAlert: Notification = {
      id: `not-${Date.now()}`,
      title: 'Return Requested at Till',
      message: `Cashier Zainab initiated return for ${newRequest.itemName} worth PKR ${newRequest.refundAmount.toLocaleString()}. Approval pending.`,
      time: 'Just now',
      type: 'warning',
      read: false
    };
    await firebaseService.saveDoc('notifications', returnAlert);
  };

  // 4. Owner approves POS Return
  const handleApproveReturn = async (id: string) => {
    const req = returnRequests.find(r => r.id === id);
    if (!req) return;

    await firebaseService.updateDoc('returnRequests', id, { status: 'Approved', approvedAt: 'Just now' });

    const approvedAlert: Notification = {
      id: `not-${Date.now()}`,
      title: 'POS Return APPROVED',
      message: `Return of ${req.itemName} worth PKR ${req.refundAmount.toLocaleString()} approved. Cashier unlocked.`,
      time: 'Just now',
      type: 'success',
      read: false
    };
    await firebaseService.saveDoc('notifications', approvedAlert);

    // Financial Posting: Debit Sales Revenue, Credit Cash on Hand
    const updatedAccounts = coaAccounts.map(acc => {
      let balance = acc.balance;
      if (acc.id === 'a-4100') balance += req.refundAmount; // Debit (increase) Sales Revenue (decreasing credit balance)
      if (acc.id === 'a-1110') balance -= req.refundAmount; // Credit (decrease) Cash on Hand
      return { ...acc, balance };
    });

    for (const acc of updatedAccounts) {
      const original = coaAccounts.find(x => x.id === acc.id);
      if (original && original.balance !== acc.balance) {
        await firebaseService.updateDoc('coaAccounts', acc.id, { balance: acc.balance });
      }
    }
  };

  // 5. Owner rejects POS Return
  const handleRejectReturn = async (id: string, reason: string) => {
    const req = returnRequests.find(r => r.id === id);
    if (!req) return;

    await firebaseService.updateDoc('returnRequests', id, { status: 'Rejected', rejectedReason: reason });

    const rejectedAlert: Notification = {
      id: `not-${Date.now()}`,
      title: 'POS Return REJECTED',
      message: `Return request of ${req.itemName} rejected: "${reason}".`,
      time: 'Just now',
      type: 'info',
      read: false
    };
    await firebaseService.saveDoc('notifications', rejectedAlert);
  };

  // 6. Adding / Editing / Deleting products from ERP (Full SKU CRUD)
  const handleAddProduct = async (prod: Product) => {
    await firebaseService.saveDoc('products', prod);
  };

  const handleAddVariant = async (v: ProductVariant) => {
    await firebaseService.saveDoc('variants', v);
  };

  const handleUpdateVariant = async (vId: string, fields: Partial<ProductVariant>) => {
    await firebaseService.updateDoc('variants', vId, fields);
  };

  const handleDeleteVariant = async (vId: string) => {
    await firebaseService.deleteDoc('variants', vId);
  };

  const handleDeleteProduct = async (pId: string) => {
    // Delete product
    await firebaseService.deleteDoc('products', pId);
    // Delete related variants
    const relatedVariants = variants.filter(v => v.productId === pId);
    for (const rv of relatedVariants) {
      await firebaseService.deleteDoc('variants', rv.id);
    }
  };

  // 7. Stock transfers from ERP
  const handleTransferStock = async (transfer: StockTransfer) => {
    await firebaseService.saveDoc('stockTransfers', transfer);

    // Decrease stock level of source variant
    const matchedVariant = variants.find(v => v.productId === transfer.productId);
    if (matchedVariant) {
      const qtyToDeduct = transfer.uom === 'Dozen' ? transfer.qty * 12 : transfer.uom === 'Carton' ? transfer.qty * 144 : transfer.qty;
      const newStock = Math.max(0, matchedVariant.stockLevel - qtyToDeduct);
      await firebaseService.updateDoc('variants', matchedVariant.id, { stockLevel: newStock });
    }

    const transferAlert: Notification = {
      id: `not-${Date.now()}`,
      title: 'Stock Transfer Dispatched',
      message: `Dispatched ${transfer.qty} ${transfer.uom} of item SKU from Centaurus Mall.`,
      time: 'Just now',
      type: 'info',
      read: false
    };
    await firebaseService.saveDoc('notifications', transferAlert);
  };

  // 8. General Ledger manual voucher posting & full COA Account CRUD
  const handleAddVoucher = async (v: Voucher) => {
    await firebaseService.saveDoc('vouchers', v);

    // Update COA Account balances based on lines
    const updatedAccounts = coaAccounts.map(acc => {
      const matchedLine = v.lines.find(l => l.accountId === acc.id);
      if (matchedLine) {
        const netChange = matchedLine.debit - matchedLine.credit;
        return { ...acc, balance: acc.balance + netChange };
      }
      return acc;
    });

    for (const acc of updatedAccounts) {
      const original = coaAccounts.find(x => x.id === acc.id);
      if (original && original.balance !== acc.balance) {
        await firebaseService.updateDoc('coaAccounts', acc.id, { balance: acc.balance });
      }
    }
  };

  const handleSaveCOAAccount = async (acc: COAAccount) => {
    await firebaseService.saveDoc('coaAccounts', acc);
  };

  const handleDeleteCOAAccount = async (accId: string) => {
    await firebaseService.deleteDoc('coaAccounts', accId);
  };

  // 9. Party Ledger CRUD
  const handleSaveParty = async (party: Party) => {
    await firebaseService.saveDoc('parties', party);
  };

  const handleDeleteParty = async (partyId: string) => {
    await firebaseService.deleteDoc('parties', partyId);
  };

  // 10. Branch Configuration CRUD (for Owner Panel)
  const handleSaveBranch = async (branch: Branch) => {
    await firebaseService.saveDoc('branches', branch);
  };

  const handleDeleteBranch = async (branchId: string) => {
    await firebaseService.deleteDoc('branches', branchId);
  };

  // 11. Posting a Cash sale from POS till register
  const handlePostPOSSale = async (subtotal: number, tax: number, total: number, branchId: string) => {
    // Financial Posting
    const updatedAccounts = coaAccounts.map(acc => {
      let balance = acc.balance;
      if (acc.id === 'a-1110') balance += total; // Cash on Hand
      if (acc.id === 'a-4100') balance -= subtotal; // Revenue (-)
      if (acc.id === 'a-2120') balance -= tax; // Sales Tax Payable (-)
      return { ...acc, balance };
    });

    for (const acc of updatedAccounts) {
      const original = coaAccounts.find(x => x.id === acc.id);
      if (original && original.balance !== acc.balance) {
        await firebaseService.updateDoc('coaAccounts', acc.id, { balance: acc.balance });
      }
    }

    // Alert notification logs
    const saleAlert: Notification = {
      id: `not-${Date.now()}`,
      title: 'Retail POS Sale Posted',
      message: `Centaurus Mall POS Till registered sale worth PKR ${total.toLocaleString()} (Tax: PKR ${tax.toLocaleString()}).`,
      time: 'Just now',
      type: 'info',
      read: false
    };
    await firebaseService.saveDoc('notifications', saleAlert);
  };

  const handleMarkNotificationsRead = async () => {
    for (const notif of notifications) {
      if (!notif.read) {
        await firebaseService.updateDoc('notifications', notif.id, { read: true });
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans">
      
      {/* PERSPECTIVE SWITCHER FLOATING CONTROL BAR */}
      <div className="bg-slate-900 border-b border-slate-800 text-white p-3 flex flex-wrap items-center justify-between gap-4 z-40 sticky top-0 shadow-lg backdrop-blur-md bg-opacity-95">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-slate-950 rounded-xl p-2 font-bold flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight flex items-center gap-1.5">
              SilkGlow Cosmetics Group 
              <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-500 text-white rounded-full uppercase tracking-widest">
                ERP Integrated Prototype
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Place an order, simulate delivery rider GPS, and watch accounts update live!</p>
          </div>
        </div>

        {/* Perspective buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          {[
            { id: 'customer', label: '🛒 Customer Shop', desc: 'Browse, Checkout, Map Track' },
            { id: 'rider', label: '🏍️ Delivery Rider', desc: 'Dispatches, GPS Slider Drive' },
            { id: 'owner', label: '📱 Owner App', desc: 'Approvals & Biometric PIN' },
            { id: 'pos', label: '💻 Cashier POS', desc: 'Shop Till, Returns Desk' },
            { id: 'erp', label: '🏢 ERP Backend', desc: 'Finance Ledger & Inventory' }
          ].map(pers => (
            <button
              key={pers.id}
              onClick={() => setPerspective(pers.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex flex-col items-center ${
                perspective === pers.id 
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{pers.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CORE DISPLAY WINDOW */}
      <div className="flex-1 flex items-center justify-center p-4 min-h-0 bg-slate-950">
        
        {/* Device Wrapper frames for highly polished, visual immersion */}
        {['customer', 'rider', 'owner'].includes(perspective) ? (
          /* SMARTPHONE DEVICE FRAMER MOCKUP */
          <div className="relative mx-auto w-full max-w-[395px] h-[780px] bg-slate-950 rounded-[48px] p-3.5 border-[10px] border-slate-800 shadow-2xl ring-1 ring-slate-700/50 flex flex-col justify-between overflow-hidden">
            {/* Phone Notch/Dynamic Island */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-between px-3 text-[10px] text-slate-400">
              <span className="font-bold">1:25</span>
              <div className="w-12 h-2.5 bg-slate-900 rounded-full border border-slate-850" />
              <span className="text-[9px]">5G</span>
            </div>

            {/* Simulated app screen render */}
            <div className="flex-1 rounded-[34px] overflow-hidden bg-white border border-slate-850 h-full relative">
              {perspective === 'customer' && (
                <CustomerApp 
                  products={products}
                  variants={variants}
                  orders={orders}
                  onPlaceOrder={handlePlaceOrder}
                  activeOrder={activeOrder}
                  setActiveOrder={setActiveOrder}
                />
              )}
              {perspective === 'rider' && (
                <RiderApp 
                  orders={orders}
                  onUpdateOrder={handleUpdateOrder}
                />
              )}
              {perspective === 'owner' && (
                <OwnerApp 
                  branches={branches}
                  orders={orders}
                  returnRequests={returnRequests}
                  onApproveReturn={handleApproveReturn}
                  onRejectReturn={handleRejectReturn}
                  notifications={notifications}
                  onMarkNotificationsRead={handleMarkNotificationsRead}
                />
              )}
            </div>

            {/* iOS Home Indicator bar */}
            <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-2 shrink-0 z-50" />
          </div>
        ) : perspective === 'pos' ? (
          /* LANDSCAPE POS TABLET REGISTER MOCKUP */
          <div className="w-full max-w-5xl h-[650px] bg-slate-950 rounded-[32px] p-4 border-[12px] border-slate-800 shadow-2xl ring-1 ring-slate-700/50 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 bg-white rounded-2xl overflow-hidden border border-slate-850 h-full relative">
              <POSCashier 
                products={products}
                variants={variants}
                returnRequests={returnRequests}
                onInitiateReturn={handleInitiateReturn}
                onPostPOSSale={handlePostPOSSale}
              />
            </div>
          </div>
        ) : (
          /* FULL DESKTOP ERP WORKSPACE MOCKUP */
          <div className="w-full max-w-7xl h-[820px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
            <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-[10px] text-slate-500 font-mono">ERP Desk Admin Workspace • Secure Console</span>
              <div className="w-12" />
            </div>

            <div className="flex-1 bg-white overflow-hidden relative">
              <ERPAdmin 
                branches={branches}
                products={products}
                variants={variants}
                batches={batches}
                coaAccounts={coaAccounts}
                parties={parties}
                orders={orders}
                onAddProduct={handleAddProduct}
                onAddVariant={handleAddVariant}
                onUpdateVariant={handleUpdateVariant}
                onDeleteVariant={handleDeleteVariant}
                onDeleteProduct={handleDeleteProduct}
                onTransferStock={handleTransferStock}
                onAddVoucher={handleAddVoucher}
                onSaveCOAAccount={handleSaveCOAAccount}
                onDeleteCOAAccount={handleDeleteCOAAccount}
                onSaveParty={handleSaveParty}
                onDeleteParty={handleDeleteParty}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
