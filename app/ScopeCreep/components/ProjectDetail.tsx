import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Project, Request, EmailTemplateType, UserSettings, AiEmailConfig } from '../types';
import RequestLogForm from './RequestLogForm';
import { ArrowLeft, Check, Copy, Mail, AlertTriangle, Plus, FileText, LayoutDashboard, Send, Loader2, ExternalLink, RefreshCw, Sparkles, Wand2 } from 'lucide-react';

interface ProjectDetailProps {
    projects: Project[];
    updateProject: (project: Project) => void;
    userSettings: UserSettings;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projects, updateProject, userSettings }) => {
    const { slug } = useParams<{ slug: string }>();
    const location = useLocation();

    // Helper to slugify project name
    const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

    const project = projects.find(p =>
        p.id === slug ||
        toSlug(p.projectName) === slug?.toLowerCase()
    );

    const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'scope' | 'email'>('overview');
    const [showLogModal, setShowLogModal] = useState(false);
    const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
    const [emailTemplate, setEmailTemplate] = useState<EmailTemplateType>('SINGLE_QUOTE');
    const [generatedEmail, setGeneratedEmail] = useState({ subject: '', body: '' });

    // AI State
    const [aiConfig, setAiConfig] = useState<AiEmailConfig>({
        tone: 'Professional',
        intent: 'Discuss Budget',
        length: 'Medium',
        customInstructions: ''
    });
    const [isAiGenerating, setIsAiGenerating] = useState(false);

    // Email sending state
    const [isSending, setIsSending] = useState(false);
    const [sendResult, setSendResult] = useState<'idle' | 'success' | 'error'>('idle');
    const [sendErrorMsg, setSendErrorMsg] = useState('');
    const [serverStatus, setServerStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('action') === 'log') {
            setShowLogModal(true);
        }
    }, [location]);

    // Check server status when email tab is active
    useEffect(() => {
        if (activeTab === 'email') {
            checkServerStatus();
        }
    }, [activeTab]);

    const checkServerStatus = async () => {
        try {
            const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://127.0.0.1:3001' : '';
            const res = await fetch(`${baseUrl}/`);
            if (res.ok) {
                setServerStatus('online');
            } else {
                setServerStatus('offline');
            }
        } catch (e) {
            setServerStatus('offline');
        }
    };

    // Derived state - guarded
    const unpaidRequests = project ? project.requests.filter(r => r.scopeStatus === 'OUT_SCOPE' && r.status === 'Pending') : [];
    const unpaidTotal = unpaidRequests.reduce((acc, r) => acc + r.estimatedCost, 0);
    const totalBudget = project ? (project.projectPrice + project.requests.filter(r => r.status === 'Approved' && r.scopeStatus === 'OUT_SCOPE').reduce((acc, r) => acc + r.estimatedCost, 0)) : 0;

    const handleSaveRequest = (newRequest: Omit<Request, 'id'>) => {
        if (!project) return;
        const request: Request = {
            ...newRequest,
            id: crypto.randomUUID(),
        };
        const updatedProject = {
            ...project,
            requests: [request, ...project.requests] // Add to top
        };
        updateProject(updatedProject);
        setShowLogModal(false);
        setActiveTab('requests');
    };

    const handleAiGenerate = async () => {
        if (!project) return;
        setIsAiGenerating(true);
        setSendResult('idle');
        try {
            const requestsToInclude = project.requests.filter(r => selectedRequests.includes(r.id));
            if (requestsToInclude.length === 0 && selectedRequests.length > 0) {
                // User selected something that isn't in the list? Unlikely but safe check
            }

            const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://127.0.0.1:3001' : '';
            const response = await fetch(`${baseUrl}/api/ai/generate-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project: {
                        clientName: project.clientName,
                        projectName: project.projectName,
                        projectPrice: project.projectPrice
                    },
                    requests: requestsToInclude.length > 0 ? requestsToInclude : unpaidRequests,
                    config: aiConfig,
                    senderName: userSettings.emailConfig?.senderName || userSettings.name
                })
            });

            const data = await response.json();
            if (response.ok) {
                setGeneratedEmail({
                    subject: data.subject,
                    body: data.body
                });
            } else {
                setGeneratedEmail({
                    subject: 'Error generating email',
                    body: `AI Error: ${data.error}`
                });
            }
        } catch (e) {
            setGeneratedEmail({
                subject: 'Connection Error',
                body: 'Could not connect to AI service. Ensure server is running.'
            });
        } finally {
            setIsAiGenerating(false);
        }
    };

    const generateEmailContent = () => {
        if (!project) return;
        if (emailTemplate === 'AI_GENERATED') return; // Handled by handleAiGenerate

        let subject = '';
        let body = '';

        // Use sender name if available, otherwise fallback to user name
        const senderName = userSettings.emailConfig?.senderName || userSettings.name || 'Your Name';

        if (emailTemplate === 'SINGLE_QUOTE' || emailTemplate === 'WEEKLY_SUMMARY') {
            const requestsToInclude = project.requests.filter(r => selectedRequests.includes(r.id));

            if (requestsToInclude.length === 0 && activeTab === 'email') {
                return { subject: 'Select requests first', body: 'Please select requests from the list to generate an email.' };
            }

            if (emailTemplate === 'SINGLE_QUOTE') {
                const req = requestsToInclude[0] || project.requests[0]; // Fallback
                if (req) {
                    subject = `Change Request - ${req.requestText.substring(0, 30)}...`;
                    body = `Hi ${project.clientName.split(' ')[0]},

Thank you for your request to ${req.requestText}.

I've reviewed this against our original scope of work, and this would be considered an additional feature outside our current agreement.

ORIGINAL SCOPE:
Our contract includes the agreed deliverables defined in our scope document.

REQUESTED ADDITION:
• ${req.requestText}
• Impact: ${req.timelineImpact} timeline adjustment

IMPACT:
• Additional Cost: $${req.estimatedCost.toLocaleString()}
• Additional Time: ${req.timelineImpact}

OPTIONS:
1. Add to current project (revise contract + payment required)
2. Complete current project first, then do this as Phase 2
3. Remove this request and proceed with original scope

Please let me know how you'd like to proceed!

Best,
${senderName}`;
                }
            } else if (emailTemplate === 'WEEKLY_SUMMARY') {
                subject = `Weekly Project Update - Scope Change Requests`;
                body = `Hi ${project.clientName.split(' ')[0]},

Here's a summary of the recent scope change requests for ${project.projectName}:

OUT-OF-SCOPE REQUESTS:
${requestsToInclude.map((r, i) => `${i + 1}. ${r.requestText} → $${r.estimatedCost} / ${r.timelineImpact}`).join('\n')}

TOTAL ADDITIONAL COST: $${requestsToInclude.reduce((sum, r) => sum + r.estimatedCost, 0).toLocaleString()}

NEXT STEPS:
Let's schedule a quick call to discuss which additions you'd like to approve.

Best,
${senderName}`;
            }
        } else if (emailTemplate === 'FIRM_REMINDER') {
            subject = `Project Budget Discussion Needed - ${project.projectName}`;
            body = `Hi ${project.clientName.split(' ')[0]},

I wanted to touch base regarding some scope changes that have been requested on the ${project.projectName} project.

CURRENT SITUATION:
• Original project budget: $${project.projectPrice.toLocaleString()}
• Pending out-of-scope work: $${unpaidTotal.toLocaleString()}

I'm committed to delivering excellent work, and I want to ensure we're aligned on project scope and budget before proceeding further.

Can we schedule a call this week to discuss?

Best,
${senderName}`;
        }
        setGeneratedEmail({ subject, body });
        return { subject, body }; // Return for immediate use
    };

    const handleSendEmail = async () => {
        if (!project) return;
        // Check if user has configured email
        if (!userSettings.emailConfig?.email || !userSettings.emailConfig?.appPassword) {
            setSendResult('error');
            setSendErrorMsg('Please configure your email settings first.');
            return;
        }

        setIsSending(true);
        setSendResult('idle');
        setSendErrorMsg('');

        try {
            const content = emailTemplate === 'AI_GENERATED' ? generatedEmail : generateEmailContent();

            if (!content) {
                throw new Error("Could not generate email content");
            }

            const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://127.0.0.1:3001' : '';
            const response = await fetch(`${baseUrl}/api/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: project.clientEmail,
                    subject: content.subject,
                    body: content.body,
                    userEmail: userSettings.emailConfig?.email,
                    userPass: userSettings.emailConfig?.appPassword,
                    senderName: userSettings.emailConfig?.senderName
                })
            });

            const data = await response.json();
            if (response.ok) {
                setSendResult('success');
            } else {
                setSendResult('error');
                setSendErrorMsg(data.error || 'Failed to send email');
            }
        } catch (e: any) {
            setSendResult('error');
            setSendErrorMsg(e.message || 'Network error');
        } finally {
            setIsSending(false);
        }
    };

    // Update generated email when template or selection changes
    useEffect(() => {
        if (project && emailTemplate !== 'AI_GENERATED') {
            generateEmailContent();
        }
    }, [emailTemplate, selectedRequests, activeTab, project]);

    const toggleRequestSelection = (id: string) => {
        if (selectedRequests.includes(id)) {
            setSelectedRequests(selectedRequests.filter(r => r !== id));
        } else {
            setSelectedRequests([...selectedRequests, id]);
        }
    };

    if (!project) return <div className="p-8 text-center">Project not found</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
            </Link>

            <div className="bg-white/[0.02] rounded-xl shadow-sm border border-border overflow-hidden mb-8 backdrop-blur-md">
                <div className="p-6 sm:p-8 border-b border-border">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-foreground">{project.projectName}</h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${project.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                    project.status === 'Completed' ? 'bg-muted text-muted-foreground border-border' :
                                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                    }`}>
                                    {project.status}
                                </span>
                            </div>
                            <p className="text-muted-foreground text-lg">{project.clientName} • {project.clientEmail}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogModal(true)}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 font-medium shadow-sm shadow-primary/20"
                            >
                                <Plus size={20} />
                                Log Request
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'requests' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        Change Requests
                        {project.requests.length > 0 && (
                            <span className="ml-2 bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">
                                {project.requests.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('scope')}
                        className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'scope' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        Original Scope
                    </button>
                    <button
                        onClick={() => setActiveTab('email')}
                        className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'email' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        Email Generator
                    </button>
                </div>

                <div className="p-6 sm:p-8 bg-muted/30 min-h-[400px]">
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                            <div className="bg-white/[0.02] p-6 rounded-xl border border-border shadow-sm backdrop-blur-md">
                                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                    <LayoutDashboard className="text-muted-foreground" size={20} />
                                    Financial Summary
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                        <span className="text-muted-foreground">Original Budget</span>
                                        <span className="font-bold text-foreground">{project.currency || '$'}{project.projectPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                                        <span className="text-destructive font-medium">Pending Scope Creep</span>
                                        <span className="font-bold text-destructive">+{project.currency || '$'}{unpaidTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="pt-4 border-t border-border flex justify-between items-center">
                                        <span className="text-foreground font-bold">Projected Total</span>
                                        <span className="font-bold text-xl text-foreground">{project.currency || '$'}{(project.projectPrice + unpaidTotal).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/[0.02] p-6 rounded-xl border border-border shadow-sm backdrop-blur-md">
                                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                    <AlertTriangle className="text-muted-foreground" size={20} />
                                    Scope Health
                                </h3>
                                <div className="flex items-center justify-center py-6">
                                    <div className="relative w-32 h-32">
                                        <svg className="w-full h-full" viewBox="0 0 36 36">
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="hsl(var(--muted))"
                                                strokeWidth="3"
                                            />
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke={unpaidTotal > 0 ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                                                strokeWidth="3"
                                                strokeDasharray={`${Math.min((unpaidTotal / project.projectPrice) * 100, 100)}, 100`}
                                            />
                                        </svg>
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                            <span className={`text-xl font-bold ${unpaidTotal > 0 ? 'text-destructive' : 'text-primary'}`}>
                                                {((unpaidTotal / project.projectPrice) * 100).toFixed(1)}%
                                            </span>
                                            <span className="block text-xs text-muted-foreground">Creep</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-center text-sm text-muted-foreground">
                                    {unpaidTotal > 0
                                        ? "Warning: Scope is expanding beyond original agreement."
                                        : "Great job! Project is currently within scope."}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* REQUESTS TAB */}
                    {activeTab === 'requests' && (
                        <div className="animate-in fade-in">
                            {project.requests.length === 0 ? (
                                <div className="text-center py-12 bg-white/[0.02] rounded-xl border border-border border-dashed backdrop-blur-md">
                                    <p className="text-muted-foreground mb-4">No requests logged yet.</p>
                                    <button
                                        onClick={() => setShowLogModal(true)}
                                        className="inline-flex px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors items-center gap-2"
                                    >
                                        <Plus size={20} />
                                        Log First Request
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {project.requests.map(request => (
                                        <div key={request.id} className="bg-white/[0.02] p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow backdrop-blur-md">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${request.scopeStatus === 'IN_SCOPE' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'
                                                            }`}>
                                                            {request.scopeStatus === 'IN_SCOPE' ? 'In Scope' : 'Out of Scope'}
                                                        </span>
                                                        <span className="text-muted-foreground text-xs">•</span>
                                                        <span className="text-muted-foreground text-xs">{new Date(request.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <h4 className="text-lg font-medium text-foreground">{request.requestText}</h4>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-foreground">{project.currency || '$'}{request.estimatedCost.toLocaleString()}</p>
                                                    <p className="text-xs text-muted-foreground">{request.timelineImpact}</p>
                                                </div>
                                            </div>
                                            <div className="bg-muted/30 p-3 rounded-lg text-sm text-muted-foreground mb-4">
                                                <span className="font-medium text-foreground">Why: </span>
                                                {request.justification}
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRequests([request.id]);
                                                        setActiveTab('email');
                                                    }}
                                                    className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                                                >
                                                    <Mail size={16} /> Draft Email
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SCOPE TAB */}
                    {activeTab === 'scope' && (
                        <div className="bg-white/[0.02] rounded-xl border border-border shadow-sm overflow-hidden animate-in fade-in backdrop-blur-md">
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                                    <FileText className="text-muted-foreground" size={20} />
                                    Original Agreement
                                </h3>

                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">In Scope Deliverables</h4>
                                        <ul className="space-y-3">
                                            {project.deliverables.filter(d => d.type === 'IN_SCOPE').map(item => (
                                                <li key={item.id} className="flex items-start gap-3 text-muted-foreground">
                                                    <Check className="text-green-500 mt-0.5 shrink-0" size={18} />
                                                    <span>{item.description}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Explicitly Out of Scope</h4>
                                        <ul className="space-y-3">
                                            {project.deliverables.filter(d => d.type === 'OUT_SCOPE').map(item => (
                                                <li key={item.id} className="flex items-start gap-3 text-muted-foreground">
                                                    <AlertTriangle className="text-destructive mt-0.5 shrink-0" size={18} />
                                                    <span>{item.description}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* EMAIL TAB */}
                    {activeTab === 'email' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
                            {/* Left Sidebar: Selection */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-white/[0.02] p-5 rounded-xl border border-border shadow-sm backdrop-blur-md">
                                    <h3 className="font-bold text-foreground mb-4">1. Select Requests</h3>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {project.requests.filter(r => r.scopeStatus === 'OUT_SCOPE').length === 0 ? (
                                            <p className="text-sm text-muted-foreground italic">No out-of-scope requests to discuss.</p>
                                        ) : (
                                            project.requests.filter(r => r.scopeStatus === 'OUT_SCOPE').map(req => (
                                                <label key={req.id} className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        className="mt-1 rounded border-border bg-muted text-primary focus:ring-primary"
                                                        checked={selectedRequests.includes(req.id)}
                                                        onChange={() => toggleRequestSelection(req.id)}
                                                    />
                                                    <div className="text-sm">
                                                        <p className="font-medium text-foreground line-clamp-2">{req.requestText}</p>
                                                        <p className="text-muted-foreground mt-1">${req.estimatedCost}</p>
                                                    </div>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white/[0.02] p-5 rounded-xl border border-border shadow-sm backdrop-blur-md">
                                    <h3 className="font-bold text-foreground mb-4">2. Choose Template</h3>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => setEmailTemplate('SINGLE_QUOTE')}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${emailTemplate === 'SINGLE_QUOTE' ? 'bg-primary/10 border-primary text-primary' : 'hover:bg-muted/50 border-border text-foreground'}`}
                                        >
                                            <div className="font-medium">Single Request Quote</div>
                                            <div className="text-xs opacity-75">For addressing one specific new request</div>
                                        </button>
                                        <button
                                            onClick={() => setEmailTemplate('WEEKLY_SUMMARY')}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${emailTemplate === 'WEEKLY_SUMMARY' ? 'bg-primary/10 border-primary text-primary' : 'hover:bg-muted/50 border-border text-foreground'}`}
                                        >
                                            <div className="font-medium">Weekly Summary</div>
                                            <div className="text-xs opacity-75">Roundup of all recent scope creep</div>
                                        </button>
                                        <button
                                            onClick={() => setEmailTemplate('FIRM_REMINDER')}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${emailTemplate === 'FIRM_REMINDER' ? 'bg-primary/10 border-primary text-primary' : 'hover:bg-muted/50 border-border text-foreground'}`}
                                        >
                                            <div className="font-medium">Firm Budget Reminder</div>
                                            <div className="text-xs opacity-75">When you need to draw a hard line</div>
                                        </button>
                                        <button
                                            onClick={() => setEmailTemplate('AI_GENERATED')}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${emailTemplate === 'AI_GENERATED' ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'hover:bg-muted/50 border-border text-foreground'}`}
                                        >
                                            <div className="font-medium flex items-center gap-2"><Sparkles size={14} /> AI Custom Email</div>
                                            <div className="text-xs opacity-75">Generate a custom email using AI</div>
                                        </button>
                                    </div>
                                </div>

                                {emailTemplate === 'AI_GENERATED' && (
                                    <div className="bg-white/[0.02] p-5 rounded-xl border border-purple-500/30 shadow-sm animate-in fade-in backdrop-blur-md">
                                        <h3 className="font-bold text-purple-400 mb-4 flex items-center gap-2">
                                            <Wand2 size={18} /> AI Configuration
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-muted-foreground mb-1">Tone</label>
                                                <select
                                                    className="w-full p-2 text-sm bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-foreground"
                                                    value={aiConfig.tone}
                                                    onChange={(e) => setAiConfig({ ...aiConfig, tone: e.target.value as any })}
                                                >
                                                    <option value="Professional">Professional</option>
                                                    <option value="Friendly">Friendly</option>
                                                    <option value="Firm">Firm</option>
                                                    <option value="Empathetic">Empathetic</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-muted-foreground mb-1">Intent</label>
                                                <select
                                                    className="w-full p-2 text-sm bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-foreground"
                                                    value={aiConfig.intent}
                                                    onChange={(e) => setAiConfig({ ...aiConfig, intent: e.target.value as any })}
                                                >
                                                    <option value="Discuss Budget">Discuss Budget</option>
                                                    <option value="Reject Request">Reject Request</option>
                                                    <option value="Propose Compromise">Propose Compromise</option>
                                                    <option value="Clarify Scope">Clarify Scope</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-muted-foreground mb-1">Custom Instructions</label>
                                                <textarea
                                                    className="w-full p-2 text-sm bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-foreground placeholder:text-muted-foreground"
                                                    rows={3}
                                                    placeholder="e.g. Mention we can do this in Phase 2..."
                                                    value={aiConfig.customInstructions}
                                                    onChange={(e) => setAiConfig({ ...aiConfig, customInstructions: e.target.value })}
                                                />
                                            </div>
                                            <button
                                                onClick={handleAiGenerate}
                                                disabled={isAiGenerating}
                                                className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-70"
                                            >
                                                {isAiGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                                Generate with AI
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Content: Email Preview */}
                            <div className="lg:col-span-2">
                                <div className="bg-white/[0.02] rounded-xl border border-border shadow-sm h-full flex flex-col backdrop-blur-md">
                                    <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30 rounded-t-xl">
                                        <h3 className="font-bold text-foreground">Email Preview</h3>
                                        <div className="flex gap-2">
                                            <button
                                                className="text-muted-foreground hover:text-foreground p-2 rounded hover:bg-muted transition-colors"
                                                title="Copy to Clipboard"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`${generatedEmail.subject}\n\n${generatedEmail.body}`);
                                                }}
                                            >
                                                <Copy size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">To</label>
                                            <div className="p-2 bg-muted/30 rounded border border-border text-foreground text-sm">
                                                {project.clientEmail}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Subject</label>
                                            <input
                                                type="text"
                                                className="w-full p-2 bg-muted/10 rounded border border-border text-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
                                                value={generatedEmail.subject}
                                                onChange={(e) => setGeneratedEmail({ ...generatedEmail, subject: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1 flex-1">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Message Body</label>
                                            <textarea
                                                className="w-full h-full min-h-[300px] p-4 bg-muted/10 rounded border border-border text-foreground text-sm leading-relaxed focus:ring-2 focus:ring-primary outline-none resize-none font-mono"
                                                value={generatedEmail.body}
                                                onChange={(e) => setGeneratedEmail({ ...generatedEmail, body: e.target.value })}
                                            />
                                        </div>

                                        <div className="pt-4 border-t border-border flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                <span className="text-muted-foreground">
                                                    Server: {serverStatus === 'online' ? 'Connected' : 'Disconnected'}
                                                </span>
                                                {serverStatus === 'offline' && (
                                                    <button onClick={checkServerStatus} className="text-primary hover:underline flex items-center gap-1">
                                                        <RefreshCw size={12} /> Retry
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex gap-3">
                                                <a
                                                    href={`mailto:${project.clientEmail}?subject=${encodeURIComponent(generatedEmail.subject)}&body=${encodeURIComponent(generatedEmail.body)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-white/[0.03] border border-border text-foreground rounded-lg hover:bg-white/[0.05] font-medium flex items-center gap-2"
                                                >
                                                    <ExternalLink size={18} /> Open in Mail App
                                                </a>
                                                <button
                                                    onClick={handleSendEmail}
                                                    disabled={isSending || serverStatus === 'offline'}
                                                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                                >
                                                    {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                                    Send Email
                                                </button>
                                            </div>
                                        </div>

                                        {sendResult === 'success' && (
                                            <div className="p-3 bg-green-500/10 text-green-500 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                                <Check size={16} /> Email sent successfully!
                                            </div>
                                        )}
                                        {sendResult === 'error' && (
                                            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                                <AlertTriangle size={16} /> {sendErrorMsg || 'Failed to send email.'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showLogModal && (
                <RequestLogForm
                    onSave={handleSaveRequest}
                    onCancel={() => setShowLogModal(false)}
                    hourlyRate={project.hourlyRate}
                    currency={project.currency}
                />
            )}
        </div>
    );
};

export default ProjectDetail;
