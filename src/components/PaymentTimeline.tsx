import React from 'react';
import { Payment } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';
import { Calendar, Receipt, FileText } from 'lucide-react';

interface PaymentTimelineProps {
  payments: Payment[];
}

const PaymentTimeline: React.FC<PaymentTimelineProps> = ({ payments }) => {
  const sortedPayments = [...payments].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getPaymentMethodIcon = (method: Payment['method']) => {
    const methodIcons = {
      cash: '💵',
      gpay: '📱',
      phonepe: '📱',
      paytm: '📱',
      upi: '📱',
      bank: '🏦',
    };
    return methodIcons[method] || '💳';
  };

  const getPaymentTypeColor = (type: Payment['type']) => {
    return type === 'principal' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  if (sortedPayments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
        <p>No payments recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
      <div className="space-y-3">
        {sortedPayments.map((payment) => (
          <div key={payment.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeColor(payment.type)}`}>
                    {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
                  </span>
                  <span className="text-sm text-gray-600">
                    {getPaymentMethodIcon(payment.method)} {payment.method.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>{formatDate(payment.date)}</span>
                  </div>
                  {payment.receiptFile && (
                    <div className="flex items-center space-x-1">
                      <Receipt size={14} />
                      <span>Receipt attached</span>
                    </div>
                  )}
                </div>
                {payment.notes && (
                  <p className="text-sm text-gray-600 mt-2">{payment.notes}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(payment.amount)}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(payment.createdAt)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentTimeline;