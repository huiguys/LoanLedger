import React from 'react';
import { Loan, Payment } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';
import { FileText, Calendar, DollarSign, TrendingDown, CheckCircle, X } from 'lucide-react';

interface LoanStatementProps {
  loan: Loan;
  payments: Payment[];
  isOpen: boolean;
  onClose: () => void;
}

const LoanStatement: React.FC<LoanStatementProps> = ({ loan, payments, isOpen, onClose }) => {
  if (!isOpen) return null;

  const principalPayments = payments.filter(p => p.type === 'principal').sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const interestPayments = payments.filter(p => p.type === 'interest').sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const totalPrincipalPaid = principalPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalInterestPaid = interestPayments.reduce((sum, p) => sum + p.amount, 0);

  const getScheduleText = (schedule: string) => {
    switch (schedule) {
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly (Every 3 months)';
      case 'yearly': return 'Yearly';
      default: return schedule;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: TrendingDown, text: 'Active' },
      paid: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Settled - Closed' },
      overdue: { color: 'bg-red-100 text-red-800', icon: Calendar, text: 'Overdue' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon size={16} className="mr-1" />
        {config.text}
        {loan.settlementDate && status === 'paid' && (
          <span className="ml-2 text-xs">({formatDate(loan.settlementDate)})</span>
        )}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <FileText size={24} className="text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Loan Statement</h2>
              <p className="text-sm text-gray-600">{loan.personName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Loan Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Summary</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan Type:</span>
                  <span className="font-medium capitalize">{loan.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Original Amount:</span>
                  <span className="font-medium">{formatCurrency(loan.originalAmount || loan.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interest Rate:</span>
                  <span className="font-medium">{loan.interestRate}% yearly ({loan.interestType})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Schedule:</span>
                  <span className="font-medium">{getScheduleText(loan.paymentSchedule)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium">{formatDate(loan.startDate)}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Status:</span>
                  <div>{getStatusBadge(loan.status)}</div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Outstanding Balance:</span>
                  <span className={`font-medium ${loan.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(loan.currentBalance)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Principal Paid:</span>
                  <span className="font-medium text-blue-600">{formatCurrency(totalPrincipalPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest Paid:</span>
                  <span className="font-medium text-green-600">{formatCurrency(totalInterestPaid)}</span>
                </div>
                {loan.settlementDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Settlement Date:</span>
                    <span className="font-medium">{formatDate(loan.settlementDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Principal Payment History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Principal Payment History</h3>
            {principalPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <DollarSign size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No principal payments recorded</p>
              </div>
            ) : (
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Paid</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remaining Balance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {principalPayments.map((payment, index) => (
                      <tr key={payment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatDate(payment.date)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-blue-600">{formatCurrency(payment.amount)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(payment.remainingBalance)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 capitalize">{payment.method}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{payment.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Interest Payment History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Interest Payment History</h3>
            {interestPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No interest payments recorded</p>
              </div>
            ) : (
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Paid</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {interestPayments.map((payment, index) => (
                      <tr key={payment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatDate(payment.date)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-green-600">{formatCurrency(payment.amount)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 capitalize">{payment.method}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{payment.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Notes */}
          {loan.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Notes</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-700">{loan.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Statement generated on {formatDate(new Date().toISOString())}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Close Statement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanStatement;