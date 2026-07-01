import React, { useState } from 'react';
import { 
  ShoppingBag, Trash2, Search, ArrowRight, CheckCircle2, AlertCircle, 
  RefreshCw, Layers, Printer, Landmark, Sparkles, UserCheck 
} from 'lucide-react';
import { Product, ProductVariant, ReturnRequest, POSSession } from '../types';

interface POSCashierProps {
  products: Product[];
  variants: ProductVariant[];
  returnRequests: ReturnRequest[];
  onInitiateReturn: (req: ReturnRequest) => void;
  onPostPOSSale: (subtotal: number, tax: number, total: number, branchId: string) => void;
}

export default function POSCashier({
  products, variants, returnRequests, onInitiateReturn, onPostPOSSale
}: POSCashierProps) {
  const [session, setSession] = useState<POSSession>({
    id: 'SESS-8091',
    cashierId: 'c-01',
    branchId: 'b-01',
    startTime: '10:00 AM',
    openingFloat: 15000,
    status: 'Active'
  });

  const [cart, setCart] = useState<{ variant: ProductVariant; product: Product; qty: number; uom: 'Piece' | 'Dozen' | 'Carton' }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUom, setSelectedUom] = useState<'Piece' | 'Dozen' | 'Carton'>('Piece');
  
  // Checkout details
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Split'>('Cash');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Return panel state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnInvoice, setReturnInvoice] = useState('');
  const [returnItemName, setReturnItemName] = useState('Glow Silk Liquid Foundation (02 Warm Beige)');
  const [returnQty, setReturnQty] = useState(1);
  const [returnUom, setReturnUom] = useState('Piece');
  const [returnReason, setReturnReason] = useState('Customer shade mismatched');
  const [returnRefund, setReturnRefund] = useState(2400);

  const getPrice = (variant: ProductVariant, uom: 'Piece' | 'Dozen' | 'Carton') => {
    if (uom === 'Piece') return variant.pricePiece;
    if (uom === 'Dozen') return variant.priceDozen;
    return variant.priceCarton;
  };

  const addToCart = (variant: ProductVariant) => {
    const product = products.find(p => p.id === variant.productId);
    if (!product) return;

    const existingIndex = cart.findIndex(
      item => item.variant.id === variant.id && item.uom === selectedUom
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].qty += 1;
      setCart(updated);
    } else {
      setCart([...cart, { variant, product, qty: 1, uom: selectedUom }]);
    }
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleQtyChange = (index: number, val: number) => {
    if (val < 1) return;
    const updated = [...cart];
    updated[index].qty = val;
    setCart(updated);
  };

  const handleUomChange = (index: number, uom: 'Piece' | 'Dozen' | 'Carton') => {
    const updated = [...cart];
    updated[index].uom = uom;
    setCart(updated);
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + getPrice(item.variant, item.uom) * item.qty, 0);
  };

  const getTax = () => {
    return Math.round(getSubtotal() * 0.17); // FBR standard tax
  };

  const getTotal = () => {
    return getSubtotal() + getTax();
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const sub = getSubtotal();
    const tx = getTax();
    const tot = getTotal();

    const data = {
      orderNo: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString(),
      items: [...cart],
      subtotal: sub,
      tax: tx,
      total: tot,
      cashier: 'Zainab Fatima',
      paymentMethod,
      cashTendered: Number(cashTendered) || tot,
      change: Math.max(0, (Number(cashTendered) || tot) - tot)
    };

    setReceiptData(data);
    setShowReceipt(true);
    onPostPOSSale(sub, tx, tot, session.branchId);
    setCart([]);
    setCashTendered('');
  };

  // Submit return for owner approval
  const handleInitiateReturnSubmit = () => {
    if (!returnInvoice) {
      alert('Please provide original invoice number');
      return;
    }

    const newReturn: ReturnRequest = {
      id: `ret-${Date.now()}`,
      sessionNo: session.id,
      cashierName: 'Zainab Fatima',
      branchId: session.branchId,
      originalInvoiceNo: returnInvoice,
      itemName: returnItemName,
      qty: returnQty,
      uom: returnUom,
      reason: returnReason,
      refundAmount: returnRefund,
      status: 'Pending',
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onInitiateReturn(newReturn);
    setShowReturnModal(false);
  };

  const filteredVariants = variants.filter(v => {
    const p = products.find(prod => prod.id === v.productId);
    return v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (p && p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div id="pos-cashier-root" className="flex flex-col h-full bg-slate-100 text-slate-800">
      
      {/* Till/Shift Header */}
      <div className="bg-indigo-950 text-white px-5 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm tracking-tight">Centaurus Till Register</h3>
            <p className="text-[10px] text-indigo-300">Session: {session.id} • Cashier: Zainab Fatima</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowReturnModal(true)}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg border border-rose-500/20 uppercase tracking-wider flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Process Return
          </button>
          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-500/20">
            Shift Active
          </span>
        </div>
      </div>

      {/* Main Split Screen */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Left Side: Product Selector Grid */}
        <div className="w-7/12 p-4 flex flex-col gap-3 border-r border-slate-200">
          <div className="relative">
            <input
              id="pos-search-input"
              type="text"
              placeholder="Search products or scan barcode (e.g., 890123...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Item Quick Lists</h4>
            <div className="flex gap-1.5 text-[9px] font-bold">
              <span>Set default:</span>
              {(['Piece', 'Dozen', 'Carton'] as const).map(u => (
                <button 
                  key={u} 
                  onClick={() => setSelectedUom(u)}
                  className={`px-2 py-0.5 rounded ${selectedUom === u ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 pr-1">
            {filteredVariants.map(variant => {
              const product = products.find(p => p.id === variant.productId);
              return (
                <div
                  key={variant.id}
                  onClick={() => addToCart(variant)}
                  className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between cursor-pointer hover:border-indigo-500 hover:shadow-sm transition-all text-left"
                >
                  <div>
                    <span className="text-[8px] font-mono text-slate-400 block">{variant.sku}</span>
                    <h5 className="font-bold text-xs text-slate-800 line-clamp-1 mt-0.5">{product?.name}</h5>
                    <p className="text-[10px] text-indigo-600 font-bold mt-0.5">{variant.name}</p>
                  </div>
                  <div className="flex justify-between items-end mt-3 pt-2 border-t border-slate-100">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{selectedUom}</span>
                    <span className="text-xs font-black text-slate-900">
                      PKR {getPrice(variant, selectedUom).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Cashier Cart Desk */}
        <div className="w-5/12 bg-white flex flex-col justify-between border-l border-slate-200">
          
          {/* Cart Header */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              Checkout Cart ({cart.reduce((s, i) => s + i.qty, 0)})
            </h4>
            <button 
              onClick={() => setCart([])} 
              className="text-red-500 hover:text-red-600 text-[10px] font-bold"
            >
              Clear Cart
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 px-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-2">
                <ShoppingBag className="w-12 h-12 stroke-1 text-slate-300" />
                <p className="text-xs font-bold">Register Cart is Empty</p>
                <p className="text-[9px] text-slate-400">Click variants on left grid to bill items.</p>
              </div>
            ) : (
              cart.map((item, idx) => {
                const price = getPrice(item.variant, item.uom);
                return (
                  <div key={idx} className="py-2.5 flex items-start gap-2.5">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs text-slate-800 truncate">{item.product.name}</h5>
                      <span className="text-[9px] text-slate-500 block truncate">{item.variant.name}</span>
                      
                      {/* UOM Row Select */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">UOM:</span>
                        <div className="flex gap-1">
                          {(['Piece', 'Dozen', 'Carton'] as const).map(u => (
                            <button
                              key={u}
                              onClick={() => handleUomChange(idx, u)}
                              className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${
                                item.uom === u ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {u}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1.5 shrink-0">
                      <p className="font-bold text-slate-900 text-xs">PKR {(price * item.qty).toLocaleString()}</p>
                      
                      {/* Qty incrementors */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleQtyChange(idx, item.qty - 1)}
                          className="w-5 h-5 bg-slate-100 rounded-md flex items-center justify-center text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                        <button 
                          onClick={() => handleQtyChange(idx, item.qty + 1)}
                          className="w-5 h-5 bg-slate-100 rounded-md flex items-center justify-center text-xs font-bold"
                        >
                          +
                        </button>
                        
                        <button 
                          onClick={() => removeFromCart(idx)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded-md ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Checkout billing footer */}
          <div className="bg-slate-50 border-t border-slate-200 p-4 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>PKR {getSubtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>FBR Sales Tax (17%)</span>
                <span>PKR {getTax().toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Grand Total</span>
                <span>PKR {getTotal().toLocaleString()}</span>
              </div>
            </div>

            {/* Split Checkout Tender details */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-3 gap-1">
                {['Cash', 'Card', 'Split'].map(m => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m as any)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                      paymentMethod === m 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950' 
                        : 'border-slate-200 bg-white text-slate-500'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {paymentMethod !== 'Card' && (
                <div className="relative">
                  <input
                    id="pos-cash-tendered-input"
                    type="text"
                    placeholder="Input Tendered Cash amount..."
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                  {cashTendered && Number(cashTendered) >= getTotal() && (
                    <span className="absolute right-3 top-2.5 text-[9px] text-green-600 font-bold">
                      Change: PKR {(Number(cashTendered) - getTotal()).toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              id="pos-bill-btn"
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-amber-500" />
              Complete Transaction & Print Receipt
            </button>
          </div>
        </div>
      </div>

      {/* POS RETURNS POPUP */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                  Sales Return Portal
                </span>
                <h3 className="font-extrabold text-slate-800 text-sm mt-2">Initiate Item Refund</h3>
              </div>
              <button 
                onClick={() => setShowReturnModal(false)}
                className="bg-slate-100 text-slate-500 font-bold h-7 w-7 rounded-full flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              Any sales return requires active supervisor or owner authorization via the 📱 <strong>Owner Mobile App</strong> before it can be credited to cash.
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Original Invoice No</label>
                  <input 
                    id="return-invoice-input"
                    type="text" 
                    placeholder="e.g. INV-901842"
                    value={returnInvoice}
                    onChange={(e) => setReturnInvoice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Refund Amount (PKR)</label>
                  <input 
                    id="return-refund-input"
                    type="number" 
                    value={returnRefund}
                    onChange={(e) => setReturnRefund(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Product for Refund</label>
                <select
                  id="return-product-select"
                  value={returnItemName}
                  onChange={(e) => setReturnItemName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  <option>Glow Silk Liquid Foundation (02 Warm Beige)</option>
                  <option>Velvet Matte Cushion Lipstick (Rosewood Blush)</option>
                  <option>Multi-Active Hyaluronic B5 Serum (50ml)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Return Qty</label>
                  <input 
                    id="return-qty-input"
                    type="number" 
                    value={returnQty}
                    onChange={(e) => setReturnQty(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Return UOM</label>
                  <select 
                    id="return-uom-select"
                    value={returnUom}
                    onChange={(e) => setReturnUom(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option>Piece</option>
                    <option>Dozen</option>
                    <option>Carton</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Reason for Refund</label>
                <input 
                  id="return-reason-input"
                  type="text" 
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="E.g., Mismatch shades, leaking bottle"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" 
                />
              </div>
            </div>

            <button
              id="submit-return-btn"
              onClick={handleInitiateReturnSubmit}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition-colors text-xs uppercase"
            >
              Request Authorization From Owner
            </button>
          </div>
        </div>
      )}

      {/* RECENT RETURN LOGS AND THEIR STATUS OVERVIEWS */}
      <div className="bg-white border-t border-slate-200 px-4 py-3 space-y-2">
        <h4 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">Live Return Requests Stream</h4>
        {returnRequests.length === 0 ? (
          <p className="text-[10px] text-slate-400 italic">No returns filed in this session.</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {returnRequests.map(req => (
              <div 
                key={req.id} 
                className={`flex-none w-52 p-2 rounded-xl border flex flex-col justify-between ${
                  req.status === 'Approved' ? 'bg-emerald-50 border-emerald-200' :
                  req.status === 'Rejected' ? 'bg-red-50 border-red-200' :
                  'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold font-mono text-slate-500">{req.originalInvoiceNo}</span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                      req.status === 'Approved' ? 'bg-emerald-200 text-emerald-800' :
                      req.status === 'Rejected' ? 'bg-red-200 text-red-800' :
                      'bg-amber-200 text-amber-800 animate-pulse'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <h5 className="font-bold text-[10px] text-slate-800 mt-1 truncate">{req.itemName}</h5>
                  <p className="text-[9px] text-slate-500">Refund: PKR {req.refundAmount.toLocaleString()}</p>
                </div>
                
                {req.status === 'Approved' && (
                  <button 
                    onClick={() => alert(`Printing return credit memo for PKR ${req.refundAmount.toLocaleString()}`)}
                    className="mt-1.5 bg-slate-900 text-white font-bold text-[8px] py-1 rounded flex items-center justify-center gap-1"
                  >
                    <Printer className="w-3 h-3" />
                    Print Credit Slip
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* THERMAL RECEIPT MODAL SIMULATOR */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm border border-slate-200 shadow-2xl relative">
            
            {/* Thermal Slip View */}
            <div className="bg-yellow-50/50 p-5 rounded-2xl border border-yellow-100 font-mono text-xs text-slate-800 space-y-3 shadow-inner">
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <h4 className="font-extrabold text-sm">SILKGLOW COSMETICS</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Centaurus Mall, G-8, Islamabad</p>
                <p className="text-[10px] text-slate-500">FBR POS Registered • NTN: 8901241-1</p>
              </div>

              <div className="space-y-1 text-[10px] text-slate-600">
                <p>Invoice: {receiptData.orderNo}</p>
                <p>Date: {receiptData.date}</p>
                <p>Cashier: {receiptData.cashier}</p>
                <p>Terminal: TILL-CENT-01</p>
              </div>

              {/* Items billed */}
              <div className="border-t border-b border-dashed border-slate-300 py-2.5 divide-y divide-slate-200 divide-dashed">
                {receiptData.items.map((item: any, i: number) => (
                  <div key={i} className="py-1.5 flex justify-between">
                    <div>
                      <p className="font-bold text-[10px]">{item.product.name}</p>
                      <p className="text-[9px] text-slate-500">{item.qty} × {item.uom} @ PKR {getPrice(item.variant, item.uom).toLocaleString()}</p>
                    </div>
                    <span className="font-bold">PKR {(getPrice(item.variant, item.uom) * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Bill totals */}
              <div className="space-y-1 text-[10px] text-right">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>PKR {receiptData.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>FBR GST (17%):</span>
                  <span>PKR {receiptData.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1 border-t border-dashed border-slate-300">
                  <span>NET TOTAL:</span>
                  <span>PKR {receiptData.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1 text-[10px] border-t border-dashed border-slate-300 pt-2.5">
                <p>Payment: {receiptData.paymentMethod}</p>
                <p>Tendered: PKR {receiptData.cashTendered.toLocaleString()}</p>
                <p className="font-bold text-slate-900">Change: PKR {receiptData.change.toLocaleString()}</p>
              </div>

              <div className="text-center pt-3 border-t border-dashed border-slate-300">
                <p className="text-[9px] text-slate-500">Thanks for shopping premium luxury.</p>
                <p className="text-[9px] text-indigo-600 font-bold mt-1">FBR INVOICE CODE: SG-99210-POS</p>
              </div>
            </div>

            <button
              onClick={() => setShowReceipt(false)}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-2xl text-xs mt-4"
            >
              Done / Close Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
