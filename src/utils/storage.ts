import { Person, Loan, Payment, Alert } from '../types';

const STORAGE_KEYS = {
  PERSONS: 'loanleder_persons',
  LOANS: 'loanleder_loans',
  PAYMENTS: 'loanleder_payments',
  ALERTS: 'loanleder_alerts',
  SMS_TEMPLATES: 'loanleder_sms_templates',
  NOTIFICATION_SETTINGS: 'loanleder_notification_settings',
};

export const storage = {
  // Persons
  getPersons: (): Person[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PERSONS);
    return data ? JSON.parse(data) : [];
  },
  
  setPersons: (persons: Person[]) => {
    localStorage.setItem(STORAGE_KEYS.PERSONS, JSON.stringify(persons));
  },
  
  // Loans
  getLoans: (): Loan[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LOANS);
    return data ? JSON.parse(data) : [];
  },
  
  setLoans: (loans: Loan[]) => {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  },
  
  // Payments
  getPayments: (): Payment[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return data ? JSON.parse(data) : [];
  },
  
  setPayments: (payments: Payment[]) => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  },
  
  // Alerts
  getAlerts: (): Alert[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return data ? JSON.parse(data) : [];
  },
  
  setAlerts: (alerts: Alert[]) => {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  },
  
  // Clear all data
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};