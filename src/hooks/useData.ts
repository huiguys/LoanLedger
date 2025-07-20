import { useState, useEffect } from 'react';
import { Person, Loan, Payment, Alert, Statistics } from '../types';
import { storage } from '../utils/storage';
import { calculateInterestDue } from '../utils/calculations';

export const useData = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    try {
      const storedPersons = storage.getPersons();
      const storedLoans = storage.getLoans();
      const storedPayments = storage.getPayments();
      const storedAlerts = storage.getAlerts();

      setPersons(storedPersons);
      setLoans(storedLoans);
      setPayments(storedPayments);
      setAlerts(storedAlerts);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPerson = (person: Person) => {
    const updatedPersons = [...persons, person];
    setPersons(updatedPersons);
    storage.setPersons(updatedPersons);
  };

  const updatePerson = (personId: string, updates: Partial<Person>) => {
    const updatedPersons = persons.map(p => 
      p.id === personId ? { ...p, ...updates } : p
    );
    setPersons(updatedPersons);
    storage.setPersons(updatedPersons);
    
    // Update phone number in related loans
    if (updates.phoneNumber !== undefined) {
      const updatedLoans = loans.map(l => 
        l.personId === personId ? { ...l, personPhone: updates.phoneNumber } : l
      );
      setLoans(updatedLoans);
      storage.setLoans(updatedLoans);
    }
  };

  const addLoan = (loan: Loan) => {
    const updatedLoans = [...loans, loan];
    setLoans(updatedLoans);
    storage.setLoans(updatedLoans);
  };

  const updateLoan = (loanId: string, updates: Partial<Loan>) => {
    const updatedLoans = loans.map(l => 
      l.id === loanId ? { ...l, ...updates } : l
    );
    setLoans(updatedLoans);
    storage.setLoans(updatedLoans);
  };

  const addPayment = (payment: Payment) => {
    const updatedPayments = [...payments, payment];
    setPayments(updatedPayments);
    storage.setPayments(updatedPayments);

    // Update loan balance if it's a principal payment
    if (payment.type === 'principal') {
      const loan = loans.find(l => l.id === payment.loanId);
      if (loan) {
        const newBalance = loan.currentBalance - payment.amount;
        const isSettled = newBalance <= 0;
        const updates: Partial<Loan> = {
          currentBalance: newBalance,
          status: isSettled ? 'paid' : 'active'
        };
        
        if (isSettled) {
          updates.settlementDate = new Date().toISOString().split('T')[0];
        }
        
        updateLoan(payment.loanId, updates);
      }
    } else if (payment.type === 'interest') {
      // Update total interest paid
      const loan = loans.find(l => l.id === payment.loanId);
      if (loan) {
        updateLoan(payment.loanId, {
          totalInterestPaid: (loan.totalInterestPaid || 0) + payment.amount
        });
      }
    }
  };

  const getStatistics = (): Statistics => {
    const totalLent = loans
      .filter(l => l.type === 'lent')
      .reduce((sum, l) => sum + l.amount, 0);
    
    const totalBorrowed = loans
      .filter(l => l.type === 'borrowed')
      .reduce((sum, l) => sum + l.amount, 0);
    
    const interestPending = loans
      .filter(l => l.status === 'active')
      .reduce((sum, loan) => {
        const loanPayments = payments.filter(p => p.loanId === loan.id);
        return sum + calculateInterestDue(loan, loanPayments);
      }, 0);

    return {
      totalLent,
      totalBorrowed,
      interestPending,
      activeLoans: loans.filter(l => l.status === 'active').length,
      totalPersons: persons.length,
    };
  };

  const getPersonById = (personId: string): Person | undefined => {
    return persons.find(p => p.id === personId);
  };

  const getLoansByPersonId = (personId: string): Loan[] => {
    return loans.filter(l => l.personId === personId);
  };

  const getPaymentsByLoanId = (loanId: string): Payment[] => {
    return payments.filter(p => p.loanId === loanId);
  };

  return {
    persons,
    loans,
    payments,
    alerts,
    loading,
    addPerson,
    updatePerson,
    addLoan,
    updateLoan,
    addPayment,
    getStatistics,
    getPersonById,
    getLoansByPersonId,
    getPaymentsByLoanId,
    loadData,
  };
};