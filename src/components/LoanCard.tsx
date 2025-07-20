import React from 'react';
import { Loan, Payment } from '../types';
import { formatCurrency, formatDate, calculateInterestDue, calculateMonthlyInterest, getInterestStatus, calculateScheduledInterest } from '../utils/calculations';
import { Calendar, Percent, DollarSign, Send, Phone, FileText } from 'lucide-react';

interface LoanCardProps {
  loan: Loan;
  payments: Payment[];
  onAddPayment: (loanId: string, type: 'principal' | 'interest') => void;
  onMarkInterestPaid: (loanId: string) => void;
  onSendAlert?: (loanId: string, alertType: 'reminder' | 'overdue') => void;
  onViewStatement?: (loanId: string) => void;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan, payments, onAddPayment, onMarkInterestPaid, onSendAlert, onViewStatement }) => {
  const interestDue = calculateInterestDue(loan, payments);
  const scheduledInterest = calculateScheduledInterest(loan.currentBalance, loan.interestRate, loan.interestType, loan.paymentSchedule);
  const interestStatus = getInterestStatus(loan, payments);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingBalance = loan.currentBalance;

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    paid: 'bg-blue-100 text-blue-800',
    overdue: 'bg-red-100 text-red-800',
  };

  const typeColors = {
    lent: 'border-green-200 bg-green-50',
    borrowed: 'border-red-200 bg-red-50',
  };

  return (
    <div className={`rounded-lg border-2 ${typeColors[loan.type]} p-6 mb-4`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[loan.status]}`}>
              {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
            </span>
            <span className="text-sm text-gray-600">
              {loan.type === 'lent' ? 'Lent to' : 'Borrowed from'} {loan.personName}
            </span>
            {loan.personPhone && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Phone size={12} />
                <span>{loan.personPhone}</span>
              </div>
            )}
          </div>
          {loan.personPhone && onSendAlert && (
            <button
              onClick={() => onSendAlert(loan.id, interestStatus.status === 'overdue' ? 'overdue' : 'reminder')}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              <Send size={12} />
              <span>Send Alert</span>
            </button>
          )}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <DollarSign size={16} className="text-gray-400" />
              <span>Original: {formatCurrency(loan.amount)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Percent size={16} className="text-gray-400" />
              <span>{loan.interestRate}% yearly ({loan.interestType}) - {loan.paymentSchedule}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-400" />
              <span>Started: {formatDate(loan.startDate)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign size={16} className="text-gray-400" />
              <span>Balance: {formatCurrency(remainingBalance)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign size={16} className="text-green-400" />
              <span>Interest Paid: {formatCurrency(loan.totalInterestPaid || 0)}</span>
            </div>
            <div className="flex items-center space-x-2 col-span-2">
              <Percent size={16} className="text-blue-400" />
              <span>{(loan.paymentSchedule || 'monthly').charAt(0).toUpperCase() + (loan.paymentSchedule || 'monthly').slice(1)} Interest: {formatCurrency(scheduledInterest)}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(remainingBalance)}
          </div>
          <div className="text-sm text-gray-600">Remaining</div>
        </div>
      </div>

      {(interestDue > 0 || interestStatus.status !== 'paid') && (
        <div className={`rounded-lg p-3 mb-4 ${
          interestStatus.status === 'overdue' 
            ? 'bg-red-50 border border-red-200' 
            : interestStatus.status === 'due'
            ? 'bg-yellow-50 border border-yellow-200'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <div className={`text-sm font-medium ${
                interestStatus.status === 'overdue' 
                  ? 'text-red-800' 
                  : interestStatus.status === 'due'
                  ? 'text-yellow-800'
                  : 'text-blue-800'
              }`}>
                {interestDue > 0 ? `Interest Due: ${formatCurrency(interestDue)}` : 'Interest Status'}
              </div>
              <div className={`text-xs mt-1 ${
                interestStatus.status === 'overdue' 
                  ? 'text-red-600' 
                  : interestStatus.status === 'due'
                  ? 'text-yellow-600'
                  : 'text-blue-600'
              }`}>
                {interestStatus.message}
              </div>
            </div>
            {interestDue > 0 && (
              <button
                onClick={() => onAddPayment(loan.id, 'interest')}
                className={`px-3 py-1 text-white rounded-md text-sm transition-colors ${
                  interestStatus.status === 'overdue' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                Pay Interest
              </button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex space-x-2">
        <button
          onClick={() => onAddPayment(loan.id, 'principal')}
          disabled={loan.status === 'paid'}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            loan.status === 'paid' 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loan.status === 'paid' ? 'Loan Settled' : 'Add Principal Payment'}
        </button>
        <button
          onClick={() => onAddPayment(loan.id, 'interest')}
          disabled={loan.status === 'paid'}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            loan.status === 'paid' 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {loan.status === 'paid' ? 'Settled' : 'Add Interest Payment'}
        </button>
        {loan.personPhone && onSendAlert && (
          <button
            onClick={() => onSendAlert(loan.id, 'reminder')}
            className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center space-x-1"
          >
            <Send size={16} />
            <span className="hidden sm:inline">Alert</span>
          </button>
        )}
        </div>
        
        {onViewStatement && (
          <button
            onClick={() => onViewStatement(loan.id)}
            className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
          >
            <FileText size={16} />
            <span>View Detailed Statement</span>
          </button>
        )}
      </div>

      {loan.notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{loan.notes}</p>
        </div>
      )}
    </div>
  );
};

export default LoanCard;