import React, { useRef, useState } from 'react';
import { Database, Download, Upload, AlertTriangle, CheckCircle2, FileJson } from 'lucide-react';

interface DataBackupProps {
  currentData: any;
  onRestore: (data: any) => void;
}

const DataBackup: React.FC<DataBackupProps> = ({ currentData, onRestore }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(currentData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `sn_enterprise_backup_${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setStatus({ type: 'success', message: 'Backup downloaded successfully!' });
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Failed to create backup file.' });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation: check if key arrays exist
        if (json.projects && Array.isArray(json.projects)) {
          onRestore(json);
          setStatus({ type: 'success', message: 'Data restored successfully!' });
        } else {
          setStatus({ type: 'error', message: 'Invalid backup file format.' });
        }
      } catch (error) {
        console.error(error);
        setStatus({ type: 'error', message: 'Failed to read backup file.' });
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Backup & Restore</h1>
          <p className="text-slate-500">Securely export your data or restore from a previous save.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Export Section */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
             <Download size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Export Data</h2>
          <p className="text-slate-500 mb-6 max-w-sm">
            Download a complete backup of all projects, workers, bills, payments, and expenses to your device.
          </p>
          <button 
            onClick={handleExport}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
          >
            <FileJson size={20} /> Download Backup
          </button>
        </div>

        {/* Import Section */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center animate-fade-in-up" style={{animationDelay: '100ms'}}>
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
             <Upload size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Restore Data</h2>
          <p className="text-slate-500 mb-6 max-w-sm">
            Restore your database by uploading a previously saved backup file. 
          </p>
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button 
             onClick={handleImportClick}
             className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 shadow-lg shadow-orange-900/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
          >
            <Upload size={20} /> Upload Backup File
          </button>
          
          <div className="mt-4 flex items-center gap-2 text-xs text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
             <AlertTriangle size={14} />
             Warning: This replaces all current data!
          </div>
        </div>
      </div>

      {status.type && (
         <div className={`p-4 rounded-xl flex items-center gap-3 animate-scale-in border ${
            status.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
         }`}>
            {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
            <div>
               <p className="font-bold">{status.type === 'success' ? 'Success' : 'Error'}</p>
               <p className="text-sm">{status.message}</p>
            </div>
         </div>
      )}
    </div>
  );
};

export default DataBackup;