import React from 'react';
import { Users, Pill, RefreshCw, MessageCircle } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { name: 'Active Chronic Patients', value: '142', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Active Medications', value: '384', icon: Pill, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Refills Due Today', value: '12', icon: RefreshCw, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Reminders Sent Today', value: '8', icon: MessageCircle, color: 'text-teal-600', bg: 'bg-teal-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h2>
          <p className="mt-1 text-sm text-slate-500">Overview of pharmacy chronic patient metrics.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Today's Follow-ups</h3>
        </div>
        <div className="p-6">
          <div className="text-slate-500 text-center py-8">
            Data loading will be implemented in subsequent phases.
          </div>
        </div>
      </div>
    </div>
  );
}
