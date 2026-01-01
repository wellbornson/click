import Dexie, { Table } from 'dexie';

export interface UserEntry {
  id?: number;
  date: string; // ISO string for indexing
  description: string;
  amount: number;
  timestamp: number;
}

export interface WorkerEntry {
  id?: number;
  date: string;
  name: string;
  type: 'salary' | 'advance' | 'deduction';
  amount: number;
  timestamp: number;
}

export interface ExpenseEntry {
  id?: number;
  date: string;
  category: 'Rent' | 'Bills' | 'Maintenance' | 'Others';
  description: string;
  amount: number;
  timestamp: number;
}

export class ClickDatabase extends Dexie {
  user!: Table<UserEntry>;
  worker!: Table<WorkerEntry>;
  expense!: Table<ExpenseEntry>;

  constructor() {
    super('ClickDatabase');
    this.version(1).stores({
      user: '++id, date, timestamp',
      worker: '++id, date, name, type, timestamp',
      expense: '++id, date, category, timestamp'
    });
  }
}

export const db = new ClickDatabase();
