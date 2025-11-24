

import { Project, ProjectStatus, Worker, Bill, KharchiEntry, AdvanceEntry, Resource, ClientPayment, PurchaseEntry, ExecutionLevel, MessEntry } from "./types";

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Sunset Heights Complex',
    startDate: '2023-01-15',
    completionDate: '2024-06-30',
    address: '1240 Sunset Blvd',
    budget: 1200000,
    status: ProjectStatus.IN_PROGRESS,
    client: 'Apex Dev',
    spent: 450000,
    completionPercentage: 45
  },
  {
    id: '2',
    name: 'Downtown Office Reno',
    startDate: '2023-06-01',
    completionDate: '2023-12-15',
    address: '445 Main St',
    budget: 85000,
    status: ProjectStatus.PLANNING,
    client: 'TechSpace',
    spent: 0,
    completionPercentage: 0
  },
  {
    id: '3',
    name: 'Riverside Luxury Homes',
    startDate: '2023-03-10',
    completionDate: '2024-08-20',
    address: '88 River Rd',
    budget: 2500000,
    status: ProjectStatus.IN_PROGRESS,
    client: 'Private',
    spent: 1200000,
    completionPercentage: 55
  },
];

export const MOCK_WORKERS: Worker[] = [
  { id: 'w1', workerId: 'W-101', name: 'Rajesh Kumar', projectId: '1', designation: 'Mason', joiningDate: '2023-02-01', serialNo: 1 },
  { id: 'w2', workerId: 'W-102', name: 'Sunil Singh', projectId: '1', designation: 'Helper', joiningDate: '2023-02-05', serialNo: 2 },
  { id: 'w3', workerId: 'W-103', name: 'Amit Patel', projectId: '3', designation: 'Carpenter', joiningDate: '2023-03-15', serialNo: 1 },
];

export const MOCK_BILLS: Bill[] = [
  { id: 'b1', serialNo: 1, projectId: '1', billNo: 'INV-001', workNature: 'Foundation Work', amount: 50000, gstRate: 18, gstAmount: 9000, grandTotal: 59000, billingMonth: '2023-02', certifyDate: '2023-02-28' },
  { id: 'b2', serialNo: 2, projectId: '1', billNo: 'INV-002', workNature: 'Ground Floor Slab', amount: 75000, gstRate: 18, gstAmount: 13500, grandTotal: 88500, billingMonth: '2023-03', certifyDate: '2023-03-30' },
  { id: 'b3', serialNo: 1, projectId: '3', billNo: 'RV-001', workNature: 'Mobilization', amount: 100000, gstRate: 12, gstAmount: 12000, grandTotal: 112000, billingMonth: '2023-03', certifyDate: '2023-03-15' },
];

export const MOCK_CLIENT_PAYMENTS: ClientPayment[] = [
  { id: 'cp1', projectId: '1', amount: 40000, date: '2023-03-10', remarks: 'Part payment for INV-001' },
  { id: 'cp2', projectId: '1', amount: 50000, date: '2023-04-05', remarks: 'Full payment for INV-002' },
  { id: 'cp3', projectId: '3', amount: 50000, date: '2023-03-20', remarks: 'Advance for mobilization' },
];

export const MOCK_PURCHASES: PurchaseEntry[] = [
  { id: 'p1', serialNo: 1, projectId: '1', description: 'UltraTech Cement', unit: 'Bags', quantity: 50, rate: 420, totalAmount: 21000, date: '2023-02-15' },
  { id: 'p2', serialNo: 2, projectId: '1', description: 'River Sand', unit: 'Brass', quantity: 5, rate: 6500, totalAmount: 32500, date: '2023-02-18' },
  { id: 'p3', serialNo: 1, projectId: '3', description: 'Steel 10mm', unit: 'Kg', quantity: 500, rate: 65, totalAmount: 32500, date: '2023-03-01' },
];

export const MOCK_KHARCHI: KharchiEntry[] = [
  { id: 'k1', workerId: 'w1', projectId: '1', date: '2024-01-07', amount: 500 },
  { id: 'k2', workerId: 'w1', projectId: '1', date: '2024-01-14', amount: 500 },
  { id: 'k3', workerId: 'w2', projectId: '1', date: '2024-01-07', amount: 300 },
];

export const MOCK_ADVANCES: AdvanceEntry[] = [
  { id: 'a1', serialNo: 1, workerId: 'w1', projectId: '1', amount: 2000, paidBy: 'Site Supervisor', remarks: 'Medical Emergency', date: '2024-01-10', paymentMode: 'Cash' }
];

export const MOCK_RESOURCES: Resource[] = [
  { id: 'r1', name: 'JCB Excavator', type: 'Equipment', status: 'In Use', assignedTo: '1', costPerDay: 500 },
  { id: 'r2', name: 'Concrete Mixer', type: 'Equipment', status: 'Available', costPerDay: 100 },
  { id: 'r3', name: 'General Labor Team A', type: 'Labor', status: 'In Use', assignedTo: '1', costPerDay: 800 },
];

export const MOCK_EXECUTION: ExecutionLevel[] = [
  { 
    id: 'e1', projectId: '1', levelName: '10th Floor', 
    pours: [
        { date: '2025-08-28', cycle: 20 },
        { date: '2025-08-30', cycle: 18 },
        { date: '2025-09-04', cycle: 13 }
    ]
  },
  { 
    id: 'e2', projectId: '1', levelName: '9th Floor', 
    pours: [
        { date: '2025-08-08', cycle: 18 },
        { date: '2025-08-12', cycle: 18 },
        { date: '2025-08-22', cycle: 23 }
    ]
  },
  { 
    id: 'e3', projectId: '1', levelName: '8th Floor', 
    pours: [
        { date: '2025-07-21', cycle: 17 },
        { date: '2025-07-25', cycle: 18 },
        { date: '2025-07-30', cycle: undefined }
    ]
  },
  { 
    id: 'e4', projectId: '1', levelName: '7th Floor', 
    pours: [
        { date: '2025-07-04', cycle: 25 },
        { date: '2025-07-07', cycle: undefined }
    ]
  },
  { 
    id: 'e5', projectId: '1', levelName: '6th Floor', 
    pours: [
        { date: '2025-06-09', cycle: 101 },
        { date: '', cycle: undefined }, // Skip pour 2
        { date: '2025-06-26', cycle: 127 }
    ]
  },
];

export const MOCK_MESS_ENTRIES: MessEntry[] = [
  {
    id: 'm1',
    projectId: '1',
    weekStartDate: '2025-10-05',
    weekEndDate: '2025-10-11',
    workerCount: 32,
    rate: 750,
    totalAmount: 24000, // 32 * 750
    amountPaid: 24000,
    otherExpenses: 535,
    otherExpensesDesc: 'Ekram(5days)',
    balance: 535, // 24000 - 24000 + 535
    remarks: ''
  }
];