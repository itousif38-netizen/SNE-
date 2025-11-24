import React, { useState } from 'react';
import { generateConstructionEstimate } from '../services/geminiService';
import { EstimateItem } from '../types';
import { Calculator, Sparkles, AlertTriangle, Download, RefreshCw, Building2 } from 'lucide-react';

const AIEstimator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [estimate, setEstimate] = useState<EstimateItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    setEstimate(null);

    try {
      const items = await generateConstructionEstimate(prompt);
      setEstimate(items);
    } catch (err) {
      setError("Failed to generate estimate. Please try again with a more detailed description.");
    } finally {
      setLoading(false);
    }
  };

  const totalCost = estimate ? estimate.reduce((acc, item) => acc + item.total, 0) : 0;

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-estimate, #printable-estimate * { visibility: visible; }
          #printable-estimate {
            position: absolute; left: 0; top: 0; width: 100%;
            background: white; padding: 20px;
          }
        }
      `}</style>

      <div className="text-center mb-8 print:hidden">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Cost Estimator</h1>
        <p className="text-slate-500">Describe your project, and our AI will generate a line-item material and labor estimate.</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden print:hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-2">Project Description</label>
          <div className="relative">
            <textarea
              className="w-full h-32 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="E.g., Build a 20x25 foot wooden deck with treated pine, including concrete footings, railing, and stairs. Height is 3 feet off the ground."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className={`absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all
                ${loading || !prompt.trim() 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-900/20'}
              `}
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
              {loading ? 'Generating...' : 'Generate Estimate'}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center">
            <AlertTriangle size={12} className="mr-1" />
            AI estimates are for planning purposes only. Verify all prices with suppliers.
          </p>
        </div>

        {error && (
          <div className="p-6 text-center text-red-600 bg-red-50">
            {error}
          </div>
        )}

        {estimate && (
          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-slate-700">Description</th>
                    <th className="px-6 py-3 font-semibold text-slate-700 text-right">Qty</th>
                    <th className="px-6 py-3 font-semibold text-slate-700">Unit</th>
                    <th className="px-6 py-3 font-semibold text-slate-700 text-right">Unit Price</th>
                    <th className="px-6 py-3 font-semibold text-slate-700 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {estimate.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-slate-900 font-medium">{item.description}</td>
                      <td className="px-6 py-3 text-slate-600 text-right">{item.quantity}</td>
                      <td className="px-6 py-3 text-slate-600">{item.unit}</td>
                      <td className="px-6 py-3 text-slate-600 text-right">₹{item.unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-3 text-slate-900 font-medium text-right">₹{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <td colSpan={4} className="px-6 py-4 text-right text-lg">Estimated Total</td>
                    <td className="px-6 py-4 text-right text-lg text-orange-600">₹{totalCost.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button 
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium"
              >
                <Download size={18} />
                Export PDF
              </button>
            </div>
          </div>
        )}
        
        {!estimate && !loading && !error && (
          <div className="p-12 text-center text-slate-400">
            <Calculator size={48} className="mx-auto mb-4 opacity-50" />
            <p>Enter project details above to generate a breakdown.</p>
          </div>
        )}
      </div>

      {/* Printable Report for AI Estimate */}
      <div id="printable-estimate" className="hidden">
         <div className="flex flex-col items-center mb-6">
             <div className="flex items-center gap-3 mb-2">
               <div className="relative w-12 h-12 flex items-center justify-center bg-blue-600 rounded-xl overflow-hidden border border-black">
                  <Building2 className="text-white w-8 h-8 relative z-10" />
                  <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-orange-500 rounded-full"></div>
              </div>
               <h1 className="text-5xl font-['Oswald'] font-black text-black uppercase tracking-wide">SN ENTERPRISE</h1>
             </div>
             <div className="h-0.5 bg-black w-full my-1"></div>
             <h2 className="text-lg font-bold">Preliminary Cost Estimate</h2>
             <div className="text-sm text-slate-600 mt-2 p-2 bg-slate-50 border rounded w-full">
                <strong>Project Scope:</strong> {prompt}
             </div>
         </div>

         {estimate ? (
           <table className="w-full border-collapse border border-black text-sm">
             <thead>
                 <tr className="bg-gray-200">
                     <th className="border border-black px-2 py-2 text-left">Item Description</th>
                     <th className="border border-black px-2 py-2 text-center w-20">Qty</th>
                     <th className="border border-black px-2 py-2 text-center w-20">Unit</th>
                     <th className="border border-black px-2 py-2 text-right w-28">Rate</th>
                     <th className="border border-black px-2 py-2 text-right w-32">Amount</th>
                 </tr>
             </thead>
             <tbody>
                 {estimate.map((item, index) => (
                     <tr key={index}>
                         <td className="border border-black px-2 py-2">{item.description}</td>
                         <td className="border border-black px-2 py-2 text-center">{item.quantity}</td>
                         <td className="border border-black px-2 py-2 text-center">{item.unit}</td>
                         <td className="border border-black px-2 py-2 text-right">{item.unitPrice.toFixed(2)}</td>
                         <td className="border border-black px-2 py-2 text-right font-bold">{item.total.toFixed(2)}</td>
                     </tr>
                 ))}
                 <tr className="bg-gray-100 font-bold">
                     <td colSpan={4} className="border border-black px-2 py-2 text-right">Grand Total Estimate</td>
                     <td className="border border-black px-2 py-2 text-right text-lg">₹{totalCost.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                 </tr>
             </tbody>
           </table>
         ) : (
           <p className="text-center italic">No estimate generated yet.</p>
         )}
         
         <div className="mt-8 text-xs text-slate-500">
            * This is an AI-generated estimate for planning purposes only. Actual costs may vary based on market conditions and specific site requirements.
         </div>
      </div>
    </div>
  );
};

export default AIEstimator;