import React, { useState } from 'react';
import { Resource } from '../types';
import { Truck, Wrench, Users, Search, Filter } from 'lucide-react';

interface ResourceTrackerProps {
  resources: Resource[];
}

const ResourceTracker: React.FC<ResourceTrackerProps> = ({ resources }) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Equipment' | 'Labor'>('All');

  const filteredResources = resources.filter(r => 
    activeTab === 'All' ? true : r.type === activeTab
  );

  const getIcon = (type: string) => {
    switch(type) {
      case 'Equipment': return <Truck className="text-blue-500" size={20} />;
      case 'Labor': return <Users className="text-orange-500" size={20} />;
      default: return <Wrench className="text-slate-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Available': return 'bg-green-100 text-green-700';
      case 'In Use': return 'bg-blue-100 text-blue-700';
      case 'Maintenance': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resource Tracker</h1>
          <p className="text-slate-500">Manage your fleet, tools, and workforce.</p>
        </div>
        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
          Add Resource
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex space-x-2">
            {['All', 'Equipment', 'Labor'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${activeTab === tab 
                    ? 'bg-slate-100 text-slate-900' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
                `}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-64"
              />
            </div>
            <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Resource Name</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Type</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Assigned To</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Daily Cost</th>
                <th className="px-6 py-4 font-semibold text-slate-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredResources.map((resource) => (
                <tr key={resource.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center font-medium text-slate-900">
                      <span className="p-2 bg-slate-100 rounded-md mr-3">
                        {getIcon(resource.type)}
                      </span>
                      {resource.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{resource.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(resource.status)}`}>
                      {resource.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {resource.assignedTo ? (
                      <span className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        Project #{resource.assignedTo}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">
                    ₹{resource.costPerDay.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResourceTracker;