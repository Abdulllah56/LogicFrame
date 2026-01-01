import React from 'react';
import { Project } from '../types';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus, ShieldAlert, DollarSign, LogOut, Settings, TrendingUp, Activity } from 'lucide-react';
import ScopeTrendsChart from './ScopeTrendsChart';
import RecentActivity from './RecentActivity';

interface DashboardProps {
  projects: Project[];
  onLogout?: () => void;
  userName?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onLogout, userName }) => {
  const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

  // Calculate aggregates
  const totalUnpaidWork = projects.reduce((acc, project) => {
    return acc + project.requests
      .filter(r => r.scopeStatus === 'OUT_SCOPE' && r.status === 'Pending')
      .reduce((sum, r) => sum + r.estimatedCost, 0);
  }, 0);

  const totalActive = projects.filter(p => p.status === 'Active').length;

  // Calculate "Saved Revenue" (Approved Out-of-Scope requests)
  const totalSavedRevenue = projects.reduce((acc, project) => {
    return acc + project.requests
      .filter(r => r.scopeStatus === 'OUT_SCOPE' && r.status === 'Approved')
      .reduce((sum, r) => sum + r.estimatedCost, 0);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Scope Creep Protector</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            {userName ? `Welcome back, ${userName}.` : 'Manage your projects and get paid for every extra request.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/settings"
            className="px-4 py-2 bg-white/[0.03] border border-border text-foreground rounded-lg hover:bg-white/[0.05] transition-colors font-medium flex items-center justify-center gap-2 shadow-sm"
          >
            <Settings size={18} />
            Settings
          </Link>
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-white/[0.03] border border-border text-foreground rounded-lg hover:bg-white/[0.05] transition-colors font-medium flex items-center justify-center gap-2 shadow-sm"
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
          <Link
            to="/new"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105 flex items-center gap-2 font-medium shadow-lg shadow-primary/25"
          >
            <Plus size={20} />
            New Project
          </Link>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/[0.02] p-6 rounded-xl shadow-sm border border-border backdrop-blur-md hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
              <h3 className="text-2xl font-bold text-foreground">{totalActive}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] p-6 rounded-xl shadow-sm border border-border backdrop-blur-md hover:border-destructive/30 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Risk (Unpaid)</p>
              <h3 className="text-2xl font-bold text-foreground">${totalUnpaidWork.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] p-6 rounded-xl shadow-sm border border-border backdrop-blur-md hover:border-green-500/30 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Revenue Saved</p>
              <h3 className="text-2xl font-bold text-foreground">${totalSavedRevenue.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] p-6 rounded-xl shadow-sm border border-border backdrop-blur-md hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Protected</p>
              <h3 className="text-2xl font-bold text-foreground">{projects.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScopeTrendsChart projects={projects} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity projects={projects} />
        </div>
      </div>

      {/* Project List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Your Projects</h2>
          <div className="flex gap-2">
            {/* Filter buttons could go here */}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {projects.length === 0 ? (
            <div className="text-center py-16 bg-white/[0.02] rounded-xl border border-border border-dashed backdrop-blur-md">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="text-muted-foreground" size={32} />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Start by creating your first project to track scope creep and protect your revenue.
              </p>
              <Link
                to="/new"
                className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105 items-center gap-2 font-medium shadow-lg shadow-primary/20"
              >
                <Plus size={20} />
                Create First Project
              </Link>
            </div>
          ) : (
            projects.map(project => {
              const unpaidRequests = project.requests.filter(r => r.scopeStatus === 'OUT_SCOPE' && r.status === 'Pending');
              const unpaidAmount = unpaidRequests.reduce((sum, r) => sum + r.estimatedCost, 0);

              return (
                <div key={project.id} className="bg-white/[0.02] rounded-xl shadow-sm border border-border hover:border-primary/50 transition-all hover:shadow-md hover:shadow-primary/5 overflow-hidden backdrop-blur-md group">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{project.projectName}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${project.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            project.status === 'Completed' ? 'bg-muted text-muted-foreground border-border' :
                              'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            }`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{project.clientName} • {project.clientEmail}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-sm text-muted-foreground">Original Budget</p>
                        <p className="text-lg font-bold text-foreground">{project.currency || '$'}{project.projectPrice.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Unpaid Work</p>
                        <p className={`text-xl font-bold ${unpaidAmount > 0 ? 'text-destructive' : 'text-green-500'}`}>
                          {project.currency || '$'}{unpaidAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{unpaidRequests.length} pending requests</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Current Total</p>
                        <p className="text-xl font-bold text-foreground">
                          {project.currency || '$'}{(project.projectPrice + unpaidAmount).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {unpaidAmount > 0 ? `+${((unpaidAmount / project.projectPrice) * 100).toFixed(1)}% increase` : 'On budget'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Timeline</p>
                        <p className="text-xl font-bold text-foreground">{project.timeline}</p>
                        <p className="text-xs text-muted-foreground">Ends: {new Date(project.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/project/${toSlug(project.projectName)}`}
                        className="px-4 py-2 text-sm bg-white/[0.03] border border-border text-foreground rounded-lg hover:bg-white/[0.05] transition-colors font-medium"
                      >
                        View Dashboard
                      </Link>
                      <Link
                        to={`/project/${toSlug(project.projectName)}?action=log`}
                        className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 font-medium shadow-sm shadow-primary/20"
                      >
                        <Plus size={16} />
                        Log Request
                      </Link>
                    </div>
                  </div>
                  {unpaidAmount > 0 && (
                    <div className="bg-destructive/10 px-6 py-3 border-t border-destructive/20 flex items-center gap-2 text-destructive text-sm font-medium animate-pulse">
                      <ShieldAlert size={16} />
                      Attention needed: You have {project.currency || '$'}{unpaidAmount.toLocaleString()} in pending scope changes.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
