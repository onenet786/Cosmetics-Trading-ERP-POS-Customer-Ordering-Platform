import React, { useState } from 'react';
import { 
  Building2, Layers, BookOpen, AlertCircle, TrendingUp, DollarSign, 
  ArrowRight, FileSpreadsheet, Percent, HelpCircle, ShieldAlert, Check, 
  Calendar, Users, Truck, Plus, Trash2, ShieldCheck, ChevronDown, ChevronRight 
} from 'lucide-react';
import { 
  Branch, Product, ProductVariant, Batch, COAAccount, Party, Order, 
  StockTransfer, Voucher, VoucherLine 
} from '../types';

interface ERPAdminProps {
  branches: Branch[];
  products: Product[];
  variants: ProductVariant[];
  batches: Batch[];
  coaAccounts: COAAccount[];
  parties: Party[];
  orders: Order[];
  onAddProduct: (prod: Product) => void;
  onAddVariant: (variant: ProductVariant) => void;
  onUpdateVariant?: (variantId: string, fields: Partial<ProductVariant>) => void;
  onDeleteVariant?: (variantId: string) => void;
  onDeleteProduct?: (productId: string) => void;
  onTransferStock: (transfer: StockTransfer) => void;
  onAddVoucher: (voucher: Voucher) => void;
  onSaveCOAAccount?: (account: COAAccount) => void;
  onDeleteCOAAccount?: (accountId: string) => void;
  onSaveParty?: (party: Party) => void;
  onDeleteParty?: (partyId: string) => void;
}

