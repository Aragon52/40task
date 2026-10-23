import { useState, useEffect } from 'react';
import { 
  Layers, 
  Eye, 
  Search,
  X,
  Upload,
  Download,
  RefreshCcw,
  Link as LinkIcon,
  FileSpreadsheet,
  RefreshCw,
  Database
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../supabase';
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

export default function TemplatesSummary() {
  const [selectedTemplate, setSelectedTemplate] = useState('M-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showExplorer, setShowExplorer] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const isSynced = localStorage.getItem('cb_sheet_auto_synced_v5');
    if (!isSynced) {
      localStorage.removeItem('cb_template_overrides');
      localStorage.setItem('cb_sheet_auto_synced_v5', 'true');
    }
  }, []);

  const [templateOverrides, setTemplateOverrides] = useState<Record<string, any[]>>(() => {
    try {
      const saved = localStorage.getItem('cb_template_overrides');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const getActiveTemplate = (name: string) => {
    if (templateOverrides[name]) return templateOverrides[name];
    switch (name) {
      case 'M-1': return TEMPLATE_M_1;
      case 'M-2': return TEMPLATE_M_2;
      case 'M-3': return TEMPLATE_M_3;
      case 'M-4': return TEMPLATE_M_4;
      case 'M-5': return TEMPLATE_M_5;
      case 'C-1': return TEMPLATE_C_1;
      case 'C-2': return TEMPLATE_C_2;
      case 'C-3': return TEMPLATE_C_3;
      case 'C-4': return TEMPLATE_C_4;
      case 'C-5': return TEMPLATE_C_5;
      default: return TEMPLATE_M_1;
    }
  };

  const templatesMap: Record<string, any[]> = {
    'M-1': getActiveTemplate('M-1'),
    'M-2': getActiveTemplate('M-2'),
    'M-3': getActiveTemplate('M-3'),
    'M-4': getActiveTemplate('M-4'),
    'M-5': getActiveTemplate('M-5'),
    'C-1': getActiveTemplate('C-1'),
    'C-2': getActiveTemplate('C-2'),
    'C-3': getActiveTemplate('C-3'),
    'C-4': getActiveTemplate('C-4'),
    'C-5': getActiveTemplate('C-5')
  };

  const templateNames = Object.keys(templatesMap);

  const stats = templateNames.map(name => {
    const items = templatesMap[name];
    const totalValue = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const totalProfit = items.reduce((sum, item) => sum + Number(item.profit || 0), 0);
    const avgPrice = items.length ? totalValue / items.length : 0;
    const avgProfit = items.length ? totalProfit / items.length : 0;
    const minPrice = items.length ? Math.min(...items.map(i => Number(i.price || 0))) : 0;
    const maxPrice = items.length ? Math.max(...items.map(i => Number(i.price || 0))) : 0;
    const margin = totalValue > 0 ? (totalProfit / totalValue) * 100 : 0;
    
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

  const displayStats = stats.filter(s => {
    if (filterType === 'M') return s.id.startsWith('M');
    if (filterType === 'C') return s.id.startsWith('C');
    return true;
  });

  const currentTemplateItems = (templatesMap[selectedTemplate] || []).map((item, idx) => ({
    sr: idx + 1,
    title: item.title,
    image: item.image,
    price: item.price,
    profit: item.profit
  }));

  const filteredItems = currentTemplateItems.filter(i => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return i.title.toLowerCase().includes(q) || i.price.toString().includes(q);
  });

  const handleDownloadSample = () => {
    const csvContent = "Sr,Item Value,Profits,Different Amount\n1,498.06,1.1,501.1\n2,476.07,0.8,501.9\n3,500.1,1,502.9\n4,456.11,0.77,503.77";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_template_format.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Sample template format CSV downloaded successfully");
  };

  const handleResetTemplates = () => {
    localStorage.removeItem('cb_template_overrides');
    setTemplateOverrides({});
    toast.success("All order templates successfully reset to their original state!");
  };

  const handleSyncLiveGoogleSheet = async () => {
    setImporting(true);
    try {
      const gidMap: Record<string, string> = {
        'M-1': '101', 'C-1': '102', 'M-2': '103', 'C-2': '104',
        'M-3': '107', 'C-3': '108', 'M-4': '105', 'C-4': '106',
        'M-5': '109', 'C-5': '110'
      };

      const newOverrides: Record<string, any[]> = {};

      for (const [tName, gid] of Object.entries(gidMap)) {
        const rawUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vSWNcPIsqMZLmvAkDMuAAV0wACKnhqzce7exrAb4Fh_SPoWluXjm9iGJjTJkZ9FxI9850kQigp030Mr/pub?output=csv&gid=${gid}`;
        const res = await fetch(`/api/fetch-sheet?url=${encodeURIComponent(rawUrl)}`);
        if (!res.ok) continue;
        const text = await res.text();
        const lines = text.split('\n').slice(1);
        const baseItems = getActiveTemplate(tName);

        const parsedItems = lines.map((line, idx) => {
          const parts = line.split(',');
          if (parts.length < 3) return null;
          const price = parseFloat(parts[1]?.trim().replace('..', '.')) || 500;
          const profit = parseFloat(parts[2]?.trim().replace('..', '.')) || 1.0;
          const original = baseItems[idx] || {};
          return {
            sr: idx + 1,
            price,
            profit,
            title: original.title || `Item ${idx + 1}`,
            image: original.image || 'https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-1.png'
          };
        }).filter(Boolean);

        if (parsedItems.length > 0) {
          newOverrides[tName] = parsedItems;
        }
      }

      setTemplateOverrides(newOverrides);
      localStorage.setItem('cb_template_overrides', JSON.stringify(newOverrides));
      toast.success("Successfully synced live prices and profits from Google Sheet via secure server proxy!");
    } catch (err: any) {
      console.error("Live Google Sheet sync error:", err);
      toast.error("Failed to sync live Google Sheet due to network error. Using updated local templates.");
    } finally {
      setImporting(false);
    }
  };

  const handleSyncDatabaseTasks = async () => {
    setImporting(true);
    try {
      const { data: tasks, error } = await supabase.from('cb_assigned_tasks').select('*');
      if (error) throw error;
      if (!tasks || tasks.length === 0) {
        toast.success("No active assigned tasks found in database.");
        setImporting(false);
        return;
      }

      let updatedCount = 0;
      for (const task of tasks) {
        let ordersList = [];
        try {
          ordersList = typeof task.orders === 'string' ? JSON.parse(task.orders) : (task.orders || []);
        } catch (e) {
          continue;
        }

        const sumPrices = ordersList.reduce((acc: number, o: any) => acc + Number(o.price || 0), 0);
        let matchedTemplateName = null;
        for (const [tName, tItems] of Object.entries(templatesMap)) {
          const tSum = tItems.reduce((acc: number, i: any) => acc + Number(i.price || 0), 0);
          if (Math.abs(sumPrices - tSum) < 500) {
            matchedTemplateName = tName;
            break;
          }
        }

        if (matchedTemplateName && templatesMap[matchedTemplateName]) {
          const freshItems = templatesMap[matchedTemplateName];
          const updatedOrders = ordersList.map((ord: any, idx: number) => {
            const fresh = freshItems[idx] || freshItems[0];
            return {
              ...ord,
              price: fresh.price.toString(),
              profit: fresh.profit.toString(),
              title: fresh.title || ord.title,
              image: fresh.image || ord.image
            };
          });

          const newTotalAmount = updatedOrders.reduce((acc: number, o: any) => acc + Number(o.price || 0), 0);

          await supabase.from('cb_assigned_tasks').update({
            orders: JSON.stringify(updatedOrders),
            total_amount: newTotalAmount
          }).eq('id', task.id);

          updatedCount++;
        }
      }

      toast.success(`Successfully synced ${updatedCount} active database task records to latest sheet prices!`);
    } catch (err: any) {
      console.error("Database task sync error:", err);
      toast.error(`Failed to sync database tasks: ${err.message || 'Unknown error'}`);
    } finally {
      setImporting(false);
    }
  };

  const handleImportSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetUrl.trim()) {
      toast.error("Please enter a valid Google Sheet link or CSV URL");
      return;
    }
    setImporting(true);
    try {
      let targetUrl = sheetUrl.trim();
      if (targetUrl.includes('/edit') || targetUrl.includes('/view')) {
        targetUrl = targetUrl.replace(/\/edit.*$/, '/pub?output=csv').replace(/\/view.*$/, '/pub?output=csv');
      }
      if (!targetUrl.includes('output=csv')) {
        targetUrl += (targetUrl.includes('?') ? '&' : '?') + 'output=csv';
      }

      const res = await fetch(`/api/fetch-sheet?url=${encodeURIComponent(targetUrl)}`);
      if (!res.ok) throw new Error("Failed to fetch CSV through server proxy");
      const text = await res.text();
      const lines = text.split('\n');
      const readerLines = lines.map(l => l.split(','));
      
      const baseItems = getActiveTemplate(selectedTemplate);
      const parsedItems = readerLines.slice(1).map((parts, idx) => {
        if (parts.length < 3) return null;
        const price = parseFloat(parts[1]?.trim().replace('..', '.')) || 500;
        const profit = parseFloat(parts[2]?.trim().replace('..', '.')) || 1.0;
        const original = baseItems[idx] || {};
        return {
          sr: idx + 1,
          price,
          profit,
          title: original.title || `Item ${idx + 1} (${selectedTemplate})`,
          image: original.image || 'https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-1.png'
        };
      }).filter(Boolean);

      if (parsedItems.length > 0) {
        const updated = { ...templateOverrides, [selectedTemplate]: parsedItems };
        setTemplateOverrides(updated);
        localStorage.setItem('cb_template_overrides', JSON.stringify(updated));
        toast.success(`Successfully imported ${parsedItems.length} items from sheet into Template ${selectedTemplate}!`);
        setSheetUrl('');
      } else {
        toast.error("No valid items parsed from sheet URL. Check format (Sr, Item Value, Profits).");
      }
    } catch (err: any) {
      console.error("Sheet import error:", err);
      toast.error(`Failed to import sheet: ${err.message || 'Network error'}`);
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').slice(1);
        const newItems = lines.map((line, idx) => {
          const parts = line.split(',');
          return {
            sr: idx + 1,
            price: parseFloat(parts[1]) || 500,
            profit: parseFloat(parts[2]) || 1.0,
            title: `Imported Item ${idx + 1} (${selectedTemplate})`,
            image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-1.png"
          };
        }).filter(i => !isNaN(i.price));

        if (newItems.length > 0) {
          const updated = { ...templateOverrides, [selectedTemplate]: newItems };
          setTemplateOverrides(updated);
          localStorage.setItem('cb_template_overrides', JSON.stringify(updated));
          toast.success(`Successfully imported ${newItems.length} items into Template ${selectedTemplate}!`);
        } else {
          toast.error("No valid items parsed from file. Please follow sample CSV format.");
        }
      } catch (err) {
        toast.error("Error parsing uploaded file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="admin-page-container space-y-6">
      {/* Header and Controls */}
      <div className="admin-card">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-50 text-xl tracking-tight flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-indigo-500" />
              <span>Presets Matrix & Verification</span>
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Verify order template yields, price bounds, live Google Sheet sync via proxy, or DB task updates.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSyncLiveGoogleSheet}
              disabled={importing}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <RefreshCw size={16} className={importing ? 'animate-spin' : ''} />
              <span>{importing ? 'Syncing...' : 'Sync All Google Sheets'}</span>
            </button>

            <button
              onClick={handleSyncDatabaseTasks}
              disabled={importing}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Database size={16} />
              <span>Sync Active DB Tasks</span>
            </button>

            <button
              onClick={handleResetTemplates}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer border border-rose-200 dark:border-rose-900/50"
            >
              <RefreshCcw size={16} />
              <span>Reset State</span>
            </button>

            <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button 
                className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                  showExplorer 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm border border-slate-200 dark:border-slate-700' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
                onClick={() => setShowExplorer(!showExplorer)}
              >
                <Eye size={16} />
                {showExplorer ? 'Hide Explorer' : 'Show Explorer'}
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>
              <button 
                className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  filterType === 'all' 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm border border-slate-200 dark:border-slate-700 font-bold' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
                onClick={() => setFilterType('all')}
              >
                All
              </button>
              <button 
                className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  filterType === 'M' 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm border border-slate-200 dark:border-slate-700 font-bold' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
                onClick={() => setFilterType('M')}
              >
                Merchant
              </button>
              <button 
                className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  filterType === 'C' 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm border border-slate-200 dark:border-slate-700 font-bold' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
                onClick={() => setFilterType('C')}
              >
                Commission
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spreadsheet Import & Sample Card */}
      <div className="admin-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
              <span>Import Single Sheet URL into Selected Template ({selectedTemplate})</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Paste your single-sheet published CSV link (e.g. <span className="font-mono text-indigo-600">.../pub?output=csv</span>) to instantly update Template <span className="font-bold text-indigo-600">{selectedTemplate}</span>.
            </p>
          </div>

          <button
            onClick={handleDownloadSample}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer border border-indigo-200 dark:border-indigo-900/40 shrink-0"
          >
            <Download size={14} />
            <span>Download Sample CSV Format</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Google Sheet Link Input */}
          <form onSubmit={handleImportSheet} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Single Sheet CSV Link for {selectedTemplate}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>
              <button
                type="submit"
                disabled={importing}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
              >
                {importing ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                <span>{importing ? 'Importing...' : 'Import to ' + selectedTemplate}</span>
              </button>
            </div>
          </form>

          {/* Local File Upload (.csv / .xlsx) */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Upload .CSV / .XLSX File for {selectedTemplate}
            </label>
            <div className="relative flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-indigo-500 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Upload size={16} className="text-indigo-500" />
                <span>Choose CSV file or drag & drop</span>
              </div>
              <input
                type="file"
                accept=".csv, .xlsx"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg">
                Browse
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Presets Table */}
        <div className={`${showExplorer ? '2xl:col-span-7' : '2xl:col-span-12'} space-y-6 min-w-0`}>
          <div className="admin-card !p-0 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Preset Directory & Yields</h3>
            </div>

            <div className="table-responsive-wrapper border-none rounded-none">
              <table className="admin-table min-w-[720px]">
                <thead>
                  <tr>
                    <th>Template ID</th>
                    <th>Type</th>
                    <th className="text-right">Total Price</th>
                    <th className="text-right">Total Profit</th>
                    <th className="text-center">Avg Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {displayStats.map((item) => {
                    const isSelected = selectedTemplate === item.id;
                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition-colors cursor-pointer ${
                          isSelected && showExplorer ? 'bg-indigo-50/50 dark:bg-indigo-950/30 font-bold' : ''
                        }`}
                        onClick={() => {
                          setSelectedTemplate(item.id);
                          if (!showExplorer) setShowExplorer(true);
                        }}
                      >
                        <td>
                          <div className="flex items-center gap-2.5">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                              item.id.startsWith('M') 
                                ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400' 
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            }`}>
                              {item.id}
                            </span>
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{item.id}</span>
                          </div>
                        </td>
                        <td className="text-sm text-slate-500">{item.type}</td>
                        <td className="text-right font-mono text-sm font-bold text-slate-900 dark:text-white">${item.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="text-right font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">+${item.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="text-center font-mono text-sm font-semibold text-indigo-600 dark:text-indigo-400">{item.margin.toFixed(2)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Preset Item Explorer */}
        {showExplorer && (
          <div className="2xl:col-span-5 admin-card space-y-4 min-w-0">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-500" />
                <span>Preset Explorer ({selectedTemplate})</span>
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowExplorer(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-400 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4 pointer-events-none" />
              <input 
                type="text" 
                placeholder="Search items by title or price..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 text-sm focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
              />
            </div>

            <div className="min-h-[320px] max-h-[min(70dvh,720px)] overflow-y-auto space-y-2 pr-1 border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950/50">
              {filteredItems.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  No items match your search filter.
                </div>
              ) : (
                filteredItems.map((item, idx) => (
                  <div key={`${selectedTemplate}-item-${idx}`} className="p-3 sm:p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-slate-400 text-xs font-semibold w-5 shrink-0">{item.sr}</span>
                      <img 
                        src={item.image} 
                        alt="" 
                        className="w-10 h-10 rounded border border-slate-200 dark:border-slate-800 object-cover bg-slate-50 shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-1.png'; }}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 block whitespace-normal break-words leading-snug" title={item.title}>
                          {item.title}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100 block">${item.price.toFixed(2)}</span>
                      <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 block font-semibold">+${item.profit.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
