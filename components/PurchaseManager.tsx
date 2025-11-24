import React, { useState } from 'react';
import { Project, PurchaseEntry } from '../types';
import { ShoppingCart, Plus, Pencil, Trash2, Download, Search, IndianRupee, Building2 } from 'lucide-react';

interface PurchaseManagerProps {
  projects: Project[];
  purchases: PurchaseEntry[];
  onAddPurchase: (purchase: PurchaseEntry) => void;
  onEditPurchase: (purchase: PurchaseEntry) => void;
  onDeletePurchase: (id: string) => void;
}

const PurchaseManager: React.FC<PurchaseManagerProps> = ({ projects, purchases, onAddPurchase, onEditPurchase, onDeletePurchase }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<PurchaseEntry>>({
    serialNo: 1,
    projectId: '',
    description: '',
    unit: '',
    quantity: 0,
    rate: 0,
    totalAmount: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const filteredPurchases = purchases.filter(p => 
    selectedProjectId === 'All' ? true : p.projectId === selectedProjectId
  );

  const totalValue = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

  const handleEditClick = (purchase: PurchaseEntry) => {
    setEditingId(purchase.id);
    setFormData({ ...purchase });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: string) => {
      if(window.confirm('Delete this purchase record?')) {
          onDeletePurchase(id);
      }
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      serialNo: purchases.length + 1,
      projectId: selectedProjectId !== 'All' ? selectedProjectId : '',
      description: '',
      unit: '',
      quantity: 0,
      rate: 0,
      totalAmount: 0,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const calculateTotal = (qty: number, rate: number) => {
      return qty * rate;
  };

  const handleInputChange = (field: keyof PurchaseEntry, value: any) => {
      const updatedForm = { ...formData, [field]: value };
      
      // Auto calculate total
      if (field === 'quantity' || field === 'rate') {
          const qty = field === 'quantity' ? Number(value) : (updatedForm.quantity || 0);
          const rate = field === 'rate' ? Number(value) : (updatedForm.rate || 0);
          updatedForm.totalAmount = calculateTotal(qty, rate);
      }

      setFormData(updatedForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.projectId && formData.description && formData.quantity && formData.rate) {
      if (editingId) {
        // Update
        const updatedPurchase: PurchaseEntry = {
            id: editingId,
            serialNo: Number(formData.serialNo),
            projectId: formData.projectId || '',
            description: formData.description || '',
            unit: formData.unit || '',
            quantity: Number(formData.quantity),
            rate: Number(formData.rate),
            totalAmount: Number(formData.totalAmount),
            date: formData.date || new Date().toISOString().split('T')[0]
        };
        onEditPurchase(updatedPurchase);
      } else {
        // Create
        onAddPurchase({
            id: Date.now().toString(),
            serialNo: Number(formData.serialNo),
            projectId: formData.projectId || '',
            description: formData.description || '',
            unit: formData.unit || '',
            quantity: Number(formData.quantity),
            rate: Number(formData.rate),
            totalAmount: Number(formData.totalAmount),
            date: formData.date || new Date().toISOString().split('T')[0]
        });
      }
      resetForm();
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || 'Unknown Project';

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-purchase, #printable-purchase * {
            visibility: visible;
          }
          #printable-purchase {
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
            <h1 className="text-2xl font-bold text-slate-900">Material Purchase</h1>
            <p className="text-slate-500">Record and track material procurement costs.</p>
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
                  else {
                      setIsFormOpen(true);
                      setFormData(prev => ({...prev, serialNo: purchases.length + 1}));
                  }
                }}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 flex items-center gap-2"
              >
                <Plus size={18} className={isFormOpen ? "rotate-45 transition-transform" : "transition-transform"} />
                {isFormOpen ? 'Cancel' : 'Add Purchase'}
              </button>
          </div>
        </div>

        {/* Filters & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Filter by Project</label>
                    <div className="relative">
                        <select 
                            className="w-full border p-2 pl-3 rounded-lg appearance-none bg-slate-50"
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                        >
                            <option value="All">All Projects</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                </div>
                <div className="flex-1">
                     {/* Placeholder for Date Filter if needed */}
                </div>
            </div>
            <div className="bg-orange-600 rounded-xl p-4 text-white shadow-lg shadow-orange-900/20">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg"><ShoppingCart size={20}/></div>
                    <span className="font-medium opacity-90">Total Purchase Value</span>
                </div>
                <div className="text-2xl font-bold">₹{totalValue.toLocaleString('en-IN')}</div>
            </div>
        </div>

        {/* Input Form */}
        {isFormOpen && (
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-top-2">
             <h3 className="font-semibold mb-4 text-slate-800 border-b pb-2">{editingId ? 'Edit Purchase Entry' : 'New Purchase Entry'}</h3>
             <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Project Name</label>
                   <select 
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" 
                      value={formData.projectId} 
                      onChange={e => handleInputChange('projectId', e.target.value)} 
                      required
                   >
                     <option value="">Select Project</option>
                     {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                   <input 
                      type="date" 
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" 
                      value={formData.date} 
                      onChange={e => handleInputChange('date', e.target.value)} 
                      required 
                    />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">SR No</label>
                   <input 
                      type="number" 
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" 
                      value={formData.serialNo} 
                      onChange={e => handleInputChange('serialNo', Number(e.target.value))} 
                      required 
                    />
                </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Material Description</label>
                   <input 
                      type="text" 
                      placeholder="e.g. Cement, Sand, Steel"
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" 
                      value={formData.description} 
                      onChange={e => handleInputChange('description', e.target.value)} 
                      required 
                    />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Unit</label>
                   <input 
                      type="text" 
                      placeholder="Bags, Kg, Brass"
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" 
                      value={formData.unit} 
                      onChange={e => handleInputChange('unit', e.target.value)} 
                      required 
                    />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Quantity</label>
                   <input 
                      type="number" 
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" 
                      value={formData.quantity} 
                      onChange={e => handleInputChange('quantity', e.target.value)} 
                      required 
                    />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Rate (₹)</label>
                   <input 
                      type="number" 
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" 
                      value={formData.rate} 
                      onChange={e => handleInputChange('rate', e.target.value)} 
                      required 
                    />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Total Amount (₹)</label>
                   <input 
                      type="number" 
                      className="w-full border p-2 rounded bg-slate-100 font-bold text-slate-700 cursor-not-allowed" 
                      value={formData.totalAmount} 
                      readOnly
                    />
                </div>
                <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-3 mt-2">
                   <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                   <button type="submit" className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 shadow-sm">
                     {editingId ? 'Update Purchase' : 'Save Entry'}
                   </button>
                </div>
             </form>
           </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">SR</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Material</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Project</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Unit</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Qty</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Rate</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Total</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredPurchases.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-slate-600">{p.date}</td>
                                <td className="px-6 py-4 text-slate-500">{p.serialNo}</td>
                                <td className="px-6 py-4 font-medium text-slate-900">{p.description}</td>
                                <td className="px-6 py-4 text-slate-600 text-xs">{getProjectName(p.projectId)}</td>
                                <td className="px-6 py-4 text-slate-600">{p.unit}</td>
                                <td className="px-6 py-4 text-right font-mono">{p.quantity}</td>
                                <td className="px-6 py-4 text-right font-mono text-slate-600">₹{p.rate.toLocaleString('en-IN')}</td>
                                <td className="px-6 py-4 text-right font-bold text-slate-900">₹{p.totalAmount.toLocaleString('en-IN')}</td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button onClick={() => handleEditClick(p)} className="text-slate-400 hover:text-blue-600"><Pencil size={16}/></button>
                                    <button onClick={() => handleDeleteClick(p.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                        {filteredPurchases.length === 0 && (
                            <tr><td colSpan={9} className="p-8 text-center text-slate-500">No purchase records found.</td></tr>
                        )}
                    </tbody>
                </table>
             </div>
        </div>
      </div>

      {/* Print View */}
      <div id="printable-purchase" className="hidden">
         <div className="flex flex-col items-center mb-6">
             <div className="flex items-center gap-3 mb-2">
               <div className="relative w-12 h-12 flex items-center justify-center bg-blue-600 rounded-xl overflow-hidden border border-black">
                  <Building2 className="text-white w-8 h-8 relative z-10" />
                  <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-orange-500 rounded-full"></div>
              </div>
               <h1 className="text-5xl font-['Oswald'] font-black text-black uppercase tracking-wide">SN ENTERPRISE</h1>
             </div>
             <div className="w-full bg-slate-300 h-px my-1"></div>
             <h2 className="text-xl font-bold text-black border-b-2 border-black pb-1">Purchase Register</h2>
          </div>

          <div className="mb-4 font-bold text-lg">
              Project: {selectedProjectId === 'All' ? 'All Projects' : getProjectName(selectedProjectId)}
          </div>

          <table className="w-full text-left border-collapse border border-black text-sm">
              <thead>
                  <tr className="bg-gray-200">
                      <th className="border border-black px-2 py-2 text-center w-12">SR</th>
                      <th className="border border-black px-2 py-2 text-center w-24">Date</th>
                      <th className="border border-black px-2 py-2 text-center">Description</th>
                      <th className="border border-black px-2 py-2 text-center w-20">Unit</th>
                      <th className="border border-black px-2 py-2 text-center w-20">Qty</th>
                      <th className="border border-black px-2 py-2 text-center w-24">Rate</th>
                      <th className="border border-black px-2 py-2 text-center w-32">Total</th>
                  </tr>
              </thead>
              <tbody>
                  {filteredPurchases.map((p, idx) => (
                      <tr key={p.id}>
                          <td className="border border-black px-2 py-2 text-center">{idx + 1}</td>
                          <td className="border border-black px-2 py-2 text-center">{p.date}</td>
                          <td className="border border-black px-2 py-2">{p.description}</td>
                          <td className="border border-black px-2 py-2 text-center">{p.unit}</td>
                          <td className="border border-black px-2 py-2 text-center">{p.quantity}</td>
                          <td className="border border-black px-2 py-2 text-right">{p.rate.toLocaleString('en-IN')}</td>
                          <td className="border border-black px-2 py-2 text-right font-bold">{p.totalAmount.toLocaleString('en-IN')}</td>
                      </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold">
                      <td colSpan={6} className="border border-black px-2 py-2 text-right">Grand Total</td>
                      <td className="border border-black px-2 py-2 text-right text-lg">₹{totalValue.toLocaleString('en-IN')}</td>
                  </tr>
              </tbody>
          </table>
      </div>
    </div>
  );
};

export default PurchaseManager;