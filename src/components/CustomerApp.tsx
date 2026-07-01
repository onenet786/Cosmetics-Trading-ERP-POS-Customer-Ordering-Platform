import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Star, ShieldCheck, CreditCard, ChevronRight, MapPin, 
  Clock, ArrowLeft, Trash2, Check, Sparkles, HelpCircle, Phone, Navigation 
} from 'lucide-react';
import { Product, ProductVariant, Order, OrderItem } from '../types';

interface CustomerAppProps {
  products: Product[];
  variants: ProductVariant[];
  orders: Order[];
  onPlaceOrder: (newOrder: Order) => void;
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
}

export default function CustomerApp({ 
  products, variants, orders, onPlaceOrder, activeOrder, setActiveOrder 
}: CustomerAppProps) {
  const [view, setView] = useState<'shop' | 'cart' | 'checkout' | 'tracker'>('shop');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedUom, setSelectedUom] = useState<'Piece' | 'Dozen' | 'Carton'>('Piece');
  const [quantity, setQuantity] = useState<number>(1);
  const [cart, setCart] = useState<{ variant: ProductVariant; product: Product; qty: number; uom: 'Piece' | 'Dozen' | 'Carton' }[]>([]);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Checkout Form
  const [fullName, setFullName] = useState('Aisha Khan');
  const [phone, setPhone] = useState('+92 300 555 4321');
  const [address, setAddress] = useState('Apartment 4B, Silver Oaks, F-10, Islamabad');
  const [notes, setNotes] = useState('Please call before arrival');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Wallet' | 'Cash'>('Card');

  // Interactive Card State
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isCvvFocused, setIsCvvFocused] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentProgress, setPaymentProgress] = useState(0); // 0 to 100
  const [paymentStep, setPaymentStep] = useState('');

  // Auto-detect shade colors for lipstick and foundation
  const getShadeColor = (variantName: string) => {
    const lower = variantName.toLowerCase();
    if (lower.includes('light') || lower.includes('porcelain')) return '#fef3e2';
    if (lower.includes('warm') || lower.includes('beige')) return '#f5dab1';
    if (lower.includes('rich') || lower.includes('tan')) return '#d2a679';
    if (lower.includes('crimson')) return '#990000';
    if (lower.includes('rosewood') || lower.includes('rose')) return '#b35959';
    if (lower.includes('peach')) return '#ff9980';
    if (lower.includes('coral')) return '#e65c00';
    return '#cccccc';
  };

  // Set default variant when product is selected
  useEffect(() => {
    if (selectedProduct) {
      const pVariants = variants.filter(v => v.productId === selectedProduct.id);
      if (pVariants.length > 0) {
        setSelectedVariant(pVariants[0]);
      }
      setSelectedUom('Piece');
      setQuantity(1);
    }
  }, [selectedProduct, variants]);

  const addToCart = () => {
    if (!selectedProduct || !selectedVariant) return;
    
    const existingIndex = cart.findIndex(
      item => item.variant.id === selectedVariant.id && item.uom === selectedUom
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].qty += quantity;
      setCart(updated);
    } else {
      setCart([...cart, { variant: selectedVariant, product: selectedProduct, qty: quantity, uom: selectedUom }]);
    }

    setSelectedProduct(null);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const getPrice = (variant: ProductVariant, uom: 'Piece' | 'Dozen' | 'Carton') => {
    if (uom === 'Piece') return variant.pricePiece;
    if (uom === 'Dozen') return variant.priceDozen;
    return variant.priceCarton;
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + getPrice(item.variant, item.uom) * item.qty, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setView('checkout');
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === 'Card' && cardNumber.length < 16) {
      alert('Please enter a valid credit card number');
      return;
    }

    if (paymentMethod === 'Card') {
      setIsProcessingPayment(true);
      setPaymentProgress(10);
      setPaymentStep('Initiating secure transaction...');

      const timer1 = setTimeout(() => {
        setPaymentProgress(35);
        setPaymentStep('Validating with 3D Secure 2.0 Gateway...');
      }, 800);

      const timer2 = setTimeout(() => {
        setPaymentProgress(70);
        setPaymentStep('Authorizing funds & encrypting tokens...');
      }, 1800);

      const timer3 = setTimeout(() => {
        setPaymentProgress(100);
        setPaymentStep('Payment Authenticated Successfully!');
        
        setTimeout(() => {
          finalizeOrder();
        }, 800);
      }, 2800);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      finalizeOrder();
    }
  };

  const finalizeOrder = () => {
    setIsProcessingPayment(false);
    const subtotal = getSubtotal();
    const tax = Math.round(subtotal * 0.17); // 17% standard
    const total = subtotal + tax;

    const items: OrderItem[] = cart.map(item => ({
      productId: item.product.id,
      variantId: item.variant.id,
      qty: item.qty,
      uom: item.uom,
      unitPrice: getPrice(item.variant, item.uom),
      total: getPrice(item.variant, item.uom) * item.qty
    }));

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `SO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      partyId: 'pty-walkin',
      customerName: fullName,
      customerPhone: phone,
      items,
      subtotal,
      tax,
      discount: 0,
      total,
      status: 'Pending',
      paymentStatus: paymentMethod === 'Card' ? 'Paid' : 'Unpaid',
      paymentMethod,
      branchId: 'b-01', // Assigned to Centaurus Islamabad branch
      deliveryAddress: address,
      riderPosition: 0,
      estimatedDeliveryTime: '35 mins',
      notes
    };

    onPlaceOrder(newOrder);
    setCart([]);
    setActiveOrder(newOrder);
    setView('tracker');
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Real-time animation paths on the stylized Islamabad map (SVG)
  // Let's create an elegant custom SVG city grid
  const getMapCoordinates = (progress: number) => {
    // Defines an elegant polyline route from shop (25, 25) to delivery address (85, 75)
    // with some cool street turns. Progress goes from 0 to 100.
    const points = [
      { x: 100, y: 100, name: 'Main Shop' }, // Start: Centaurus Mall
      { x: 180, y: 100, name: 'Jinnah Avenue' },
      { x: 180, y: 220, name: 'F-10 Street grid' },
      { x: 280, y: 220, name: 'Silver Oaks Apartments' } // End
    ];

    if (progress <= 0) return points[0];
    if (progress >= 100) return points[points.length - 1];

    const totalSegments = points.length - 1;
    const progressPerSegment = 100 / totalSegments;
    const activeSegmentIndex = Math.min(
      Math.floor(progress / progressPerSegment),
      totalSegments - 1
    );

    const segmentProgress = (progress % progressPerSegment) / progressPerSegment;
    const startNode = points[activeSegmentIndex];
    const endNode = points[activeSegmentIndex + 1];

    return {
      x: startNode.x + (endNode.x - startNode.x) * segmentProgress,
      y: startNode.y + (endNode.y - startNode.y) * segmentProgress
    };
  };

  const riderPos = activeOrder ? activeOrder.riderPosition : 0;
  const currentRiderCoords = getMapCoordinates(riderPos);

  return (
    <div id="customer-app-root" className="flex flex-col h-full bg-slate-50 text-slate-800">
      
      {/* Phone Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500 text-slate-900 rounded-lg p-1">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">SilkGlow Express</h2>
            <p className="text-[10px] text-slate-400">Cosmetics Delivery App</p>
          </div>
        </div>
        
        {/* Cart Trigger Badge */}
        <button 
          id="cart-btn"
          onClick={() => setView('cart')} 
          className="relative p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
        >
          <ShoppingBag className="w-5 h-5 text-amber-500" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
              {cart.reduce((sum, item) => sum + item.qty, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto">
        {view === 'shop' && (
          <div className="p-4 space-y-4">
            {/* Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl relative overflow-hidden shadow-lg border border-indigo-900/40">
              <div className="absolute right-0 top-0 opacity-20 transform translate-x-12 -translate-y-4">
                <Sparkles className="w-40 h-40 text-amber-500" />
              </div>
              <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                Slab Discount Live
              </span>
              <h3 className="text-xl font-bold mt-2">10% Off Bulk Dozens!</h3>
              <p className="text-xs text-indigo-200 mt-1 max-w-xs">
                Perfect for salons & cosmetic resellers. Enquire inside for Carton-level distributor pricing.
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2">
              <input
                id="search-input"
                type="text"
                placeholder="Search premium foundations, matte lipsticks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {['All', 'Makeup', 'Skincare'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map(prod => {
                const prodVariants = variants.filter(v => v.productId === prod.id);
                const startingPrice = prodVariants.length > 0 ? Math.min(...prodVariants.map(v => v.pricePiece)) : 0;
                
                return (
                  <div 
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className="bg-white rounded-2xl border border-slate-100 p-3 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow group"
                  >
                    <div>
                      <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-100 relative mb-3">
                        <img 
                          referrerPolicy="no-referrer"
                          src={prod.image} 
                          alt={prod.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {prod.brand}
                        </span>
                      </div>
                      <h4 className="text-xs text-slate-500 uppercase font-bold tracking-wider">{prod.category}</h4>
                      <h3 className="font-bold text-sm text-slate-800 line-clamp-2 mt-0.5">{prod.name}</h3>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                      <div>
                        <p className="text-[10px] text-slate-400">Starting from</p>
                        <p className="font-bold text-slate-900 text-xs">PKR {startingPrice.toLocaleString()}</p>
                      </div>
                      <span className="bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white rounded-full p-1.5 transition-colors">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Active Order Banner if exists */}
            {activeOrder && (
              <div 
                onClick={() => setView('tracker')}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors shadow-sm animate-pulse"
              >
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  <div>
                    <p className="text-xs font-bold">Active Delivery: {activeOrder.orderNumber}</p>
                    <p className="text-[10px] opacity-80">Rider Status: {activeOrder.status} ({activeOrder.estimatedDeliveryTime})</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" />
              </div>
            )}
          </div>
        )}

        {/* Product Details Modal Overlay */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center z-50 p-2">
            <div className="bg-white w-full max-w-md rounded-t-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-slide-up">
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {selectedProduct.brand} • {selectedProduct.category}
                  </span>
                  <h3 className="font-bold text-lg text-slate-800 mt-1">{selectedProduct.name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full p-1.5"
                >
                  <Check className="w-4 h-4 transform rotate-45" />
                </button>
              </div>

              <img 
                referrerPolicy="no-referrer"
                src={selectedProduct.image} 
                alt={selectedProduct.name} 
                className="w-full h-48 object-cover rounded-2xl" 
              />

              <p className="text-xs text-slate-500 leading-relaxed">{selectedProduct.description}</p>

              {/* Variant Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Select Shade / Size:</label>
                <div className="flex flex-wrap gap-2">
                  {variants.filter(v => v.productId === selectedProduct.id).map(variant => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const shadeColor = getShadeColor(variant.name);
                    
                    return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all ${
                          isSelected 
                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold' 
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full border border-slate-300 shadow-xs" style={{ backgroundColor: shadeColor }} />
                        {variant.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* UOM Selector */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase">Trading Unit (UOM):</label>
                  <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                    1 Carton = 12 Dozens = 144 Pieces
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['Piece', 'Dozen', 'Carton'] as const).map(uom => {
                    const price = selectedVariant ? getPrice(selectedVariant, uom) : 0;
                    const isSelected = selectedUom === uom;
                    
                    return (
                      <button
                        key={uom}
                        onClick={() => setSelectedUom(uom)}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                          isSelected 
                            ? 'border-indigo-600 bg-indigo-600 text-white font-semibold shadow-sm' 
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs">{uom}</span>
                        <span className={`text-[10px] mt-0.5 font-bold ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                          PKR {price.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector & Price */}
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <button 
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(q => q - 1)}
                    className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm w-4 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600"
                  >
                    +
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">Total Price</p>
                  <p className="font-extrabold text-indigo-600 text-lg">
                    PKR {selectedVariant ? (getPrice(selectedVariant, selectedUom) * quantity).toLocaleString() : 0}
                  </p>
                </div>
              </div>

              <button
                onClick={addToCart}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                Add to Cart ({selectedUom})
              </button>
            </div>
          </div>
        )}

        {/* Cart View */}
        {view === 'cart' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setView('shop')} className="p-1 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="font-extrabold text-lg text-slate-800">Your Cart</h3>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                <ShoppingBag className="w-16 h-16 stroke-1 text-slate-300" />
                <p className="text-sm font-semibold">Your shopping cart is empty</p>
                <button 
                  onClick={() => setView('shop')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-100 p-2 divide-y divide-slate-100">
                  {cart.map((item, index) => {
                    const price = getPrice(item.variant, item.uom);
                    return (
                      <div key={index} className="flex gap-3 py-3 px-2 items-center justify-between">
                        <img 
                          referrerPolicy="no-referrer"
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-12 h-12 object-cover rounded-xl"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-slate-800 truncate">{item.product.name}</h4>
                          <p className="text-xs text-slate-400 truncate">{item.variant.name}</p>
                          <p className="text-xs font-semibold text-slate-600 mt-0.5">
                            {item.qty} × {item.uom} @ PKR {price.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right pl-2">
                          <p className="font-bold text-slate-900 text-sm">PKR {(price * item.qty).toLocaleString()}</p>
                          <button 
                            onClick={() => removeFromCart(index)}
                            className="text-red-500 hover:text-red-600 mt-1 p-1 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bill Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2 text-sm shadow-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>PKR {getSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Sales Tax (FBR 17%)</span>
                    <span>PKR {Math.round(getSubtotal() * 0.17).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Delivery Charge</span>
                    <span className="text-green-600 font-bold">FREE Delivery</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-slate-900 text-base pt-2 border-t border-slate-100">
                    <span>Grand Total</span>
                    <span className="text-indigo-600">PKR {Math.round(getSubtotal() * 1.17).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  id="checkout-btn"
                  onClick={handleCheckout}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-between px-5"
                >
                  <span>Proceed to Checkout</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Checkout View */}
        {view === 'checkout' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setView('cart')} className="p-1 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="font-extrabold text-lg text-slate-800">Secure Checkout</h3>
            </div>

            {/* Delivery Details */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 shadow-xs">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-600" />
                Delivery Address (Pakistan)
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Recipient Name</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Mobile Number</label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Street / Apartment / Sector</label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Rider Instructions</label>
                  <input 
                    type="text" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g., Ring buzzer, leave at reception"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" 
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 shadow-xs">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                Select Payment Option
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Card', label: 'Credit Card', sub: 'Instant & Secure' },
                  { id: 'Wallet', label: 'JazzCash/EP', sub: 'Easy Transfer' },
                  { id: 'Cash', label: 'COD', sub: 'Cash on Arrival' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id as any)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      paymentMethod === opt.id 
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold' 
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs">{opt.label}</span>
                    <span className="text-[9px] text-slate-400 font-medium mt-0.5">{opt.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SECURE CREDIT CARD GATEWAY INTERACTIVE INTERFACE */}
            {paymentMethod === 'Card' && (
              <div className="space-y-4">
                {/* Visual Card Representation */}
                <div className="perspective-1000 w-full aspect-[1.586/1] max-w-sm mx-auto">
                  <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
                    isCvvFocused ? 'rotate-y-180' : ''
                  }`}>
                    
                    {/* Front of Card */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-5 text-white flex flex-col justify-between shadow-xl border border-indigo-500/10 backface-hidden">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] text-indigo-200 font-bold tracking-widest uppercase">Premium Card</p>
                          <h4 className="font-black text-sm tracking-tight text-white/90">SILKGLOW PLATINUM</h4>
                        </div>
                        <div className="h-7 w-10 bg-white/15 rounded-md flex items-center justify-center font-bold text-xs text-indigo-100 uppercase tracking-widest">
                          Visa
                        </div>
                      </div>

                      {/* Chip */}
                      <div className="w-9 h-7 bg-amber-400/80 rounded-sm relative overflow-hidden border border-amber-600/30">
                        <div className="absolute inset-x-2 top-0 h-full border-x border-slate-900/10" />
                        <div className="absolute inset-y-1.5 left-0 w-full border-y border-slate-900/10" />
                      </div>

                      <div className="space-y-2">
                        {/* Number */}
                        <p className="text-sm font-semibold tracking-widest font-mono text-center">
                          {cardNumber.padEnd(16, '•').replace(/(.{4})/g, '$1 ')}
                        </p>
                        
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <div>
                            <p className="text-white/40 uppercase text-[8px]">Cardholder</p>
                            <p className="font-bold text-white/90 uppercase">{cardName || 'YOUR FULL NAME'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/40 uppercase text-[8px]">Expires</p>
                            <p className="font-bold text-white/90">{cardExpiry || 'MM/YY'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Back of Card */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 rounded-2xl py-5 text-white flex flex-col justify-between shadow-xl border border-indigo-500/10 backface-hidden rotate-y-180">
                      <div className="w-full h-10 bg-black/85 mt-2" />
                      
                      <div className="px-5 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-8 bg-slate-300 rounded-sm flex items-center justify-end px-3">
                            <span className="text-slate-800 font-bold italic tracking-wider text-[11px]">Authorized signature</span>
                          </div>
                          <div className="bg-amber-400 text-slate-900 font-bold font-mono h-7 px-2.5 rounded flex items-center justify-center text-xs">
                            {cardCvv || 'CVV'}
                          </div>
                        </div>
                        
                        <p className="text-[7px] text-slate-400 text-center leading-normal">
                          This is a secure simulated trading card. Do not enter sensitive real banking details. Transactions processed using simulated 256-bit AES military-grade endpoint security encryption.
                        </p>
                      </div>
                      
                      <div className="h-4" />
                    </div>

                  </div>
                </div>

                {/* Card Fields Form */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 shadow-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Cardholder Full Name</label>
                    <input 
                      id="cardholder-name"
                      type="text" 
                      placeholder="e.g. Aisha Khan"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Card Number (16 Digits)</label>
                    <input 
                      id="cardholder-number"
                      type="text" 
                      maxLength={16}
                      placeholder="4123 4567 8901 2345"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none font-mono" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Expiry (MM/YY)</label>
                      <input 
                        id="cardholder-expiry"
                        type="text" 
                        maxLength={5}
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none font-mono" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Security Code (CVV)</label>
                      <input 
                        id="cardholder-cvv"
                        type="password" 
                        maxLength={3}
                        placeholder="***"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        onFocus={() => setIsCvvFocused(true)}
                        onBlur={() => setIsCvvFocused(false)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none font-mono" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Price Summary Button */}
            <div className="bg-slate-900 p-4 rounded-2xl flex items-center justify-between text-white shadow-lg shadow-slate-900/10">
              <div>
                <p className="text-[10px] text-slate-300">Net Payable</p>
                <p className="font-extrabold text-base text-amber-400">PKR {Math.round(getSubtotal() * 1.17).toLocaleString()}</p>
              </div>
              <button
                id="place-order-btn"
                onClick={handlePlaceOrder}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                Place Order Now
              </button>
            </div>

            {/* Payment Processing Modal */}
            {isProcessingPayment && (
              <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-6">
                <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center space-y-4 shadow-2xl">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">Processing Secure Payment</h3>
                    <p className="text-xs text-slate-400 mt-1">{paymentStep}</p>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-600 h-1.5 transition-all duration-300" style={{ width: `${paymentProgress}%` }} />
                  </div>
                  <p className="text-[10px] text-indigo-600/60 font-mono">SECURE TRADING ENCRYPTED ENDPOINT</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Real-time Delivery Tracker View */}
        {view === 'tracker' && (
          <div className="p-4 space-y-4">
            {!activeOrder ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                <ShoppingBag className="w-16 h-16 stroke-1 text-slate-300" />
                <p className="text-sm font-semibold">No active orders being tracked</p>
                <button 
                  onClick={() => setView('shop')}
                  className="bg-indigo-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl"
                >
                  Browse Store
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header info */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 uppercase tracking-wider">
                        Order Status: {activeOrder.status}
                      </span>
                      <h4 className="font-black text-lg text-slate-800 mt-2">{activeOrder.orderNumber}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Est. Arrival</p>
                      <p className="font-extrabold text-slate-900 text-base flex items-center gap-1 justify-end">
                        <Clock className="w-4 h-4 text-indigo-600 animate-pulse" />
                        {activeOrder.estimatedDeliveryTime}
                      </p>
                    </div>
                  </div>

                  {/* Multi-step progress tracker */}
                  <div className="relative pt-2">
                    <div className="absolute top-5 inset-x-4 h-0.5 bg-slate-100 -z-1" />
                    <div 
                      className="absolute top-5 left-4 h-0.5 bg-indigo-600 -z-1 transition-all duration-500" 
                      style={{ 
                        width: 
                          activeOrder.status === 'Pending' ? '0%' : 
                          activeOrder.status === 'Approved' ? '25%' : 
                          activeOrder.status === 'Packed' ? '50%' : 
                          activeOrder.status === 'Dispatched' ? '75%' : '100%' 
                      }} 
                    />
                    
                    <div className="flex justify-between text-center relative">
                      {[
                        { label: 'Placed', status: ['Pending', 'Approved', 'Packed', 'Dispatched', 'InTransit', 'Delivered'] },
                        { label: 'Packed', status: ['Packed', 'Dispatched', 'InTransit', 'Delivered'] },
                        { label: 'Dispatched', status: ['Dispatched', 'InTransit', 'Delivered'] },
                        { label: 'Arriving', status: ['InTransit', 'Delivered'] },
                        { label: 'Delivered', status: ['Delivered'] }
                      ].map((step, idx) => {
                        const isDone = step.status.includes(activeOrder.status);
                        return (
                          <div key={idx} className="flex flex-col items-center flex-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${
                              isDone ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                            </div>
                            <span className="text-[9px] font-bold text-slate-500 mt-1">{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* THE INTERACTIVE VECTOR MAP */}
                <div className="bg-slate-900 rounded-3xl overflow-hidden relative border border-slate-800 shadow-lg">
                  <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-xs text-[10px] text-white px-2.5 py-1 rounded-full border border-slate-800 z-10 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-emerald-400" />
                    Islamabad Centaurus Delivery Sector Map
                  </div>

                  {/* Map SVG */}
                  <svg className="w-full h-64 bg-slate-950" viewBox="0 0 400 320">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Highly stylized roads */}
                    <path d="M 50,50 L 350,50" stroke="#1e293b" strokeWidth="18" strokeLinecap="round" fill="none" />
                    <path d="M 50,50 L 350,50" stroke="#334155" strokeWidth="10" strokeLinecap="round" fill="none" />
                    
                    <path d="M 100,20 L 100,300" stroke="#1e293b" strokeWidth="18" strokeLinecap="round" fill="none" />
                    <path d="M 100,20 L 100,300" stroke="#334155" strokeWidth="10" strokeLinecap="round" fill="none" />

                    <path d="M 100,100 L 280,100" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" fill="none" />
                    <path d="M 100,100 L 280,100" stroke="#475569" strokeWidth="6" strokeLinecap="round" fill="none" />

                    <path d="M 180,100 L 180,220" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" fill="none" />
                    <path d="M 180,100 L 180,220" stroke="#475569" strokeWidth="6" strokeLinecap="round" fill="none" />

                    <path d="M 180,220 L 350,220" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" fill="none" />
                    <path d="M 180,220 L 350,220" stroke="#475569" strokeWidth="6" strokeLinecap="round" fill="none" />

                    {/* City parks / Landmarks */}
                    <rect x="140" y="140" width="80" height="40" rx="8" fill="#064e3b" opacity="0.4" />
                    <text x="180" y="165" fill="#10b981" fontSize="9" textAnchor="middle" fontWeight="bold">Fatima Jinnah Park</text>

                    <rect x="230" y="40" width="60" height="30" rx="8" fill="#1e1b4b" opacity="0.6" />
                    <text x="260" y="58" fill="#818cf8" fontSize="8" textAnchor="middle">G-9 Markaz</text>

                    {/* Landmarks Markers */}
                    {/* Centaurus Mall (Source) */}
                    <circle cx="100" cy="100" r="16" fill="#4f46e5" opacity="0.2" />
                    <circle cx="100" cy="100" r="10" fill="#4f46e5" />
                    <ShoppingBag className="w-4 h-4 text-white absolute" style={{ left: '92px', top: '92px' }} />
                    <text x="100" y="125" fill="#a5b4fc" fontSize="8" textAnchor="middle" fontWeight="bold">CENTAURUS MALL</text>

                    {/* Destination House */}
                    <circle cx="280" cy="220" r="16" fill="#f59e0b" opacity="0.2" />
                    <circle cx="280" cy="220" r="10" fill="#f59e0b" />
                    <MapPin className="w-4 h-4 text-slate-900 absolute" style={{ left: '272px', top: '212px' }} />
                    <text x="280" y="245" fill="#fcd34d" fontSize="8" textAnchor="middle" fontWeight="bold">YOUR HOME</text>

                    {/* Rider Marker (Moves dynamically along coordinates) */}
                    {riderPos > 0 && riderPos < 100 && (
                      <g transform={`translate(${currentRiderCoords.x - 12}, ${currentRiderCoords.y - 12})`}>
                        <circle cx="12" cy="12" r="14" fill="#10b981" opacity="0.4" className="animate-ping" />
                        <circle cx="12" cy="12" r="10" fill="#10b981" />
                        {/* Custom tiny bike representation */}
                        <path d="M 6,14 L 10,8 L 14,8 L 18,14 M 10,14 A 2,2 0 1,1 8,14 M 16,14 A 2,2 0 1,1 14,14" stroke="white" strokeWidth="1.5" fill="none" />
                      </g>
                    )}
                  </svg>

                  {/* Floating address details inside map */}
                  <div className="absolute bottom-3 inset-x-3 bg-slate-950/90 backdrop-blur-xs p-3 rounded-2xl border border-slate-800 text-xs text-white space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        F-10 Sector, Islamabad
                      </p>
                      <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Secure AES Tracking</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{activeOrder.deliveryAddress}</p>
                  </div>
                </div>

                {/* Rider status and simulated action info */}
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl space-y-2">
                  <h4 className="font-bold text-xs text-indigo-950 uppercase tracking-wider">Rider Live Update Info</h4>
                  <p className="text-xs text-indigo-900 leading-relaxed">
                    You can switch to the 🏍️ <strong>Rider perspective</strong> in the top switcher bar to physically drive the bike along the map using the controls and update the order delivery status!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="bg-white border-t border-slate-100 px-6 py-2 flex justify-between text-slate-400 shadow-lg">
        {[
          { id: 'shop', label: 'Store', icon: Sparkles },
          { id: 'cart', label: 'Cart', icon: ShoppingBag },
          { id: 'tracker', label: 'Track', icon: Navigation }
        ].map(tab => {
          const isSelected = view === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as any)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isSelected ? 'text-indigo-600 font-bold' : 'hover:text-slate-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
