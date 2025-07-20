export interface Person {
  id: string;
  name: string;
  phoneNumber?: string;
  tags?: string[];
  totalLent: number;
  totalBorrowed: number;
  totalInterestPaid: number;
  totalInterestDue: number;
}

export interface Loan {
  id: string;
  personId: string;
  personName: string;
  personPhone?: string;
  type: 'borrowed' | 'lent';
  amount: number;
  currentBalance: number;
  interestRate: number;
  interestType: 'simple' | 'compound';
  paymentSchedule: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  dueDate?: string;
  settlementDate?: string;
  notes?: string;
  status: 'active' | 'paid' | 'overdue';
  tags?: string[];
  createdAt: string;
  totalInterestPaid: number;
  originalAmount: number;
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  type: 'principal' | 'interest';
  principalPortion?: number;
  interestPortion?: number;
  remainingBalance: number;
  method: 'cash' | 'gpay' | 'phonepe' | 'paytm' | 'upi' | 'bank';
  notes?: string;
  receiptFile?: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  loanId: string;
  personId: string;
  personName: string;
  personPhone?: string;
  type: 'due' | 'overdue' | 'reminder';
  message: string;
  date: string;
  status: 'pending' | 'sent' | 'acknowledged';
  smsStatus?: 'pending' | 'sent' | 'failed';
}

export interface Statistics {
  totalLent: number;
  totalBorrowed: number;
  interestPending: number;
  activeLoans: number;
  totalPersons: number;
}

export interface SMSTemplate {
  id: string;
  name: string;
  type: 'payment_due' | 'payment_overdue' | 'payment_received' | 'loan_created';
  template: string;
  isDefault: boolean;
}

export interface NotificationSettings {
  smsEnabled: boolean;
  emailEnabled: boolean;
  reminderDaysBefore: number;
  overdueReminderFrequency: 'daily' | 'weekly' | 'monthly';
}