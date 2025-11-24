
import React, { useState } from 'react';
import { Project, PurchaseEntry, KharchiEntry, AdvanceEntry, ClientPayment, WorkerPayment, MessEntry, Bill } from '../types';
import { TrendingUp, TrendingDown, PieChart, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ExpenseManagerProps {
  projects: Project[];
  purchases: PurchaseEntry[];
  kharchi: KharchiEntry[];
  advances: AdvanceEntry[];
  clientPayments: ClientPayment[];
  workerPayments: WorkerPayment[];
  messEntries: MessEntry[];
  bills: Bill[];
}

const ExpenseManager: React.FC<ExpenseManagerProps> = ({ 
  projects, purchases, kharchi, advances, clientPayments, workerPayments, messEntries, bills
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('All');

  const filterByProject = (item: { projectId: string }) => selectedProjectId === 'All' || item.projectId === selectedProjectId;

  // 1. Expenses
  const totalPurchases = purchases.filter(filterByProject).reduce((sum, p) => sum + p.totalAmount, 0);
  const totalKharchi = kharchi.filter(filterByProject).reduce((sum, k) => sum + k.amount, 0);
  const totalAdvances = advances.filter(filterByProject).reduce((sum, a) => sum + a.amount, 0);
  const totalSalaries = workerPayments.filter(filterByProject).reduce((sum, w) => sum + w.netPayable, 0);
  const totalMessExpenses = messEntries.filter(filterByProject).reduce((sum, m) => sum + m.amountPaid, 0);
  
  const totalLaborExpense = totalKharchi + totalAdvances + totalSalaries + totalMessExpenses;
  const totalOperationalExpenses = totalPurchases + totalLaborExpense;

  // 2. GST Liability
  // GST is deducted from P&L because it's a liability, not income.
  const totalGSTLiability = bills.filter(filterByProject).reduce((sum, b) => sum + (b.gstAmount || 0), 0);

  // 3. Income
  const totalClientPayments = clientPayments.filter(filterByProject).reduce((sum, c) => sum + c.amount, 0);

  // 4. Net Profit Calculation
  // Net Profit = (Total Cash Received - GST To Pay) - Operational Expenses
  // This assumes the Client Payments include the GST component.
  const netProfit = (totalClientPayments - totalGSTLiability) - totalOperationalExpenses;

  const chartData = [
    { name: 'Income', amount: totalClientPayments, fill: '#16a34a' },
    { name: 'GST', amount: totalGSTLiability, fill: '#9333ea' },
    { name: 'Material', amount: totalPurchases, fill: '#ea580c' },
    { name: 'Labor', amount: totalLaborExpense, fill: '#2563eb' },
    { name: 'Net P&L', amount: netProfit, fill: netProfit >= 0 ? '#16a34a' : '#dc2626' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Expense Manager</h1>
           <p className="text-slate-500">Profit & Loss Overview (Net of GST).</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <label className="block text-sm font-medium text-slate-700 mb-1">Select Project Report</label>
        <select 
          className="w-full md:w-1/3 border p-2 rounded-lg"
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
        >
          <option value="All">All Projects Combined</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {/* Income Card */}
         <div className="bg-green-100 p-6 rounded-xl border border-green-200">
            <div className="flex justify-between items-start mb-2">
               <span className="text-green-800 font-medium">Total Received</span>
               <TrendingUp className="text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900">₹{totalClientPayments.toLocaleString('en-IN')}</div>
            <div className="text-xs text-green-700 mt-1">Gross Client Payments</div>
         </div>

         {/* GST Card */}
         <div className="bg-purple-100 p-6 rounded-xl border border-purple-200">
            <div className="flex justify-between items-start mb-2">
               <span className="text-purple-800 font-medium">GST Liability</span>
               <Percent className="text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-900">₹{totalGSTLiability.toLocaleString('en-IN')}</div>
            <div className="text-xs text-purple-700 mt-1">Deducted from Income</div>
         </div>

         {/* Expenses Card */}
         <div className="bg-red-100 p-6 rounded-xl border border-red-200">
            <div className="flex justify-between items-start mb-2">
               <span className="text-red-800 font-medium">Total Expenses</span>
               <TrendingDown className="text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-900">₹{totalOperationalExpenses.toLocaleString('en-IN')}</div>
            <div className="text-xs text-red-700 mt-1">Material + Labor</div>
         </div>

         {/* Profit Card */}
         <div className={`p-6 rounded-xl border ${netProfit >= 0 ? 'bg-blue-100 border-blue-200' : 'bg-orange-100 border-orange-200'}`}>
            <div className="flex justify-between items-start mb-2">
               <span className={`${netProfit >= 0 ? 'text-blue-800' : 'text-orange-800'} font-medium`}>Net Profit</span>
               <PieChart className={`${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                {netProfit < 0 ? '-' : ''}₹{Math.abs(netProfit).toLocaleString('en-IN')}
            </div>
            <div className="text-xs mt-1 opacity-70">Rx - GST - Ex</div>
         </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
          <h3 className="font-bold text-slate-800 mb-4">Financial Overview</h3>
          <ResponsiveContainer width="100%" height="100%">
             <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Bar>
             </BarChart>
          </ResponsiveContainer>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <h3 className="font-bold text-slate-800 mb-4">Detailed Breakdown</h3>
         <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 border-b">
                     <tr>
                         <th className="p-3">Category</th>
                         <th className="p-3 text-right">Amount</th>
                         <th className="p-3">Impact</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y">
                     <tr className="bg-green-50">
                         <td className="p-3 font-medium">Total Client Collections</td>
                         <td className="p-3 text-right text-green-700 font-bold">₹{totalClientPayments.toLocaleString('en-IN')}</td>
                         <td className="p-3 text-green-600">INFLOW (+)</td>
                     </tr>
                     <tr className="bg-purple-50">
                         <td className="p-3 font-medium">GST Liability</td>
                         <td className="p-3 text-right text-purple-700 font-bold">₹{totalGSTLiability.toLocaleString('en-IN')}</td>
                         <td className="p-3 text-purple-600">DEDUCTION (-)</td>
                     </tr>
                     <tr>
                         <td className="p-3 font-medium">Material Purchases</td>
                         <td className="p-3 text-right">₹{totalPurchases.toLocaleString('en-IN')}</td>
                         <td className="p-3 text-red-500">EXPENSE (-)</td>
                     </tr>
                     <tr>
                         <td className="p-3 font-medium">Labor & Mess (Total)</td>
                         <td className="p-3 text-right">₹{totalLaborExpense.toLocaleString('en-IN')}</td>
                         <td className="p-3 text-red-500">EXPENSE (-)</td>
                     </tr>
                     <tr className="bg-slate-100 font-bold text-lg border-t-2 border-slate-300">
                         <td className="p-3">Net Profit / Loss</td>
                         <td className={`p-3 text-right ${netProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                             ₹{netProfit.toLocaleString('en-IN')}
                         </td>
                         <td></td>
                     </tr>
                 </tbody>
             </table>
         </div>
      </div>
    </div>
  );
};

export default ExpenseManager;
