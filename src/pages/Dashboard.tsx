import React from 'react';
import { useData } from '../hooks/useData';
import StatCard from '../components/StatCard';
import PersonCard from '../components/PersonCard';
import { DollarSign, TrendingUp, TrendingDown, Users, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string, personId?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { persons, loading, getStatistics } = useData();
  const stats = getStatistics();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your lending and borrowing activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Lent"
          value={stats.totalLent}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Total Borrowed"
          value={stats.totalBorrowed}
          icon={TrendingDown}
          color="red"
        />
        <StatCard
          title="Interest Pending"
          value={stats.interestPending}
          icon={AlertTriangle}
          color="yellow"
        />
        <StatCard
          title="Active Loans"
          value={stats.activeLoans}
          icon={DollarSign}
          color="blue"
          format="number"
        />
        <StatCard
          title="Total Persons"
          value={stats.totalPersons}
          icon={Users}
          color="blue"
          format="number"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">People</h2>
          <button
            onClick={() => onNavigate('add-loan')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add New Loan
          </button>
        </div>

        {persons.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No people yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first loan</p>
            <button
              onClick={() => onNavigate('add-loan')}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New Loan
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {persons.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onClick={(personId) => onNavigate('person', personId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;