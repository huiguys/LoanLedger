import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import LoanCard from '../components/LoanCard';
import LoanStatement from '../components/LoanStatement';
import PaymentModal from '../components/PaymentModal';
import PaymentTimeline from '../components/PaymentTimeline';
import { ArrowLeft, User, Plus, Send, Phone, FileText } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

interface PersonProfileProps {
  personId: string;
  onNavigate: (page: string) => void;
}

const PersonProfile: React.FC<PersonProfileProps> = ({ personId, onNavigate }) => {
  const { 
    getPersonById, 
    getLoansByPersonId, 
    getPaymentsByLoanId, 
    addPayment, 
    updateLoan 
  } = useData();
  
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    loanId: string;
    type: 'principal' | 'interest';
  }>({
    isOpen: false,
    loanId: '',
    type: 'principal',
  });

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    loanId: string;
    alertType: 'reminder' | 'overdue';
  }>({
    isOpen: false,
    loanId: '',
    alertType: 'reminder',
  });
  
  const [statementModal, setStatementModal] = useState<{
    isOpen: boolean;
    loanId: string;
  }>({
    isOpen: false,
    loanId: '',
  });
  const person = getPersonById(personId);
  const loans = getLoansByPersonId(personId);

  if (!person) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Person not found</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleAddPayment = (loanId: string, type: 'principal' | 'interest') => {
    setPaymentModal({ isOpen: true, loanId, type });
  };

  const handleSavePayment = (payment: any) => {
    const newPayment = {
      ...payment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    addPayment(newPayment);
  };

  const handleSendAlert = (loanId: string, alertType: 'reminder' | 'overdue') => {
    setAlertModal({ isOpen: true, loanId, alertType });
  };

  const handleViewStatement = (loanId: string) => {
    setStatementModal({ isOpen: true, loanId });
  };
  const handleSendSMS = async (message: string) => {
    const loan = loans.find(l => l.id === alertModal.loanId);
    if (!loan || !loan.personPhone) return;

    try {
      // Simulate SMS sending (replace with actual SMS service)
      console.log(`Sending SMS to ${loan.personPhone}: ${message}`);
      
      // Show success message
      alert(`SMS sent successfully to ${loan.personName} (${loan.personPhone})`);
      
      // Close modal
      setAlertModal(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      alert('Failed to send SMS. Please try again.');
    }
  };
  const handleMarkInterestPaid = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;
    
    // Calculate monthly interest amount
    const monthlyInterest = loan.amount * loan.interestRate / (12 * 100);
    
    const interestPayment = {
      id: Date.now().toString(),
      loanId,
      amount: monthlyInterest,
      date: new Date().toISOString().split('T')[0],
      type: 'interest' as const,
      method: 'cash' as const,
      notes: 'Monthly interest payment',
      createdAt: new Date().toISOString(),
    };
    addPayment(interestPayment);
  };

  const allPayments = loans.flatMap(loan => 
    getPaymentsByLoanId(loan.id).map(payment => ({
      ...payment,
      loanInfo: loan,
    }))
  );

  const netAmount = person.totalLent - person.totalBorrowed;
  const isPositive = netAmount > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <User size={24} className="text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{person.name}</h1>
              {person.phoneNumber && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <Phone size={16} />
                  <span>{person.phoneNumber}</span>
                </div>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Total Lent: {formatCurrency(person.totalLent)}</span>
                <span>Total Borrowed: {formatCurrency(person.totalBorrowed)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(netAmount))}
          </div>
          <div className="text-sm text-gray-600">
            {isPositive ? 'You are owed' : 'You owe'}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Loans</h2>
            <button
              onClick={() => onNavigate('add-loan')}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              <span>Add Loan</span>
            </button>
          </div>
          
          {loans.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No loans found for this person</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  payments={getPaymentsByLoanId(loan.id)}
                  onAddPayment={handleAddPayment}
                  onMarkInterestPaid={handleMarkInterestPaid}
                  onSendAlert={handleSendAlert}
                  onViewStatement={handleViewStatement}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <PaymentTimeline payments={allPayments} />
        </div>
      </div>

      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal(prev => ({ ...prev, isOpen: false }))}
        onSave={handleSavePayment}
        loanId={paymentModal.loanId}
        paymentType={paymentModal.type}
        loan={loans.find(l => l.id === paymentModal.loanId)}
      />

      {/* SMS Alert Modal */}
      {alertModal.isOpen && (
        <SMSAlertModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
          onSend={handleSendSMS}
          loan={loans.find(l => l.id === alertModal.loanId)}
          alertType={alertModal.alertType}
        />
      )}
      
      {/* Loan Statement Modal */}
      <LoanStatement
        isOpen={statementModal.isOpen}
        onClose={() => setStatementModal(prev => ({ ...prev, isOpen: false }))}
        loan={loans.find(l => l.id === statementModal.loanId)!}
        payments={statementModal.loanId ? getPaymentsByLoanId(statementModal.loanId) : []}
      />
    </div>
  );
};

// SMS Alert Modal Component
interface SMSAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
  loan: any;
  alertType: 'reminder' | 'overdue';
}

const SMSAlertModal: React.FC<SMSAlertModalProps> = ({ isOpen, onClose, onSend, loan, alertType }) => {
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  React.useEffect(() => {
    if (loan && isOpen) {
      const templates = {
        reminder: `Hi ${loan.personName}, this is a friendly reminder that your monthly interest payment of ₹${Math.round((loan.amount * loan.interestRate) / (12 * 100))} is due. Please make the payment at your earliest convenience. Thank you!`,
        overdue: `Hi ${loan.personName}, your interest payment of ₹${Math.round((loan.amount * loan.interestRate) / (12 * 100))} is overdue. Please make the payment as soon as possible to avoid any inconvenience. Thank you!`,
      };
      setMessage(templates[alertType]);
      setSelectedTemplate(alertType);
    }
  }, [loan, alertType, isOpen]);

  const templates = [
    {
      id: 'reminder',
      name: 'Payment Reminder',
      template: loan ? `Hi ${loan.personName}, this is a friendly reminder that your monthly interest payment of ₹${Math.round((loan.amount * loan.interestRate) / (12 * 100))} is due. Please make the payment at your earliest convenience. Thank you!` : '',
    },
    {
      id: 'overdue',
      name: 'Overdue Payment',
      template: loan ? `Hi ${loan.personName}, your interest payment of ₹${Math.round((loan.amount * loan.interestRate) / (12 * 100))} is overdue. Please make the payment as soon as possible to avoid any inconvenience. Thank you!` : '',
    },
    {
      id: 'custom',
      name: 'Custom Message',
      template: '',
    },
  ];

  if (!isOpen || !loan) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Send SMS Alert</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Sending to: <strong>{loan.personName}</strong> ({loan.personPhone})
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => {
                setSelectedTemplate(e.target.value);
                const template = templates.find(t => t.id === e.target.value);
                if (template) {
                  setMessage(template.template);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message ({message.length}/160)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              maxLength={160}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your message..."
            />
          </div>
        </div>

        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSend(message)}
              disabled={!message.trim()}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Send size={16} />
              <span>Send SMS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonProfile;