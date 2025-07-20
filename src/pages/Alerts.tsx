import React from 'react';
import { useData } from '../hooks/useData';
import { ArrowLeft, Bell, AlertTriangle, CheckCircle, Send, Phone } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/calculations';

interface AlertsProps {
  onNavigate: (page: string) => void;
}

const Alerts: React.FC<AlertsProps> = ({ onNavigate }) => {
  const { loans, getPaymentsByLoanId } = useData();

  // Generate real alerts from loan data
  const generateAlerts = () => {
    const alerts = [];
    
    loans.forEach(loan => {
      if (loan.status === 'active' && loan.personPhone) {
        const payments = getPaymentsByLoanId(loan.id);
        const monthlyInterest = (loan.amount * loan.interestRate) / (12 * 100);
        
        // Check if interest is overdue
        const startDate = new Date(loan.startDate);
        const currentDate = new Date();
        const monthsElapsed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
        
        if (monthsElapsed >= 1) {
          const interestPaid = payments
            .filter(p => p.type === 'interest')
            .reduce((sum, p) => sum + p.amount, 0);
          
          const totalInterestDue = monthlyInterest * monthsElapsed;
          const outstandingInterest = totalInterestDue - interestPaid;
          
          if (outstandingInterest > monthlyInterest * 0.1) {
            const monthsOverdue = Math.floor(outstandingInterest / monthlyInterest);
            
            alerts.push({
              id: `${loan.id}_interest`,
              loanId: loan.id,
              personName: loan.personName,
              personPhone: loan.personPhone,
              type: monthsOverdue >= 1 ? 'overdue' : 'due',
              message: monthsOverdue >= 1 
                ? `Interest payment overdue for ${loan.personName} - ${monthsOverdue} month${monthsOverdue > 1 ? 's' : ''} behind`
                : `Interest payment due for ${loan.personName}`,
              date: new Date().toISOString().split('T')[0],
              amount: outstandingInterest,
              status: 'pending',
            });
          }
        }
      }
    });
    
    return alerts;
  };

  const alerts = generateAlerts();

  // Mock additional alerts for demonstration
  const additionalAlerts = [
    {
      id: 'reminder_1',
      type: 'reminder',
      message: 'Monthly interest collection reminder',
      date: '2025-01-12',
      amount: 0,
      status: 'pending',
    },
  ];

  const allAlerts = [...alerts, ...additionalAlerts];

  const handleSendBulkAlerts = () => {
    const pendingAlerts = alerts.filter(alert => alert.status === 'pending' && alert.personPhone);
    
    if (pendingAlerts.length === 0) {
      alert('No pending alerts to send');
      return;
    }

    // Simulate sending bulk SMS
    const confirmSend = window.confirm(`Send SMS alerts to ${pendingAlerts.length} people?`);
    if (confirmSend) {
      console.log('Sending bulk SMS alerts:', pendingAlerts);
      alert(`SMS alerts sent to ${pendingAlerts.length} people successfully!`);
    }
  };

  const handleSendIndividualAlert = (alert: any) => {
    if (!alert.personPhone) {
      alert('No phone number available for this person');
      return;
    }

    const message = alert.type === 'overdue' 
      ? `Hi ${alert.personName}, your interest payment of ₹${Math.round(alert.amount)} is overdue. Please make the payment as soon as possible.`
      : `Hi ${alert.personName}, your monthly interest payment is due. Please make the payment at your earliest convenience.`;
    
    console.log(`Sending SMS to ${alert.personPhone}: ${message}`);
    alert(`SMS sent to ${alert.personName} (${alert.personPhone})`);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle size={20} className="text-red-500" />;
      case 'due':
        return <Bell size={20} className="text-yellow-500" />;
      default:
        return <CheckCircle size={20} className="text-green-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'overdue':
        return 'border-red-200 bg-red-50';
      case 'due':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-green-200 bg-green-50';
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={handleSendBulkAlerts}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Send size={16} />
            <span>Send All Alerts</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">SMS Notification Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">SMS Reminders</h3>
              <p className="text-sm text-gray-600">Send SMS notifications for due payments</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Auto-send Overdue Alerts</h3>
              <p className="text-sm text-gray-600">Automatically send SMS for overdue payments</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Reminder Frequency</h3>
              <p className="text-sm text-gray-600">How often to send overdue reminders</p>
            </div>
            <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
              <option value="daily">Daily</option>
              <option value="weekly" selected>Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Active Alerts ({allAlerts.length})
        </h2>
        {allAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No active alerts</p>
            <p className="text-sm mt-2">All payments are up to date!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <p className="font-medium text-gray-900">{alert.message}</p>
                      {alert.personPhone && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                          <Phone size={12} />
                          <span>{alert.personPhone}</span>
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(alert.date)}
                        {alert.amount > 0 && ` • ${formatCurrency(alert.amount)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {alert.personPhone && alert.status === 'pending' && (
                      <button
                        onClick={() => handleSendIndividualAlert(alert)}
                        className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs"
                      >
                        <Send size={12} />
                        <span>Send SMS</span>
                      </button>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;