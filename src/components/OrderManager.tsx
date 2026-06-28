import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  FileText, 
  Download, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Globe, 
  Mail, 
  Clock, 
  Printer, 
  FileSpreadsheet, 
  CornerUpLeft, 
  ChevronRight, 
  ChevronDown,
  Lock,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  CreditCard,
  Ban,
  Check
} from 'lucide-react';

export interface Order {
  id: string;
  date: string;
  buyer: {
    name: string;
    email: string;
    country: string;
    avatar?: string;
    ipAddress: string;
    deviceId: string;
  };
  productTitle: string;
  price: number;
  licenseType: string;
  licenseKey: string;
  status: 'completed' | 'refunded' | 'failed' | 'processing';
  fraudScore: number; // 0 to 100
  fraudStatus: 'low' | 'medium' | 'high';
  downloadHistory: { timestamp: string; ip: string; device: string; progress: number }[];
  orderNotes: string[];
  invoiceNo: string;
}

export default function OrderManager() {
  // Initial rich state for high fidelity
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'OMY-ORD-4921',
      date: '2026-06-27T14:32:00Z',
      buyer: {
        name: 'Sarah Jenkins',
        email: 'sarah.j@uxlabs.io',
        country: 'United States',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop&q=80',
        ipAddress: '192.168.1.104',
        deviceId: 'macOS-Chrome-114'
      },
      productTitle: 'Nexus Premium Tailwind UI System',
      price: 49.00,
      licenseType: 'Commercial Enterprise',
      licenseKey: 'LIC-NEXUS-COMM-77F82A-99B',
      status: 'completed',
      fraudScore: 8,
      fraudStatus: 'low',
      downloadHistory: [
        { timestamp: '2026-06-27T14:40:00Z', ip: '192.168.1.104', device: 'macOS-Chrome-114', progress: 100 },
        { timestamp: '2026-06-27T15:12:00Z', ip: '192.168.1.104', device: 'macOS-Chrome-114', progress: 100 }
      ],
      orderNotes: ['Initial buy approved automatically by stripe processor.'],
      invoiceNo: 'INV-2026-4029'
    },
    {
      id: 'OMY-ORD-4919',
      date: '2026-06-26T18:21:00Z',
      buyer: {
        name: 'Alexei Volkov',
        email: 'volkov.dev@yandex.ru',
        country: 'Russia',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop&q=80',
        ipAddress: '82.112.44.18',
        deviceId: 'Linux-Firefox-110'
      },
      productTitle: 'OmniAudio Cinematic Synth FX',
      price: 29.00,
      licenseType: 'Standard Commercial',
      licenseKey: 'LIC-OMNI-STD-12A55C-33D',
      status: 'completed',
      fraudScore: 48,
      fraudStatus: 'medium',
      downloadHistory: [
        { timestamp: '2026-06-26T18:30:00Z', ip: '82.112.44.18', device: 'Linux-Firefox-110', progress: 100 }
      ],
      orderNotes: ['High proxy check warning, but matched country card validation successfully.'],
      invoiceNo: 'INV-2026-4027'
    },
    {
      id: 'OMY-ORD-4917',
      date: '2026-06-25T09:12:00Z',
      buyer: {
        name: 'Li Wei',
        email: 'li.wei@tencent.cn',
        country: 'China',
        ipAddress: '103.22.188.4',
        deviceId: 'Windows-Edge-112'
      },
      productTitle: 'Sovereign 3D Vector Pack',
      price: 19.00,
      licenseType: 'Standard Commercial',
      licenseKey: 'LIC-SOV-STD-34F91E-44F',
      status: 'refunded',
      fraudScore: 12,
      fraudStatus: 'low',
      downloadHistory: [],
      orderNotes: ['Buyer requested refund - duplicate asset transaction error.'],
      invoiceNo: 'INV-2026-4025'
    },
    {
      id: 'OMY-ORD-4915',
      date: '2026-06-24T22:05:00Z',
      buyer: {
        name: 'John Doe (Proxy)',
        email: 'anonymous-buyer@mailinator.com',
        country: 'Venezuela',
        ipAddress: '190.114.22.10',
        deviceId: 'Android-Chrome-Mobile'
      },
      productTitle: 'Nexus Premium Tailwind UI System',
      price: 49.00,
      licenseType: 'Commercial Enterprise',
      licenseKey: 'LIC-NEXUS-COMM-89X92C-11Z',
      status: 'failed',
      fraudScore: 92,
      fraudStatus: 'high',
      downloadHistory: [],
      orderNotes: ['OMYRA Security Shield auto-rejected payment authorization. Cardholder ZIP mismatch.'],
      invoiceNo: 'INV-2026-4023'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'refunded' | 'failed'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0]);
  const [newNote, setNewNote] = useState('');

  // Handle Note Submission
  const handleAddNote = () => {
    if (!newNote || !selectedOrder) return;
    const updated = orders.map(o => {
      if (o.id === selectedOrder.id) {
        return {
          ...o,
          orderNotes: [...o.orderNotes, newNote]
        };
      }
      return o;
    });
    setOrders(updated);
    setSelectedOrder({
      ...selectedOrder,
      orderNotes: [...selectedOrder.orderNotes, newNote]
    });
    setNewNote('');
  };

  // Trigger refund status change
  const handleRefundOrder = (id: string) => {
    if (confirm('Initiate order refund protocol? Cryptographic keys will be immediately revoked.')) {
      const updated = orders.map(o => {
        if (o.id === id) {
          return {
            ...o,
            status: 'refunded' as const,
            orderNotes: [...o.orderNotes, `Merchant processed full refund on ${new Date().toLocaleString()}.`]
          };
        }
        return o;
      });
      setOrders(updated);
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({
          ...selectedOrder,
          status: 'refunded',
          orderNotes: [...selectedOrder.orderNotes, `Merchant processed full refund on ${new Date().toLocaleString()}.`]
        });
      }
    }
  };

  // Export CSV representation
  const handleExportCSV = () => {
    const headers = 'Order ID,Date,Buyer Name,Buyer Email,Product,Price,License,Status,Fraud Score,Invoice\n';
    const rows = orders.map(o => 
      `"${o.id}","${o.date}","${o.buyer.name}","${o.buyer.email}","${o.productTitle}",${o.price},"${o.licenseType}","${o.status}",${o.fraudScore},"${o.invoiceNo}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `omyra_orders_report_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  // Simulated print trigger
  const handlePrintInvoice = () => {
    alert(`Generating standard cryptographic legal invoice ${selectedOrder?.invoiceNo}. Redirecting to system printer spool...`);
  };

  const filteredOrders = orders.filter(o => {
    const query = searchQuery.toLowerCase();
    const matchSearch = 
      o.id.toLowerCase().includes(query) ||
      o.buyer.name.toLowerCase().includes(query) ||
      o.buyer.email.toLowerCase().includes(query) ||
      o.productTitle.toLowerCase().includes(query);
    
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div id="order-escrow-portal" className="space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-[#F4F4F4] flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-[#D4FF5E]" />
            <span>Sellers Order Ledger & Fraud Escrow</span>
          </h2>
          <p className="text-[10px] text-[#8E9299] font-medium mt-1">
            Track customer licensing logs, download history, and trigger cryptographic proxy shield fraud defense audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="rounded-xl border border-white/10 bg-white/5 text-[#8E9299] hover:text-white px-3.5 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Hand: Orders List Panel (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Quick Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#161618] border border-white/10 p-4 rounded-2xl">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#8E9299]" />
              <input
                type="text"
                placeholder="Search ID, email, buyer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-[#0A0A0B] pl-10 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4FF5E]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
              {(['all', 'completed', 'refunded', 'failed'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all shrink-0 ${
                    filterStatus === st
                      ? 'bg-[#D4FF5E]/10 border-[#D4FF5E] text-[#D4FF5E]'
                      : 'border-white/5 text-[#8E9299] hover:text-[#F4F4F4]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Catalog list */}
          <div className="bg-[#161618] border border-white/10 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0A0A0B]/40 text-[#8E9299] uppercase tracking-widest text-[9px] font-black border-b border-white/5">
                  <tr>
                    <th className="px-5 py-4">Buyer & Date</th>
                    <th className="px-5 py-4">Product Purchased</th>
                    <th className="px-5 py-4 text-center">Price</th>
                    <th className="px-5 py-4 text-center">Fraud Alert</th>
                    <th className="px-5 py-4 text-right">Escrow Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-xs text-[#8E9299] uppercase tracking-widest font-bold">
                        No orders recorded matching selection query.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(o => {
                      const isSel = selectedOrder?.id === o.id;
                      return (
                        <tr 
                          key={o.id}
                          onClick={() => setSelectedOrder(o)}
                          className={`hover:bg-white/5 cursor-pointer transition-colors ${
                            isSel ? 'bg-white/[0.03]' : ''
                          }`}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              {o.buyer.avatar ? (
                                <img src={o.buyer.avatar} alt="" className="h-7 w-7 rounded-full object-cover border border-white/10" />
                              ) : (
                                <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white uppercase border border-white/15">
                                  {o.buyer.name[0]}
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-white block uppercase text-[11px] truncate max-w-[120px]">{o.buyer.name}</span>
                                <span className="text-[9px] text-[#8E9299] font-mono">{new Date(o.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-bold text-white block truncate max-w-[140px] uppercase">{o.productTitle}</span>
                            <span className="text-[9px] text-[#8E9299] font-mono">{o.id}</span>
                          </td>
                          <td className="px-5 py-4 text-center font-bold text-[#F4F4F4] font-mono">
                            ${o.price.toFixed(2)}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                              o.fraudStatus === 'high' 
                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                                : o.fraudStatus === 'medium'
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            }`}>
                              {o.fraudScore}%
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                              o.status === 'completed' 
                                ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' 
                                : o.status === 'refunded'
                                ? 'border-amber-500/20 text-amber-400 bg-amber-500/5'
                                : o.status === 'failed'
                                ? 'border-rose-500/20 text-rose-400 bg-rose-500/5'
                                : 'border-blue-500/20 text-blue-400 bg-blue-500/5'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Hand: Detailed Order Panel (Col 5) */}
        <div className="lg:col-span-5">
          {selectedOrder ? (
            <div className="bg-[#161618] border border-[#D4FF5E]/10 rounded-3xl p-6 space-y-6">
              
              {/* Top bar with Order Action Status */}
              <div className="flex justify-between items-start border-b border-white/5 pb-4">
                <div>
                  <span className="text-[9px] font-black text-[#D4FF5E] uppercase tracking-widest block">Detailed Order Log</span>
                  <h3 className="font-display font-black text-white text-base mt-0.5">{selectedOrder.id}</h3>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={handlePrintInvoice}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-[#8E9299] hover:text-white"
                    title="Print Invoice"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                  {selectedOrder.status === 'completed' && (
                    <button
                      onClick={() => handleRefundOrder(selectedOrder.id)}
                      className="text-[9px] font-black bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/25 text-rose-400 px-3 py-1.5 rounded-xl uppercase tracking-widest"
                    >
                      Process Refund
                    </button>
                  )}
                </div>
              </div>

              {/* Security Shield Integrity Analysis (Fraud check) */}
              <div className={`p-4 rounded-2xl border ${
                selectedOrder.fraudStatus === 'high' 
                  ? 'bg-rose-500/5 border-rose-500/10 text-rose-400' 
                  : selectedOrder.fraudStatus === 'medium'
                  ? 'bg-amber-500/5 border-amber-500/10 text-amber-400'
                  : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
              }`}>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest">OMYRA Shield Integrity Analysis</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                  <div>
                    <span className="block text-[8px] text-[#8E9299] uppercase tracking-wider font-bold">Fraud Threat Factor</span>
                    <span className="font-bold text-white font-mono text-sm">{selectedOrder.fraudScore} / 100 ({selectedOrder.fraudStatus.toUpperCase()})</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-[#8E9299] uppercase tracking-wider font-bold">Terminal IP Escrow</span>
                    <span className="font-bold text-white font-mono">{selectedOrder.buyer.ipAddress}</span>
                  </div>
                </div>
                <p className="text-[9px] text-[#8E9299] leading-relaxed mt-2.5 border-t border-white/5 pt-2">
                  {selectedOrder.fraudStatus === 'high' 
                    ? 'CRITICAL WARNING: IP proxy node match failed geographic postal check parameters. Payment automatically frozen.'
                    : selectedOrder.fraudStatus === 'medium'
                    ? 'MODERATE ADVISORY: Dynamic cell ISP block mismatch reported. Buyer cleared visual captcha test.'
                    : 'CLEAN DISCOVERY: Legitimate resident IP matched standard localized billing information perfectly.'
                  }
                </p>
              </div>

              {/* Buyer Profile Info */}
              <div className="space-y-3.5">
                <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block">Buyer Information</span>
                <div className="rounded-2xl border border-white/5 bg-[#0A0A0B]/30 p-4 space-y-2.5 text-xs text-[#8E9299]">
                  <div className="flex justify-between items-center">
                    <span>Full Legal Name:</span>
                    <span className="text-white font-bold uppercase">{selectedOrder.buyer.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Email Address:</span>
                    <span className="text-white font-mono">{selectedOrder.buyer.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tax Jurisdiction:</span>
                    <span className="text-white font-bold">{selectedOrder.buyer.country}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Registered Browser Device:</span>
                    <span className="text-white truncate max-w-[180px] font-mono">{selectedOrder.buyer.deviceId}</span>
                  </div>
                </div>
              </div>

              {/* Digital License Info */}
              <div className="space-y-3.5">
                <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block">Cryptographic Licensing Keys</span>
                <div className="rounded-2xl border border-white/5 bg-[#0A0A0B]/30 p-4 space-y-3 text-xs text-[#8E9299]">
                  <div className="flex justify-between items-center">
                    <span>Authorized License:</span>
                    <span className="text-[#D4FF5E] font-bold uppercase tracking-wider font-mono bg-[#D4FF5E]/10 border border-[#D4FF5E]/20 px-2 py-0.5 rounded">
                      {selectedOrder.licenseType}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[9.5px]">Digital Signature Proof:</span>
                    <div className="p-2.5 rounded-xl bg-black font-mono text-[10px] text-white border border-white/5 flex justify-between items-center select-all">
                      <span>{selectedOrder.licenseKey}</span>
                      <Lock className="h-3.5 w-3.5 text-[#D4FF5E]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Download History */}
              <div className="space-y-3.5">
                <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block">Download History Ledger</span>
                <div className="rounded-2xl border border-white/5 bg-[#0A0A0B]/30 p-4 text-xs">
                  {selectedOrder.downloadHistory.length === 0 ? (
                    <div className="text-[#8E9299] uppercase text-[10.5px] font-bold text-center py-2">
                      Buyer has not fetched files from client library.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedOrder.downloadHistory.map((dl, index) => (
                        <div key={index} className="flex justify-between items-center text-[#8E9299] border-b border-white/5 pb-2 last:border-0 last:pb-0">
                          <div>
                            <span className="text-white block font-mono">{new Date(dl.timestamp).toLocaleString()}</span>
                            <span className="text-[9.5px] font-mono text-[#8E9299]">{dl.ip} • {dl.device}</span>
                          </div>
                          <span className="text-[#D4FF5E] font-bold uppercase tracking-wider">SUCCESS (100%)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Invoice & Stamp info */}
              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 text-xs text-[#8E9299]">
                <div>
                  <span className="block text-[8px] uppercase font-bold tracking-wider">Invoice Identifier</span>
                  <span className="text-white font-mono">{selectedOrder.invoiceNo}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] uppercase font-bold tracking-wider">Stamp Date</span>
                  <span className="text-white font-mono">{new Date(selectedOrder.date).toLocaleString()}</span>
                </div>
              </div>

              {/* Order Notes Feed */}
              <div className="space-y-3.5 border-t border-white/5 pt-4">
                <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block">Order Audit Notes</span>
                
                <div className="space-y-2">
                  {selectedOrder.orderNotes.map((note, index) => (
                    <div key={index} className="bg-black/30 p-3 rounded-xl border border-white/5 text-[11px] text-[#8E9299] leading-relaxed relative">
                      <span className="absolute top-2.5 right-3 text-[8.5px] font-mono">system admin</span>
                      <p className="pr-12">{note}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1.5">
                  <input
                    type="text"
                    placeholder="Append admin notes to order history..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2 text-xs text-white placeholder-[#8E9299]"
                  />
                  <button
                    onClick={handleAddNote}
                    className="rounded-xl bg-white/10 hover:bg-white/20 text-[#F4F4F4] px-4 text-[10px] font-black uppercase tracking-widest"
                  >
                    Append
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#161618] p-12 text-center text-xs text-[#8E9299] uppercase tracking-widest font-black">
              Select an order from the list catalog to review comprehensive licensing audit records.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
