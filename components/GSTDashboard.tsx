
import React, { useState } from 'react';
import { Project, Bill } from '../types';
import { Percent, Filter, Building2, Download, ClipboardCheck } from 'lucide-react';

interface GSTDashboardProps {
  projects: Project[];
  bills: Bill[];
}

const GSTDashboard: React.FC<GSTDashboardProps> = ({ projects, bills }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const filteredBills = bills.filter(bill => {
    const projectMatch = selectedProjectId === 'All' || bill.projectId === selectedProjectId;
    const monthMatch = selectedMonth ? bill.billingMonth === selectedMonth : true;
    return projectMatch && monthMatch;
  });

  const totalBase = filteredBills.reduce((sum, b) => sum + b.amount, 0);
  const totalGST = filteredBills.reduce((sum, b) => sum + (b.gstAmount || 0), 0);
  const totalGrand = filteredBills.reduce((sum, b) => sum + (b.grandTotal || b.amount), 0);

  // Group data by Site for Checklist
  const siteSummaries = projects.map(project => {
      const projectBills = filteredBills.filter(b => b.projectId === project.id);
      if (projectBills.length === 0) return null;

      return {
          id: project.id,
          name: project.name,
          billCount: projectBills.length,
          base: projectBills.reduce((sum, b) => sum + b.amount, 0),
          gst: projectBills.reduce((sum, b) => sum + (b.gstAmount || 0), 0),
          total: projectBills.reduce((sum, b) => sum + (b.grandTotal || b.amount), 0)
      };
  }).filter(Boolean); // Remove nulls (projects with no bills in current filter)

  const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || 'Unknown';

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
       <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-gst, #printable-gst * { visibility: visible; }
          #printable-gst {
            position: absolute; left: 0; top: 0; width: 100%;
            background: white; padding: 20px;
          }
        }
      `}</style>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">GST Dashboard</h1>
          <p className="text-slate-500">Track GST Liability by Site and Month.</p>
        </div>
        <button 
            onClick={handleExportPDF}
            className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 flex items-center gap-2"
        >
            <Download size={18} /> Export PDF
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-end">
         <div className="flex-1 w-full">
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
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
         </div>
         <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-slate-500 mb-1">Filter by Month</label>
            <input 
                type="month" 
                className="w-full border p-2 rounded-lg bg-slate-50"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
            />
         </div>
         <div className="pb-2 text-sm text-slate-500 cursor-pointer hover:underline" onClick={() => setSelectedMonth('')}>
             Clear Month
         </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="text-slate-500 text-sm font-medium mb-1">Total Base Amount</div>
             <div className="text-2xl font-bold text-slate-900">₹{totalBase.toLocaleString('en-IN')}</div>
         </div>
         <div className="bg-purple-600 p-6 rounded-xl border border-purple-700 shadow-md text-white">
             <div className="flex items-center gap-2 mb-1">
                 <Percent size={18} className="text-purple-200" />
                 <span className="text-purple-100 text-sm font-medium">Total GST Liability</span>
             </div>
             <div className="text-2xl font-bold">₹{totalGST.toLocaleString('en-IN')}</div>
             <div className="text-xs text-purple-200 mt-1">To be paid to Govt.</div>
         </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="text-slate-500 text-sm font-medium mb-1">Total Invoice Value</div>
             <div className="text-2xl font-bold text-slate-900">₹{totalGrand.toLocaleString('en-IN')}</div>
         </div>
      </div>

      {/* Site-wise Checklist */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-purple-50 flex items-center gap-2">
              <ClipboardCheck className="text-purple-700" size={20} />
              <h3 className="font-bold text-purple-900">Site-wise GST Checklist</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                          <th className="px-6 py-3 font-semibold text-slate-700">Project Site</th>
                          <th className="px-6 py-3 font-semibold text-slate-700 text-center">No. of Bills</th>
                          <th className="px-6 py-3 font-semibold text-slate-700 text-right">Taxable Amount</th>
                          <th className="px-6 py-3 font-semibold text-purple-700 text-right">GST Liability</th>
                          <th className="px-6 py-3 font-semibold text-slate-700 text-right">Total Value</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                      {siteSummaries.map(site => (
                          <tr key={site?.id} className="hover:bg-slate-50">
                              <td className="px-6 py-4 font-medium text-slate-900">{site?.name}</td>
                              <td className="px-6 py-4 text-center text-slate-600">{site?.billCount}</td>
                              <td className="px-6 py-4 text-right text-slate-600">₹{site?.base.toLocaleString('en-IN')}</td>
                              <td className="px-6 py-4 text-right font-bold text-purple-700">₹{site?.gst.toLocaleString('en-IN')}</td>
                              <td className="px-6 py-4 text-right font-bold text-slate-900">₹{site?.total.toLocaleString('en-IN')}</td>
                          </tr>
                      ))}
                      {siteSummaries.length === 0 && (
                          <tr><td colSpan={5} className="p-6 text-center text-slate-500">No data available for checklist.</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>

      {/* Detailed Bill List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-700">Detailed Bill Register</h3>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 border-b border-slate-200">
                     <tr>
                         <th className="px-6 py-4 font-semibold text-slate-700">Bill No</th>
                         <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
                         <th className="px-6 py-4 font-semibold text-slate-700">Project</th>
                         <th className="px-6 py-4 font-semibold text-slate-700 text-right">Base Amount</th>
                         <th className="px-6 py-4 font-semibold text-slate-700 text-center">GST %</th>
                         <th className="px-6 py-4 font-semibold text-purple-700 text-right bg-purple-50">GST Amount</th>
                         <th className="px-6 py-4 font-semibold text-slate-700 text-right">Total</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-200">
                     {filteredBills.map(bill => (
                         <tr key={bill.id} className="hover:bg-slate-50">
                             <td className="px-6 py-4 font-medium">{bill.billNo}</td>
                             <td className="px-6 py-4 text-slate-500">{bill.certifyDate}</td>
                             <td className="px-6 py-4 text-slate-600">{getProjectName(bill.projectId)}</td>
                             <td className="px-6 py-4 text-right">₹{bill.amount.toLocaleString('en-IN')}</td>
                             <td className="px-6 py-4 text-center">
                                 <span className="bg-slate-100 px-2 py-1 rounded text-xs border">{bill.gstRate}%</span>
                             </td>
                             <td className="px-6 py-4 text-right font-bold text-purple-700 bg-purple-50/50">₹{(bill.gstAmount || 0).toLocaleString('en-IN')}</td>
                             <td className="px-6 py-4 text-right font-bold text-slate-900">₹{(bill.grandTotal || bill.amount).toLocaleString('en-IN')}</td>
                         </tr>
                     ))}
                 </tbody>
             </table>
          </div>
      </div>

      {/* Print Section */}
      <div id="printable-gst" className="hidden">
         <div className="flex flex-col items-center mb-6">
             <div className="flex items-center gap-3 mb-2">
               <div className="relative w-12 h-12 flex items-center justify-center bg-blue-600 rounded-xl overflow-hidden border border-black">
                  <Building2 className="text-white w-8 h-8 relative z-10" />
                  <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-orange-500 rounded-full"></div>
              </div>
               <h1 className="text-5xl font-['Oswald'] font-black text-black uppercase tracking-wide">SN ENTERPRISE</h1>
             </div>
             <div className="h-0.5 bg-black w-full my-1"></div>
             <h2 className="text-lg font-bold">GST Liability Report</h2>
             <p className="text-sm">Filter: {selectedProjectId === 'All' ? 'All Projects' : getProjectName(selectedProjectId)} {selectedMonth ? `| ${selectedMonth}` : ''}</p>
         </div>

         {/* Site-wise Checklist for Print */}
         <div className="mb-6">
             <h3 className="font-bold border-b border-black mb-2">Site-wise Checklist Summary</h3>
             <table className="w-full border-collapse border border-black text-sm">
                 <thead>
                     <tr className="bg-gray-200">
                         <th className="border border-black px-2 py-1 text-left">Project Name</th>
                         <th className="border border-black px-2 py-1 text-center">Bill Count</th>
                         <th className="border border-black px-2 py-1 text-right">Taxable Amt</th>
                         <th className="border border-black px-2 py-1 text-right">GST Liability</th>
                         <th className="border border-black px-2 py-1 text-right">Total Invoice</th>
                     </tr>
                 </thead>
                 <tbody>
                     {siteSummaries.map(site => (
                         <tr key={site?.id}>
                             <td className="border border-black px-2 py-1">{site?.name}</td>
                             <td className="border border-black px-2 py-1 text-center">{site?.billCount}</td>
                             <td className="border border-black px-2 py-1 text-right">{site?.base.toLocaleString('en-IN')}</td>
                             <td className="border border-black px-2 py-1 text-right font-bold">{site?.gst.toLocaleString('en-IN')}</td>
                             <td className="border border-black px-2 py-1 text-right">{site?.total.toLocaleString('en-IN')}</td>
                         </tr>
                     ))}
                     <tr className="bg-gray-100 font-bold">
                         <td colSpan={3} className="border border-black px-2 py-1 text-right">Grand Total</td>
                         <td className="border border-black px-2 py-1 text-right">{totalGST.toLocaleString('en-IN')}</td>
                         <td className="border border-black px-2 py-1 text-right">{totalGrand.toLocaleString('en-IN')}</td>
                     </tr>
                 </tbody>
             </table>
         </div>

         <h3 className="font-bold border-b border-black mb-2">Detailed Bill List</h3>
         <table className="w-full border-collapse border border-black text-sm">
             <thead>
                 <tr className="bg-gray-200">
                     <th className="border border-black px-2 py-2 text-center w-12">SR</th>
                     <th className="border border-black px-2 py-2">Bill No</th>
                     <th className="border border-black px-2 py-2 text-center w-24">Date</th>
                     <th className="border border-black px-2 py-2">Project</th>
                     <th className="border border-black px-2 py-2 text-right">Base Amt</th>
                     <th className="border border-black px-2 py-2 text-center w-12">GST%</th>
                     <th className="border border-black px-2 py-2 text-right">GST Amt</th>
                     <th className="border border-black px-2 py-2 text-right">Total</th>
                 </tr>
             </thead>
             <tbody>
                 {filteredBills.map((bill, idx) => (
                     <tr key={bill.id}>
                         <td className="border border-black px-2 py-2 text-center">{idx + 1}</td>
                         <td className="border border-black px-2 py-2">{bill.billNo}</td>
                         <td className="border border-black px-2 py-2 text-center">{bill.certifyDate}</td>
                         <td className="border border-black px-2 py-2">{getProjectName(bill.projectId)}</td>
                         <td className="border border-black px-2 py-2 text-right">{bill.amount.toLocaleString('en-IN')}</td>
                         <td className="border border-black px-2 py-2 text-center">{bill.gstRate}%</td>
                         <td className="border border-black px-2 py-2 text-right font-bold">{bill.gstAmount?.toLocaleString('en-IN')}</td>
                         <td className="border border-black px-2 py-2 text-right font-bold">{bill.grandTotal?.toLocaleString('en-IN')}</td>
                     </tr>
                 ))}
             </tbody>
         </table>
      </div>
    </div>
  );
};

export default GSTDashboard;
