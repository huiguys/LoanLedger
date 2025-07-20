import { Loan, Payment } from '../types';

export const calculateScheduledInterest = (principal: number, yearlyRate: number, interestType: 'simple' | 'compound', schedule: 'monthly' | 'quarterly' | 'yearly'): number => {
  const periods = schedule === 'monthly' ? 12 : schedule === 'quarterly' ? 4 : 1;
  
  if (interestType === 'simple') {
    return (principal * yearlyRate) / (periods * 100);
  } else {
    const periodRate = yearlyRate / (periods * 100);
    return principal * periodRate;
  }
};
export const calculateSimpleInterest = (principal: number, yearlyRate: number, timeInMonths: number): number => {
  return (principal * yearlyRate * timeInMonths) / (12 * 100);
};

export const calculateCompoundInterest = (principal: number, yearlyRate: number, timeInMonths: number): number => {
  const monthlyRate = yearlyRate / (12 * 100);
  return principal * (Math.pow(1 + monthlyRate, timeInMonths) - 1);
};

export const calculateMonthlyInterest = (principal: number, yearlyRate: number, interestType: 'simple' | 'compound'): number => {
  if (interestType === 'simple') {
    return (principal * yearlyRate) / (12 * 100);
  } else {
    const monthlyRate = yearlyRate / (12 * 100);
    return principal * monthlyRate;
  }
};

export const calculateInterestDue = (loan: Loan, payments: Payment[]): number => {
  if (loan.status !== 'active') return 0;
  
  const startDate = new Date(loan.startDate);
  const currentDate = new Date();
  
  // Calculate months elapsed since loan start
  const monthsElapsed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)); // More accurate month calculation
  
  if (monthsElapsed < 1) return 0; // No interest due in first month
  
  const interestPaid = payments
    .filter(p => p.type === 'interest')
    .reduce((sum, p) => sum + p.amount, 0);
  
  // Calculate monthly interest amount
  const monthlyInterest = calculateScheduledInterest(loan.currentBalance, loan.interestRate, loan.interestType, loan.paymentSchedule);
  
  // Total interest that should have been paid by now
  const totalInterestDue = monthlyInterest * monthsElapsed;
  
  // Outstanding interest (unpaid previous months + current month if due)
  return Math.max(0, totalInterestDue - interestPaid);
};

export const getInterestStatus = (loan: Loan, payments: Payment[]) => {
  if (loan.status !== 'active') return { status: 'paid', monthsOverdue: 0, nextDueDate: null };
  
  const startDate = new Date(loan.startDate);
  const currentDate = new Date();
  
  // Calculate months elapsed since loan start
  const monthsElapsed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  
  if (monthsElapsed < 1) {
    // Calculate next due date (1 month from start)
    const nextDue = new Date(startDate);
    nextDue.setMonth(nextDue.getMonth() + 1);
    return { 
      status: 'upcoming', 
      monthsOverdue: 0, 
      nextDueDate: nextDue.toISOString().split('T')[0],
      message: `First interest payment due on ${formatDate(nextDue.toISOString())}`
    };
  }
  
  const interestPaid = payments
    .filter(p => p.type === 'interest')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const monthlyInterest = calculateScheduledInterest(loan.currentBalance, loan.interestRate, loan.interestType, loan.paymentSchedule);
  const totalInterestDue = monthlyInterest * monthsElapsed;
  const outstandingInterest = totalInterestDue - interestPaid;
  
  // Calculate how many months of interest are overdue
  const monthsOverdue = Math.floor(outstandingInterest / monthlyInterest);
  
  // Calculate next due date
  const nextDue = new Date(startDate);
  nextDue.setMonth(nextDue.getMonth() + monthsElapsed + 1);
  
  if (outstandingInterest <= monthlyInterest * 0.1) { // Small tolerance for rounding
    return { 
      status: 'current', 
      monthsOverdue: 0, 
      nextDueDate: nextDue.toISOString().split('T')[0],
      message: `Next interest payment due on ${formatDate(nextDue.toISOString())}`
    };
  } else if (monthsOverdue >= 1) {
    return { 
      status: 'overdue', 
      monthsOverdue, 
      nextDueDate: nextDue.toISOString().split('T')[0],
      message: `${monthsOverdue} month${monthsOverdue > 1 ? 's' : ''} overdue + current month due`
    };
  } else {
    return { 
      status: 'due', 
      monthsOverdue: 0, 
      nextDueDate: nextDue.toISOString().split('T')[0],
      message: `Current month interest due`
    };
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};