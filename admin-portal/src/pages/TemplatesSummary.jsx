import React, { useState } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Info,
  DollarSign, 
  Percent, 
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Sparkles,
  HelpCircle,
  FileText
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

const templatesMap = {
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
  const [filterType, setFilterType] = useState('all'); // 'all', 'M', 'C'

  // Calculate detailed stats for each template
  const stats = templateNames.map(name => {
    const items = templatesMap[name];
    const totalValue = items.reduce((sum, item) => sum + item.price, 0);
    const totalProfit = items.reduce((sum, item) => sum + item.profit, 0);
    const avgPrice = totalValue / items.length;
    const avgProfit = totalProfit / items.length;
    const minPrice = Math.min(...items.map(i => i.price));
    const maxPrice = Math.max(...items.map(i => i.price));
    const margin = (totalProfit / totalValue) * 100;
    
    return {
      id: name,
      type: name.startsWith('M') ? 'Merchant (M)' : 'Commission (C)',
      count: items.length,
      totalValue,
      totalProfit,
      avgPrice,
      avgProfit,
      minPrice,
      maxPrice,
      margin
    };
  });

  // Calculate overlap matrix dynamically
  const overlapMatrix = {};
  templateNames.forEach(t1 => {
    overlapMatrix[t1] = {};
    templateNames.forEach(t2 => {
      if (t1 === t2) {
        overlapMatrix[t1][t2] = { count: 40, percentage: 100 };
      } else {
        const items1 = templatesMap[t1];
        const items2 = templatesMap[t2];
        let identicalCount = 0;
        
        // Count how many items are identical in price and profit at the same index
        for (let idx = 0; idx < 40; idx++) {
          if (items1[idx] && items2[idx]) {
            if (items1[idx].price === items2[idx].price && items1[idx].profit === items2[idx].profit) {
              identicalCount++;
            }
          }
        }
        
        overlapMatrix[t1][t2] = {
          count: identicalCount,
          percentage: (identicalCount / 40) * 100
        };
      }
    });
  });

  const getOverlapStatusColor = (count) => {
    if (count === 0) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (count < 5) return 'text-blue-600 bg-blue-50 border-blue-100';
    if (count < 35) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  const selectedItems = templatesMap[selectedTemplate] || [];
  
  const filteredItems = selectedItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sr.toString() === searchQuery ||
    item.price.toString().includes(searchQuery) ||
    item.profit.toString().includes(searchQuery)
  );

  const displayStats = stats.filter(s => {
    if (filterType === 'all') return true;
    if (filterType === 'M') return s.id.startsWith('M');
    if (filterType === 'C') return s.id.startsWith('C');
    return true;
  });

  return (
    <div className="admin-page-container scale-up pb-12">
      {/* Header section with description */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Layers className="text-indigo-500 w-6 h-6" />
            Order Presets Matrix & Verification
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Analyze, compare, and verify the distinct uniqueness of all preset order lists (M-1 to M-5 and C-1 to C-5).
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setFilterType('all')} 
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${
              filterType === 'all' 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Presets
          </button>
          <button 
            onClick={() => setFilterType('M')} 
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${
              filterType === 'M' 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            M Presets (Merchant)
          </button>
          <button 
            onClick={() => setFilterType('C')} 
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${
              filterType === 'C' 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            C Presets (Commission)
          </button>
        </div>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="admin-card !mb-0 !p-5 flex items-center justify-between bg-white border border-slate-100 rounded-xl shadow-sm">
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Total Presets</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">10 Packs</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
            <Layers size={20} />
          </div>
        </div>

        <div className="admin-card !mb-0 !p-5 flex items-center justify-between bg-white border border-slate-100 rounded-xl shadow-sm">
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Uniqueness Standard</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">90.0% Perfect</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="admin-card !mb-0 !p-5 flex items-center justify-between bg-white border border-slate-100 rounded-xl shadow-sm">
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Overlap Checks</span>
            <span className="text-2xl font-extrabold text-amber-500 mt-1 block">45 Grid Pairs</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="admin-card !mb-0 !p-5 flex items-center justify-between bg-white border border-slate-100 rounded-xl shadow-sm">
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Items Per Pack</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">40 Items</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center">
            <FileText size={20} />
          </div>
        </div>
      </div>

      {/* Main Grid: Master Presets Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Table of Presets & Overlap Matrix */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Table of Presets */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Preset Metadata Directory</h3>
                <p className="text-xs text-slate-500">Summary stats and total yields across preset lists.</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-full border border-slate-200">
                Sorted alphabetically
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Template ID</th>
                    <th className="py-4 px-4">Type</th>
                    <th className="py-4 px-4 text-right">Total Price</th>
                    <th className="py-4 px-4 text-right">Total Commission</th>
                    <th className="py-4 px-4 text-center">Avg Margin</th>
                    <th className="py-4 px-4 text-center">Price Range</th>
                    <th className="py-4 px-6 text-center">Uniqueness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {displayStats.map((item) => {
                    const otherTemplates = templateNames.filter(col => col !== item.id);
                    const maxOverlap = otherTemplates.length > 0 
                      ? Math.max(...otherTemplates.map(col => overlapMatrix[item.id][col]?.count || 0)) 
                      : 0;
                    const maxOverlapCol = maxOverlap > 0 
                      ? otherTemplates.find(col => (overlapMatrix[item.id][col]?.count || 0) === maxOverlap) 
                      : '';
                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                          selectedTemplate === item.id ? 'bg-indigo-50/40 font-medium' : ''
                        }`}
                        onClick={() => setSelectedTemplate(item.id)}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                              item.id.startsWith('M') 
                                ? 'bg-indigo-100 text-indigo-700' 
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {item.id}
                            </div>
                            <span className="font-bold text-slate-700">{item.id}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-slate-500 text-xs bg-slate-100 py-1 px-2 rounded-md">
                            {item.id.startsWith('M') ? 'Merchant' : 'Commission'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-slate-800">
                          ${item.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-emerald-600">
                          ${item.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-semibold">
                            {item.margin.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center text-xs text-slate-400">
                          ${item.minPrice.toFixed(0)} - ${item.maxPrice.toFixed(0)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {maxOverlap > 0 ? (
                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs border font-medium ${
                              maxOverlap > 30 
                                ? 'bg-rose-50 text-rose-700 border-rose-100' 
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                              <AlertTriangle size={13} />
                              {maxOverlap}/40 Overlap with {maxOverlapCol}
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-xs border border-emerald-100 font-medium">
                              <CheckCircle2 size={13} />
                              100% Unique
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overlap & Duplication Matrix */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-500" size={20} />
                  Dynamic Cross-Template Overlap Matrix
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Displays the exact count of identical item configurations (matching price and profit at corresponding indexes) between any two templates.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full text-center border border-slate-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-3 px-2 bg-slate-100 font-bold text-slate-700 text-xs text-left">ID Pair</th>
                      {templateNames.map(name => (
                        <th key={name} className="py-3 px-2 font-bold text-slate-700 text-xs border-l border-slate-200">
                          {name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {templateNames.map(row => (
                      <tr key={row} className="hover:bg-slate-50/50">
                        <td className="py-3 px-2 font-bold text-slate-700 bg-slate-100 text-left border-r border-slate-200">
                          {row}
                        </td>
                        {templateNames.map(col => {
                          const val = overlapMatrix[row][col];
                          const isSelf = row === col;
                          
                          let displayVal = val.count.toString();
                          let cellClass = '';
                          
                          if (isSelf) {
                            displayVal = "—";
                            cellClass = 'bg-slate-100 text-slate-400 font-medium';
                          } else if (val.count === 0) {
                            displayVal = "0";
                            cellClass = 'bg-emerald-50 text-emerald-700 font-semibold';
                          } else if (val.count > 30) {
                            cellClass = 'bg-rose-100 text-rose-800 font-black animate-pulse';
                          } else {
                            cellClass = 'bg-amber-50 text-amber-800 font-semibold';
                          }
                          
                          return (
                            <td 
                              key={col} 
                              className={`py-3 px-2 border-l border-slate-200 text-center ${cellClass}`}
                              title={`${row} vs ${col}: ${val.count}/40 overlapping items`}
                            >
                              {displayVal}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-emerald-50 border border-emerald-100 inline-block"></span>
                <span>0 Items Overlap (100% Unique)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-amber-50 border border-amber-100 inline-block"></span>
                <span>Partial Overlap</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-rose-100 border border-rose-200 inline-block animate-pulse"></span>
                <span>High Overlap (Warning: Verify configs!)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right 1 Column: Active Preset Item Explorer */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-[740px]">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-1.5">
                <Eye className="text-indigo-500 w-5 h-5" />
                Preset Explorer
              </h3>
              <div className="text-xs bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full">
                {selectedTemplate} (40 items)
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Currently inspecting item definitions inside preset {selectedTemplate}.
            </p>
          </div>

          {/* Search box within template */}
          <div className="relative mb-4">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search size={14} />
            </span>
            <input 
              type="text" 
              placeholder="Search items by title or price..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Table list of items in active template */}
          <div className="flex-1 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No items match your search.
              </div>
            ) : (
              filteredItems.map((item, idx) => (
                <div key={`${selectedTemplate}-item-${idx}`} className="p-3 hover:bg-slate-50/50 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-slate-400 font-semibold w-5 text-right">{item.sr}</span>
                    <img 
                      src={item.image} 
                      alt="" 
                      className="w-8 h-8 rounded border border-slate-100 object-cover bg-slate-50 shrink-0"
                      onError={(e) => { e.target.src = 'https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-1.png'; }}
                    />
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-700 block truncate" title={item.title}>
                        {item.title}
                      </span>
                      <span className="text-slate-400 font-mono">Sr. {item.sr}</span>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-800 block">${item.price.toFixed(2)}</span>
                    <span className="text-emerald-600 block font-semibold">+${item.profit.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick specs card */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <h4 className="font-bold text-slate-700 text-xs mb-2">Preset Overview Metrics</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase">Sum Cost</span>
                <span className="font-bold text-slate-800">
                  ${(templatesMap[selectedTemplate]?.reduce((sum, i) => sum + i.price, 0) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase">Sum profit</span>
                <span className="font-bold text-emerald-600">
                  ${(templatesMap[selectedTemplate]?.reduce((sum, i) => sum + i.profit, 0) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
