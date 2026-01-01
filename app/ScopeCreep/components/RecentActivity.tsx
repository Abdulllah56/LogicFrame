import React from 'react';
import { Project, Request } from '../types';
import { Clock, CheckCircle, AlertTriangle, FileText, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentActivityProps {
    projects: Project[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ projects }) => {
    // Flatten all requests into a single array with project context
    const allRequests = projects.flatMap(project =>
        project.requests.map(request => ({
            ...request,
            projectName: project.projectName,
            projectSlug: project.projectName.toLowerCase().replace(/\s+/g, '-')
        }))
    );

    // Sort by date descending (assuming ISO date strings)
    const sortedRequests = allRequests.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 5);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    if (sortedRequests.length === 0) {
        return (
            <div className="bg-white/[0.02] p-6 rounded-xl shadow-sm border border-border backdrop-blur-md h-full min-h-[400px] flex flex-col">
                <h3 className="text-lg font-bold text-foreground mb-4">Recent Activity</h3>
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                        <Clock className="text-muted-foreground" size={24} />
                    </div>
                    <p className="text-muted-foreground">No recent activity found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/[0.02] p-6 rounded-xl shadow-sm border border-border backdrop-blur-md h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-foreground">Recent Activity</h3>
                <Link to="/projects" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
                    View All <ArrowUpRight size={12} />
                </Link>
            </div>

            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                {sortedRequests.map((request) => (
                    <div key={request.id} className="flex gap-4 group">
                        <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${request.scopeStatus === 'OUT_SCOPE'
                            ? 'bg-destructive/10 border-destructive/20 text-destructive'
                            : request.scopeStatus === 'IN_SCOPE'
                                ? 'bg-green-500/10 border-green-500/20 text-green-500'
                                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                            }`}>
                            {request.scopeStatus === 'OUT_SCOPE' ? <AlertTriangle size={14} /> :
                                request.scopeStatus === 'IN_SCOPE' ? <CheckCircle size={14} /> :
                                    <FileText size={14} />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                    {request.projectName}
                                </p>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatDate(request.date)}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {request.requestText}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 bg-muted px-2 py-0.5 rounded">
                                    {request.category}
                                </span>
                                {request.estimatedCost > 0 && (
                                    <span className="text-[10px] font-medium text-foreground">
                                        ${request.estimatedCost}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentActivity;
