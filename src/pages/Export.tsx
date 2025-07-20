import React from 'react';
import { useData } from '../hooks/useData';
import { ArrowLeft, Download, FileText, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

interface ExportProps {
  onNavigate: (page: string) => void;
}

const Export: React.FC<ExportProps> = ({ onNavigate }) => {
  const { persons, loans, payments, getStatistics } = useData();
  const stats = getStatistics();

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportPersonData = (personId: string) => {
    const person = persons.find(p => p.id === personId);
    if (!person) return;

    const personLoans = loans.filter(l => l.personId === personId);
    const personPayments = payments.filter(p => 
      personLoans.some(l => l.id === p.loanId)
    );

    const exportData = personLoans.map(loan => ({
      PersonName: person.name,
      LoanType: loan.type,
      Amount: loan.amount,
      CurrentBalance: loan.currentBalance,
      InterestRate: loan.interestRate,
      InterestType: loan.interestType,
      StartDate: loan.startDate,
      Status: loan.status,
      TotalPayments: personPayments.filter(p => p.loanId === loan.id).length,
      TotalPaid: personPayments
        .filter(p => p.loanId === loan.id)
        .reduce((sum, p) => sum + p.amount, 0),
    }));

    exportToCSV(exportData, `${person.name}_loans`);
  };

  const exportAllData = () => {
    const exportData = loans.map(loan => {
      const person = persons.find(p => p.id === loan.personId);
      const loanPayments = payments.filter(p => p.loanId === loan.id);
      
      return {
        PersonName: person?.name || 'Unknown',
        LoanType: loan.type,
        Amount: loan.amount,
        CurrentBalance: loan.currentBalance,
        InterestRate: loan.interestRate,
        InterestType: loan.interestType,
        StartDate: loan.startDate,
        Status: loan.status,
        TotalPayments: loanPayments.length,
        TotalPaid: loanPayments.reduce((sum, p) => sum + p.amount, 0),
        CreatedAt: loan.createdAt,
      };
    });

    exportToCSV(exportData, 'all_loans');
  };

  const exportSummaryReport = () => {
    const summaryData = [
      {
        Metric: 'Total Lent',
        Value: stats.totalLent,
        Currency: formatCurrency(stats.totalLent),
      },
      {
        Metric: 'Total Borrowed',
        Value: stats.totalBorrowed,
        Currency: formatCurrency(stats.totalBorrowed),
      },
      {
        Metric: 'Interest Pending',
        Value: stats.interestPending,
        Currency: formatCurrency(stats.interestPending),
      },
      {
        Metric: 'Active Loans',
        Value: stats.activeLoans,
        Currency: 'N/A',
      },
      {
        Metric: 'Total Persons',
        Value: stats.totalPersons,
        Currency: 'N/A',
      },
    ];

    exportToCSV(summaryData, 'loan_summary');
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
        <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
      </div>

      <div className="grid gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Exports</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={exportAllData}
              className="flex flex-col items-center space-y-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText size={32} className="text-blue-600" />
              <div className="text-center">
                <h3 className="font-medium text-gray-900">All Loans</h3>
                <p className="text-sm text-gray-600">Export all loan data</p>
              </div>
            </button>
            
            <button
              onClick={exportSummaryReport}
              className="flex flex-col items-center space-y-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar size={32} className="text-green-600" />
              <div className="text-center">
                <h3 className="font-medium text-gray-900">Summary Report</h3>
                <p className="text-sm text-gray-600">Export summary statistics</p>
              </div>
            </button>
            
            <button
              onClick={() => {
                const paymentsData = payments.map(payment => {
                  const loan = loans.find(l => l.id === payment.loanId);
                  const person = persons.find(p => p.id === loan?.personId);
                  return {
                    PersonName: person?.name || 'Unknown',
                    LoanType: loan?.type || 'Unknown',
                    PaymentType: payment.type,
                    Amount: payment.amount,
                    Date: payment.date,
                    Method: payment.method,
                    Notes: payment.notes || '',
                  };
                });
                exportToCSV(paymentsData, 'all_payments');
              }}
              className="flex flex-col items-center space-y-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={32} className="text-purple-600" />
              <div className="text-center">
                <h3 className="font-medium text-gray-900">All Payments</h3>
                <p className="text-sm text-gray-600">Export payment history</p>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Export by Person</h2>
          {persons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No persons to export</p>
            </div>
          ) : (
            <div className="space-y-3">
              {persons.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{person.name}</h3>
                    <p className="text-sm text-gray-600">
                      Lent: {formatCurrency(person.totalLent)} • 
                      Borrowed: {formatCurrency(person.totalBorrowed)}
                    </p>
                  </div>
                  <button
                    onClick={() => exportPersonData(person.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Download size={16} />
                    <span>Export</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Export;