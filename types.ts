

export enum ProjectStatus {
  PLANNING = 'Planning',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  ON_HOLD = 'On Hold'
}

export interface Project {
  id: string;
  name: string;
  startDate: string;
  completionDate?: string;
  address: string;
  budget: number;
  status: ProjectStatus;
  client?: string; // Optional for backward compatibility or future use
  spent?: number;
  completionPercentage?: number;
}

export interface Worker {
  id: string;
  workerId: string; // The custom ID like W-101
  name: string;
  projectId: string;
  designation: string;
  joiningDate: string;
  exitDate?: string;
  serialNo: number;
}

export interface Bill {
  id: string;
  serialNo: number;
  projectId: string;
  billNo: string;
  workNature: string;
  amount: number; // Base Amount
  gstRate?: number; // Percentage (e.g. 18)
  gstAmount?: number; // Calculated GST value
  grandTotal?: number; // Base + GST
  billingMonth: string; // YYYY-MM
  certifyDate: string;
}

export interface ClientPayment {
  id: string;
  projectId: string;
  amount: number;
  date: string;
  remarks?: string;
}

export interface ClientPaymentRecord {
  id: string;
  projectId: string;
  billId?: string;
  totalBilled: number;
  receivedAmount: number;
  balance: number;
}

export interface PurchaseEntry {
  id: string;
  serialNo: number;
  projectId: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  totalAmount: number;
  date: string;
}

export interface KharchiEntry {
  id: string;
  workerId: string;
  projectId: string;
  date: string; // Specific date (Sunday)
  amount: number;
}

export interface AdvanceEntry {
  id: string;
  serialNo: number;
  workerId: string;
  projectId: string;
  amount: number;
  paidBy: string;
  remarks: string;
  date: string;
  paymentMode?: string;
}

export interface WorkerPayment {
  id: string;
  serialNo: number;
  workerId: string;
  projectId: string;
  month: string; // YYYY-MM
  workAmount: number;
  messDeduction: number;
  kharchiDeduction: number;
  advanceDeduction: number;
  netPayable: number;
  isPaid: boolean;
  date?: string; // Date of saving
}

export interface PourStage {
  date?: string;
  cycle?: number;
}

export interface ExecutionLevel {
  id: string;
  projectId: string;
  levelName: string; // e.g. "10th Floor"
  pours: PourStage[];
}

export interface MessEntry {
  id: string;
  projectId: string;
  weekStartDate: string;
  weekEndDate: string;
  workerCount: number;
  rate: number;
  totalAmount: number;
  amountPaid: number;
  otherExpenses: number;
  otherExpensesDesc: string;
  balance: number;
  remarks: string;
}

export interface EstimateItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Resource {
  id: string;
  name: string;
  type: 'Equipment' | 'Labor' | 'Other' | string;
  status: 'Available' | 'In Use' | 'Maintenance' | string;
  assignedTo?: string; // Project ID
  costPerDay: number;
}

export enum AppView {
  DASHBOARD = 'Dashboard',
  PROJECTS = 'Projects',
  EXECUTION = 'Execution',
  PURCHASE = 'Purchase',
  WORKERS = 'Workers',
  BILLING = 'Billing & Client Pay',
  GST = 'GST Dashboard',
  KHARCHI = 'Kharchi',
  ADVANCE = 'Advance',
  MESS = 'Mess Management',
  WORKER_PAYMENT = 'Worker Payment',
  EXPENSES = 'Expense Manager',
  ESTIMATOR = 'AI Estimator',
  ASSISTANT = 'Site Assistant',
  BACKUP = 'Data Backup'
}