import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Download, 
  Globe, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Compass, 
  Search, 
  ChevronRight, 
  Users, 
  Activity, 
  LineChart, 
  Eye, 
  Flame, 
  Sparkles, 
  MousePointerClick
} from 'lucide-react';

export default function AnalyticsManager() {
  const [forecastModel, setForecastModel] = useState<'linear' | 'aggressive' | 'conservative'>('linear');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('all');
  const [activeFunnelStep, setActiveFunnelStep] = useState<number | null>(null);

  // High-fidelity Mock Data for Enterprise Analytics
  const stats = {
    revenue: 14892.50,
    revenueGrowth: 24.8,
    sales: 312,
    salesGrowth: 18.2,
    downloads: 1240,
    downloadsGrowth: 32.5,
    conversionRate: '4.2%'
  };

  const trafficSources = [
    { source: 'Direct Traffic', visits: 12450, percentage: 40, conversion: '5.2%' },
    { source: 'GitHub Repositories', visits: 7800, percentage: 25, conversion: '4.8%' },
    { source: 'Twitter / X Ref', visits: 4680, percentage: 15, conversion: '3.1%' },
    { source: 'Google Organic Search', visits: 3120, percentage: 10, conversion: '2.5%' },
    { source: 'Dev.to / Technical Blogs', visits: 3120, percentage: 10, conversion: '3.8%' }
  ];

  const conversionFunnel = [
    { step: 'Asset Impressions', count: 74500, percentage: 100, desc: 'Users who saw the listings' },
    { step: 'Product Page Views', count: 31200, percentage: 41.8, desc: 'Users who opened product details' },
    { step: 'Added to Cart / Checkout', count: 4800, percentage: 6.4, desc: 'Users starting buy sequence' },
    { step: 'Completed Purchase', count: 312, percentage: 0.42, desc: 'Sellers confirmed paid orders' },
    { step: 'Successful Downloads', count: 298, percentage: 0.40, desc: 'Buyers fetched licensing files' }
  ];

  const deviceAnalytics = [
    { device: 'Desktop / Workstation', icon: Monitor, count: 218, percentage: 70 },
    { device: 'Mobile Smartphone', icon: Smartphone, count: 78, percentage: 25 },
    { device: 'Tablet PC', icon: Tablet, count: 16, percentage: 5 }
  ];

  const browserAnalytics = [
    { browser: 'Google Chrome', count: 198, percentage: 63.4 },
    { browser: 'Apple Safari', count: 62, percentage: 19.8 },
    { browser: 'Mozilla Firefox', count: 34, percentage: 10.9 },
    { browser: 'Microsoft Edge', count: 18, percentage: 5.9 }
  ];

  const countryAnalytics = [
    { country: 'United States', flag: '🇺🇸', revenue: 6450.00, sales: 132 },
    { country: 'Germany', flag: '🇩🇪', revenue: 2580.00, sales: 54 },
    { country: 'United Kingdom', flag: '🇬🇧', revenue: 1940.00, sales: 40 },
    { country: 'Japan', flag: '🇯🇵', revenue: 1450.00, sales: 30 },
    { country: 'India', flag: '🇮🇳', revenue: 1210.00, sales: 28 },
    { country: 'Canada', flag: '🇨🇦', revenue: 1262.50, sales: 28 }
  ];

  // Predictive Forecaster calculations
  const getForecastMultiplier = () => {
    if (forecastModel === 'aggressive') return 1.45;
    if (forecastModel === 'conservative') return 0.95;
    return 1.18; // linear
  };

  const getForecastedData = () => {
    const mult = getForecastMultiplier();
    return {
      month1: stats.revenue * mult * 0.35,
      month2: stats.revenue * mult * 0.72,
      month3: stats.revenue * mult * 1.12
    };
  };

  const forecasts = getForecastedData();

  const productPerformance = [
    { title: 'Nexus Premium Tailwind UI System', category: 'Templates', sales: 142, revenue: 6958.00, retention: '88%' },
    { title: 'OmniAudio Cinematic Synth FX', category: 'Audio', sales: 98, revenue: 2842.00, retention: '92%' },
    { title: 'Sovereign 3D Vector Pack', category: 'Design', sales: 42, revenue: 798.00, retention: '76%' },
    { title: 'Minimalist Neumorphic Dashboard UI', category: 'Templates', sales: 30, revenue: 2970.00, retention: '94%' }
  ];

  const retentionCohort = [
    { month: 'Month 1 (Acquisition)', rate: 100 },
    { month: 'Month 2 (Re-downloads & updates)', rate: 84 },
    { month: 'Month 3 (Extended license upgrades)', rate: 42 },
    { month: 'Month 4 (Loyal multi-asset buyers)', rate: 29 }
  ];

  const heatmapSpots = [
    { element: 'Cover Graphic Slider', clicks: 4200, level: 'high' },
    { element: 'Figma Live Embed Preview', clicks: 3100, level: 'high' },
    { element: 'Download Sample Button', clicks: 1850, level: 'medium' },
    { element: 'Reviews Section Accordion', clicks: 1200, level: 'medium' },
    { element: 'Technical Docs Anchor Links', clicks: 450, level: 'low' }
  ];

  const searchAnalytics = [
    { query: 'tailwind dashboard template', count: 1840, conversion: '6.2%' },
    { query: 'cinematic sound effects', count: 1210, conversion: '4.9%' },
    { query: '3d blender icons', count: 850, conversion: '3.1%' },
    { query: 'dark neumorphic dashboard', count: 520, conversion: '5.8%' },
    { query: 'clean design system kit', count: 310, conversion: '7.1%' }
  ];

  return (
    <div id="enterprise-analytics-engine" className="space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-[#F4F4F4] flex items-center gap-2">
            <LineChart className="h-4 w-4 text-[#D4FF5E]" />
            <span>Enterprise Intelligence & Analytics</span>
          </h2>
          <p className="text-[10px] text-[#8E9299] font-medium mt-1">
            Analyze customer acquisition channels, conversion retention, and execute predictive neural ML revenue forecasting modules.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-black text-[#D4FF5E] uppercase tracking-widest font-mono border border-[#D4FF5E]/20 bg-[#D4FF5E]/5 px-2.5 py-1 rounded">
            REAL-TIME DATA STACK
          </span>
        </div>
      </div>

      {/* Grid Row 1: Key Metrics High Contrast */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#161618] border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#8E9299]">Gross Revenue</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-black text-white font-mono">${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-[#D4FF5E] font-bold flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" />
              +{stats.revenueGrowth}%
            </span>
          </div>
          <div className="h-1 bg-gradient-to-r from-[#D4FF5E] to-transparent rounded-full mt-4" style={{ width: '80%' }} />
        </div>

        <div className="bg-[#161618] border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#8E9299]">Sales Units</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-black text-white font-mono">{stats.sales}</span>
            <span className="text-[10px] text-[#D4FF5E] font-bold flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" />
              +{stats.salesGrowth}%
            </span>
          </div>
          <div className="h-1 bg-gradient-to-r from-[#D4FF5E] to-transparent rounded-full mt-4" style={{ width: '65%' }} />
        </div>

        <div className="bg-[#161618] border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#8E9299]">Downloads Log</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-black text-white font-mono">{stats.downloads}</span>
            <span className="text-[10px] text-[#D4FF5E] font-bold flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" />
              +{stats.downloadsGrowth}%
            </span>
          </div>
          <div className="h-1 bg-gradient-to-r from-[#D4FF5E] to-transparent rounded-full mt-4" style={{ width: '90%' }} />
        </div>

        <div className="bg-[#161618] border border-[#D4FF5E]/20 p-5 rounded-2xl relative overflow-hidden bg-gradient-to-br from-[#D4FF5E]/[0.02] to-transparent">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#D4FF5E]">Total Conversion Funnel</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-black text-[#D4FF5E] font-mono">{stats.conversionRate}</span>
            <span className="text-[10px] text-emerald-400 font-bold">Stable Escrow</span>
          </div>
          <div className="h-1 bg-[#D4FF5E] rounded-full mt-4" style={{ width: '42%' }} />
        </div>
      </div>

      {/* Grid Row 2: Conversion Funnel and Predictive Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Conversion Funnel (Col 7) */}
        <div className="lg:col-span-7 bg-[#161618] border border-white/10 rounded-3xl p-6 space-y-5">
          <div>
            <span className="text-[9px] font-black text-[#D4FF5E] uppercase tracking-widest block">Customer Path Index</span>
            <h3 className="font-display font-black text-white text-sm uppercase mt-0.5">Conversion Funnel Drop-off Rate</h3>
          </div>

          <div className="space-y-3">
            {conversionFunnel.map((step, index) => {
              const isActive = activeFunnelStep === index;
              return (
                <div 
                  key={index}
                  onClick={() => setActiveFunnelStep(isActive ? null : index)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#D4FF5E]/10 border-[#D4FF5E] text-[#D4FF5E]' 
                      : 'bg-black/20 border-white/5 hover:border-white/10 text-[#8E9299]'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="h-5 w-5 rounded-full bg-white/5 flex items-center justify-center font-mono font-bold text-[10px] border border-white/10">
                        {index + 1}
                      </span>
                      <span className="font-bold text-white uppercase tracking-wide">{step.step}</span>
                    </div>

                    <div className="text-right font-mono">
                      <span className="font-bold text-white block">{step.count.toLocaleString()}</span>
                      <span className="text-[9.5px] font-bold block">{step.percentage}% step rate</span>
                    </div>
                  </div>

                  {isActive && (
                    <div className="border-t border-white/5 mt-3 pt-2.5 text-[10px] text-[#8E9299] leading-relaxed">
                      {step.desc}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Predictive Revenue Forecaster (Col 5) */}
        <div className="lg:col-span-5 bg-[#161618] border border-[#D4FF5E]/10 rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block">AI Forecaster Suite</span>
              <h3 className="font-display font-black text-white text-sm uppercase mt-0.5">Predictive Revenue Forecast</h3>
            </div>

            {/* Forecaster Control Buttons */}
            <div className="grid grid-cols-3 gap-1 bg-black p-1 rounded-xl border border-white/5">
              {(['conservative', 'linear', 'aggressive'] as const).map(model => (
                <button
                  key={model}
                  onClick={() => setForecastModel(model)}
                  className={`py-1.5 text-[8.5px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    forecastModel === model 
                      ? 'bg-[#D4FF5E] text-black' 
                      : 'text-[#8E9299] hover:text-[#F4F4F4]'
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>

            {/* Predicted Values Spark list */}
            <div className="space-y-3.5 pt-2 text-xs text-[#8E9299]">
              <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5">
                <span>Next 30 Days Forecast:</span>
                <span className="font-bold text-[#D4FF5E] font-mono">+${forecasts.month1.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5">
                <span>Next 60 Days Forecast:</span>
                <span className="font-bold text-[#D4FF5E] font-mono">+${forecasts.month2.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5">
                <span>Next 90 Days Forecast:</span>
                <span className="font-bold text-[#D4FF5E] font-mono">+${forecasts.month3.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4">
            <div className="flex items-center gap-2 text-[10px] text-[#8E9299] leading-relaxed">
              <Sparkles className="h-4 w-4 text-[#D4FF5E] shrink-0" />
              <span>
                Based on historic retention indexes & organic growth curves compiled with current platform indexes.
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Grid Row 3: Traffic and Search Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Traffic Sources Acquisition */}
        <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 space-y-4">
          <div>
            <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block">Acquisition Channels</span>
            <h3 className="font-display font-black text-white text-sm uppercase mt-0.5">Top Traffic Reference Sources</h3>
          </div>

          <div className="space-y-3.5">
            {trafficSources.map((tr, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between text-white font-bold">
                  <span>{tr.source}</span>
                  <span className="font-mono text-[#8E9299]">{tr.visits.toLocaleString()} visits ({tr.conversion} cvr)</span>
                </div>
                <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5 relative">
                  <div className="h-full bg-[#D4FF5E] rounded-full" style={{ width: `${tr.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Search Queries in Mall */}
        <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 space-y-4">
          <div>
            <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block">In-Mall Search Intent</span>
            <h3 className="font-display font-black text-white text-sm uppercase mt-0.5">Top Converting Search Queries</h3>
          </div>

          <div className="divide-y divide-white/5 max-h-[220px] overflow-y-auto pr-1">
            {searchAnalytics.map((s, idx) => (
              <div key={idx} className="flex justify-between items-center py-2.5 text-xs text-[#8E9299]">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Search className="h-3.5 w-3.5 text-[#8E9299]" />
                  <span>"{s.query}"</span>
                </div>
                <div className="font-mono text-right">
                  <span className="text-white font-bold block">{s.count} requests</span>
                  <span className="text-[9.5px] text-[#D4FF5E] block">{s.conversion} purchase rate</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid Row 4: Device, Browser, and Country Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Device Distribution */}
        <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 space-y-4">
          <h3 className="font-display font-black text-white text-xs uppercase">Device Distribution</h3>
          <div className="space-y-3.5">
            {deviceAnalytics.map((dev, idx) => {
              const DevIcon = dev.icon;
              return (
                <div key={idx} className="flex items-center justify-between text-xs text-[#8E9299]">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <DevIcon className="h-4 w-4 text-[#8E9299]" />
                    <span>{dev.device}</span>
                  </div>
                  <span className="font-mono font-bold text-[#D4FF5E]">{dev.percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Browser Distribution */}
        <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 space-y-4">
          <h3 className="font-display font-black text-white text-xs uppercase">Browser Engines</h3>
          <div className="space-y-3.5">
            {browserAnalytics.map((b, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-[#8E9299]">
                <span className="font-bold text-white">{b.browser}</span>
                <span className="font-mono font-bold text-[#D4FF5E]">{b.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Country Distribution */}
        <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 space-y-4">
          <h3 className="font-display font-black text-white text-xs uppercase">Geographic Market Share</h3>
          <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
            {countryAnalytics.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-[#8E9299]">
                <div className="flex items-center gap-2 text-white font-bold">
                  <span>{c.flag}</span>
                  <span>{c.country}</span>
                </div>
                <span className="font-mono text-white">${c.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid Row 5: Product Performance & Retention & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Product Performance and Retention Table (Col 8) */}
        <div className="lg:col-span-8 bg-[#161618] border border-white/10 rounded-3xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Product Catalog Sales Ranking</h3>
            <span className="text-[9px] font-black text-[#8E9299] uppercase font-mono">RETENTION SHIELD ACTIVE</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0A0B]/40 text-[#8E9299] uppercase tracking-widest text-[9px] font-black border-b border-white/5">
                <tr>
                  <th className="px-5 py-4">Asset Title</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4 text-center">Sales count</th>
                  <th className="px-5 py-4 text-center">Client Retention</th>
                  <th className="px-5 py-4 text-right">Earning revenues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {productPerformance.map((p, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 font-bold text-white uppercase">{p.title}</td>
                    <td className="px-5 py-4 text-[#8E9299] font-mono capitalize">{p.category}</td>
                    <td className="px-5 py-4 text-center font-bold text-white font-mono">{p.sales} units</td>
                    <td className="px-5 py-4 text-center text-[#D4FF5E] font-bold font-mono">{p.retention}</td>
                    <td className="px-5 py-4 text-right font-black text-[#D4FF5E] font-mono">${p.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Heatmap click analysis (Col 4) */}
        <div className="lg:col-span-4 bg-[#161618] border border-white/10 rounded-3xl p-6 space-y-4">
          <div>
            <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block">Heatmap click analysis</span>
            <h3 className="font-display font-black text-white text-xs uppercase mt-0.5">UX Element Clicks</h3>
          </div>

          <div className="space-y-3">
            {heatmapSpots.map((h, idx) => (
              <div key={idx} className="bg-black/30 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block uppercase tracking-wide text-[10.5px]">{h.element}</span>
                  <span className="text-[9px] text-[#8E9299] font-mono">{h.clicks.toLocaleString()} clicks detected</span>
                </div>
                <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                  h.level === 'high' 
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                    : h.level === 'medium'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                }`}>
                  {h.level}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
