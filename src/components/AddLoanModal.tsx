import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Loan } from '../types';

interface AddLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (loan: Omit<Loan, 'id' | 'createdAt'>) => void;
  existingPersons: string[];
}

const AddLoanModal: React.FC<AddLoanModalProps> = ({ isOpen, onClose, onSave, existingPersons }) => {
  const [formData, setFormData] = useState({
    personName: '',
    personPhone: '',
    type: 'lent' as 'lent' | 'borrowed',
    amount: '',
    interestRate: '',
    interestType: 'simple' as 'simple' | 'compound',
    paymentSchedule: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
  });

  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.personName || !formData.amount || !formData.interestRate) return;

    // Check for duplicate names
    const isDuplicate = existingPersons.includes(formData.personName.toLowerCase());
    if (isDuplicate && !showDuplicateWarning) {
      setShowDuplicateWarning(true);
      return;
    }

    const loan: Omit<Loan, 'id' | 'createdAt'> = {
      personId: '', // Will be set by parent component
      personName: formData.personName,
      personPhone: formData.personPhone || undefined,
      type: formData.type,
      amount: parseFloat(formData.amount),
      currentBalance: parseFloat(formData.amount),
      originalAmount: parseFloat(formData.amount),
      interestRate: parseFloat(formData.interestRate),
      interestType: formData.interestType,
      paymentSchedule: formData.paymentSchedule,
      startDate: formData.startDate,
      dueDate: formData.dueDate || undefined,
      notes: formData.notes || undefined,
      status: 'active',
      totalInterestPaid: 0,
    };

    onSave(loan);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      personName: '',
      personPhone: '',
      type: 'lent',
      amount: '',
      interestRate: '',
      interestType: 'simple',
      paymentSchedule: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      notes: '',
    });
    setShowDuplicateWarning(false);
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'personName') {
      setShowDuplicateWarning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Loan</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Person Name *
              </label>
              <input
                type="text"
                value={formData.personName}
                onChange={(e) => handleChange('personName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter person's name"
                required
              />
              {showDuplicateWarning && (
                <p className="text-sm text-yellow-600 mt-1">
                  This name already exists. Continue to add another loan for this person.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={formData.personPhone}
                onChange={(e) => handleChange('personPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+91 9876543210"
              />
              <p className="text-xs text-gray-500 mt-1">
                Phone number for SMS payment reminders
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="lent">Lent (I gave money)</option>
                <option value="borrowed">Borrowed (I received money)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (% yearly) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={(e) => handleChange('interestRate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Type
                </label>
                <select
                  value={formData.interestType}
                  onChange={(e) => handleChange('interestType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="simple">Simple</option>
                  <option value="compound">Compound</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Schedule *
              </label>
              <select
                value={formData.paymentSchedule}
                onChange={(e) => handleChange('paymentSchedule', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly (Every 3 months)</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any notes..."
              />
            </div>
          </form>
        </div>

        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Loan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLoanModal;