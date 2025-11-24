import React, { useState } from 'react';
import { Project, Worker, AdvanceEntry } from '../types';
import { Wallet, Plus, Pencil, Trash2, Download, Building2 } from 'lucide-react';

interface AdvanceTrackerProps {
  projects: Project[];
  workers: Worker[];
  advances: AdvanceEntry[];
  onAddAdvance: (entry: AdvanceEntry) => void;
  onEditAdvance: (entry: AdvanceEntry) => void;
  onDeleteAdvance: (id: string) => void;
}

const AdvanceTracker: React.FC<AdvanceTrackerProps> = ({ projects, workers, advances, onAddAdvance, onEditAdvance, onDeleteAdvance }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AdvanceEntry>>({
    workerId: '',
    amount: 0,
    paidBy: '',
    remarks: '',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'Cash'
  });

  const filteredAdvances = advances.filter(a => a.projectId === selectedProjectId);
  const projectWorkers = workers.filter(w => w.projectId === selectedProjectId);
  const selectedProjectName = projects.find(p => p.id === selectedProjectId)?.name || '';
  
  const totalProjectAdvance = filteredAdvances.reduce((sum, a) => sum + a.amount, 0);

  const handleEditClick = (adv: AdvanceEntry) => {
    setEditingId(adv.id);
    setFormData({ ...adv });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: string) => {
      if(window.confirm('Are you sure you want to delete this advance entry?')) {
          onDeleteAdvance(id);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.workerId && formData.amount) {
      if (editingId) {
        // Update existing
        const updated: AdvanceEntry = {
            id: editingId,
            serialNo: advances.find(a => a.id === editingId)?.serialNo || 0,
            workerId: formData.workerId,
            projectId: selectedProjectId,
            amount: Number(formData.amount),
            paidBy: formData.paidBy || 'Admin',
            remarks: formData.remarks || '',
            date: formData.date || new Date().toISOString().split('T')[0],
            paymentMode: formData.paymentMode || 'Cash'
        };
        onEditAdvance(updated);
      } else {
        // Add new
        onAddAdvance({
            id: Date.now().toString(),
            serialNo: advances.length + 1,
            workerId: formData.workerId,
            projectId: selectedProjectId,
            amount: Number(formData.amount),
            paidBy: formData.paidBy || 'Admin',
            remarks: formData.remarks || '',
            date: formData.date || new Date().toISOString().split('T')[0],
            paymentMode: formData.paymentMode || 'Cash'
        });
      }
      // Reset
      setEditingId(null);
      setFormData({ workerId: '', amount: 0, paidBy: '', remarks: '', date: new Date().toISOString().split('T')[0], paymentMode: 'Cash' });
    }
  };

  const handleCancel = () => {
      setEditingId(null);
      setFormData({ workerId: '', amount: 0, paidBy: '', remarks: '', date: new Date().toISOString().split('T')[0], paymentMode: 'Cash' });
  };

  const handleExportPDF = () => {
      window.print();
  };

  // Format date for print
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  return (
    <div className="space-y-6">
        <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-advance, #printable-advance * {
            visibility: visible;
          }
          #printable-advance {
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

      <div className="print:hidden space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">6. Advance Management</h1>
            <p className="text-slate-500">Record and track worker salary advances.</p>
        </div>

        {/* Project Selection & Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Project</label>
                <select 
                    className="border p-2 rounded-lg w-full md:w-1/3"
                    value={selectedProjectId}
                    onChange={e => setSelectedProjectId(e.target.value)}
                >
                    <option value="">-- Choose Project --</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>

            {selectedProjectId && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-sm font-semibold mb-3 bg-slate-100 p-2 rounded">{editingId ? 'Edit Entry' : 'New Advance Entry'}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Worker</label>
                            <select 
                                className="w-full border p-2 rounded"
                                value={formData.workerId}
                                onChange={e => setFormData({...formData, workerId: e.target.value})}
                                required
                            >
                                <option value="">Select Worker</option>
                                {projectWorkers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.workerId})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                            <input 
                                type="date" 
                                className="w-full border p-2 rounded" 
                                value={formData.date} 
                                onChange={e => setFormData({...formData, date: e.target.value})} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Amount (₹)</label>
                            <input 
                                type="number" 
                                className="w-full border p-2 rounded" 
                                value={formData.amount} 
                                onChange={e => setFormData({...formData, amount: Number(e.target.value)})} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Payment Mode</label>
                            <select 
                                className="w-full border p-2 rounded"
                                value={formData.paymentMode}
                                onChange={e => setFormData({...formData, paymentMode: e.target.value})} 
                            >
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Paid By</label>
                            <input 
                                type="text" 
                                className="w-full border p-2 rounded" 
                                value={formData.paidBy} 
                                onChange={e => setFormData({...formData, paidBy: e.target.value})} 
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Remarks (Description)</label>
                            <input 
                                type="text" 
                                className="w-full border p-2 rounded" 
                                value={formData.remarks} 
                                onChange={e => setFormData({...formData, remarks: e.target.value})} 
                                placeholder="Reason for advance"
                            />
                        </div>
                        <div className="md:col-span-1 flex items-end gap-2">
                            <button type="submit" className="flex-1 bg-slate-900 text-white py-2 rounded hover:bg-slate-800 flex items-center justify-center gap-2">
                                <Plus size={16} /> {editingId ? 'Update' : 'Add'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={handleCancel} className="px-3 py-2 bg-slate-200 rounded hover:bg-slate-300 text-slate-600">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}
        </div>

        {selectedProjectId && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <div className="font-semibold text-slate-700">Total Advances: <span className="text-red-600">₹{totalProjectAdvance.toLocaleString('en-IN')}</span></div>
                    <button 
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 text-sm bg-white border border-slate-300 px-3 py-1.5 rounded hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <Download size={16} /> Export PDF
                    </button>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-600">
                        <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Worker</th>
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3">Mode</th>
                            <th className="px-4 py-3">Paid By</th>
                            <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredAdvances.map(adv => {
                            const workerName = workers.find(w => w.id === adv.workerId)?.name || 'Unknown';
                            return (
                                <tr key={adv.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">{adv.date}</td>
                                    <td className="px-4 py-3 font-medium">{workerName}</td>
                                    <td className="px-4 py-3 text-slate-500">{adv.remarks}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-slate-900">₹{adv.amount.toLocaleString('en-IN')}</td>
                                    <td className="px-4 py-3">{adv.paymentMode}</td>
                                    <td className="px-4 py-3 text-slate-500">{adv.paidBy}</td>
                                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                                        <button onClick={() => handleEditClick(adv)} className="text-slate-400 hover:text-blue-600"><Pencil size={14}/></button>
                                        <button onClick={() => handleDeleteClick(adv.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={14}/></button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredAdvances.length === 0 && (
                            <tr><td colSpan={7} className="p-6 text-center text-slate-500">No advances recorded for this project.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* --- Printable Section (SN ENTERPRISE Layout) --- */}
      <div id="printable-advance" className="hidden">
        <div className="flex flex-col items-center mb-6">
           <div className="flex items-center gap-3 mb-2">
             <div className="relative w-12 h-12 flex items-center justify-center bg-blue-600 rounded-xl overflow-hidden border border-black">
                <Building2 className="text-white w-8 h-8 relative z-10" />
                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-orange-500 rounded-full"></div>
            </div>
             <h1 className="text-5xl font-['Oswald'] font-black text-black uppercase tracking-wide">SN ENTERPRISE</h1>
           </div>
           <div className="w-full bg-slate-300 h-px my-1"></div>
           <div className="bg-gray-200 w-full text-center py-1 border border-black font-bold text-lg">
                Project- {selectedProjectName}
           </div>
           <div className="bg-gray-200 w-full text-center py-1 border border-black border-t-0 font-bold text-lg">
                Worker Advance Sheet
           </div>
        </div>

        <table className="w-full text-sm text-left border-collapse border border-black">
            <thead>
                <tr className="bg-gray-300 text-black">
                    <th className="border border-black px-2 py-1 text-center w-12">S</th>
                    <th className="border border-black px-2 py-1 text-center w-24">Date</th>
                    <th className="border border-black px-2 py-1 text-center">Worker Name</th>
                    <th className="border border-black px-2 py-1 text-center">Description</th>
                    <th className="border border-black px-2 py-1 text-center w-24">Amount</th>
                    <th className="border border-black px-2 py-1 text-center w-24">Payment Mode</th>
                    <th className="border border-black px-2 py-1 text-center">Remarks</th>
                    <th className="border border-black px-2 py-1 text-center w-16">Deduct</th>
                </tr>
            </thead>
            <tbody>
                {filteredAdvances.map((adv, index) => {
                    const workerName = workers.find(w => w.id === adv.workerId)?.name || '';
                    return (
                        <tr key={adv.id}>
                            <td className="border border-black px-2 py-2 text-center">{index + 1}</td>
                            <td className="border border-black px-2 py-2 text-center">{formatDate(adv.date)}</td>
                            <td className="border border-black px-2 py-2 text-center">{workerName}</td>
                            <td className="border border-black px-2 py-2 text-center">{adv.remarks}</td>
                            <td className="border border-black px-2 py-2 text-center font-bold">{adv.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                            <td className="border border-black px-2 py-2 text-center">{adv.paymentMode}</td>
                            <td className="border border-black px-2 py-2 text-center">Paid by {adv.paidBy}</td>
                            <td className="border border-black px-2 py-2 text-center">Yes</td>
                        </tr>
                    );
                })}
                 {/* Filler rows to look like Excel sheet */}
                 {Array.from({ length: Math.max(0, 10 - filteredAdvances.length) }).map((_, idx) => (
                    <tr key={`empty-${idx}`}>
                        <td className="border border-black px-2 py-3"></td>
                        <td className="border border-black px-2 py-3"></td>
                        <td className="border border-black px-2 py-3"></td>
                        <td className="border border-black px-2 py-3"></td>
                        <td className="border border-black px-2 py-3"></td>
                        <td className="border border-black px-2 py-3"></td>
                        <td className="border border-black px-2 py-3"></td>
                        <td className="border border-black px-2 py-3"></td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdvanceTracker;