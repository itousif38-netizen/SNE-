import React, { useState, useEffect } from 'react';
import { Project, ExecutionLevel, PourStage } from '../types';
import { Layers, Plus, Trash2, Download, Minus, Building2 } from 'lucide-react';

interface ExecutionTrackerProps {
  projects: Project[];
  executionData: ExecutionLevel[];
  onAddExecution: (entry: ExecutionLevel) => void;
  onUpdateExecution: (entry: ExecutionLevel) => void;
  onDeleteExecution: (id: string) => void;
}

const ExecutionTracker: React.FC<ExecutionTrackerProps> = ({ 
  projects, 
  executionData, 
  onAddExecution, 
  onUpdateExecution, 
  onDeleteExecution 
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [pourCount, setPourCount] = useState(3);

  const filteredData = executionData.filter(e => e.projectId === selectedProjectId);

  // Auto-adjust pour count if data exceeds current view
  useEffect(() => {
    let maxPours = 3;
    filteredData.forEach(item => {
        if (item.pours && item.pours.length > maxPours) {
            maxPours = item.pours.length;
        }
    });
    setPourCount(maxPours);
  }, [filteredData, selectedProjectId]);

  const handleAddRow = () => {
    if (!selectedProjectId) {
      alert("Please select a project first.");
      return;
    }
    const newEntry: ExecutionLevel = {
      id: Date.now().toString(),
      projectId: selectedProjectId,
      levelName: `Level ${filteredData.length + 1}`,
      pours: Array(pourCount).fill({ date: '', cycle: undefined })
    };
    onAddExecution(newEntry);
  };

  const handleInputChange = (id: string, field: 'levelName' | 'pour', value: any, pourIndex?: number, subField?: keyof PourStage) => {
    const entry = executionData.find(e => e.id === id);
    if (!entry) return;

    if (field === 'levelName') {
      onUpdateExecution({ ...entry, levelName: value });
    } else if (field === 'pour' && typeof pourIndex === 'number' && subField) {
        const newPours = [...(entry.pours || [])];
        // Ensure array is long enough
        while (newPours.length <= pourIndex) {
            newPours.push({});
        }
        newPours[pourIndex] = {
            ...newPours[pourIndex],
            [subField]: value
        };
        onUpdateExecution({ ...entry, pours: newPours });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this level record?")) {
      onDeleteExecution(id);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };
  
  const incrementPours = () => setPourCount(prev => prev + 1);
  const decrementPours = () => setPourCount(prev => Math.max(1, prev - 1));

  const getProjectName = () => projects.find(p => p.id === selectedProjectId)?.name || '';

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-execution, #printable-execution * { visibility: visible; }
          #printable-execution {
            position: absolute; left: 0; top: 0; width: 100%;
            background: white; padding: 20px;
          }
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      `}</style>

      {/* Screen View */}
      <div className="print:hidden space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Execution Dashboard</h1>
            <p className="text-slate-500">Track Slab Casting Dates and Cycle Times by Level.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleExportPDF}
              className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 flex items-center gap-2"
            >
              <Download size={18} /> Export PDF
            </button>
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 items-end">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Project</label>
            <select 
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-orange-500"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
            >
                <option value="">-- Choose Project --</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
             <span className="text-sm font-medium text-slate-600">Pour Columns: {pourCount}</span>
             <button onClick={decrementPours} className="p-1.5 border rounded hover:bg-slate-100" title="Remove Column"><Minus size={16}/></button>
             <button onClick={incrementPours} className="p-1.5 border rounded hover:bg-slate-100" title="Add Column"><Plus size={16}/></button>
          </div>
        </div>

        {selectedProjectId && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
               <h3 className="font-semibold text-slate-700">Casting Schedule</h3>
               <button 
                 onClick={handleAddRow}
                 className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
               >
                 <Plus size={16} /> Add Level
               </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="border-collapse w-full min-w-max">
                <thead>
                  <tr className="bg-blue-200 text-slate-800 text-sm">
                    <th rowSpan={2} className="border border-slate-300 px-4 py-2 w-40 sticky left-0 z-10 bg-blue-200">Floors</th>
                    {Array.from({ length: pourCount }).map((_, i) => (
                        <th key={i} colSpan={2} className="border border-slate-300 px-4 py-1 text-center bg-blue-300/50">Pour-{i + 1}</th>
                    ))}
                    <th rowSpan={2} className="border border-slate-300 px-2 py-2 w-16 text-center">Action</th>
                  </tr>
                  <tr className="bg-blue-100 text-slate-700 text-xs">
                    {Array.from({ length: pourCount }).map((_, i) => (
                        <React.Fragment key={i}>
                            <th className="border border-slate-300 px-2 py-2 text-center min-w-[120px]">Date</th>
                            <th className="border border-slate-300 px-2 py-2 text-center w-16">Cycle</th>
                        </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row) => (
                    <tr key={row.id} className="bg-green-500 hover:bg-green-600 transition-colors">
                      <td className="border border-green-600 p-0 sticky left-0 z-10 bg-green-500">
                         <input 
                           type="text" 
                           className="w-full bg-transparent p-3 font-bold text-slate-900 placeholder-slate-700 focus:outline-none focus:bg-white/20"
                           value={row.levelName}
                           onChange={(e) => handleInputChange(row.id, 'levelName', e.target.value)}
                         />
                      </td>
                      
                      {Array.from({ length: pourCount }).map((_, i) => (
                         <React.Fragment key={i}>
                            <td className="border border-green-600 p-0">
                                <input 
                                type="date"
                                className="w-full bg-transparent p-2 text-center text-sm focus:outline-none focus:bg-white/20"
                                value={row.pours?.[i]?.date || ''}
                                onChange={(e) => handleInputChange(row.id, 'pour', e.target.value, i, 'date')}
                                />
                            </td>
                            <td className="border border-green-600 p-0">
                                <input 
                                type="number"
                                className="w-full bg-transparent p-2 text-center text-sm focus:outline-none focus:bg-white/20"
                                placeholder="-"
                                value={row.pours?.[i]?.cycle ?? ''}
                                onChange={(e) => handleInputChange(row.id, 'pour', Number(e.target.value), i, 'cycle')}
                                />
                            </td>
                         </React.Fragment>
                      ))}

                      <td className="border border-green-600 p-0 text-center">
                        <button 
                          onClick={() => handleDelete(row.id)}
                          className="p-2 text-slate-800 hover:text-red-700 transition-colors opacity-60 hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr className="bg-white">
                      <td colSpan={(pourCount * 2) + 2} className="p-8 text-center text-slate-500">
                        No execution levels added yet. Click "Add Level" to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Print View */}
      <div id="printable-execution" className="hidden">
         <div className="flex flex-col items-center mb-6">
             <div className="flex items-center gap-3 mb-2">
               <div className="relative w-12 h-12 flex items-center justify-center bg-blue-600 rounded-xl overflow-hidden border border-black">
                  <Building2 className="text-white w-8 h-8 relative z-10" />
                  <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-orange-500 rounded-full"></div>
              </div>
               <h1 className="text-5xl font-['Oswald'] font-black text-black uppercase tracking-wide">SN ENTERPRISE</h1>
             </div>
             <div className="h-0.5 bg-black w-full my-1"></div>
             <h2 className="text-lg font-bold">Execution Schedule - {getProjectName()}</h2>
         </div>

         <table className="w-full border-collapse border border-black text-sm">
            <thead>
               <tr className="bg-blue-300 text-black font-bold">
                  <th rowSpan={2} className="border border-black px-2 py-2">Floors</th>
                  {Array.from({ length: pourCount }).map((_, i) => (
                      <th key={i} colSpan={2} className="border border-black px-2 py-1 text-center">Pour-{i + 1}</th>
                  ))}
               </tr>
               <tr className="bg-blue-200 text-black">
                   {Array.from({ length: pourCount }).map((_, i) => (
                       <React.Fragment key={i}>
                           <th className="border border-black px-2 py-1 text-center">Date</th>
                           <th className="border border-black px-2 py-1 text-center">Cycle</th>
                       </React.Fragment>
                   ))}
               </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id} className="bg-green-400 print:bg-green-400">
                   <td className="border border-black px-2 py-3 font-bold">{row.levelName}</td>
                   {Array.from({ length: pourCount }).map((_, i) => (
                        <React.Fragment key={i}>
                            <td className="border border-black px-2 py-3 text-center">{row.pours?.[i]?.date}</td>
                            <td className="border border-black px-2 py-3 text-center">{row.pours?.[i]?.cycle}</td>
                        </React.Fragment>
                   ))}
                </tr>
              ))}
            </tbody>
         </table>
      </div>
    </div>
  );
};

export default ExecutionTracker;