import React, { useState, useEffect } from 'react';
import { Project, Worker, KharchiEntry } from '../types';
import { Coins, Save, IndianRupee, PieChart, Download, Building2 } from 'lucide-react';

interface KharchiTrackerProps {
  projects: Project[];
  workers: Worker[];
  kharchi: KharchiEntry[];
  onUpdateKharchi: (entries: KharchiEntry[]) => void;
}

const KharchiTracker: React.FC<KharchiTrackerProps> = ({ projects, workers, kharchi, onUpdateKharchi }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [sundays, setSundays] = useState<string[]>([]);
  
  // Local state to handle input changes before saving
  const [inputValues, setInputValues] = useState<Record<string, number>>({});

  useEffect(() => {
    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      const sundaysList = [];
      while (date.getMonth() === month - 1) {
        if (date.getDay() === 0) { // 0 is Sunday
          sundaysList.push(date.toISOString().split('T')[0]);
        }
        date.setDate(date.getDate() + 1);
      }
      setSundays(sundaysList);
    }
  }, [selectedMonth]);

  useEffect(() => {
    // Initialize inputs with existing data
    const values: Record<string, number> = {};
    kharchi.forEach(k => {
      values[`${k.workerId}-${k.date}`] = k.amount;
    });
    setInputValues(values);
  }, [kharchi]);

  const projectWorkers = workers.filter(w => w.projectId === selectedProjectId);
  const selectedProjectName = projects.find(p => p.id === selectedProjectId)?.name || '';

  const handleInputChange = (workerId: string, date: string, amount: string) => {
    setInputValues(prev => ({
      ...prev,
      [`${workerId}-${date}`]: Number(amount)
    }));
  };

  const handleSave = () => {
    const newEntries: KharchiEntry[] = [];
    Object.entries(inputValues).forEach(([key, val]) => {
      const amount = Number(val);
      const [workerId, date] = key.split('-');
      if (amount > 0) {
        newEntries.push({
          id: key, 
          workerId,
          projectId: selectedProjectId,
          date,
          amount
        });
      }
    });
    
    onUpdateKharchi(newEntries);
    alert("Kharchi records updated!");
  };

  const handleExportPDF = () => {
    window.print();
  };

  // Calculations for summaries
  const siteSummaries = projects.map(p => {
    const total = kharchi
      .filter(k => k.projectId === p.id && k.date.startsWith(selectedMonth))
      .reduce((sum, k) => sum + k.amount, 0);
    return { id: p.id, name: p.name, total };
  });

  const totalAllSites = siteSummaries.reduce((sum, item) => sum + item.total, 0);

  // Table totals (Live)
  const getWorkerTotal = (workerId: string) => {
      return sundays.reduce((sum, sunday) => sum + (inputValues[`${workerId}-${sunday}`] || 0), 0);
  };

  const getSundayTotal = (sunday: string) => {
      return projectWorkers.reduce((sum, w) => sum + (inputValues[`${w.id}-${sunday}`] || 0), 0);
  };

  const getTableGrandTotal = () => {
      return projectWorkers.reduce((sum, w) => sum + getWorkerTotal(w.id), 0);
  };

  // Format date for print header (e.g. "October/25")
  const getFormattedMonth = (isoMonth: string) => {
      if(!isoMonth) return '';
      const [year, month] = isoMonth.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return `${date.toLocaleString('default', { month: 'long' })}/${year.slice(2)}`;
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            padding: 20px;
          }
          /* Ensure backgrounds print */
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      `}</style>

      {/* --- Screen Only View --- */}
      <div className="print:hidden space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">5. Kharchi (Pocket Money)</h1>
          <p className="text-slate-500">Track weekly Sunday payments to workers.</p>
        </div>

        {/* Monthly Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="bg-orange-600 rounded-xl p-4 text-white shadow-lg shadow-orange-900/20">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg"><IndianRupee size={20}/></div>
                    <span className="font-medium opacity-90">Total Month Kharchi</span>
                </div>
                <div className="text-2xl font-bold">₹{totalAllSites.toLocaleString('en-IN')}</div>
                <div className="text-xs mt-1 opacity-75">All sites combined</div>
            </div>
            
            <div className="lg:col-span-3 bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col justify-center">
                <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                    <PieChart size={16} /> Site-wise Breakdown ({selectedMonth})
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {siteSummaries.map(site => (
                        <div key={site.id} className="min-w-[140px] p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="text-xs text-slate-500 truncate mb-1" title={site.name}>{site.name}</div>
                            <div className="font-bold text-slate-900">₹{site.total.toLocaleString('en-IN')}</div>
                        </div>
                    ))}
                     {siteSummaries.length === 0 && <span className="text-sm text-slate-400">No projects available.</span>}
                </div>
            </div>
        </div>

        {/* Selection Header */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Project to Edit</label>
            <select 
              className="border p-2 rounded-lg min-w-[200px]"
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
            >
              <option value="">-- Choose Project --</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Month</label>
            <input 
              type="month" 
              className="border p-2 rounded-lg"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>

        {/* Matrix Table */}
        {selectedProjectId && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 border-r">SR No</th>
                    <th className="px-4 py-3 border-r">ID No</th>
                    <th className="px-4 py-3 border-r min-w-[150px]">Name</th>
                    {sundays.map(sunday => (
                      <th key={sunday} className="px-4 py-3 text-center border-r bg-orange-50 min-w-[100px]">
                        Sun<br/>
                        <span className="text-xs font-normal">{sunday.split('-')[2]}</span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right bg-slate-100">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {projectWorkers.map((worker) => {
                    const workerTotal = getWorkerTotal(worker.id);
                    return (
                      <tr key={worker.id}>
                        <td className="px-4 py-2 border-r text-slate-500">{worker.serialNo}</td>
                        <td className="px-4 py-2 border-r font-mono text-xs">{worker.workerId}</td>
                        <td className="px-4 py-2 border-r font-medium">{worker.name}</td>
                        {sundays.map(sunday => {
                          const key = `${worker.id}-${sunday}`;
                          const val = inputValues[key] || 0;
                          return (
                            <td key={sunday} className="p-0 border-r text-center">
                              <input 
                                type="number"
                                className="w-full h-full py-2 text-center focus:bg-blue-50 focus:outline-none"
                                placeholder="-"
                                value={val || ''}
                                onChange={(e) => handleInputChange(worker.id, sunday, e.target.value)}
                              />
                            </td>
                          );
                        })}
                        <td className="px-4 py-2 text-right font-bold text-slate-900 bg-slate-50">
                          ₹{workerTotal}
                        </td>
                      </tr>
                    );
                  })}
                  {projectWorkers.length === 0 && (
                    <tr><td colSpan={sundays.length + 4} className="p-8 text-center text-slate-500">No workers found for this project.</td></tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t border-slate-300">
                    <tr>
                        <td colSpan={3} className="px-4 py-3 text-right text-slate-700">Daily Total</td>
                        {sundays.map(sunday => (
                            <td key={sunday} className="px-2 py-3 text-center text-slate-800 border-r border-slate-300">
                                ₹{getSundayTotal(sunday).toLocaleString('en-IN')}
                            </td>
                        ))}
                        <td className="px-4 py-3 text-right text-orange-700 text-lg">
                            ₹{getTableGrandTotal().toLocaleString('en-IN')}
                        </td>
                    </tr>
                </tfoot>
              </table>
            </div>
            {projectWorkers.length > 0 && (
              <div className="p-4 border-t flex justify-end gap-3 bg-slate-50">
                 <button 
                  onClick={handleExportPDF}
                  className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-50 flex items-center gap-2 shadow-sm"
                >
                  <Download size={18} /> Export PDF
                </button>
                <button 
                  onClick={handleSave}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 flex items-center gap-2 shadow-sm"
                >
                  <Save size={18} /> Save Records
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- Print Only View (Hidden on Screen) --- */}
      <div id="printable-area" className="hidden">
        <div className="flex flex-col items-center mb-4">
           <div className="flex items-center gap-3 mb-2">
             <div className="relative w-12 h-12 flex items-center justify-center bg-blue-600 rounded-xl overflow-hidden border border-black">
                <Building2 className="text-white w-8 h-8 relative z-10" />
                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-orange-500 rounded-full"></div>
            </div>
             <h1 className="text-5xl font-['Oswald'] font-black text-black uppercase tracking-wide">SN ENTERPRISE</h1>
           </div>
           <div className="border-b-2 border-black w-full my-1"></div>
           <h2 className="text-xl font-medium text-black">Weekly Kharchi Summary</h2>
        </div>

        {selectedProjectId && (
          <div className="flex justify-between items-center mb-4 border-b border-black pb-2">
             <div className="text-lg font-semibold">Site- {selectedProjectName}</div>
             <div className="text-lg font-semibold">Month-{getFormattedMonth(selectedMonth)}</div>
          </div>
        )}

        <table className="w-full text-left border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black px-2 py-2 text-center w-12">Sr</th>
              <th className="border border-black px-2 py-2 text-center">Worker Name</th>
              {sundays.map(sunday => {
                  const [y, m, d] = sunday.split('-');
                  return <th key={sunday} className="border border-black px-2 py-2 text-center">{d}-{m}-{y}</th>
              })}
              <th className="border border-black px-2 py-2 text-center w-24">Total</th>
              <th className="border border-black px-2 py-2 text-center w-32">Signature</th>
            </tr>
          </thead>
          <tbody>
             {projectWorkers.map((worker) => {
                 const workerTotal = getWorkerTotal(worker.id);
                 return (
                     <tr key={worker.id}>
                         <td className="border border-black px-2 py-3 text-center">{worker.serialNo}</td>
                         <td className="border border-black px-2 py-3 text-center font-medium">{worker.name}</td>
                         {sundays.map(sunday => {
                             const key = `${worker.id}-${sunday}`;
                             const val = inputValues[key];
                             return (
                                 <td key={sunday} className="border border-black px-2 py-3 text-center">
                                     {val ? val.toLocaleString('en-IN', {minimumFractionDigits: 2}) : ''}
                                 </td>
                             )
                         })}
                         <td className="border border-black px-2 py-3 text-center font-bold">
                             {workerTotal > 0 ? workerTotal.toLocaleString('en-IN', {minimumFractionDigits: 2}) : '0.00'}
                         </td>
                         <td className="border border-black px-2 py-3"></td>
                     </tr>
                 )
             })}
             {/* Empty rows to fill space if needed, or total row */}
              <tr className="font-bold">
                  <td colSpan={2} className="border border-black px-2 py-3 text-right">Grand Total</td>
                   {sundays.map(sunday => (
                        <td key={sunday} className="border border-black px-2 py-3 text-center">
                             {getSundayTotal(sunday) > 0 ? getSundayTotal(sunday).toLocaleString('en-IN', {minimumFractionDigits: 2}) : ''}
                        </td>
                   ))}
                   <td className="border border-black px-2 py-3 text-center">
                       {getTableGrandTotal().toLocaleString('en-IN', {minimumFractionDigits: 2})}
                   </td>
                   <td className="border border-black px-2 py-3"></td>
              </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KharchiTracker;