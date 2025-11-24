import React, { useState, useEffect } from 'react';
import { Menu, Building2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import WorkerManager from './components/WorkerManager';
import BillingManager from './components/BillingManager';
import KharchiTracker from './components/KharchiTracker';
import AdvanceTracker from './components/AdvanceTracker';
import WorkerPayment from './components/WorkerPayment';
import ExpenseManager from './components/ExpenseManager';
import ResourceTracker from './components/ResourceTracker';
import PurchaseManager from './components/PurchaseManager';
import ExecutionTracker from './components/ExecutionTracker';
import MessManager from './components/MessManager';
import GSTDashboard from './components/GSTDashboard';
import AIEstimator from './components/AIEstimator';
import AIChat from './components/AIChat';
import Login from './components/Login';
import DataBackup from './components/DataBackup';
import { AppView, Project, Worker, Bill, KharchiEntry, AdvanceEntry, ClientPayment, PurchaseEntry, ExecutionLevel, WorkerPayment as WorkerPaymentType, MessEntry } from './types';
import { MOCK_PROJECTS, MOCK_RESOURCES, MOCK_WORKERS, MOCK_BILLS, MOCK_KHARCHI, MOCK_ADVANCES, MOCK_CLIENT_PAYMENTS, MOCK_PURCHASES, MOCK_EXECUTION, MOCK_MESS_ENTRIES } from './constants';

// Custom Hook for Local Storage Persistence
function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}

