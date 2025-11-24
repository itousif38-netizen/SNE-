import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Project, Bill, ClientPayment } from '../types';
import { FileText, DollarSign, Plus, IndianRupee, Pencil, Trash2, X, Save, Calendar, Percent, Filter } from 'lucide-react';

interface BillingManagerProps {
  projects: Project[];
  bills: Bill[];
  clientPayments?: ClientPayment[]; // Made optional for now to avoid breaking if not passed immediately, but logic assumes existence
  onAddBill: (b: Bill) => void;
  onEditBill: (b: Bill) => void;
  onDeleteBill: (id: string) => void;
  onAddPayment?: (p: ClientPayment) => void;
  onEditPayment?: (p: ClientPayment) => void;
  onDeletePayment?: (id: string) => void;
}

const BillingManager: React.FC<BillingManagerProps> = ({ 
  projects, 
  bills, 
  clientPayments = [], 
  onAddBill, 
  onEditBill, 
  onDeleteBill,
  onAddPayment,
  onEditPayment,
  onDeletePayment
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter State
  const [selectedBillMonth, setSelectedBillMonth] = useState<string>('');

  // State for Managing Client Payments
  const [managingProjectId, setManagingProjectId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState<Partial<ClientPayment>>({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    remarks: ''
  });
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Bill>>({
    serialNo: bills.length + 1,
    projectId: '',
    billNo: '',
    workNature: '',
    amount: 0,
    gstRate: 0,
    gstAmount: 0,
    grandTotal: 0,
    billingMonth: new Date().toISOString().slice(0, 7),
    certifyDate: new Date().toISOString().split('T')[0]
  });

  // Filter Logic
  const filteredBills = bills.filter(b => {
    if (!selectedBillMonth) return true;
    return b.billingMonth === selectedBillMonth;
  });

  // 3. Billing Management - Analytics
  const dataByMonth = bills.reduce((acc, bill) => {
    const month = bill.billingMonth;
    if (!acc[month]) acc[month] = 0;
    acc[month] += (bill.grandTotal || bill.amount); // Use Grand Total for charts
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(dataByMonth).sort().map(month => ({
    name: month,
    Amount: dataByMonth[month]
  }));

  // Create sorted monthly totals for the table view
  const monthlyTotals = Object.entries(dataByMonth)
    .map(([month, amount]) => ({ month, amount: Number(amount) }))
    .sort((a, b) => b.month.localeCompare(a.month)); // Descending order (newest first)

  // 4. Client Payment (Calculated View)
  const clientPaymentData = projects.map(p => {
    const projectBills = bills.filter(b => b.projectId === p.id);
    const totalBilled = projectBills.reduce((sum, b) => sum + (b.grandTotal || b.amount), 0);
    
    // Calculate actual received from payments list
    const projectPayments = clientPayments.filter(cp => cp.projectId === p.id);
    const received = projectPayments.reduce((sum, cp) => sum + cp.amount, 0);
    
    return {
      id: p.id,
      name: p.name,
      totalBilled,
      received,
      balance: totalBilled - received
    };
  });

  // Helper to format YYYY-MM to Month Year
  const formatMonthName = (yyyyMm: string) => {
      if (!yyyyMm) return '';
      const [year, month] = yyyyMm.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return `${date.toLocaleDateString('en-US', { month: 'long' })} ${year}`;
  };

  const getProjectName = (id: string) => {
    return projects.find(p => p.id === id)?.name || 'Unknown Project';
  };

  // --- Bill Handlers ---
  const handleEditClick = (bill: Bill) => {
    setEditingId(bill.id);
    setFormData({ ...bill });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: string) => {
      if(window.confirm('Delete this bill?')) {
          onDeleteBill(id);
      }
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      serialNo: bills.length + 1,
      projectId: '',
      billNo: '',
      workNature: '',
      amount: 0,
      gstRate: 0,
      gstAmount: 0,
      grandTotal: 0,
      billingMonth: new Date().toISOString().slice(0, 7),
      certifyDate: new Date().toISOString().split('T')[0]
    });
  };

  const calculateTotal = (amount: number, gstRate: number) => {
      const gst = (amount * gstRate) / 100;
      const total = amount + gst;
      return { gst, total };
  };

  const handleAmountChange = (val: number) => {
      const { gst, total } = calculateTotal(val, formData.gstRate || 0);
      setFormData({
          ...formData,
          amount: val,
          gstAmount: gst,
          grandTotal: total
      });
  };

  const handleGstChange = (val: number) => {
      const { gst, total } = calculateTotal(formData.amount || 0, val);
      setFormData({
          ...formData,
          gstRate: val,
          gstAmount: gst,
          grandTotal: total
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.projectId && formData.amount) {
      if (editingId) {
        const updatedBill: Bill = {
            id: editingId,
            serialNo: Number(formData.serialNo),
            projectId: formData.projectId || '',
            billNo: formData.billNo || '',
            workNature: formData.workNature || '',
            amount: Number(formData.amount),
            gstRate: Number(formData.gstRate || 0),
            gstAmount: Number(formData.gstAmount || 0),
            grandTotal: Number(formData.grandTotal || formData.amount),
            billingMonth: formData.billingMonth || '',
            certifyDate: formData.certifyDate || ''
        };
        onEditBill(updatedBill);
      } else {
        onAddBill({
          id: Date.now().toString(),
          serialNo: Number(formData.serialNo),
          projectId: formData.projectId || '',
          billNo: formData.billNo || '',
          workNature: formData.workNature || '',
          amount: Number(formData.amount),
          gstRate: Number(formData.gstRate || 0),
          gstAmount: Number(formData.gstAmount || 0),
          grandTotal: Number(formData.grandTotal || formData.amount),
          billingMonth: formData.billingMonth || '',
          certifyDate: formData.certifyDate || ''
        });
      }
      resetForm();
    }
  };

  // --- Payment Management Handlers ---
  const handleManagePayments = (projectId: string) => {
    setManagingProjectId(projectId);
    setPaymentForm({ amount: 0, date: new Date().toISOString().split('T')[0], remarks: '' });
    setEditingPaymentId(null);
  };

  const handleCloseManagePayments = () => {
    setManagingProjectId(null);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (managingProjectId && paymentForm.amount && onAddPayment && onEditPayment) {
        if (editingPaymentId) {
            onEditPayment({
                id: editingPaymentId,
                projectId: managingProjectId,
                amount: Number(paymentForm.amount),
                date: paymentForm.date || '',
                remarks: paymentForm.remarks || ''
            });
        } else {
            onAddPayment({
                id: Date.now().toString(),
                projectId: managingProjectId,
                amount: Number(paymentForm.amount),
                date: paymentForm.date || '',
                remarks: paymentForm.remarks || ''
            });
        }
        setPaymentForm({ amount: 0, date: new Date().toISOString().split('T')[0], remarks: '' });
        setEditingPaymentId(null);
    }
  };

  const handleEditPaymentRecord = (payment: ClientPayment) => {
      setPaymentForm({ ...payment });
      setEditingPaymentId(payment.id);
  };

  const handleDeletePaymentRecord = (id: string) => {
      if (onDeletePayment && window.confirm('Remove this payment record?')) {
          onDeletePayment(id);
      }
  };

  return (
    <div className="space-y-8">
      {/* 3. Billing Management */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <div>
             <h1 className="text-2xl font-bold text-slate-900">Billing & Payments</h1>
             <p className="text-slate-500">3. Billing Management & 4. Client Payment Tracking</p>
          </div>
          <button 
            onClick={() => {
                if(isFormOpen) resetForm();
                else setIsFormOpen(true);
            }}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 flex items-center gap-2"
          >
            <Plus size={18} className={isFormOpen ? "rotate-45" : ""} /> {isFormOpen ? 'Cancel' : 'Add Bill'}
          </button>
        </div>

        {isFormOpen && (
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 animate-in slide-in-from-top-2">
             <h3 className="font-semibold mb-4 text-slate-800 border-b pb-2">{editingId ? 'Edit Bill' : 'New Bill Entry'}</h3>
             <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="number" placeholder="SR No" className="border p-2 rounded" value={formData.serialNo} onChange={e => setFormData({...formData, serialNo: Number(e.target.value)})} />
                <select className="border p-2 rounded" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} required>
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="text" placeholder="Bill No" className="border p-2 rounded" value={formData.billNo} onChange={e => setFormData({...formData, billNo: e.target.value})} required />
                <input type="text" placeholder="Work Nature" className="border p-2 rounded" value={formData.workNature} onChange={e => setFormData({...formData, workNature: e.target.value})} required />
                
                <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Base Amount (₹)</label>
                        <input 
                            type="number" 
                            className="w-full border p-2 rounded" 
                            value={formData.amount} 
                            onChange={e => handleAmountChange(Number(e.target.value))} 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">GST (%)</label>
                        <input 
                            type="number" 
                            className="w-full border p-2 rounded" 
                            value={formData.gstRate} 
                            onChange={e => handleGstChange(Number(e.target.value))} 
                            placeholder="e.g. 18"
                        />
                    </div>
                    <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">Total Value (₹)</label>
                         <input 
                            type="number" 
                            className="w-full border p-2 rounded bg-white font-bold text-orange-600" 
                            value={formData.grandTotal} 
                            readOnly 
                         />
                         <div className="text-xs text-slate-400 mt-1">Includes ₹{(formData.gstAmount || 0).toFixed(2)} GST</div>
                    </div>
                </div>

                <input type="month" className="border p-2 rounded" value={formData.billingMonth} onChange={e => setFormData({...formData, billingMonth: e.target.value})} required />
                <input type="date" className="border p-2 rounded" value={formData.certifyDate} onChange={e => setFormData({...formData, certifyDate: e.target.value})} required />
                <div className="md:col-span-2">
                   <button type="submit" className="w-full bg-slate-900 text-white p-2 rounded hover:bg-slate-800">
                     {editingId ? 'Update Bill' : 'Save Bill'}
                   </button>
                </div>
             </form>
           </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
               {/* Analytics Chart */}
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-semibold mb-4">Billing Trend (Gross Total)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `₹${value/1000}k`}/>
                        <Tooltip formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']} />
                        <Bar dataKey="Amount" fill="#ea580c" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               {/* Monthly Summary Table */}
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Calendar size={18} className="text-orange-600" />
                      Monthly Total Billing Value
                  </h3>
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-orange-50 text-orange-900 border-b border-orange-100">
                              <tr>
                                  <th className="px-4 py-3 font-semibold">Month</th>
                                  <th className="px-4 py-3 font-semibold text-right">Total Billed (Inc. GST)</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {monthlyTotals.map((item, index) => (
                                  <tr key={item.month} className="hover:bg-slate-50">
                                      <td className="px-4 py-3 font-medium text-slate-700">{formatMonthName(item.month)}</td>
                                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                                          ₹{item.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                      </td>
                                  </tr>
                              ))}
                              {monthlyTotals.length === 0 && (
                                  <tr><td colSpan={2} className="px-4 py-4 text-center text-slate-500">No billing data available.</td></tr>
                              )}
                          </tbody>
                          <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                              <tr>
                                  <td className="px-4 py-3">Grand Total</td>
                                  <td className="px-4 py-3 text-right text-lg text-orange-600">
                                      ₹{monthlyTotals.reduce((sum, i) => sum + i.amount, 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                  </td>
                              </tr>
                          </tfoot>
                      </table>
                  </div>
               </div>
           </div>

           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-auto max-h-[800px]">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="font-semibold">Recent Individual Bills</h3>
                 <div className="flex flex-col items-end gap-1">
                     <label className="text-xs text-slate-500 font-medium">Filter Month</label>
                     <div className="flex items-center gap-1">
                         <input 
                            type="month" 
                            className="text-xs p-1 border rounded"
                            value={selectedBillMonth}
                            onChange={(e) => setSelectedBillMonth(e.target.value)}
                         />
                         {selectedBillMonth && (
                             <button onClick={() => setSelectedBillMonth('')} className="text-xs text-slate-400 hover:text-slate-800">
                                 <X size={14} />
                             </button>
                         )}
                     </div>
                 </div>
             </div>
             <table className="w-full text-sm text-left">
               <thead className="bg-slate-50">
                 <tr>
                   <th className="p-2">Bill No</th>
                   <th className="p-2">Project</th>
                   <th className="p-2">Work Nature</th>
                   <th className="p-2">Date</th>
                   <th className="p-2 text-right">Financials</th>
                   <th className="p-2"></th>
                 </tr>
               </thead>
               <tbody>
                 {filteredBills.slice().reverse().map(b => (
                   <tr key={b.id} className="border-t hover:bg-slate-50">
                     <td className="p-2 font-medium align-top">
                         {b.billNo}
                     </td>
                     <td className="p-2 text-slate-600 text-xs align-top">
                        {getProjectName(b.projectId)}
                     </td>
                     <td className="p-2 text-slate-600 text-xs truncate max-w-[100px] align-top" title={b.workNature}>
                        {b.workNature}
                     </td>
                     <td className="p-2 text-slate-500 align-top">{b.certifyDate}</td>
                     <td className="p-2 text-right min-w-[180px]">
                         <div className="flex justify-between items-center text-xs text-slate-500 mb-0.5">
                            <span>Base</span>
                            <span>₹{b.amount.toLocaleString('en-IN')}</span>
                         </div>
                         <div className="flex justify-between items-center text-xs text-purple-600 mb-0.5">
                            <span>GST ({b.gstRate}%)</span>
                            <span>₹{(b.gstAmount || 0).toLocaleString('en-IN')}</span>
                         </div>
                         <div className="flex justify-between items-center font-bold text-sm text-slate-900 border-t border-slate-200 mt-1 pt-1">
                            <span>Total</span>
                            <span>₹{(b.grandTotal || b.amount).toLocaleString('en-IN')}</span>
                         </div>
                     </td>
                     <td className="p-2 text-right flex gap-1 justify-end align-top">
                        <button onClick={() => handleEditClick(b)} className="text-slate-400 hover:text-blue-600">
                            <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDeleteClick(b.id)} className="text-slate-400 hover:text-red-600">
                            <Trash2 size={14} />
                        </button>
                     </td>
                   </tr>
                 ))}
                 {filteredBills.length === 0 && (
                     <tr><td colSpan={6} className="p-4 text-center text-slate-400">No bills found for the selected month.</td></tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>

      {/* 4. Client Payment Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">4. Client Payment Status</h2>
          <p className="text-slate-500 text-sm">Track actual payments received against billed amounts.</p>
        </div>
        
        {/* Payment Management Panel */}
        {managingProjectId && (
            <div className="bg-slate-50 border-b border-slate-200 p-6 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800">
                        Manage Payments: {projects.find(p => p.id === managingProjectId)?.name}
                    </h3>
                    <button onClick={handleCloseManagePayments} className="text-slate-500 hover:text-slate-800">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Form */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                        <h4 className="text-sm font-semibold mb-3">{editingPaymentId ? 'Edit Payment' : 'Add New Payment'}</h4>
                        <form onSubmit={handlePaymentSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                                <input 
                                    type="date" 
                                    className="w-full border p-2 rounded text-sm" 
                                    value={paymentForm.date} 
                                    onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Amount (₹)</label>
                                <input 
                                    type="number" 
                                    className="w-full border p-2 rounded text-sm" 
                                    value={paymentForm.amount} 
                                    onChange={e => setPaymentForm({...paymentForm, amount: Number(e.target.value)})} 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Remarks</label>
                                <input 
                                    type="text" 
                                    className="w-full border p-2 rounded text-sm" 
                                    placeholder="Check No, Transaction ID, etc."
                                    value={paymentForm.remarks} 
                                    onChange={e => setPaymentForm({...paymentForm, remarks: e.target.value})} 
                                />
                            </div>
                            <div className="pt-2 flex gap-2">
                                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700 flex justify-center items-center gap-2">
                                    <Save size={16} /> {editingPaymentId ? 'Update' : 'Save'}
                                </button>
                                {editingPaymentId && (
                                    <button 
                                        type="button" 
                                        onClick={() => { setEditingPaymentId(null); setPaymentForm({amount:0, date: '', remarks: ''})}}
                                        className="px-3 bg-slate-200 text-slate-600 rounded text-sm hover:bg-slate-300"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* History List */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 border-b">Payment History</div>
                        <div className="max-h-60 overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr>
                                        <th className="px-3 py-2 text-xs">Date</th>
                                        <th className="px-3 py-2 text-xs text-right">Amount</th>
                                        <th className="px-3 py-2 text-xs">Remarks</th>
                                        <th className="px-3 py-2 text-xs"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {clientPayments.filter(cp => cp.projectId === managingProjectId).map(cp => (
                                        <tr key={cp.id} className="hover:bg-slate-50">
                                            <td className="px-3 py-2 whitespace-nowrap">{cp.date}</td>
                                            <td className="px-3 py-2 text-right font-medium text-green-700">₹{cp.amount.toLocaleString('en-IN')}</td>
                                            <td className="px-3 py-2 text-slate-500 text-xs truncate max-w-[100px]">{cp.remarks}</td>
                                            <td className="px-3 py-2 text-right flex justify-end gap-1">
                                                <button onClick={() => handleEditPaymentRecord(cp)} className="text-blue-500 hover:text-blue-700"><Pencil size={12}/></button>
                                                <button onClick={() => handleDeletePaymentRecord(cp.id)} className="text-red-500 hover:text-red-700"><Trash2 size={12}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {clientPayments.filter(cp => cp.projectId === managingProjectId).length === 0 && (
                                        <tr><td colSpan={4} className="p-4 text-center text-slate-400 text-xs">No payments recorded yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Main Status Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Project Name</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Total Billed</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Amount Received</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Balance</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {clientPaymentData.map((p) => (
                <tr key={p.id} className={managingProjectId === p.id ? "bg-blue-50" : ""}>
                  <td className="px-6 py-4 font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-right">₹{p.totalBilled.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-right text-green-600 font-bold">₹{p.received.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-right text-red-600 font-bold">₹{p.balance.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${p.balance > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {p.balance > 0 ? 'Outstanding' : 'Paid'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                      <button 
                        onClick={() => handleManagePayments(p.id)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1 border border-blue-200 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                      >
                          <Pencil size={12} /> Manage
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingManager;