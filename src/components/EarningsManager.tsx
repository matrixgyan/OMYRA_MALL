import React, { useState } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  HelpCircle, 
  Calendar, 
  Percent, 
  TrendingUp, 
  Download, 
  Globe, 
  Coins, 
  Receipt, 
  FileText, 
  Printer, 
  ArrowRightLeft,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';

export default function EarningsManager() {
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'INR' | 'BTC'>('USD');
  const [activeStatementIndex, setActiveStatementIndex] = useState<number | null>(null);

  // Financial Metrics
  const financialMetrics = {
    availableBalance: 8450.00,
    pendingBalance: 2420.00,
    withdrawableBalance: 8127.50, // Available minus processing/reserve buffer
    marketplaceFeeRate: 5.0, // Omyra platform commission
    taxWithholdingRate: 10.0, // Default W-8BEN treaty rate
  };

  // Live Currency conversion ratios
  const currencyRates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.45,
    BTC: 0.000015
  };

  const convertAmount = (amount: number) => {
    const rate = currencyRates[selectedCurrency];
    const converted = amount * rate;
    if (selectedCurrency === 'BTC') {
      return `₿ ${converted.toFixed(5)}`;
    }
    const symbol = selectedCurrency === 'EUR' ? '€' : selectedCurrency === 'GBP' ? '£' : selectedCurrency === 'INR' ? '₹' : '$';
    return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const revenueBreakdown = [
    { source: 'UI Templates Catalog', percentage: 55, amount: 8190.87 },
    { source: 'Direct Support & Custom Work', percentage: 20, amount: 2978.50 },
    { source: 'Commercial Licensing Upgrades', percentage: 15, amount: 2233.88 },
    { source: 'Cinematic Sound Assets', percentage: 10, amount: 1489.25 }
  ];

  const taxesAndFees = {
    grossRevenue: 14892.50,
    marketplaceFees: 744.62, // 5%
    taxesWithheld: 1489.25, // 10%
    paymentProcessingFees: 431.88, // Stripe/PayPal network fees ~2.9%
    netEarnings: 12226.75
  };

  const monthlyStatements = [
    { id: 'STMT-2026-06', month: 'June 2026', gross: 6420.00, net: 5270.40, status: 'Released' },
    { id: 'STMT-2026-05', month: 'May 2026', gross: 5100.00, net: 4182.00, status: 'Released' },
    { id: 'STMT-2026-04', month: 'April 2026', gross: 3372.50, net: 2774.35, status: 'Released' },
    { id: 'STMT-2026-03', month: 'March 2026', gross: 2100.00, net: 1722.00, status: 'Archived' }
  ];

  const handlePrintStatement = (stmtId: string) => {
    alert(`Compiling official digital financial statement ${stmtId}. Readying format for secure print spool...`);
  };

  return (
    <div id="financial-earnings-ledger" className="space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-[#F4F4F4] flex items-center gap-2">
            <Coins className="h-4 w-4 text-[#D4FF5E]" />
            <span>Financial Ledger & Earnings Escrow</span>
          </h2>
          <p className="text-[10px] text-[#8E9299] font-medium mt-1">
            Reconcile global sales earnings, calculate currency conversion factors, review withholding taxes, and track pending escrow payouts.
          </p>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center gap-2 bg-[#161618] border border-white/10 p-1.5 rounded-xl">
          <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest px-2 flex items-center gap-1">
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span>Currency:</span>
          </span>
          <div className="flex gap-1">
            {(['USD', 'EUR', 'GBP', 'INR', 'BTC'] as const).map(curr => (
              <button
                key={curr}
                onClick={() => setSelectedCurrency(curr)}
                className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all ${
                  selectedCurrency === curr 
                    ? 'bg-[#D4FF5E] text-black' 
                    : 'text-[#8E9299] hover:text-[#F4F4F4]'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Row 1: Triple Balance Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Available Balance */}
        <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block">Liquid Account Balance</span>
              <h3 className="text-2xl font-black text-white font-mono mt-1">{convertAmount(financialMetrics.availableBalance)}</h3>
            </div>
            <span className="text-[8.5px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase tracking-wider">
              Settled
            </span>
          </div>
          <p className="text-[9.5px] text-[#8E9299] leading-relaxed">
            Standard 3-day hold finalized. Funds cleared for immediately dispatched merchant payout transfers.
          </p>
        </div>

        {/* Pending Balance */}
        <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block">Escrow Clearance Balance</span>
              <h3 className="text-2xl font-black text-white font-mono mt-1">{convertAmount(financialMetrics.pendingBalance)}</h3>
            </div>
            <span className="text-[8.5px] font-black bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded uppercase tracking-wider">
              In Escrow
            </span>
          </div>
          <p className="text-[9.5px] text-[#8E9299] leading-relaxed">
            Awaiting 72-hour fraud validation clearance before allocation into withdrawable account balances.
          </p>
        </div>

        {/* Withdrawable Balance */}
        <div className="bg-[#161618] border border-[#D4FF5E]/20 rounded-3xl p-6 space-y-4 bg-gradient-to-br from-[#D4FF5E]/[0.02] to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-black text-[#D4FF5E] uppercase tracking-widest block">Cleared to Withdraw</span>
              <h3 className="text-2xl font-black text-[#D4FF5E] font-mono mt-1">{convertAmount(financialMetrics.withdrawableBalance)}</h3>
            </div>
            <span className="text-[8.5px] font-black bg-[#D4FF5E]/10 border border-[#D4FF5E]/20 text-[#D4FF5E] px-2 py-0.5 rounded uppercase tracking-wider">
              Ready
            </span>
          </div>
          <p className="text-[9.5px] text-[#8E9299] leading-relaxed">
            Maximum cleared funds allowed for transfer request, accounting for merchant security reserve values.
          </p>
        </div>

      </div>

      {/* Grid Row 2: Revenue breakdown & Taxes/Fees */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Revenue Breakdown (Col 7) */}
        <div className="lg:col-span-7 bg-[#161618] border border-white/10 rounded-3xl p-6 space-y-5">
          <div>
            <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block font-mono">Channel breakdown</span>
            <h3 className="font-display font-black text-white text-sm uppercase mt-0.5">Revenue Sources Allocation</h3>
          </div>

          <div className="space-y-4">
            {revenueBreakdown.map((r, i) => (
              <div key={i} className="space-y-1.5 text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-white uppercase">{r.source}</span>
                  <span className="font-mono text-[#8E9299]">{convertAmount(r.amount)} ({r.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5 relative">
                  <div className="h-full bg-[#D4FF5E] rounded-full" style={{ width: `${r.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Taxes and Fees Breakdown (Col 5) */}
        <div className="lg:col-span-5 bg-[#161618] border border-white/10 rounded-3xl p-6 space-y-4">
          <div>
            <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block font-mono">Net Earnings Reconciliation</span>
            <h3 className="font-display font-black text-white text-sm uppercase mt-0.5">Itemized Deductions & Fees</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-[#8E9299]">Gross Revenue:</span>
              <span className="font-bold text-white font-mono">{convertAmount(taxesAndFees.grossRevenue)}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#8E9299] flex items-center gap-1">
                <span>Omyra Marketplace Fee:</span>
                <span className="text-[9px] font-bold bg-white/5 px-1.5 py-0.2 rounded border border-white/10">5%</span>
              </span>
              <span className="font-bold text-rose-400 font-mono">-{convertAmount(taxesAndFees.marketplaceFees)}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#8E9299] flex items-center gap-1">
                <span>Tax Withholding:</span>
                <span className="text-[9px] font-bold bg-white/5 px-1.5 py-0.2 rounded border border-white/10">10%</span>
              </span>
              <span className="font-bold text-rose-400 font-mono">-{convertAmount(taxesAndFees.taxesWithheld)}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-white/5 pb-2">
              <span className="text-[#8E9299]">Payment Network Processing:</span>
              <span className="font-bold text-rose-400 font-mono">-{convertAmount(taxesAndFees.paymentProcessingFees)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 text-sm font-bold">
              <span className="text-white uppercase tracking-wider">Total Net Earnings:</span>
              <span className="text-[#D4FF5E] font-mono font-black">{convertAmount(taxesAndFees.netEarnings)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Payout Schedule & Monthly Statements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Payout Schedule Notice (Col 4) */}
        <div className="lg:col-span-4 bg-[#161618] border border-[#D4FF5E]/10 rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#D4FF5E]" />
              <span className="text-[9px] font-black uppercase text-[#D4FF5E] tracking-widest font-mono">Schedule parameters</span>
            </div>
            <h3 className="font-display font-black text-white text-base uppercase">Payout Schedule Log</h3>
            
            <div className="space-y-3 text-xs text-[#8E9299]">
              <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                <span className="block text-[8px] font-bold uppercase tracking-wider">Next Dispatch Date</span>
                <span className="text-white font-bold block mt-0.5">July 1, 2026 (Wednesday)</span>
              </div>
              <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                <span className="block text-[8px] font-bold uppercase tracking-wider">Frequency Mode</span>
                <span className="text-white font-bold block mt-0.5">Bi-Weekly Automated Escrow</span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4 text-[9px] text-[#8E9299] leading-relaxed">
            Change payout frequency configurations anytime in the Payout Center workspace panel.
          </div>
        </div>

        {/* Monthly statements listing (Col 8) */}
        <div className="lg:col-span-8 bg-[#161618] border border-white/10 rounded-3xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Monthly statements & Invoice Slips</h3>
            <span className="text-[9px] font-black text-[#8E9299] uppercase font-mono">ARCHIVE SECURED</span>
          </div>

          <div className="divide-y divide-white/5">
            {monthlyStatements.map((stmt, idx) => {
              const isExpanded = activeStatementIndex === idx;
              return (
                <div key={idx} className="hover:bg-white/[0.01] transition-colors">
                  <div 
                    onClick={() => setActiveStatementIndex(isExpanded ? null : idx)}
                    className="px-6 py-4 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4.5 w-4.5 text-[#8E9299]" />
                      <div>
                        <span className="font-bold text-white block uppercase text-[11px]">{stmt.month}</span>
                        <span className="text-[9px] text-[#8E9299] font-mono">{stmt.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[#8E9299] mr-1">Gross:</span>
                        <span className="font-bold text-white">${stmt.gross.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[#8E9299] mr-1">Net Cleared:</span>
                        <span className="font-bold text-[#D4FF5E]">${stmt.net.toFixed(2)}</span>
                      </div>
                      <span className="text-[9px] bg-[#D4FF5E]/10 border border-[#D4FF5E]/20 text-[#D4FF5E] px-2 py-0.5 rounded uppercase font-black">
                        {stmt.status}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-5 pt-1 border-t border-white/5 bg-[#0A0A0B]/30 text-xs text-[#8E9299] flex justify-between items-center">
                      <p className="max-w-md leading-relaxed text-[10px]">
                        This statement certifies that gross digital asset sales revenue totaling ${stmt.gross.toFixed(2)} was successfully calculated, matching appropriate W-8BEN withholding laws.
                      </p>
                      <button
                        onClick={() => handlePrintStatement(stmt.id)}
                        className="rounded-xl bg-white/10 hover:bg-white/15 hover:text-white px-3.5 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Print Statement</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
