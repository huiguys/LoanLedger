import React from 'react';
import { Person } from '../types';
import { formatCurrency } from '../utils/calculations';
import { User, ArrowUpRight, ArrowDownRight, Phone } from 'lucide-react';

interface PersonCardProps {
  person: Person;
  onClick: (personId: string) => void;
}

const PersonCard: React.FC<PersonCardProps> = ({ person, onClick }) => {
  const netAmount = person.totalLent - person.totalBorrowed;
  const isPositive = netAmount > 0;

  return (
    <div
      className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(person.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{person.name}</h3>
            {person.phoneNumber && (
              <div className="flex items-center space-x-1 text-xs text-gray-500 mb-1">
                <Phone size={12} />
                <span>{person.phoneNumber}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {person.totalLent > 0 && (
                <span className="flex items-center space-x-1">
                  <ArrowUpRight size={14} className="text-green-600" />
                  <span>Lent: {formatCurrency(person.totalLent)}</span>
                </span>
              )}
              {person.totalBorrowed > 0 && (
                <span className="flex items-center space-x-1">
                  <ArrowDownRight size={14} className="text-red-600" />
                  <span>Borrowed: {formatCurrency(person.totalBorrowed)}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(netAmount))}
          </div>
          <div className="text-sm text-gray-500">
            {isPositive ? 'You are owed' : 'You owe'}
          </div>
          {person.totalInterestDue > 0 && (
            <div className="text-sm text-yellow-600 mt-1">
              Interest: {formatCurrency(person.totalInterestDue)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonCard;