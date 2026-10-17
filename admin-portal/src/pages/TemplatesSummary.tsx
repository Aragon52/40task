import React, { useState } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  Eye, 
  Search,
  FileText,
  TrendingUp,
  Filter,
  DollarSign,
  BarChart3,
  Check
} from 'lucide-react';
import { 
  TEMPLATE_M_1, 
  TEMPLATE_M_2, 
  TEMPLATE_M_3, 
  TEMPLATE_M_4, 
  TEMPLATE_M_5, 
  TEMPLATE_C_1, 
  TEMPLATE_C_2, 
  TEMPLATE_C_3, 
  TEMPLATE_C_4, 
  TEMPLATE_C_5 
} from './OrdersTasking';
import { Badge, Input, Card } from '@/src/shared/UI';

const templatesMap: Record<string, any[]> = {
  'M-1': TEMPLATE_M_1,
  'M-2': TEMPLATE_M_2,
  'M-3': TEMPLATE_M_3,
  'M-4': TEMPLATE_M_4,
  'M-5': TEMPLATE_M_5,
  'C-1': TEMPLATE_C_1,
  'C-2': TEMPLATE_C_2,
  'C-3': TEMPLATE_C_3,
  'C-4': TEMPLATE_C_4,
  'C-5': TEMPLATE_C_5
};

const templateNames = Object.keys(templatesMap);

export default function TemplatesSummary() {
  const [selectedTemplate, setSelectedTemplate] = useState('M-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const stats = templateNames.map(name => {
    const items = templatesMap[name];
    const totalValue = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const totalProfit = items.reduce((sum, item) => sum + Number(item.profit || 0), 0);
    const avgPrice = items.length ? totalValue / items.length : 0;
    const avgProfit = items.length ? totalProfit / items.length : 0;
    const margin = totalValue > 0 ? (totalProfit / totalValue) * 100 : 0;
    
    return {
      id: name,
      type: name.startsWith('M') ? 'Merchant' : 'Commission',
      count: items.length,
      totalValue,
      totalProfit,
      avgPrice,
      avgProfit,
      margin
    };
  });

  const displayStats = stats.filter(s => {
    if (filterType === 'M') return s.id.startsWith('M');
    if (filterType === 'C') return s.id.startsWith('C');
    return true;
  });

  const currentTemplateItems = (templatesMap[selectedTemplate] || []).map((item, idx) => ({
    sr: idx + 1,
    title: item.title,
    image: item.image,
    price: Number(item.price),
    profit: Number(item.profit)
  }));

  const filteredItems = currentTemplateItems.filter(i => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return i.title.toLowerCase().includes(q) || i.price.toString().includes(q);
  });

  return (
    <div className="admin-page-container space-y-6 animate-in fade-in duration-500">
      {/* Header Card */}
      <div className="admin-card !p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
              <Layers size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Presets Matrix</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Verify yield distributions and price bounds across template series.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 self-start lg:self-center">
            {['all', 'M', 'C'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  filterType === t
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {t === 'all' ? 'All Packs' : t === 'M' ? 'Merchant Series' : 'Commission Series'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card !p-5 !mb-0 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Packs</span>
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white block">10</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
            <FileText size={22} />
          </div>
        </div>
        
        <div className="admin-card !p-5 !mb-0 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Items Per Set</span>
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white block">40</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-sky-500 transition-colors">
            <BarChart3 size={22} />
          </div>
        </div>

        <div className="admin-card !p-5 !mb-0 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Average Margin</span>
            <span className="text-2xl font-black font-mono text-emerald-600 block">6.25%</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="admin-card !p-5 !mb-0 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</span>
            <span className="text-sm font-black text-emerald-600 uppercase tracking-tighter flex items-center gap-1.5 mt-2">
              <CheckCircle2 size={16} />
              Validated
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
            <Check size={22} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Pack Selection Table */}
        <div className="xl:col-span-7 admin-card !p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Filter size={16} className="text-indigo-500" />
              Series Matrix
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Template</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Yield (Total)</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Profit (Total)</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Margin</th>
                </tr>
              </thead>
              <tbody>
                {displayStats.map((item) => {
                  const isSelected = selectedTemplate === item.id;
                  return (
                    <tr 
                      key={item.id}
                      onClick={() => setSelectedTemplate(item.id)}
                      className={`group cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800/50 ${
                        isSelected 
                          ? 'bg-indigo-50/50 dark:bg-indigo-950/30' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] border shadow-xs ${
                            item.id.startsWith('M')
                              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/40'
                              : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40'
                          }`}>
                            {item.id}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block uppercase">{item.id} Series</span>
                            <span className="text-[10px] font-medium text-slate-400">{item.type} Classification</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                          $ {item.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
                          + $ {item.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-xs font-black font-mono text-indigo-600 dark:text-indigo-400">
                          {item.margin.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Item Explorer */}
        <div className="xl:col-span-5 space-y-4 min-w-0">
          <div className="admin-card !p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Eye size={16} className="text-indigo-500" />
                Sequence Explorer
              </h3>
              <Badge variant="outline" className="font-mono text-[10px] py-1 border-slate-200">
                {selectedTemplate} (40 NODES)
              </Badge>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4 pointer-events-none" />
              <input 
                type="text" 
                placeholder="Search sequence by title or price..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none transition-all"
              />
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              {filteredItems.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                  <Search size={32} strokeWidth={1} />
                  <span className="text-xs font-medium">No matches in this sequence</span>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div 
                    key={`${selectedTemplate}-node-${item.sr}`}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center gap-3 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors group"
                  >
                    <span className="w-6 text-[10px] font-black font-mono text-slate-300 dark:text-slate-700">{item.sr}</span>
                    <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shrink-0 overflow-hidden">
                      <img 
                        src={item.image || ''} 
                        alt="" 
                        className="w-full h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-1.png'; }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate block group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </span>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black font-mono text-slate-500">
                          $ {item.price.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-black font-mono text-emerald-600">
                          + $ {item.profit.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
