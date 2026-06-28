import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Globe, 
  Mail, 
  MessageSquare, 
  LifeBuoy, 
  Heart, 
  DollarSign, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  ArrowUpRight, 
  X,
  Send,
  UserCheck
} from 'lucide-react';

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  country: string;
  lifetimeValue: number;
  purchasesCount: number;
  purchaseHistory: {
    orderId: string;
    product: string;
    price: number;
    date: string;
  }[];
  reviewsCount: number;
  isFollowing: boolean;
  messages: {
    id: string;
    sender: 'customer' | 'creator';
    text: string;
    timestamp: string;
  }[];
  supportTickets: {
    id: string;
    subject: string;
    status: 'open' | 'resolved' | 'pending';
    priority: 'low' | 'medium' | 'high';
    date: string;
    messages: { sender: 'customer' | 'creator'; text: string; date: string }[];
  }[];
}

export default function CustomerManager() {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 'OMY-CUST-802',
      name: 'Sarah Jenkins',
      email: 'sarah.j@uxlabs.io',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop&q=80',
      country: 'United States',
      lifetimeValue: 245.00,
      purchasesCount: 5,
      purchaseHistory: [
        { orderId: 'OMY-ORD-4921', product: 'Nexus Premium Tailwind UI System', price: 49.00, date: '2026-06-27' },
        { orderId: 'OMY-ORD-4100', product: 'OmniAudio Cinematic Synth FX', price: 29.00, date: '2026-04-12' },
        { orderId: 'OMY-ORD-3882', product: 'Sovereign 3D Vector Pack', price: 19.00, date: '2026-03-01' },
        { orderId: 'OMY-ORD-3021', product: 'Minimalist Neumorphic Dashboard UI', price: 99.00, date: '2025-11-15' },
        { orderId: 'OMY-ORD-2911', product: 'Audio Cinematic Epic FX Pack', price: 49.00, date: '2025-10-02' }
      ],
      reviewsCount: 3,
      isFollowing: true,
      messages: [
        { id: 'm1', sender: 'customer', text: 'Hi! Are there any planned React 19 updates for the Nexus UI kit?', timestamp: '2026-06-27T10:00:00Z' },
        { id: 'm2', sender: 'creator', text: 'Hey Sarah! Yes, React 19 templates are in active development. Plan to release them next week.', timestamp: '2026-06-27T10:15:00Z' }
      ],
      supportTickets: [
        {
          id: 'TKT-9921',
          subject: 'Broken layout in Chrome 124 for grid cards',
          status: 'open',
          priority: 'high',
          date: '2026-06-27',
          messages: [
            { sender: 'customer', text: 'On Chrome 124, grid items overlap slightly when resizing past 1200px viewport.', date: '2026-06-27T10:02:00Z' }
          ]
        }
      ]
    },
    {
      id: 'OMY-CUST-794',
      name: 'Alexei Volkov',
      email: 'volkov.dev@yandex.ru',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop&q=80',
      country: 'Russia',
      lifetimeValue: 29.00,
      purchasesCount: 1,
      purchaseHistory: [
        { orderId: 'OMY-ORD-4919', product: 'OmniAudio Cinematic Synth FX', price: 29.00, date: '2026-06-26' }
      ],
      reviewsCount: 1,
      isFollowing: true,
      messages: [
        { id: 'm3', sender: 'customer', text: 'Thanks for the quick license key delivery! Outstanding audio quality.', timestamp: '2026-06-26T19:00:00Z' }
      ],
      supportTickets: []
    },
    {
      id: 'OMY-CUST-721',
      name: 'Li Wei',
      email: 'li.wei@tencent.cn',
      country: 'China',
      lifetimeValue: 19.00,
      purchasesCount: 1,
      purchaseHistory: [
        { orderId: 'OMY-ORD-4917', product: 'Sovereign 3D Vector Pack', price: 19.00, date: '2026-06-25' }
      ],
      reviewsCount: 0,
      isFollowing: false,
      messages: [],
      supportTickets: [
        {
          id: 'TKT-9912',
          subject: 'Download archive zip corrupt on extraction',
          status: 'resolved',
          priority: 'medium',
          date: '2026-06-25',
          messages: [
            { sender: 'customer', text: 'Failed to extract Sovereign Vector file, file CRC error.', date: '2026-06-25T09:15:00Z' },
            { sender: 'creator', text: 'Hi Li Wei, the package was re-compiled and uploaded successfully. Please try re-downloading from your library!', date: '2026-06-25T11:00:00Z' }
          ]
        }
      ]
    },
    {
      id: 'OMY-CUST-688',
      name: 'Jean-Pierre',
      email: 'jp.graphics@design.fr',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&fit=crop&q=80',
      country: 'France',
      lifetimeValue: 118.00,
      purchasesCount: 2,
      purchaseHistory: [
        { orderId: 'OMY-ORD-3201', product: 'Minimalist Neumorphic Dashboard UI', price: 99.00, date: '2026-02-15' },
        { orderId: 'OMY-ORD-3110', product: 'Sovereign 3D Vector Pack', price: 19.00, date: '2026-01-10' }
      ],
      reviewsCount: 2,
      isFollowing: true,
      messages: [
        { id: 'm5', sender: 'customer', text: 'Greetings, love your asset styles. Will you make a tailwind template for mobile applications soon?', timestamp: '2026-05-18T14:20:00Z' }
      ],
      supportTickets: []
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCust, setSelectedCust] = useState<Customer | null>(customers[0]);
  const [activePanel, setActivePanel] = useState<'details' | 'messages' | 'tickets'>('details');

  // Interactive message sending
  const [chatInput, setChatInput] = useState('');
  const [ticketInput, setTicketInput] = useState('');

  const handleSendMessage = () => {
    if (!chatInput || !selectedCust) return;
    const updated = customers.map(c => {
      if (c.id === selectedCust.id) {
        return {
          ...c,
          messages: [
            ...c.messages,
            {
              id: `m-new-${Date.now()}`,
              sender: 'creator' as const,
              text: chatInput,
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return c;
    });
    setCustomers(updated);
    setSelectedCust({
      ...selectedCust,
      messages: [
        ...selectedCust.messages,
        {
          id: `m-new-${Date.now()}`,
          sender: 'creator',
          text: chatInput,
          timestamp: new Date().toISOString()
        }
      ]
    });
    setChatInput('');
  };

  // Reply to active support ticket
  const handleReplyTicket = (ticketId: string) => {
    if (!ticketInput || !selectedCust) return;
    const updated = customers.map(c => {
      if (c.id === selectedCust.id) {
        return {
          ...c,
          supportTickets: c.supportTickets.map(t => {
            if (t.id === ticketId) {
              return {
                ...t,
                messages: [
                  ...t.messages,
                  { sender: 'creator' as const, text: ticketInput, date: new Date().toISOString() }
                ]
              };
            }
            return t;
          })
        };
      }
      return c;
    });
    setCustomers(updated);
    setSelectedCust({
      ...selectedCust,
      supportTickets: selectedCust.supportTickets.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            messages: [
              ...t.messages,
              { sender: 'creator', text: ticketInput, date: new Date().toISOString() }
            ]
          };
        }
        return t;
      })
    });
    setTicketInput('');
  };

  const handleToggleResolveTicket = (ticketId: string) => {
    if (!selectedCust) return;
    const updated = customers.map(c => {
      if (c.id === selectedCust.id) {
        return {
          ...c,
          supportTickets: c.supportTickets.map(t => {
            if (t.id === ticketId) {
              return {
                ...t,
                status: t.status === 'resolved' ? ('open' as const) : ('resolved' as const)
              };
            }
            return t;
          })
        };
      }
      return c;
    });
    setCustomers(updated);
    setSelectedCust({
      ...selectedCust,
      supportTickets: selectedCust.supportTickets.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: t.status === 'resolved' ? 'open' : 'resolved'
          };
        }
        return t;
      })
    });
  };

  const filteredCustomers = customers.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.country.toLowerCase().includes(query)
    );
  });

  return (
    <div id="customer-relationship-suite" className="space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-[#F4F4F4] flex items-center gap-2">
            <Users className="h-4 w-4 text-[#D4FF5E]" />
            <span>Customer Relationship & CRM Engine</span>
          </h2>
          <p className="text-[10px] text-[#8E9299] font-medium mt-1">
            Analyze customer lifetime value, manage real-time correspondence, review follow status, and dispatch helpdesk resolutions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Search & Customers Grid/List (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative w-full bg-[#161618] border border-white/10 p-4 rounded-2xl">
            <Search className="absolute left-7 top-6.5 h-4 w-4 text-[#8E9299]" />
            <input
              type="text"
              placeholder="Search customers by name, country or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-[#0A0A0B] pl-11 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4FF5E]"
            />
          </div>

          <div className="bg-[#161618] border border-white/10 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0A0A0B]/40 text-[#8E9299] uppercase tracking-widest text-[9px] font-black border-b border-white/5">
                  <tr>
                    <th className="px-5 py-4">Customer Name</th>
                    <th className="px-5 py-4">Country</th>
                    <th className="px-5 py-4 text-center">Purchases</th>
                    <th className="px-5 py-4 text-center">Follow Status</th>
                    <th className="px-5 py-4 text-right">Lifetime Value (LTV)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-[#8E9299] uppercase font-bold text-xs tracking-widest">
                        No clients registered under the specified name parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(c => {
                      const isSel = selectedCust?.id === c.id;
                      return (
                        <tr 
                          key={c.id}
                          onClick={() => { setSelectedCust(c); setActivePanel('details'); }}
                          className={`hover:bg-white/5 cursor-pointer transition-colors ${
                            isSel ? 'bg-white/[0.03]' : ''
                          }`}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              {c.avatar ? (
                                <img src={c.avatar} alt="" className="h-8 w-8 rounded-full object-cover border border-white/10" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white uppercase border border-white/15">
                                  {c.name[0]}
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-white block uppercase tracking-wide text-[11px]">{c.name}</span>
                                <span className="text-[9px] text-[#8E9299] font-mono">{c.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-bold text-white flex items-center gap-1">
                              <Globe className="h-3 w-3 text-[#8E9299]" />
                              <span>{c.country}</span>
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center text-[#8E9299] font-bold font-mono">
                            {c.purchasesCount} orders
                          </td>
                          <td className="px-5 py-4 text-center">
                            {c.isFollowing ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-[#D4FF5E] bg-[#D4FF5E]/10 px-2 py-0.5 rounded-full">
                                <Heart className="h-2.5 w-2.5 fill-[#D4FF5E]" />
                                <span>Follower</span>
                              </span>
                            ) : (
                              <span className="text-[9px] font-black uppercase tracking-wider text-[#8E9299]">
                                Guest
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right font-black text-[#D4FF5E] font-mono text-xs">
                            ${c.lifetimeValue.toFixed(2)}
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

        {/* Right Side: Tabbed CRM Correspondence Card (Col 5) */}
        <div className="lg:col-span-5">
          {selectedCust ? (
            <div className="bg-[#161618] border border-[#D4FF5E]/10 rounded-3xl p-6 space-y-6">
              
              {/* Profile Card Summary */}
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                {selectedCust.avatar ? (
                  <img src={selectedCust.avatar} alt="" className="h-11 w-11 rounded-full object-cover border-2 border-[#D4FF5E]" />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center text-sm font-black text-[#D4FF5E] uppercase border-2 border-[#D4FF5E]/30">
                    {selectedCust.name[0]}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-black text-white text-sm uppercase">{selectedCust.name}</h3>
                    <span className="text-[8.5px] font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[#8E9299]">{selectedCust.id}</span>
                  </div>
                  <p className="text-[10px] text-[#8E9299] font-mono">{selectedCust.email}</p>
                </div>
              </div>

              {/* Navigation Tabs (Details, Messages, Tickets) */}
              <div className="grid grid-cols-3 gap-1 bg-[#0A0A0B] p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setActivePanel('details')}
                  className={`py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    activePanel === 'details' ? 'bg-[#D4FF5E] text-black' : 'text-[#8E9299] hover:text-[#F4F4F4]'
                  }`}
                >
                  History
                </button>
                <button
                  onClick={() => setActivePanel('messages')}
                  className={`py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1 ${
                    activePanel === 'messages' ? 'bg-[#D4FF5E] text-black' : 'text-[#8E9299] hover:text-[#F4F4F4]'
                  }`}
                >
                  Messages ({selectedCust.messages.length})
                </button>
                <button
                  onClick={() => setActivePanel('tickets')}
                  className={`py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1 ${
                    activePanel === 'tickets' ? 'bg-[#D4FF5E] text-black' : 'text-[#8E9299] hover:text-[#F4F4F4]'
                  }`}
                >
                  Tickets ({selectedCust.supportTickets.length})
                </button>
              </div>

              {/* CRM PANEL 1: HISTORY & METRICS */}
              {activePanel === 'details' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 bg-black/30 border border-white/5 rounded-2xl">
                      <span className="block text-[8px] font-black uppercase tracking-widest text-[#8E9299]">Total LTV</span>
                      <span className="font-mono text-base font-black text-[#D4FF5E]">${selectedCust.lifetimeValue.toFixed(2)}</span>
                    </div>
                    <div className="p-3.5 bg-black/30 border border-white/5 rounded-2xl">
                      <span className="block text-[8px] font-black uppercase tracking-widest text-[#8E9299]">Reviews Posted</span>
                      <span className="font-mono text-base font-black text-white">{selectedCust.reviewsCount} written</span>
                    </div>
                  </div>

                  {/* Purchase History Ledger */}
                  <div className="space-y-3">
                    <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block">Purchase History Ledger</span>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {selectedCust.purchaseHistory.map((pur, i) => (
                        <div key={i} className="bg-black/20 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-white block uppercase text-[10.5px] truncate max-w-[180px]">{pur.product}</span>
                            <span className="text-[9px] text-[#8E9299] font-mono">{pur.orderId} • {pur.date}</span>
                          </div>
                          <span className="font-bold text-white font-mono shrink-0">${pur.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Following Status Block */}
                  <div className="p-3 bg-[#D4FF5E]/5 border border-[#D4FF5E]/10 rounded-2xl flex items-center justify-between text-xs text-[#8E9299]">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-[#D4FF5E]" />
                      <span className="font-bold text-white">Follower Loyalty Index</span>
                    </div>
                    <span className="font-bold text-[#D4FF5E]">
                      {selectedCust.isFollowing ? 'Active Subscriber' : 'Unsubscribed Guest'}
                    </span>
                  </div>
                </div>
              )}

              {/* CRM PANEL 2: CORRESPONDENCE / CHAT */}
              {activePanel === 'messages' && (
                <div className="space-y-4">
                  <div className="space-y-2.5 h-[240px] overflow-y-auto border border-white/5 bg-black/20 rounded-2xl p-4">
                    {selectedCust.messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-[10.5px] text-[#8E9299] font-bold uppercase tracking-widest text-center">
                        No previous correspondence recorded with client.
                      </div>
                    ) : (
                      selectedCust.messages.map((m, index) => {
                        const isMe = m.sender === 'creator';
                        return (
                          <div 
                            key={index} 
                            className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                          >
                            <span className="text-[8px] text-[#8E9299] font-mono mb-0.5">
                              {isMe ? 'You' : selectedCust.name} • {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                              isMe 
                                ? 'bg-[#D4FF5E] text-black rounded-tr-none font-medium' 
                                : 'bg-white/5 text-[#F4F4F4] rounded-tl-none border border-white/5'
                            }`}>
                              {m.text}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type real-time reply directly..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                      className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#D4FF5E]"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="rounded-xl bg-[#D4FF5E] text-black px-4 flex items-center justify-center cursor-pointer hover:bg-[#c3ec4e]"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* CRM PANEL 3: HELPDESK SUPPORT TICKETS */}
              {activePanel === 'tickets' && (
                <div className="space-y-4">
                  {selectedCust.supportTickets.length === 0 ? (
                    <div className="border border-dashed border-white/10 rounded-2xl p-8 text-center text-[10px] text-[#8E9299] uppercase tracking-widest font-black">
                      No active support files logged for this account.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                      {selectedCust.supportTickets.map(t => (
                        <div key={t.id} className="border border-white/5 bg-black/10 rounded-2xl p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[8px] font-mono text-[#D4FF5E] uppercase tracking-wider">{t.id}</span>
                              <h4 className="font-bold text-white uppercase text-[11px] mt-0.5">{t.subject}</h4>
                            </div>

                            <button
                              onClick={() => handleToggleResolveTicket(t.id)}
                              className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border ${
                                t.status === 'resolved'
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              }`}
                            >
                              {t.status}
                            </button>
                          </div>

                          {/* Ticket Feed Dialog */}
                          <div className="space-y-2 border-t border-b border-white/5 py-2.5 max-h-[140px] overflow-y-auto text-[11px]">
                            {t.messages.map((msg, idx) => (
                              <div key={idx} className="space-y-0.5">
                                <span className="block text-[8px] font-mono text-[#8E9299]">
                                  {msg.sender === 'creator' ? 'Creator Admin' : selectedCust.name}
                                </span>
                                <p className="text-[#8E9299] italic">"{msg.text}"</p>
                              </div>
                            ))}
                          </div>

                          {/* Message input to answer the support tickets */}
                          {t.status !== 'resolved' && (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Write resolution message..."
                                value={ticketInput}
                                onChange={(e) => setTicketInput(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                              />
                              <button
                                onClick={() => handleReplyTicket(t.id)}
                                className="rounded-xl bg-white/10 hover:bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-3"
                              >
                                Submit
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#161618] p-12 text-center text-xs text-[#8E9299] uppercase tracking-widest font-black">
              Select a customer profile to launch full CRM communication panels.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