export default function ERPAdmin({
  branches, products, variants, batches, coaAccounts, parties, orders,
  onAddProduct, onAddVariant, onUpdateVariant, onDeleteVariant, onDeleteProduct,
  onTransferStock, onAddVoucher, onSaveCOAAccount, onDeleteCOAAccount, onSaveParty, onDeleteParty
}: ERPAdminProps) {
  const [activeMenu, setActiveMenu] = useState<'finance' | 'inventory' | 'partners' | 'reports'>('finance');
  
  // Finance Sub-tabs
  const [financeTab, setFinanceTab] = useState<'coa' | 'voucher' | 'pdc'>('coa');
  // Inventory Sub-tabs
  const [inventoryTab, setInventoryTab] = useState<'stock' | 'batches' | 'transfer'>('stock');

  // Voucher Creation Form State
  const [voucherType, setVoucherType] = useState<Voucher['type']>('Journal');
  const [voucherNarration, setVoucherNarration] = useState('');
  const [voucherBranch, setVoucherBranch] = useState('b-01');
  const [voucherLines, setVoucherLines] = useState<VoucherLine[]>([
    { accountId: 'a-1110', debit: 15000, credit: 0 },
    { accountId: 'a-4100', debit: 0, credit: 15000 }
  ]);

  // Stock Transfer Form State
  const [fromBranch, setFromBranch] = useState('b-01');
  const [toBranch, setToBranch] = useState('b-02');
  const [transferProduct, setTransferProduct] = useState('p-01');
  const [transferQty, setTransferQty] = useState(1);
  const [transferUom, setTransferUom] = useState('Piece');

  // Add Item States
  const [newItemName, setNewItemName] = useState('');
  const [newItemBrand, setNewItemBrand] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Makeup');
  const [newItemBasePrice, setNewItemBasePrice] = useState(1000);

  // COA Account CRUD States
  const [isAddingCOA, setIsAddingCOA] = useState(false);
  const [newCOACode, setNewCOACode] = useState('');
  const [newCOAName, setNewCOAName] = useState('');
  const [newCOAType, setNewCOAType] = useState<'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'>('Asset');
  const [newCOAParent, setNewCOAParent] = useState<string>('');

  // Inline Variant Editing States
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editPricePiece, setEditPricePiece] = useState<number>(0);
  const [editPriceDozen, setEditPriceDozen] = useState<number>(0);
  const [editStockLevel, setEditStockLevel] = useState<number>(0);

  // Partner Party CRUD States
  const [isAddingParty, setIsAddingParty] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyEmail, setNewPartyEmail] = useState('');
  const [newPartyPhone, setNewPartyPhone] = useState('');
  const [newPartyType, setNewPartyType] = useState<'Customer' | 'Supplier'>('Customer');
  const [newPartyClassification, setNewPartyClassification] = useState<Party['classification']>('Salon');
  const [newPartyCreditLimit, setNewPartyCreditLimit] = useState(100000);
  const [newPartyBalance, setNewPartyBalance] = useState(0);

  const getCOABalance = (accountId: string) => {
    const act = coaAccounts.find(c => c.id === accountId);
    return act ? act.balance : 0;
  };

  const handleAddVoucherLine = () => {
    setVoucherLines([...voucherLines, { accountId: 'a-1110', debit: 0, credit: 0 }]);
  };

  const handleRemoveVoucherLine = (index: number) => {
    setVoucherLines(voucherLines.filter((_, i) => i !== index));
  };

  const handleVoucherLineChange = (index: number, field: keyof VoucherLine, val: any) => {
    const updated = [...voucherLines];
    updated[index] = { ...updated[index], [field]: val };
    setVoucherLines(updated);
  };

  const submitVoucher = () => {
    const totalDebit = voucherLines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = voucherLines.reduce((sum, l) => sum + l.credit, 0);

    if (totalDebit !== totalCredit) {
      alert(`Voucher Out of Balance! Total Debit (PKR ${totalDebit}) must equal Total Credit (PKR ${totalCredit}).`);
      return;
    }

    const newVoucher: Voucher = {
      id: `vouch-${Date.now()}`,
      number: `JV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      type: voucherType,
      branchId: voucherBranch,
      narration: voucherNarration,
      lines: voucherLines,
      approved: true,
      approvedBy: 'System Accountant Manager'
    };

    onAddVoucher(newVoucher);
    setVoucherNarration('');
    setVoucherLines([
      { accountId: 'a-1110', debit: 0, credit: 0 },
      { accountId: 'a-1110', debit: 0, credit: 0 }
    ]);
    alert('Voucher posted successfully into Ledger Control!');
  };

  const handleStockTransferSubmit = () => {
    if (fromBranch === toBranch) {
      alert('Source and destination branches must be different');
      return;
    }

    const newTransfer: StockTransfer = {
      id: `trsf-${Date.now()}`,
      transferNumber: `ST-${Math.floor(10000 + Math.random() * 90000)}`,
      fromBranchId: fromBranch,
      toBranchId: toBranch,
      productId: transferProduct,
      qty: transferQty,
      uom: transferUom,
      status: 'Dispatched',
      date: new Date().toISOString().split('T')[0]
    };

    onTransferStock(newTransfer);
    alert('Stock transfer request dispatched successfully!');
  };

  const handleAddNewItem = () => {
    if (!newItemName || !newItemBrand) {
      alert('Please fill product details');
      return;
    }

    const productId = `p-${Date.now()}`;
    const newProd: Product = {
      id: productId,
      name: newItemName,
      brand: newItemBrand,
      category: newItemCategory,
      subcategory: 'General',
      description: 'Newly entered inventory trading SKU',
      hsCode: '3304.9900',
      taxRate: 0.17,
      baseUnit: 'Piece',
      isBatchTracked: false,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&q=80'
    };

    const newVar: ProductVariant = {
      id: `v-${Date.now()}`,
      productId,
      name: 'Standard Shade / Size',
      sku: `${newItemBrand.substring(0,3).toUpperCase()}-${Math.floor(100 + Math.random()*900)}`,
      barcode: `890123${Math.floor(100000+Math.random()*900000)}`,
      pricePiece: newItemBasePrice,
      priceDozen: Math.round(newItemBasePrice * 12 * 0.9),
      priceCarton: Math.round(newItemBasePrice * 144 * 0.8),
      stockLevel: 100
    };

    onAddProduct(newProd);
    onAddVariant(newVar);

    setNewItemName('');
    setNewItemBrand('');
    alert('New stock SKU created and prices initialized!');
  };

  return (
    <div id="erp-admin-root" className="flex h-full bg-slate-100 text-slate-800">
      
      {/* Sidebar navigation */}
      <div className="w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0">
        <div className="p-5 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-500 text-slate-950 rounded-xl p-2 font-bold shadow-md shadow-amber-500/10">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight leading-none text-white">SILKGLOW ERP</h1>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Trading Backoffice v4.0</p>
            </div>
          </div>

          <div className="space-y-1">
            {[
              { id: 'finance', label: 'Financial Accounting', icon: BookOpen },
              { id: 'inventory', label: 'Inventory Controls', icon: Layers },
              { id: 'partners', label: 'Customers & Partners', icon: Users },
              { id: 'reports', label: 'Ledger Reports Suite', icon: FileSpreadsheet }
            ].map(menu => {
              const Icon = menu.icon;
              const isSelected = activeMenu === menu.id;
              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveMenu(menu.id as any)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-colors flex items-center gap-3 ${
                    isSelected 
                      ? 'bg-amber-500 text-slate-950 shadow-sm' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {menu.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5 border-t border-slate-800 text-[10px] text-slate-500 space-y-1.5 font-mono">
          <p>SSL Connected Status</p>
          <p>Local Time: 2026-07-01</p>
          <p>Tenant ID: TEN-9821-PK</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-6 space-y-6">
        
        {/* FINANCE MODULE VIEW */}
        {activeMenu === 'finance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-xl text-slate-900">Financial Ledger Desk</h2>
                <p className="text-xs text-slate-500">Dual-entry GAAP compliant ledger system with cost-center tracking.</p>
              </div>

              {/* Finance Sub Tab selector */}
              <div className="flex bg-slate-200 p-1 rounded-xl">
                {[
                  { id: 'coa', label: 'Chart of Accounts' },
                  { id: 'voucher', label: 'Voucher Entry' },
                  { id: 'pdc', label: 'PDC Register' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFinanceTab(tab.id as any)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      financeTab === tab.id ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-indigo-950'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CHART OF ACCOUNTS */}
            {financeTab === 'coa' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-900">4-Level System Chart of Accounts (COA)</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsAddingCOA(!isAddingCOA)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create New Account
                    </button>
                    <span className="text-xs text-slate-400">Total Accounts: {coaAccounts.length}</span>
                  </div>
                </div>

                {/* Account Add Form Drawer */}
                {isAddingCOA && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Account Code</label>
                      <input
                        type="text"
                        placeholder="e.g. 1140"
                        value={newCOACode}
                        onChange={(e) => setNewCOACode(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Account Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Petty Cash Branch 2"
                        value={newCOAName}
                        onChange={(e) => setNewCOAName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Classification</label>
                      <select
                        value={newCOAType}
                        onChange={(e) => setNewCOAType(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none"
                      >
                        <option value="Asset">Asset</option>
                        <option value="Liability">Liability</option>
                        <option value="Equity">Equity</option>
                        <option value="Revenue">Revenue</option>
                        <option value="Expense">Expense</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Parent Account (Optional)</label>
                      <select
                        value={newCOAParent}
                        onChange={(e) => setNewCOAParent(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none"
                      >
                        <option value="">None (Top Level Classification)</option>
                        {coaAccounts.filter(c => c.parentId === null).map(c => (
                          <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-full flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setIsAddingCOA(false)}
                        className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (!newCOACode || !newCOAName) {
                            alert('Please fill code and title');
                            return;
                          }
                          const newAcc: COAAccount = {
                            id: `a-${Date.now()}`,
                            code: newCOACode,
                            name: newCOAName,
                            type: newCOAType,
                            parentId: newCOAParent || null,
                            balance: 0
                          };
                          if (onSaveCOAAccount) onSaveCOAAccount(newAcc);
                          setNewCOACode('');
                          setNewCOAName('');
                          setIsAddingCOA(false);
                          alert('Account successfully added to COA!');
                        }}
                        className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 cursor-pointer"
                      >
                        Create Ledger Account
                      </button>
                    </div>
                  </div>
                )}

                {/* Simulated COA Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700">
                        <th className="py-2.5 px-4">Account Code</th>
                        <th className="py-2.5 px-4">Account Title</th>
                        <th className="py-2.5 px-4">Classification</th>
                        <th className="py-2.5 px-4 text-right">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {coaAccounts.map(account => {
                        const isMainClass = account.parentId === null;
                        const isSubClass = account.parentId?.startsWith('a-') && account.parentId.length === 6;
                        return (
                          <tr 
                            key={account.id} 
                            className={`hover:bg-slate-50 transition-colors ${
                              isMainClass ? 'bg-indigo-50/20 font-bold text-slate-900' : isSubClass ? 'font-semibold text-slate-800' : ''
                            }`}
                          >
                            <td className="py-2.5 px-4 font-mono">{account.code}</td>
                            <td className="py-2.5 px-4 flex items-center gap-1.5">
                              {!isMainClass && <span className="text-slate-300">├──</span>}
                              {account.name}
                            </td>
                            <td className="py-2.5 px-4 uppercase text-[10px] font-black">{account.type}</td>
                            <td className="py-2.5 px-4 text-right font-bold font-mono">
                              <div className="flex items-center justify-end gap-2">
                                <span>PKR {Math.abs(account.balance).toLocaleString()} {account.balance < 0 ? 'Cr' : 'Dr'}</span>
                                {onDeleteCOAAccount && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete account ${account.name}?`)) {
                                        onDeleteCOAAccount(account.id);
                                      }
                                    }}
                                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VOUCHER ENTRY */}
            {financeTab === 'voucher' && (
              <div className="grid grid-cols-12 gap-6">
                
                {/* Entry Form */}
                <div className="col-span-8 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-sm text-slate-900">New Accounting Voucher Double-Entry Form</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                      Maker-Checker Workflow Enabled
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Voucher Class</label>
                      <select
                        id="voucher-type-select"
                        value={voucherType}
                        onChange={(e) => setVoucherType(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                      >
                        <option value="Journal">Journal Voucher (JV)</option>
                        <option value="Payment">Bank Payment (BPV)</option>
                        <option value="Receipt">Bank Receipt (BRV)</option>
                        <option value="DebitNote">Debit Note (DN)</option>
                        <option value="CreditNote">Credit Note (CN)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Voucher Branch</label>
                      <select
                        id="voucher-branch-select"
                        value={voucherBranch}
                        onChange={(e) => setVoucherBranch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                      >
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Posting Date</label>
                      <input 
                        type="date" 
                        defaultValue="2026-07-01" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" 
                      />
                    </div>
                  </div>

                  {/* Multi Line entries */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                      <span>GL Account Allocation</span>
                      <div className="flex gap-16">
                        <span>Debit (PKR)</span>
                        <span className="pr-12">Credit (PKR)</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {voucherLines.map((line, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <select
                            id={`voucher-line-account-${idx}`}
                            value={line.accountId}
                            onChange={(e) => handleVoucherLineChange(idx, 'accountId', e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                          >
                            {coaAccounts.filter(c => c.parentId !== null).map(c => (
                              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                            ))}
                          </select>

                          <input
                            id={`voucher-line-debit-${idx}`}
                            type="number"
                            value={line.debit || ''}
                            placeholder="0"
                            onChange={(e) => handleVoucherLineChange(idx, 'debit', Number(e.target.value))}
                            className="w-28 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-right"
                          />

                          <input
                            id={`voucher-line-credit-${idx}`}
                            type="number"
                            value={line.credit || ''}
                            placeholder="0"
                            onChange={(e) => handleVoucherLineChange(idx, 'credit', Number(e.target.value))}
                            className="w-28 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-right"
                          />

                          <button 
                            disabled={voucherLines.length <= 2}
                            onClick={() => handleRemoveVoucherLine(idx)}
                            className="text-red-500 p-1 hover:bg-red-50 rounded-lg disabled:opacity-35"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      id="add-voucher-line-btn"
                      onClick={handleAddVoucherLine}
                      className="text-indigo-600 hover:text-indigo-700 font-bold text-xs flex items-center gap-1.5 mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Voucher Line Allocation
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Voucher Narration / Memo</label>
                    <textarea 
                      id="voucher-narration-textarea"
                      rows={2}
                      value={voucherNarration}
                      onChange={(e) => setVoucherNarration(e.target.value)}
                      placeholder="Explain details of this transaction for auditory visibility..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" 
                    />
                  </div>

                  {/* Validate balancing totals */}
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                    <div className="flex gap-4">
                      <span className="text-slate-500">Total Debit: <strong className="text-slate-900 font-mono">PKR {voucherLines.reduce((s,l)=>s+l.debit,0).toLocaleString()}</strong></span>
                      <span className="text-slate-500">Total Credit: <strong className="text-slate-900 font-mono">PKR {voucherLines.reduce((s,l)=>s+l.credit,0).toLocaleString()}</strong></span>
                    </div>

                    {voucherLines.reduce((s,l)=>s+l.debit,0) === voucherLines.reduce((s,l)=>s+l.credit,0) && voucherLines.reduce((s,l)=>s+l.debit,0) > 0 ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" /> Balanced & Valid
                      </span>
                    ) : (
                      <span className="text-red-500 font-bold flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> Unbalanced Voucher
                      </span>
                    )}
                  </div>

                  <button
                    id="submit-voucher-btn"
                    onClick={submitVoucher}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    Approve and Post to General Ledger
                  </button>
                </div>

                {/* Audit Trial info panel */}
                <div className="col-span-4 space-y-4">
                  <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
                    <h4 className="font-extrabold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4.5 h-4.5" />
                      Auditable Security Core
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      All ERP double postings trigger immutable cryptographic checksums on our database, logged with precise operator signatures and UTC timestamps to ensure compliance.
                    </p>
                    <div className="border-t border-slate-800 pt-3 space-y-2 text-[10px] text-slate-500 font-mono">
                      <p>Last Audit Sync: COMPLETE</p>
                      <p>Hash Integrity: 100% VALID</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* PDC REGISTER */}
            {financeTab === 'pdc' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-900">Post-Dated Cheques (PDC) Maturity Register</h3>
                  <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">
                    PDC Alerts Enabled
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700">
                        <th className="py-2.5 px-4">Cheque No</th>
                        <th className="py-2.5 px-4">Issuer Party</th>
                        <th className="py-2.5 px-4">Maturity Date</th>
                        <th className="py-2.5 px-4">Bank Account</th>
                        <th className="py-2.5 px-4 text-right">Amount (PKR)</th>
                        <th className="py-2.5 px-4 text-center">Maturity Alert</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="py-3 px-4 font-mono">HBL-8012421</td>
                        <td className="py-3 px-4">Bella Rose Beauty Salon</td>
                        <td className="py-3 px-4 text-amber-600 font-bold">2026-07-05</td>
                        <td className="py-3 px-4">Habib Bank Ltd - 0019</td>
                        <td className="py-3 px-4 text-right font-bold font-mono">PKR 350,000</td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Matures in 4 days
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono">MCB-9912042</td>
                        <td className="py-3 px-4">L'Oreal Pakistan Ltd</td>
                        <td className="py-3 px-4">2026-07-15</td>
                        <td className="py-3 px-4">Habib Bank Ltd - 0019</td>
                        <td className="py-3 px-4 text-right font-bold font-mono">PKR 500,000</td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Matures in 14 days
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* INVENTORY MODULE VIEW */}
        {activeMenu === 'inventory' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-xl text-slate-900">Trading Stock Controller</h2>
                <p className="text-xs text-slate-500">Multi-UOM support, batch & expiry tracking, branch-to-branch transfers.</p>
              </div>

              {/* Inventory tabs */}
              <div className="flex bg-slate-200 p-1 rounded-xl">
                {[
                  { id: 'stock', label: 'Stock Master' },
                  { id: 'batches', label: 'Batches & FEFO' },
                  { id: 'transfer', label: 'Stock Transfer' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setInventoryTab(tab.id as any)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      inventoryTab === tab.id ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-indigo-950'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* STOCK MASTER & ADD ITEM */}
            {inventoryTab === 'stock' && (
              <div className="grid grid-cols-12 gap-6">
                
                {/* Add Item form */}
                <div className="col-span-4 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 h-fit">
                  <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">Add New Cosmetics Product SKU</h3>
                  
                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Product Name</label>
                      <input 
                        id="new-product-name"
                        type="text" 
                        placeholder="e.g. Lip Glaze Shine"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Brand Provider</label>
                      <input 
                        id="new-product-brand"
                        type="text" 
                        placeholder="e.g. SilkGlow"
                        value={newItemBrand}
                        onChange={(e) => setNewItemBrand(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Category Scope</label>
                      <select
                        id="new-product-category"
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                      >
                        <option>Makeup</option>
                        <option>Skincare</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Base Unit Retail Price (PKR)</label>
                      <input 
                        id="new-product-price"
                        type="number" 
                        value={newItemBasePrice}
                        onChange={(e) => setNewItemBasePrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" 
                      />
                    </div>

                    <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100 text-[10px] text-amber-800 leading-normal">
                      <strong>Multi-UOM Autosync:</strong> The system will auto-compute bulk Dozen price (10% off) and Carton price (20% off) for seamless wholesale dispatch billing.
                    </div>

                    <button
                      id="create-new-product-btn"
                      onClick={handleAddNewItem}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                    >
                      Initialize Trading SKU
                    </button>
                  </div>
                </div>

                {/* Stock Table List */}
                <div className="col-span-8 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">Active Cosmetics SKU Grid</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700">
                          <th className="py-2 px-3">Trading Item</th>
                          <th className="py-2 px-3">Brand</th>
                          <th className="py-2 px-3">Base Unit Price</th>
                          <th className="py-2 px-3">Bulk Dozen Price</th>
                          <th className="py-2 px-3 text-right">Available Stock</th>
                          <th className="py-2 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {variants.map(v => {
                          const p = products.find(prod => prod.id === v.productId);
                          const isEditing = editingVariantId === v.id;
                          return (
                            <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2.5 px-3">
                                <p className="font-bold text-slate-800">{p?.name}</p>
                                <p className="text-[9px] text-slate-400 font-mono">SKU: {v.sku} • {v.name}</p>
                              </td>
                              <td className="py-2.5 px-3">{p?.brand}</td>
                              {isEditing ? (
                                <>
                                  <td className="py-2.5 px-3">
                                    <input
                                      type="number"
                                      value={editPricePiece}
                                      onChange={(e) => setEditPricePiece(Number(e.target.value))}
                                      className="w-20 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <input
                                      type="number"
                                      value={editPriceDozen}
                                      onChange={(e) => setEditPriceDozen(Number(e.target.value))}
                                      className="w-20 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <input
                                      type="number"
                                      value={editStockLevel}
                                      onChange={(e) => setEditStockLevel(Number(e.target.value))}
                                      className="w-16 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs font-mono text-right focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                  </td>
                                  <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                                    <button
                                      onClick={() => {
                                        if (onUpdateVariant) {
                                          onUpdateVariant(v.id, {
                                            pricePiece: editPricePiece,
                                            priceDozen: editPriceDozen,
                                            priceCarton: Math.round(editPricePiece * 144 * 0.8),
                                            stockLevel: editStockLevel
                                          });
                                        }
                                        setEditingVariantId(null);
                                        alert('SKU updated successfully!');
                                      }}
                                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-2 py-1 rounded-md text-[10px] cursor-pointer transition-colors"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingVariantId(null)}
                                      className="bg-slate-300 text-slate-700 px-2 py-1 rounded-md text-[10px] cursor-pointer transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="py-2.5 px-3 font-mono">PKR {v.pricePiece.toLocaleString()}</td>
                                  <td className="py-2.5 px-3 font-mono text-indigo-600 font-bold">PKR {v.priceDozen.toLocaleString()}</td>
                                  <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-900">
                                    {v.stockLevel} Pieces
                                  </td>
                                  <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                                    <button
                                      onClick={() => {
                                        setEditingVariantId(v.id);
                                        setEditPricePiece(v.pricePiece);
                                        setEditPriceDozen(v.priceDozen);
                                        setEditStockLevel(v.stockLevel);
                                      }}
                                      className="text-indigo-600 hover:text-indigo-800 font-bold text-[10px] hover:underline cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    {onDeleteProduct && (
                                      <button
                                        onClick={() => {
                                          if (confirm(`Are you sure you want to delete SKU/Product ${p?.name}?`)) {
                                            onDeleteProduct(p?.id || '');
                                          }
                                        }}
                                        className="text-red-500 hover:text-red-700 font-bold text-[10px] hover:underline cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* BATCHES & EXPIRY */}
            {inventoryTab === 'batches' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-900">FEFO Expiration & Batch tracking Grid</h3>
                  <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full font-bold">
                    FEFO Auto Suggest enabled
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700">
                        <th className="py-2.5 px-4">Batch Reference Code</th>
                        <th className="py-2.5 px-4">Cosmetics Product</th>
                        <th className="py-2.5 px-4">Batch Expiry</th>
                        <th className="py-2.5 px-4 text-right">Available Quantity</th>
                        <th className="py-2.5 px-4 text-right">Unit Cost (Base)</th>
                        <th className="py-2.5 px-4 text-center">Expiry Alert Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {batches.map(bt => {
                        const p = products.find(prod => prod.id === bt.productId);
                        // mock near expiry logic
                        const isNearExpiry = bt.batchNumber.includes('DEC25');
                        return (
                          <tr key={bt.id} className={`hover:bg-slate-50 transition-colors ${isNearExpiry ? 'bg-amber-50/45' : ''}`}>
                            <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{bt.batchNumber}</td>
                            <td className="py-2.5 px-4">{p?.name}</td>
                            <td className="py-2.5 px-4 font-bold text-slate-600">{bt.expiryDate}</td>
                            <td className="py-2.5 px-4 text-right font-mono">{bt.quantity} Pieces</td>
                            <td className="py-2.5 px-4 text-right font-mono">PKR {bt.costPrice.toLocaleString()}</td>
                            <td className="py-2.5 px-4 text-center">
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                isNearExpiry 
                                  ? 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse' 
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              }`}>
                                {isNearExpiry ? 'Expires in 180 Days' : 'Safe Shelf Life'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* STOCK TRANSFER */}
            {inventoryTab === 'transfer' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">Branch Stock Transfer Form (Multi-Shop Routing)</h3>

                <div className="grid grid-cols-4 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Dispatch Branch (Source)</label>
                    <select
                      id="transfer-from-branch"
                      value={fromBranch}
                      onChange={(e) => setFromBranch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Receive Branch (Destination)</label>
                    <select
                      id="transfer-to-branch"
                      value={toBranch}
                      onChange={(e) => setToBranch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Product SKU Selection</label>
                    <select
                      id="transfer-product-select"
                      value={transferProduct}
                      onChange={(e) => setTransferProduct(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.brand} - {p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Transfer Qty</label>
                    <div className="flex gap-2">
                      <input
                        id="transfer-qty-input"
                        type="number"
                        value={transferQty}
                        onChange={(e) => setTransferQty(Number(e.target.value))}
                        className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-center"
                      />
                      <select
                        id="transfer-uom-select"
                        value={transferUom}
                        onChange={(e) => setTransferUom(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2"
                      >
                        <option>Piece</option>
                        <option>Dozen</option>
                        <option>Carton</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  id="submit-transfer-btn"
                  onClick={handleStockTransferSubmit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Truck className="w-4 h-4" /> Dispatch Stock Transfer Shipment
                </button>
              </div>
            )}

          </div>
        )}

        {/* CUSTOMERS & PARTNERS MODULE */}
        {activeMenu === 'partners' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-xl text-slate-900">Salons, Suppliers & Party Ledgers</h2>
                <p className="text-xs text-slate-500">Manage Credit Limits, Credit Periods (Days), and Running Ledger balances.</p>
              </div>
              <button
                onClick={() => setIsAddingParty(!isAddingParty)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" /> Add New Contact Party
              </button>
            </div>

            {/* Register New Party form */}
            {isAddingParty && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 text-xs">
                <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-150 pb-2">Register New Contact Party</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Party / Partner Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Elegant Beauty Salon"
                      value={newPartyName}
                      onChange={(e) => setNewPartyName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. elegant@beauty.com"
                      value={newPartyEmail}
                      onChange={(e) => setNewPartyEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +92 300 1234567"
                      value={newPartyPhone}
                      onChange={(e) => setNewPartyPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Party Type</label>
                    <select
                      value={newPartyType}
                      onChange={(e) => setNewPartyType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none"
                    >
                      <option value="Customer">Customer (Buyer)</option>
                      <option value="Supplier">Supplier (Vendor)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Classification</label>
                    <select
                      value={newPartyClassification}
                      onChange={(e) => setNewPartyClassification(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option value="Salon">Salon Partner</option>
                      <option value="Retailer">Retailer</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Distributor">Distributor</option>
                      <option value="Walk-In">Walk-In Customer</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Credit Limit (PKR)</label>
                    <input
                      type="number"
                      value={newPartyCreditLimit}
                      onChange={(e) => setNewPartyCreditLimit(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Initial Balance (PKR)</label>
                    <input
                      type="number"
                      value={newPartyBalance}
                      onChange={(e) => setNewPartyBalance(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => setIsAddingParty(false)}
                    className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!newPartyName) {
                        alert('Please enter party name');
                        return;
                      }
                      const newPty: Party = {
                        id: `pty-${Date.now()}`,
                        name: newPartyName,
                        email: newPartyEmail,
                        phone: newPartyPhone,
                        type: newPartyType,
                        classification: newPartyClassification,
                        creditLimit: newPartyCreditLimit,
                        balance: newPartyBalance,
                        creditPeriod: 30
                      };
                      if (onSaveParty) onSaveParty(newPty);
                      setNewPartyName('');
                      setNewPartyEmail('');
                      setNewPartyPhone('');
                      setNewPartyClassification('Salon');
                      setNewPartyCreditLimit(100000);
                      setNewPartyBalance(0);
                      setIsAddingParty(false);
                      alert('Contact party registered successfully!');
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer"
                  >
                    Register Contact Party
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">Party Master Directory</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700">
                      <th className="py-2.5 px-4">Contact Party Name</th>
                      <th className="py-2.5 px-4">Party Type</th>
                      <th className="py-2.5 px-4">Classification</th>
                      <th className="py-2.5 px-4">Phone / Contact</th>
                      <th className="py-2.5 px-4 text-right">Credit Limit</th>
                      <th className="py-2.5 px-4 text-right">Running Ledger Balance</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parties.map(pty => (
                      <tr key={pty.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-800">{pty.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {pty.id} • {pty.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            pty.type === 'Customer' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {pty.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 uppercase text-[10px] font-black">{pty.classification}</td>
                        <td className="py-3 px-4 font-mono">{pty.phone}</td>
                        <td className="py-3 px-4 text-right font-mono">PKR {pty.creditLimit.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-bold font-mono" style={{ color: pty.balance < 0 ? '#b91c1c' : '#047857' }}>
                          PKR {Math.abs(pty.balance).toLocaleString()} {pty.balance < 0 ? 'Cr (Payable)' : pty.balance > 0 ? 'Dr (Receivable)' : ''}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {onDeleteParty && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete party ${pty.name}?`)) {
                                  onDeleteParty(pty.id);
                                }
                              }}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REPORTS SUITE */}
        {activeMenu === 'reports' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-black text-xl text-slate-900">Ledger Statements & Compliance</h2>
              <p className="text-xs text-slate-500">Live generated P&L Statements, Trial Balances, and FBR GST reporting outputs.</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              
              {/* P&L Statement */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">Profit & Loss (P&L) Statement</h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between font-bold border-b border-slate-150 pb-1 text-indigo-950 uppercase">
                    <span>Account Category</span>
                    <span>Total MTD</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Retail POS Sales Revenue</span>
                    <span className="font-mono">PKR 4,900,000</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Wholesale B2B Sales Revenue</span>
                    <span className="font-mono">PKR 3,500,000</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>GROSS REVENUE</span>
                    <span className="font-mono">PKR 8,400,000</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-1.5 mt-2">
                    <span>Cost of Goods Sold (Merchandise)</span>
                    <span className="font-mono text-red-600">-PKR 3,900,000</span>
                  </div>
                  <div className="flex justify-between font-bold text-indigo-600">
                    <span>GROSS MARGIN (PKR)</span>
                    <span className="font-mono">PKR 4,500,000</span>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Operating Expenses</p>
                    <div className="flex justify-between text-slate-500">
                      <span>Shops Rental Expense</span>
                      <span>PKR 1,800,000</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Utilities Expense</span>
                      <span>PKR 450,000</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Staff Salaries & Commission</span>
                      <span>PKR 1,900,000</span>
                    </div>
                    <div className="flex justify-between text-slate-500 border-b border-slate-100 pb-1.5">
                      <span>Marketing Spend</span>
                      <span>PKR 350,000</span>
                    </div>
                  </div>

                  <div className="flex justify-between font-black text-sm text-emerald-600 pt-2 border-t border-slate-200">
                    <span>NET TRADING EBITDA</span>
                    <span className="font-mono">PKR { (4500000 - 4500000).toLocaleString() }</span>
                  </div>
                </div>
              </div>

              {/* FBR GST and HS Code Compliance */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">FBR Compliance POS HS-Code Summary</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead>
                      <tr className="border-b border-slate-200 font-bold text-slate-700">
                        <th className="py-2">HS Code</th>
                        <th className="py-2">Category Description</th>
                        <th className="py-2 text-right">GST Rate</th>
                        <th className="py-2 text-right">Tax Collected</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="py-2 font-mono">3304.9910</td>
                        <td className="py-2">Liquid Face Foundations</td>
                        <td className="py-2 text-right">17% FBR</td>
                        <td className="py-2 text-right font-mono">PKR 412,000</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono">3304.1000</td>
                        <td className="py-2">Lip Lipstick Gloss</td>
                        <td className="py-2 text-right">17% FBR</td>
                        <td className="py-2 text-right font-mono">PKR 320,000</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono">3304.9990</td>
                        <td className="py-2">Hyaluronic Acid Skincare</td>
                        <td className="py-2 text-right">17% FBR</td>
                        <td className="py-2 text-right font-mono">PKR 468,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex items-start gap-2 text-[11px] text-indigo-950 leading-relaxed">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">FBR Fiscal Integration Active:</strong> All sales made at shop cash tills instantly synchronize with Federal Board of Revenue endpoint servers. Check receipt QR codes for valid integration tokens.
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
