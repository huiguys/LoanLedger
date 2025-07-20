import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import AddLoanModal from '../components/AddLoanModal';
import { ArrowLeft } from 'lucide-react';

interface AddLoanProps {
  onNavigate: (page: string) => void;
}

const AddLoan: React.FC<AddLoanProps> = ({ onNavigate }) => {
  const { persons, addLoan, addPerson } = useData();
  const [isModalOpen, setIsModalOpen] = useState(true);

  const existingPersonNames = persons.map(p => p.name.toLowerCase());

  const handleSaveLoan = (loanData: any) => {
    // Check if person already exists
    let personId = '';
    const existingPerson = persons.find(p => 
      p.name.toLowerCase() === loanData.personName.toLowerCase()
    );

    if (existingPerson) {
      personId = existingPerson.id;
    } else {
      // Create new person
      personId = Date.now().toString();
      const newPerson = {
        id: personId,
        name: loanData.personName,
        phoneNumber: loanData.personPhone,
        totalLent: loanData.type === 'lent' ? loanData.amount : 0,
        totalBorrowed: loanData.type === 'borrowed' ? loanData.amount : 0,
        totalInterestPaid: 0,
        totalInterestDue: 0,
      };
      addPerson(newPerson);
    }

    // Add loan
    const newLoan = {
      ...loanData,
      id: Date.now().toString(),
      personId,
      createdAt: new Date().toISOString(),
    };
    addLoan(newLoan);

    // Navigate back to dashboard
    onNavigate('dashboard');
  };

  const handleClose = () => {
    onNavigate('dashboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Loan</h1>
      </div>

      <AddLoanModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSave={handleSaveLoan}
        existingPersons={existingPersonNames}
      />
    </div>
  );
};

export default AddLoan;