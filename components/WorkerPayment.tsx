import React, { useState } from 'react';
import { Project, Worker, KharchiEntry, AdvanceEntry, WorkerPayment as WorkerPaymentType } from '../types';
import { HandCoins, Download, Building2, Save } from 'lucide-react';

interface WorkerPaymentProps {
  projects: Project[];
  workers: Worker[];
  kharchi: KharchiEntry[];
  advances: AdvanceEntry[];
  onSavePaymentRecord?: (records: WorkerPaymentType[]) => void;
}

const WorkerPayment: React.FC<WorkerPaymentProps> = ({ projects, workers, kharchi, advances, onSavePaymentRecord }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  
  // Temporary state for work amount inputs
  const [workAmounts, setWorkAmounts] = useState<Record<string, number>>({});
  const [messDeductions, setMessDeductions] = useState<Record<string, number>>({});

  const projectWorkers = workers.filter(w => w.projectId === selectedProjectId);
  const selectedProjectName = projects.find(p => p.id === selectedProjectId)?.name || '';

  // Helper to calculate auto deductions
  const getDeductions = (workerId: string) => {
    // Kharchi: Sum of amounts for this worker in the selected month
    const workerKharchi = kharchi.filter(k => k.workerId === workerId && k.date.startsWith(selectedMonth));
    const totalKharchi = workerKharchi.reduce((sum, k) => sum + k.amount, 0);

    // Advances: Sum of all advances for this worker for selected month
    const workerAdvances = advances.filter(a => a.workerId === workerId && a.date.startsWith(selectedMonth));
    const totalAdvance = workerAdvances.reduce((sum, a) => sum + a.amount, 0);

    return { totalKharchi, totalAdvance };
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleSave = () => {
      if (!onSavePaymentRecord) return;
      if (!selectedProjectId) {
          alert('Please select a project');
          return;
      }
      
      const paymentRecords: WorkerPaymentType[] = projectWorkers.map(worker => {
          const { totalKharchi, totalAdvance } = getDeductions(worker.id);
          const workVal = workAmounts[worker.id] || 0;
          const messVal = messDeductions[worker.id] || 0;
          const netPayable = workVal - messVal - totalKharchi - totalAdvance;

          return {
              id: `${worker.id}-${selectedMonth}`,
              serialNo: worker.serialNo,
              workerId: worker.id,
              projectId: selectedProjectId,
              month: selectedMonth,
              workAmount: workVal,
              messDeduction: messVal,
              kharchiDeduction: totalKharchi,
              advanceDeduction: totalAdvance,
              netPayable: netPayable,
              isPaid: true,
              date: new Date().toISOString()
          };
      });

      onSavePaymentRecord(paymentRecords);
      alert(`Saved ${paymentRecords.length} payment records for ${selectedMonth}`);
  };

  // Format date for print header (e.g. "Oct/2025")
  const getFormattedMonth = (isoMonth: string) => {
      if(!isoMonth) return '';
      const [year, month] = isoMonth.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return `${date.toLocaleString('default', { month: 'short' })}/${year}`;
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-payment, #printable-payment * {
            visibility: visible;
          }
          #printable-payment {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            padding: 20px;
          }
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      `}</style>

      {/* Screen View */}
      <div className="print:hidden space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">7. Worker Payment</h1>
            <p className="text-slate-500">Calculate final payable amount with automatic deductions.</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Project</label>
            <select 
              className="border p-2 rounded-lg w-full"
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
            >
              <option value="">-- Choose Project --</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Month</label>
            <input 
              type="month" 
              className="border p-2 rounded-lg w-full"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
             <button 
                onClick={handleExportPDF}
                disabled={!selectedProjectId}
                className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download size={18} /> Export PDF
              </button>
             <button 
                onClick={handleSave}
                disabled={!selectedProjectId}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              >
                <Save size={18} /> Save as Expense
              </button>
          </div>
        </div>

        {selectedProjectId && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3">SR</th>
                    <th className="px-4 py-3">ID / Name</th>
                    <th className="px-4 py-3 bg-green-50 w-32">Work Amount</th>
                    <th className="px-4 py-3 bg-red-50 text-red-700 w-28">Mess (-)</th>
                    <th className="px-4 py-3 bg-red-50 text-red-700 w-28">Kharchi (-)</th>
                    <th className="px-4 py-3 bg-red-50 text-red-700 w-28">Advance (-)</th>
                    <th className="px-4 py-3 bg-blue-50 text-blue-900 text-right font-bold">Net Payable</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {projectWorkers.map((worker) => {
                    const { totalKharchi, totalAdvance } = getDeductions(worker.id);
                    const workVal = workAmounts[worker.id] || 0;
                    const messVal = messDeductions[worker.id] || 0;
                    const netPayable = workVal - messVal - totalKharchi - totalAdvance;

                    return (
                      <tr key={worker.id}>
                        <td className="px-4 py-3 text-slate-500">{worker.serialNo}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{worker.name}</div>
                          <div className="text-xs text-slate-500 font-mono">{worker.workerId}</div>
                        </td>
                        <td className="px-4 py-3 bg-green-50/30">
                          <input 
                            type="number" 
                            className="w-full border rounded p-1 text-right"
                            placeholder="0"
                            value={workVal || ''}
                            onChange={(e) => setWorkAmounts({...workAmounts, [worker.id]: Number(e.target.value)})}
                          />
                        </td>
                        <td className="px-4 py-3 bg-red-50/30">
                          <input 
                            type="number" 
                            className="w-full border rounded p-1 text-right text-red-600"
                            placeholder="0"
                            value={messVal || ''}
                            onChange={(e) => setMessDeductions({...messDeductions, [worker.id]: Number(e.target.value)})}
                          />
                        </td>
                        <td className="px-4 py-3 bg-red-50/30 text-right text-red-600 font-medium">
                          {totalKharchi}
                        </td>
                        <td className="px-4 py-3 bg-red-50/30 text-right text-red-600 font-medium">
                          {totalAdvance}
                        </td>
                        <td className="px-4 py-3 bg-blue-50/30 text-right font-bold text-lg text-blue-800">
                          ₹{netPayable.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                  {projectWorkers.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-slate-500">No workers found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Print View (Hidden on Screen) */}
      <div id="printable-payment" className="hidden">
          <div className="flex flex-col items-center mb-6">
             <div className="flex items-center gap-3 mb-2">
               <div className="relative w-12 h-12 flex items-center justify-center bg-blue-600 rounded-xl overflow-hidden border border-black">
                  <Building2 className="text-white w-8 h-8 relative z-10" />
                  <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-orange-500 rounded-full"></div>
              </div>
               <h1 className="text-5xl font-['Oswald'] font-black text-black uppercase tracking-wide">SN ENTERPRISE</h1>
             </div>
             {/* Specific Red Header requested */}
             <div className="w-full text-center mb-0">
                <h2 className="text-lg font-bold text-red-600 border border-black border-b-0 py-1 bg-white">SN ENTERPRISE (PAYMENT SHEET)</h2>
                <h2 className="text-md font-bold text-black border border-black border-b-0 py-1 bg-white">Worker Payment Sheet</h2>
             </div>
          </div>

          <div className="flex border border-black border-b-0">
             <div className="flex-1 px-2 py-1 font-bold border-r border-black">Site- {selectedProjectName}</div>
             <div className="px-2 py-1 font-bold text-right min-w-[200px]">Month- {getFormattedMonth(selectedMonth)}</div>
          </div>

          <table className="w-full text-left border-collapse border border-black text-sm">
            <thead>
              <tr>
                <th className="border border-black px-2 py-2 text-center w-10">SR</th>
                <th className="border border-black px-2 py-2 text-center">Worker Name</th>
                <th className="border border-black px-2 py-2 text-center w-24">Total</th>
                <th className="border border-black px-2 py-2 text-center w-24">Kharchi</th>
                <th className="border border-black px-2 py-2 text-center w-24">Mess</th>
                <th className="border border-black px-2 py-2 text-center w-24">Advance</th>
                <th className="border border-black px-2 py-2 text-center w-28">Net Payment</th>
                <th className="border border-black px-2 py-2 text-center w-40">Signature</th>
              </tr>
            </thead>
            <tbody>
              {projectWorkers.map((worker) => {
                const { totalKharchi, totalAdvance } = getDeductions(worker.id);
                const workVal = workAmounts[worker.id] || 0;
                const messVal = messDeductions[worker.id] || 0;
                const netPayable = workVal - messVal - totalKharchi - totalAdvance;

                return (
                  <tr key={worker.id} className="h-12">
                    <td className="border border-black px-2 py-2 text-center">{worker.serialNo}</td>
                    <td className="border border-black px-2 py-2 text-center font-medium">{worker.name}</td>
                    <td className="border border-black px-2 py-2 text-center font-bold">
                       {workVal > 0 ? workVal.toLocaleString('en-IN') : ''}
                    </td>
                    <td className="border border-black px-2 py-2 text-center">
                       {totalKharchi > 0 ? totalKharchi.toLocaleString('en-IN') : ''}
                    </td>
                    <td className="border border-black px-2 py-2 text-center">
                       {messVal > 0 ? messVal.toLocaleString('en-IN') : ''}
                    </td>
                    <td className="border border-black px-2 py-2 text-center">
                       {totalAdvance > 0 ? totalAdvance.toLocaleString('en-IN') : ''}
                    </td>
                    <td className="border border-black px-2 py-2 text-center font-bold">
                       {netPayable.toLocaleString('en-IN')}
                    </td>
                    <td className="border border-black px-2 py-2"></td>
                  </tr>
                );
              })}
              {/* Empty Rows for spacing if needed */}
              {Array.from({ length: Math.max(0, 5 - projectWorkers.length) }).map((_, idx) => (
                  <tr key={`empty-${idx}`} className="h-12">
                      <td className="border border-black px-2 py-2"></td>
                      <td className="border border-black px-2 py-2"></td>
                      <td className="border border-black px-2 py-2"></td>
                      <td className="border border-black px-2 py-2"></td>
                      <td className="border border-black px-2 py-2"></td>
                      <td className="border border-black px-2 py-2"></td>
                      <td className="border border-black px-2 py-2"></td>
                      <td className="border border-black px-2 py-2"></td>
                  </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
};

export default WorkerPayment;