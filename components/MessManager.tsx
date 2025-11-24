import React, { useState } from 'react';
import { Project, MessEntry } from '../types';
import { Utensils, Plus, Pencil, Trash2, Download, Building2, Save } from 'lucide-react';

interface MessManagerProps {
  projects: Project[];
  messEntries: MessEntry[];
  onAddMess: (entry: MessEntry) => void;
  onEditMess: (entry: MessEntry) => void;
  onDeleteMess: (id: string) => void;
}

const MessManager: React.FC<MessManagerProps> = ({ projects, messEntries, onAddMess, onEditMess, onDeleteMess }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<MessEntry>>({
    projectId: '',
    weekStartDate: '',
    weekEndDate: '',
    workerCount: 0,
    rate: 0,
    amountPaid: 0,
    otherExpenses: 0,
    otherExpensesDesc: '',
    remarks: ''
  });

  const filteredEntries = messEntries.filter(e => 
    selectedProjectId === 'All' ? true : e.projectId === selectedProjectId
  );

  const handleEditClick = (entry: MessEntry) => {
    setEditingId(entry.id);
    setFormData({ ...entry });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: string) => {
      if(window.confirm('Delete this mess record?')) {
          onDeleteMess(id);
      }
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      projectId: selectedProjectId !== 'All' ? selectedProjectId : '',
      weekStartDate: '',
      weekEndDate: '',
      workerCount: 0,
      rate: 0,
      amountPaid: 0,
      otherExpenses: 0,
      otherExpensesDesc: '',
      remarks: ''
    });
  };

  // Helper to auto-calculate date + 6 days
  const handleStartDateChange = (date: string) => {
      const start = new Date(date);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      
      setFormData(prev => ({
          ...prev,
          weekStartDate: date,
          weekEndDate: end.toISOString().split('T')[0]
      }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.projectId && formData.weekStartDate && formData.rate) {
      const count = Number(formData.workerCount || 0);
      const rate = Number(formData.rate || 0);
      const paid = Number(formData.amountPaid || 0);
      const other = Number(formData.otherExpenses || 0);
      
      const totalAmount = count * rate;
      const balance = (totalAmount + other) - paid;

      if (editingId) {
        // Update
        const updatedEntry: MessEntry = {
            id: editingId,
            projectId: formData.projectId || '',
            weekStartDate: formData.weekStartDate || '',
            weekEndDate: formData.weekEndDate || '',
            workerCount: count,
            rate: rate,
            totalAmount: totalAmount,
            amountPaid: paid,
            otherExpenses: other,
            otherExpensesDesc: formData.otherExpensesDesc || '',
            balance: balance,
            remarks: formData.remarks || ''
        };
        onEditMess(updatedEntry);
      } else {
        // Create
        onAddMess({
            id: Date.now().toString(),
            projectId: formData.projectId || '',
            weekStartDate: formData.weekStartDate || '',
            weekEndDate: formData.weekEndDate || '',
            workerCount: count,
            rate: rate,
            totalAmount: totalAmount,
            amountPaid: paid,
            otherExpenses: other,
            otherExpensesDesc: formData.otherExpensesDesc || '',
            balance: balance,
            remarks: formData.remarks || ''
        });
      }
      resetForm();
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || 'Unknown';
  const formatDate = (date: string) => {
      if(!date) return '';
      const [y, m, d] = date.split('-');
      return `${d}-${m}-${y}`;
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-mess, #printable-mess * {
            visibility: visible;
          }
          #printable-mess {
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mess Management</h1>
            <p className="text-slate-500">Track weekly labor meal costs and cook payments.</p>
          </div>
          <div className="flex gap-2">
             <button 
                onClick={handleExportPDF}
                className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 flex items-center gap-2"
              >
                <Download size={18} /> Export PDF
              </button>
             <button 
                onClick={() => {
                  if(isFormOpen) resetForm();
                  else setIsFormOpen(true);
                }}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 flex items-center gap-2"
              >
                <Plus size={18} className={isFormOpen ? "rotate-45 transition-transform" : "transition-transform"} />
                {isFormOpen ? 'Cancel' : 'Add Weekly Bill'}
              </button>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-1">Filter by Project</label>
            <select 
                className="w-full md:w-1/3 border p-2 rounded-lg"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
            >
                <option value="All">All Projects</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
        </div>

        {/* Form */}
        {isFormOpen && (
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-top-2">
             <h3 className="font-semibold mb-4 border-b pb-2">{editingId ? 'Edit Mess Bill' : 'New Mess Bill'}</h3>
             <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Project</label>
                   <select 
                      className="w-full border p-2 rounded"
                      value={formData.projectId}
                      onChange={e => setFormData({...formData, projectId: e.target.value})}
                      required
                   >
                     <option value="">Select Project</option>
                     {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Week Start (Sunday)</label>
                   <input 
                      type="date" 
                      className="w-full border p-2 rounded"
                      value={formData.weekStartDate}
                      onChange={e => handleStartDateChange(e.target.value)}
                      required
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Week End (Saturday)</label>
                   <input 
                      type="date" 
                      className="w-full border p-2 rounded"
                      value={formData.weekEndDate}
                      onChange={e => setFormData({...formData, weekEndDate: e.target.value})}
                      required
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Total Labor/Diets</label>
                   <input 
                      type="number" 
                      className="w-full border p-2 rounded"
                      value={formData.workerCount}
                      onChange={e => setFormData({...formData, workerCount: Number(e.target.value)})}
                      required
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Rate per Head/Diet</label>
                   <input 
                      type="number" 
                      className="w-full border p-2 rounded"
                      value={formData.rate}
                      onChange={e => setFormData({...formData, rate: Number(e.target.value)})}
                      required
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Amount Paid to Cook</label>
                   <input 
                      type="number" 
                      className="w-full border p-2 rounded"
                      value={formData.amountPaid}
                      onChange={e => setFormData({...formData, amountPaid: Number(e.target.value)})}
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Other Costs (Amount)</label>
                   <input 
                      type="number" 
                      className="w-full border p-2 rounded"
                      value={formData.otherExpenses}
                      onChange={e => setFormData({...formData, otherExpenses: Number(e.target.value)})}
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Other Costs (Description)</label>
                   <input 
                      type="text" 
                      className="w-full border p-2 rounded"
                      placeholder="e.g. Extra Gas, Vegetables"
                      value={formData.otherExpensesDesc}
                      onChange={e => setFormData({...formData, otherExpensesDesc: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Remarks</label>
                   <input 
                      type="text" 
                      className="w-full border p-2 rounded"
                      value={formData.remarks}
                      onChange={e => setFormData({...formData, remarks: e.target.value})}
                   />
                </div>
                
                <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-4">
                    <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                    <button type="submit" className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 shadow-sm flex items-center gap-2">
                        <Save size={18} /> {editingId ? 'Update Record' : 'Save Record'}
                    </button>
                </div>
             </form>
           </div>
        )}

        {/* List View */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700 w-16">SR</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Week Range</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-center">Labor Count</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 w-64 text-center">Rate / Total</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 w-64 text-center">Balance / Paid</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredEntries.map((e, idx) => (
                            <tr key={e.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-slate-500 align-top pt-6">{idx + 1}</td>
                                <td className="px-6 py-4 align-top pt-6">
                                    <div className="font-bold text-slate-900">{getProjectName(e.projectId)}</div>
                                    <div className="text-slate-500">{formatDate(e.weekStartDate)} to {formatDate(e.weekEndDate)}</div>
                                    {e.remarks && <div className="text-xs text-slate-400 mt-1 italic">{e.remarks}</div>}
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-lg align-top pt-6">{e.workerCount}</td>
                                
                                {/* Complex Cell to match Screenshot Layout */}
                                <td className="px-6 py-2">
                                    <div className="border rounded-lg overflow-hidden text-sm">
                                        <div className="flex justify-between p-2 border-b bg-slate-50">
                                            <span className="text-slate-500">Rate:</span>
                                            <span className="font-medium">{e.rate.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between p-2 bg-white font-bold">
                                            <span>Total:</span>
                                            <span>{e.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                                        </div>
                                        {e.otherExpenses > 0 && (
                                            <div className="flex justify-between p-2 border-t bg-yellow-50 text-xs">
                                                <span>{e.otherExpensesDesc || 'Extras'}:</span>
                                                <span>{e.otherExpenses.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                </td>

                                <td className="px-6 py-2">
                                     <div className="border rounded-lg overflow-hidden text-sm">
                                        <div className="flex justify-between p-2 border-b bg-slate-50">
                                            <span className="text-slate-500">Paid:</span>
                                            <span className="font-medium">{e.amountPaid.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                                        </div>
                                        <div className="flex justify-between p-2 bg-green-100 font-bold text-green-900">
                                            <span>Balance:</span>
                                            <span>{e.balance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-right align-top pt-6">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEditClick(e)} className="text-slate-400 hover:text-blue-600"><Pencil size={16}/></button>
                                        <button onClick={() => handleDeleteClick(e.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
      </div>

      {/* Print View */}
      <div id="printable-mess" className="hidden">
         <div className="flex flex-col items-center mb-6">
             <div className="flex items-center gap-3 mb-2">
               <div className="relative w-12 h-12 flex items-center justify-center bg-blue-600 rounded-xl overflow-hidden border border-black">
                  <Building2 className="text-white w-8 h-8 relative z-10" />
                  <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-orange-500 rounded-full"></div>
              </div>
               <h1 className="text-5xl font-['Oswald'] font-black text-black uppercase tracking-wide">SN ENTERPRISE</h1>
             </div>
             <div className="h-0.5 bg-black w-full my-1"></div>
             <h2 className="text-lg font-bold">Mess/Labor Food Weekly Report</h2>
         </div>

         <table className="w-full text-left border-collapse border border-black text-sm">
             <thead>
                 <tr className="bg-gray-200">
                     <th className="border border-black px-2 py-2 text-center w-10">SR</th>
                     <th className="border border-black px-2 py-2 text-center w-32">Week Start</th>
                     <th className="border border-black px-2 py-2 text-center w-32">Week End</th>
                     <th className="border border-black px-2 py-2 text-center w-24">Worker Count</th>
                     <th className="border border-black px-2 py-2 text-center w-24">Rate</th>
                     <th className="border border-black px-2 py-2 text-center w-32">Total</th>
                     <th className="border border-black px-2 py-2 text-center">Remarks/Details</th>
                 </tr>
             </thead>
             <tbody>
                 {filteredEntries.map((e, idx) => (
                     <tr key={e.id}>
                         <td className="border border-black px-2 py-2 text-center align-top">{idx + 1}</td>
                         <td className="border border-black px-2 py-2 text-center align-top">{formatDate(e.weekStartDate)}</td>
                         <td className="border border-black px-2 py-2 text-center align-top">{formatDate(e.weekEndDate)}</td>
                         <td className="border border-black px-2 py-2 text-center align-top font-bold">{e.workerCount}</td>
                         
                         {/* Replicating the stacked look inside the table cells for print as well */}
                         <td className="border border-black p-0 align-top">
                             <div className="border-b border-black px-2 py-1 text-center">{e.rate.toFixed(2)}</div>
                         </td>

                         <td className="border border-black p-0 align-top">
                             <div className="border-b border-black px-2 py-1 text-right font-bold">{e.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                             <div className="border-b border-black px-2 py-1 text-right text-xs">Less Paid: {e.amountPaid.toLocaleString('en-IN')}</div>
                             {e.otherExpenses > 0 && (
                                <div className="border-b border-black px-2 py-1 text-right text-xs">{e.otherExpensesDesc}: {e.otherExpenses}</div>
                             )}
                             <div className="bg-green-200 px-2 py-1 text-right font-bold text-black">Bal: {e.balance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                         </td>

                         <td className="border border-black px-2 py-2 align-top text-xs">{e.remarks}</td>
                     </tr>
                 ))}
             </tbody>
         </table>
      </div>
    </div>
  );
};

export default MessManager;