function App() {
  // Auth State (Session based, resets on refresh which is fine for security)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State for data management - NOW PERSISTENT
  const [projects, setProjects] = usePersistentState<Project[]>('sn_projects', MOCK_PROJECTS);
  const [workers, setWorkers] = usePersistentState<Worker[]>('sn_workers', MOCK_WORKERS);
  const [bills, setBills] = usePersistentState<Bill[]>('sn_bills', MOCK_BILLS);
  const [clientPayments, setClientPayments] = usePersistentState<ClientPayment[]>('sn_client_payments', MOCK_CLIENT_PAYMENTS);
  const [kharchi, setKharchi] = usePersistentState<KharchiEntry[]>('sn_kharchi', MOCK_KHARCHI);
  const [advances, setAdvances] = usePersistentState<AdvanceEntry[]>('sn_advances', MOCK_ADVANCES);
  const [purchases, setPurchases] = usePersistentState<PurchaseEntry[]>('sn_purchases', MOCK_PURCHASES);
  const [executionData, setExecutionData] = usePersistentState<ExecutionLevel[]>('sn_execution', MOCK_EXECUTION);
  const [messEntries, setMessEntries] = usePersistentState<MessEntry[]>('sn_mess', MOCK_MESS_ENTRIES);
  const [workerPayments, setWorkerPayments] = usePersistentState<WorkerPaymentType[]>('sn_worker_payments', []);

  // --- Add Handlers ---
  const handleAddProject = (newProject: Project) => {
    setProjects(prev => [...prev, newProject]);
  };

  const handleAddWorker = (newWorker: Worker) => {
    setWorkers(prev => [...prev, newWorker]);
  };

  const handleAddBill = (newBill: Bill) => {
    setBills(prev => [...prev, newBill]);
  };

  const handleAddClientPayment = (newPayment: ClientPayment) => {
    setClientPayments(prev => [...prev, newPayment]);
  };

  const handleAddAdvance = (newAdvance: AdvanceEntry) => {
    setAdvances(prev => [...prev, newAdvance]);
  };

  const handleAddPurchase = (newPurchase: PurchaseEntry) => {
    setPurchases(prev => [...prev, newPurchase]);
  };
  
  const handleAddExecution = (newExecution: ExecutionLevel) => {
    setExecutionData(prev => [...prev, newExecution]);
  };

  const handleAddMess = (newMess: MessEntry) => {
    setMessEntries(prev => [...prev, newMess]);
  };

  // --- Edit Handlers ---
  const handleEditProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleEditWorker = (updatedWorker: Worker) => {
    setWorkers(prev => prev.map(w => w.id === updatedWorker.id ? updatedWorker : w));
  };

  const handleEditBill = (updatedBill: Bill) => {
    setBills(prev => prev.map(b => b.id === updatedBill.id ? updatedBill : b));
  };

  const handleEditClientPayment = (updatedPayment: ClientPayment) => {
    setClientPayments(prev => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p));
  };

  const handleEditAdvance = (updatedAdvance: AdvanceEntry) => {
    setAdvances(prev => prev.map(a => a.id === updatedAdvance.id ? updatedAdvance : a));
  };

  const handleEditPurchase = (updatedPurchase: PurchaseEntry) => {
    setPurchases(prev => prev.map(p => p.id === updatedPurchase.id ? updatedPurchase : p));
  };
  
  const handleUpdateExecution = (updatedEntry: ExecutionLevel) => {
    setExecutionData(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
  };

  const handleEditMess = (updatedMess: MessEntry) => {
    setMessEntries(prev => prev.map(m => m.id === updatedMess.id ? updatedMess : m));
  };

  // --- Delete Handlers ---
  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleDeleteWorker = (id: string) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
  };

  const handleDeleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));
  };

  const handleDeleteClientPayment = (id: string) => {
    setClientPayments(prev => prev.filter(p => p.id !== id));
  };

  const handleDeleteAdvance = (id: string) => {
    setAdvances(prev => prev.filter(a => a.id !== id));
  };

  const handleDeletePurchase = (id: string) => {
    setPurchases(prev => prev.filter(p => p.id !== id));
  };
  
  const handleDeleteExecution = (id: string) => {
    setExecutionData(prev => prev.filter(e => e.id !== id));
  };

  const handleDeleteMess = (id: string) => {
    setMessEntries(prev => prev.filter(m => m.id !== id));
  };

  const handleUpdateKharchi = (entries: KharchiEntry[]) => {
    setKharchi(prev => {
        // Create a map of existing entries for easier lookup/replacement
        const newKharchi = [...prev];
        entries.forEach(entry => {
          const index = newKharchi.findIndex(k => k.workerId === entry.workerId && k.date === entry.date);
          if (index >= 0) {
            newKharchi[index] = entry;
          } else {
            newKharchi.push(entry);
          }
        });
        return newKharchi;
    });
  };

  const handleSaveWorkerPayments = (records: WorkerPaymentType[]) => {
      setWorkerPayments(prev => {
          // Filter out old records for the same month/project to prevent duplicates if saving again
          const filtered = prev.filter(wp => 
              !records.some(r => r.workerId === wp.workerId && r.month === wp.month)
          );
          return [...filtered, ...records];
      });
  };

  // --- Backup / Restore ---
  const handleRestoreData = (data: any) => {
     if (data.projects) setProjects(data.projects);
     if (data.workers) setWorkers(data.workers);
     if (data.bills) setBills(data.bills);
     if (data.clientPayments) setClientPayments(data.clientPayments);
     if (data.kharchi) setKharchi(data.kharchi);
     if (data.advances) setAdvances(data.advances);
     if (data.purchases) setPurchases(data.purchases);
     if (data.executionData) setExecutionData(data.executionData);
     if (data.messEntries) setMessEntries(data.messEntries);
     if (data.workerPayments) setWorkerPayments(data.workerPayments);
     alert('Data restored successfully!');
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard projects={projects} />;
      case AppView.PROJECTS:
        return (
          <ProjectList 
            projects={projects} 
            onAddProject={handleAddProject} 
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
          />
        );
      case AppView.EXECUTION:
        return (
          <ExecutionTracker 
            projects={projects}
            executionData={executionData}
            onAddExecution={handleAddExecution}
            onUpdateExecution={handleUpdateExecution}
            onDeleteExecution={handleDeleteExecution}
          />
        );
      case AppView.PURCHASE:
        return (
          <PurchaseManager 
            projects={projects}
            purchases={purchases}
            onAddPurchase={handleAddPurchase}
            onEditPurchase={handleEditPurchase}
            onDeletePurchase={handleDeletePurchase}
          />
        );
      case AppView.WORKERS:
        return (
          <WorkerManager 
            workers={workers} 
            projects={projects} 
            onAddWorker={handleAddWorker} 
            onEditWorker={handleEditWorker}
            onDeleteWorker={handleDeleteWorker}
          />
        );
      case AppView.MESS:
        return (
          <MessManager 
            projects={projects} 
            messEntries={messEntries}
            onAddMess={handleAddMess}
            onEditMess={handleEditMess}
            onDeleteMess={handleDeleteMess}
          />
        );
      case AppView.BILLING:
        return (
          <BillingManager 
            projects={projects} 
            bills={bills} 
            clientPayments={clientPayments}
            onAddBill={handleAddBill} 
            onEditBill={handleEditBill}
            onDeleteBill={handleDeleteBill}
            onAddPayment={handleAddClientPayment}
            onEditPayment={handleEditClientPayment}
            onDeletePayment={handleDeleteClientPayment}
          />
        );
      case AppView.GST:
        return <GSTDashboard projects={projects} bills={bills} />;
      case AppView.KHARCHI:
        return <KharchiTracker projects={projects} workers={workers} kharchi={kharchi} onUpdateKharchi={handleUpdateKharchi} />;
      case AppView.ADVANCE:
        return (
          <AdvanceTracker 
            projects={projects} 
            workers={workers} 
            advances={advances} 
            onAddAdvance={handleAddAdvance} 
            onEditAdvance={handleEditAdvance}
            onDeleteAdvance={handleDeleteAdvance}
          />
        );
      case AppView.WORKER_PAYMENT:
        return (
            <WorkerPayment 
                projects={projects} 
                workers={workers} 
                kharchi={kharchi} 
                advances={advances}
                onSavePaymentRecord={handleSaveWorkerPayments}
            />
        );
      case AppView.EXPENSES:
        return (
            <ExpenseManager 
                projects={projects}
                purchases={purchases}
                kharchi={kharchi}
                advances={advances}
                clientPayments={clientPayments}
                workerPayments={workerPayments}
                messEntries={messEntries}
                bills={bills}
            />
        );
      case AppView.ESTIMATOR:
        return <AIEstimator />;
      case AppView.ASSISTANT:
        return <AIChat />;
      case AppView.BACKUP:
        return (
          <DataBackup 
            currentData={{
               projects, workers, bills, clientPayments, kharchi, advances, purchases, executionData, messEntries, workerPayments
            }}
            onRestore={handleRestoreData}
          />
        );
      default:
        return <Dashboard projects={projects} />;
    }
  };

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return <Login onLogin={(success) => setIsAuthenticated(success)} />;
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm z-10 text-white animate-fade-in-up">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-slate-300 hover:text-white transition-transform active:scale-95"
          >
            <Menu size={24} />
          </button>
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-lg overflow-hidden relative shadow-lg">
                <Building2 className="text-white w-4 h-4 relative z-10" />
                <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-orange-500 rounded-full animate-pulse"></div>
            </div>
            <span className="font-['Oswald'] font-bold text-xl tracking-wide">SN <span className="text-orange-500">ENTERPRISE</span></span>
          </div>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100">
          <div key={currentView} className="max-w-7xl mx-auto animate-fade-in-up">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;