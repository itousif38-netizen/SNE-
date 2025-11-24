import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Project, ProjectStatus } from '../types';
import { IndianRupee, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface DashboardProps {
  projects: Project[];
}

const Dashboard: React.FC<DashboardProps> = ({ projects }) => {
  // Calculated metrics
  const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
  const totalSpent = projects.reduce((acc, p) => acc + (p.spent || 0), 0);
  const activeProjects = projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length;
  const completedProjects = projects.filter(p => p.status === ProjectStatus.COMPLETED).length;

  const chartData = projects.map(p => ({
    name: p.name.split(' ')[0], // Shorten name for chart
    Budget: p.budget,
    Spent: p.spent || 0,
    full: p
  }));

  const StatCard = ({ title, value, subtext, icon: Icon, colorClass, delay }: any) => (
    <div 
        className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up ${delay}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{value}</h3>
          <p className="text-xs text-slate-500 mt-1">{subtext}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 transform transition-transform hover:scale-110`}>
          <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end animate-slide-in-right">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500">Welcome back, here's what's happening on your sites today.</p>
        </div>
        <span className="text-sm text-slate-400">Last updated: Just now</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Budget" 
          value={`₹${totalBudget.toLocaleString('en-IN')}`} 
          subtext="Across all active jobs"
          icon={IndianRupee}
          colorClass="text-green-600 bg-green-100"
          delay="stagger-1"
        />
        <StatCard 
          title="Active Projects" 
          value={activeProjects} 
          subtext={`${completedProjects} completed this year`}
          icon={Clock}
          colorClass="text-blue-600 bg-blue-100"
          delay="stagger-2"
        />
        <StatCard 
          title="Pending Actions" 
          value="3" 
          subtext="Approvals & permits"
          icon={AlertCircle}
          colorClass="text-orange-600 bg-orange-100"
          delay="stagger-3"
        />
        <StatCard 
          title="Completion Rate" 
          value="92%" 
          subtext="On time delivery"
          icon={CheckCircle2}
          colorClass="text-purple-600 bg-purple-100"
          delay="stagger-4"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-scale-in" style={{animationDelay: '0.4s'}}>
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Financial Overview (Budget vs Spent)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                />
                <Bar dataKey="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} animationDuration={1500} />
                <Bar dataKey="Spent" fill="#f97316" radius={[4, 4, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-scale-in" style={{animationDelay: '0.5s'}}>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">At a Glance</h3>
          <div className="space-y-4">
            {projects.slice(0, 4).map((project, idx) => (
              <div key={project.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                <div>
                  <h4 className="font-medium text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{project.name}</h4>
                  <p className="text-xs text-slate-500">{project.client} • {project.address}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium
                    ${project.status === ProjectStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' : ''}
                    ${project.status === ProjectStatus.COMPLETED ? 'bg-green-100 text-green-700' : ''}
                    ${project.status === ProjectStatus.PLANNING ? 'bg-yellow-100 text-yellow-700' : ''}
                  `}>
                    {project.status}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">{project.completionPercentage || 0}% Complete</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors hover:shadow-md">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;