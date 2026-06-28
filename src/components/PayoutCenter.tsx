import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  ArrowUpRight, 
  Settings, 
  HelpCircle, 
  ShieldCheck, 
  FileText, 
  Send, 
  Wallet, 
  ExternalLink,
  Smartphone,
  Check,
  Building,
  Upload,
  AlertTriangle
} from 'lucide-react';

export interface PayoutMethod {
  id: string;
  type: 'bank' | 'paypal' | 'stripe' | 'crypto' | 'wire' | 'upi';
  name: string;
  details: string;
  isDefault: boolean;
  status: 'active' | 'pending_verification' | 'disabled';
}

export interface PayoutHistoryItem {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: 'completed' | 'processing' | 'failed';
  referenceHash: string;
}

export default function PayoutCenter() {
  const [availableToWithdraw, setAvailableToWithdraw] = useState<number>(8127.50);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('pay-1');
  const [withdrawalMsg, setWithdrawalMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Initial rich state for Payout methods
  const [methods, setMethods] = useState<PayoutMethod[]>([
    { id: 'pay-1', type: 'stripe', name: 'Stripe Connect Escrow', details: 'Stripe ID: acct_1N49J92 (Cleared)', isDefault: true, status: 'active' },
    { id: 'pay-2', type: 'bank', name: 'Silicon Valley Bank Business Direct', details: 'Routing: ****0210 • Account: ****9928', isDefault: false, status: 'active' },
    { id: 'pay-3', type: 'paypal', name: 'PayPal Business Merchant Account', details: 'Email: billing@designaura.io', isDefault: false, status: 'active' },
    { id: 'pay-4', type: 'crypto', name: 'Ethereum Web3 Wallet (USDC)', details: 'Addr: 0x71C...4E92 (Arbitrum Layer-2)', isDefault: false, status: 'active' },
    { id: 'pay-5', type: 'upi', name: 'UPI Gateway Integration (Optional)', details: 'VPA: aura.labs@okhdfcbank', isDefault: false, status: 'pending_verification' }
  ]);

  // Tax Document status
  const [taxStatus, setTaxStatus] = useState<'approved' | 'action_required'>('approved');
  const [taxForm, setTaxForm] = useState<'W-8BEN-E' | 'W-9'>('W-8BEN-E');

  // Initial payout transaction history
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistoryItem[]>([
    { id: 'PAY-ORD-9011', date: '2026-06-15T09:30:00Z', amount: 5270.40, method: 'Stripe Connect Escrow', status: 'completed', referenceHash: 'TXN-STRIPE-8821-X9A' },
    { id: 'PAY-ORD-8451', date: '2026-06-01T14:15:00Z', amount: 4182.00, method: 'Stripe Connect Escrow', status: 'completed', referenceHash: 'TXN-STRIPE-7100-Y2C' },
    { id: 'PAY-ORD-8012', date: '2026-05-15T11:00:00Z', amount: 2774.35, method: 'Silicon Valley Bank Business Direct', status: 'completed', referenceHash: 'TXN-ACH-0021-P01' },
    { id: 'PAY-ORD-7561', date: '2026-05-01T16:42:00Z', amount: 1722.00, method: 'Stripe Connect Escrow', status: 'completed', referenceHash: 'TXN-STRIPE-4029-A1B' }
  ]);

  // Setup options form modal states (simulated inside UI)
  const [newMethodType, setNewMethodType] = useState<'bank' | 'paypal' | 'stripe' | 'crypto' | 'wire' | 'upi'>('bank');
  const [newMethodName, setNewMethodName] = useState('');
  const [newMethodDetails, setNewMethodDetails] = useState('');
  const [showAddMethodForm, setShowAddMethodForm] = useState(false);

  // Trigger Withdrawal Request
  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setWithdrawalMsg({ type: 'error', text: 'Specify a valid withdrawal amount parameter.' });
      return;
    }

    if (amount > availableToWithdraw) {
      setWithdrawalMsg({ type: 'error', text: 'Insufficient cleared funds to complete transaction escrow withdrawal.' });
      return;
    }

    // Process successful mock request
    const methodObj = methods.find(m => m.id === selectedMethod);
    const newPayout: PayoutHistoryItem = {
      id: `PAY-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      amount: amount,
      method: methodObj ? methodObj.name : 'Stripe Connect Escrow',
      status: 'processing',
      referenceHash: `TXN-PENDING-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    };

    setPayoutHistory([newPayout, ...payoutHistory]);
    setAvailableToWithdraw(prev => prev - amount);
    setWithdrawAmount('');
    setWithdrawalMsg({ 
      type: 'success', 
      text: `Escrow request generated successfully! Payout of $${amount.toFixed(2)} is now processing with ${newPayout.method}.` 
    });
  };

  // Add custom payout account method
  const handleAddMethodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMethodName || !newMethodDetails) return;

    const newMethod: PayoutMethod = {
      id: `pay-${Date.now()}`,
      type: newMethodType,
      name: newMethodName,
      details: newMethodDetails,
      isDefault: false,
      status: 'active'
    };

    setMethods([...methods, newMethod]);
    setNewMethodName('');
    setNewMethodDetails('');
    setShowAddMethodForm(false);
  };

  const handleSetDefault = (id: string) => {
    setMethods(methods.map(m => ({
      ...m,
      isDefault: m.id === id
    })));
  };

  const handleRevokeMethod = (id: string) => {
    if (confirm('Are you sure you want to delete this payout endpoint?')) {
      setMethods(methods.filter(m => m.id !== id));
    }
  };

  const handleSimulateTaxRefetch = () => {
    alert('Re-authenticating IRS W-8BEN cryptographic treaty certification... Status: APPROVED (Valid until Dec 2029).');
  };

  return (
    <div id="payouts-center-portal" className="space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-[#F4F4F4] flex items-center gap-2">
            <Wallet className="h-4 w-4 text-[#D4FF5E]" />
            <span>Sellers Dispatch & Payout Center</span>
          </h2>
          <p className="text-[10px] text-[#8E9299] font-medium mt-1">
            Reconcile external bank accounts, Stripe integrations, crypto addresses, file IRS tax declarations, and dispatch withdrawal requests.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Request Withdrawal & Tax Compliance (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Withdrawal Request Card */}
          <div className="bg-[#161618] border border-[#D4FF5E]/10 rounded-3xl p-6 space-y-4">
            <div>
              <span className="text-[9px] font-black text-[#D4FF5E] uppercase tracking-widest block font-mono">Dispatched Escrow</span>
              <h3 className="font-display font-black text-white text-sm uppercase mt-0.5">Request Withdrawal</h3>
            </div>

            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[8.5px] font-black uppercase text-[#8E9299]">Total Available Cleared Cash</span>
              <span className="text-2xl font-black text-[#D4FF5E] font-mono block">${availableToWithdraw.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4 pt-1">
              {withdrawalMsg && (
                <div className={`p-3.5 rounded-xl border text-[10.5px] font-bold uppercase tracking-wider ${
                  withdrawalMsg.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  {withdrawalMsg.text}
                </div>
              )}

              <div>
                <label className="block text-[8.5px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Withdrawal Amount ($ USD) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-[#8E9299] font-mono">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 500.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] pl-8 pr-16 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-[#D4FF5E]"
                  />
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(availableToWithdraw.toString())}
                    className="absolute right-2 top-1.5 rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-[8px] font-black text-[#D4FF5E] uppercase tracking-wider"
                  >
                    Withdraw All
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[8.5px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Destination Payout Account *</label>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4FF5E]"
                >
                  {methods.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.details.substring(0, 16)}...)</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={availableToWithdraw <= 0}
                className={`w-full rounded-xl py-3 text-xs font-black uppercase tracking-widest text-black transition-all flex items-center justify-center gap-2 ${
                  availableToWithdraw <= 0 
                    ? 'bg-[#8E9299]/20 cursor-not-allowed text-[#8E9299]' 
                    : 'bg-[#D4FF5E] hover:bg-[#c3ec4e] cursor-pointer'
                }`}
              >
                <Send className="h-4 w-4" />
                <span>Dispatch Withdrawal Protocol</span>
              </button>
            </form>
          </div>

          {/* Tax Documents Compliance */}
          <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-2 text-white">
                <ShieldCheck className="h-4.5 w-4.5 text-[#D4FF5E]" />
                <h3 className="font-display font-black text-xs uppercase tracking-wider">Tax & IRS compliance</h3>
              </div>
              <span className="text-[8.5px] font-black bg-[#D4FF5E]/10 border border-[#D4FF5E]/20 text-[#D4FF5E] px-2 py-0.5 rounded uppercase tracking-wider">
                Approved (W-8BEN)
              </span>
            </div>

            <p className="text-[10px] text-[#8E9299] leading-relaxed">
              Official United States withholding certifications are verified. No standard domestic 30% IRS backup withholding applies.
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleSimulateTaxRefetch}
                className="w-full text-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white py-2 text-[9px] font-black uppercase tracking-widest transition-all"
              >
                Validate Treaty Token
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Account Methods & History (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Payout accounts and methods setup */}
          <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block font-mono">Linked destinations</span>
                <h3 className="font-display font-black text-white text-sm uppercase mt-0.5">Payout Methods Setup</h3>
              </div>

              <button
                onClick={() => setShowAddMethodForm(!showAddMethodForm)}
                className="rounded-xl bg-[#D4FF5E] text-black px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-[#c3ec4e] transition-all"
              >
                {showAddMethodForm ? 'Cancel Setup' : 'Link New Account'}
              </button>
            </div>

            {/* Add Payout Account form */}
            {showAddMethodForm && (
              <form onSubmit={handleAddMethodSubmit} className="bg-black/30 p-4 border border-[#D4FF5E]/10 rounded-2xl space-y-3.5">
                <span className="text-[9px] font-black text-[#D4FF5E] uppercase tracking-widest block">Configure Destination Node</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[8.5px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Integration Type</label>
                    <select
                      value={newMethodType}
                      onChange={(e) => setNewMethodType(e.target.value as any)}
                      className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4FF5E]"
                    >
                      <option value="bank">Bank Account (ACH)</option>
                      <option value="paypal">PayPal</option>
                      <option value="stripe">Stripe Connect</option>
                      <option value="crypto">Crypto Wallet (USDC/USDT)</option>
                      <option value="wire">International Wire</option>
                      <option value="upi">UPI ID (e.g. GooglePay/PhonePe)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8.5px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Account/Bank Identifier</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SVB Business Escrow"
                      value={newMethodName}
                      onChange={(e) => setNewMethodName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4FF5E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[8.5px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Credential Details / Keys</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Account Number, Email or ETH public key..."
                    value={newMethodDetails}
                    onChange={(e) => setNewMethodDetails(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4FF5E]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#D4FF5E] text-black py-2.5 text-[9px] font-black uppercase tracking-widest hover:bg-[#c3ec4e] transition-all"
                >
                  Link Verified Payout Endpoint
                </button>
              </form>
            )}

            {/* List payout methods */}
            <div className="space-y-3">
              {methods.map(m => (
                <div key={m.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-[#8E9299]">
                      {m.type === 'crypto' ? <Wallet className="h-4 w-4" /> : m.type === 'upi' ? <Smartphone className="h-4 w-4" /> : <Building className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white uppercase tracking-wide">{m.name}</span>
                        {m.isDefault && (
                          <span className="text-[8px] font-black uppercase text-black bg-[#D4FF5E] px-1.5 py-0.2 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#8E9299] font-mono block mt-0.5">{m.details}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!m.isDefault && (
                      <button
                        onClick={() => handleSetDefault(m.id)}
                        className="text-[9px] font-bold text-[#8E9299] hover:text-white uppercase"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleRevokeMethod(m.id)}
                      className="text-[9px] font-bold text-rose-400/80 hover:text-rose-400 uppercase"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Withdrawal Payout History table */}
          <div className="bg-[#161618] border border-white/10 rounded-3xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Payout Dispatch Logs History</h3>
              <span className="text-[9px] font-black text-[#D4FF5E] uppercase font-mono tracking-wider">BLOCK AUDIT SECURE</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0A0A0B]/40 text-[#8E9299] uppercase tracking-widest text-[9px] font-black border-b border-white/5">
                  <tr>
                    <th className="px-5 py-4">Request date</th>
                    <th className="px-5 py-4">Method destination</th>
                    <th className="px-5 py-4 text-center">Reference Signature</th>
                    <th className="px-5 py-4 text-center">Amount ($)</th>
                    <th className="px-5 py-4 text-right">Escrow status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payoutHistory.map((p, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-5 py-4 font-mono text-[#8E9299]">{new Date(p.date).toLocaleDateString()}</td>
                      <td className="px-5 py-4 font-bold text-white uppercase">{p.method}</td>
                      <td className="px-5 py-4 text-center font-mono text-[#8E9299] text-[9.5px] truncate max-w-[120px] select-all">{p.referenceHash}</td>
                      <td className="px-5 py-4 text-center font-black text-white font-mono">${p.amount.toFixed(2)}</td>
                      <td className="px-5 py-4 text-right">
                        <span className={`text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                          p.status === 'completed'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : p.status === 'processing'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
