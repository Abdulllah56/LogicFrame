import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, Deliverable, UserSettings } from '../types';
import { CATEGORIES } from '../constants';
import { ArrowLeft, ArrowRight, Plus, Trash2, Check, Calendar, Briefcase, DollarSign, Clock, CheckCircle, XCircle, Pencil, Save, X, Activity, Globe } from 'lucide-react';

interface ScopeWizardProps {
  onSave: (project: Project) => void;
  defaultSettings: UserSettings;
}

const COMMON_EXCLUSIONS = [
  "Blog functionality",
  "E-commerce features",
  "Social media integration",
  "Custom animations",
  "Third-party integrations",
  "Additional revision rounds",
  "Content creation",
  "Photography/videography",
  "Print materials"
];

const STATUSES = ['To Do', 'In Progress', 'Completed'];
const PROJECT_STATUSES = ['Active', 'On Hold', 'Completed'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY'];

const ScopeWizard: React.FC<ScopeWizardProps> = ({ onSave, defaultSettings }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1: Project Details State
  const [details, setDetails] = useState({
    projectName: '',
    clientName: '',
    clientEmail: '',
    projectPrice: '', // Start as string for input handling
    timeline: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    hourlyRate: defaultSettings.defaultHourlyRate || 100,
    currency: defaultSettings.currency || 'USD',
    status: 'Active' as 'Active' | 'On Hold' | 'Completed'
  });

  // Auto-calculate End Date from Timeline
  useEffect(() => {
    if (details.timeline && details.startDate) {
      const timeline = details.timeline.toLowerCase();
      const quantityMatch = timeline.match(/(\d+)/);
      const quantity = quantityMatch ? parseInt(quantityMatch[0]) : 0;

      if (quantity > 0) {
        const date = new Date(details.startDate);
        if (timeline.includes('week')) {
          date.setDate(date.getDate() + (quantity * 7));
        } else if (timeline.includes('month')) {
          date.setMonth(date.getMonth() + quantity);
        } else if (timeline.includes('day')) {
          date.setDate(date.getDate() + quantity);
        }

        // Format to YYYY-MM-DD
        if (!isNaN(date.getTime())) {
          setDetails(prev => ({ ...prev, endDate: date.toISOString().split('T')[0] }));
        }
      }
    }
  }, [details.timeline, details.startDate]);

  // Step 2: In Scope State
  const [inScopeItems, setInScopeItems] = useState<Deliverable[]>([]);
  const [newItem, setNewItem] = useState({
    description: '',
    category: 'Development' as Deliverable['category'],
    status: 'To Do' as Deliverable['status']
  });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Step 3: Out of Scope State
  const [outScopeCustomItems, setOutScopeCustomItems] = useState<Deliverable[]>([]);
  const [selectedCommonExclusions, setSelectedCommonExclusions] = useState<string[]>([]);
  const [newExclusion, setNewExclusion] = useState('');

  // Handlers
  const handleAddItem = () => {
    if (!newItem.description.trim()) return;

    if (editingItemId) {
      // Update existing item
      setInScopeItems(prev => prev.map(item =>
        item.id === editingItemId
          ? {
            ...item,
            description: newItem.description,
            category: newItem.category,
            status: newItem.status
          }
          : item
      ));
      setEditingItemId(null);
    } else {
      // Add new item
      const item: Deliverable = {
        id: Date.now().toString(),
        description: newItem.description,
        category: newItem.category,
        status: newItem.status,
        type: 'IN_SCOPE'
      };
      setInScopeItems([...inScopeItems, item]);
    }

    setNewItem({ description: '', category: 'Development', status: 'To Do' });
  };

  const handleEditItem = (item: Deliverable) => {
    setNewItem({
      description: item.description,
      category: item.category,
      status: item.status
    });
    setEditingItemId(item.id);
  };

  const handleCancelEdit = () => {
    setNewItem({ description: '', category: 'Development', status: 'To Do' });
    setEditingItemId(null);
  };

  const handleRemoveItem = (id: string) => {
    if (editingItemId === id) {
      handleCancelEdit();
    }
    setInScopeItems(inScopeItems.filter(i => i.id !== id));
  };

  const handleAddExclusion = () => {
    if (!newExclusion.trim()) return;
    const item: Deliverable = {
      id: Date.now().toString(),
      description: newExclusion,
      category: 'Other',
      status: 'To Do', // Not really used for out of scope, but needed for type
      type: 'OUT_SCOPE'
    };
    setOutScopeCustomItems([...outScopeCustomItems, item]);
    setNewExclusion('');
  };

  const handleRemoveExclusion = (id: string) => {
    setOutScopeCustomItems(outScopeCustomItems.filter(i => i.id !== id));
  };

  const toggleCommonExclusion = (exclusion: string) => {
    if (selectedCommonExclusions.includes(exclusion)) {
      setSelectedCommonExclusions(selectedCommonExclusions.filter(e => e !== exclusion));
    } else {
      setSelectedCommonExclusions([...selectedCommonExclusions, exclusion]);
    }
  };

  const handleFinish = () => {
    // Convert common exclusions to deliverables
    const commonExclusionDeliverables: Deliverable[] = selectedCommonExclusions.map((ex, idx) => ({
      id: `common-${idx}-${Date.now()}`,
      description: ex,
      category: 'Other',
      status: 'To Do',
      type: 'OUT_SCOPE'
    }));

    const newProject: Project = {
      id: Date.now().toString(),
      projectName: details.projectName,
      clientName: details.clientName,
      clientEmail: details.clientEmail,
      projectPrice: parseFloat(details.projectPrice) || 0,
      hourlyRate: details.hourlyRate,
      currency: details.currency,
      timeline: details.timeline,
      startDate: details.startDate,
      endDate: details.endDate || details.startDate, // Fallback
      status: details.status,
      deliverables: [...inScopeItems, ...outScopeCustomItems, ...commonExclusionDeliverables],
      requests: []
    };

    onSave(newProject);
    const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/project/${toSlug(newProject.projectName)}`);
  };

  // Validation for Step 1
  const isStep1Valid = details.projectName && details.clientName && details.clientEmail && details.projectPrice;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Stepper Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Define Project Scope</h1>
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-border -z-10"></div>

          <div className={`flex flex-col items-center bg-card p-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-1 transition-colors ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>1</div>
            <span className="text-sm font-medium">Details</span>
          </div>

          <div className={`flex flex-col items-center bg-card p-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-1 transition-colors ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</div>
            <span className="text-sm font-medium">In Scope</span>
          </div>

          <div className={`flex flex-col items-center bg-card p-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-1 transition-colors ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>3</div>
            <span className="text-sm font-medium">Out of Scope</span>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden backdrop-blur-sm">

        {/* STEP 1: DETAILS */}
        {step === 1 && (
          <div className="p-6 sm:p-8 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Briefcase className="text-primary" />
              Project Essentials
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-1">Project Name <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  className="w-full p-3 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground"
                  placeholder="e.g. Website Redesign 2024"
                  value={details.projectName}
                  onChange={e => setDetails({ ...details, projectName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Client Name <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  className="w-full p-3 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground"
                  placeholder="e.g. Acme Corp"
                  value={details.clientName}
                  onChange={e => setDetails({ ...details, clientName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Client Email <span className="text-destructive">*</span></label>
                <input
                  type="email"
                  className="w-full p-3 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground"
                  placeholder="contact@client.com"
                  value={details.clientEmail}
                  onChange={e => setDetails({ ...details, clientEmail: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Project Price <span className="text-destructive">*</span></label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="number"
                    className="w-full p-3 pl-10 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground"
                    placeholder="5000.00"
                    value={details.projectPrice}
                    onChange={e => setDetails({ ...details, projectPrice: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Hourly Rate ({details.currency}) <span className="text-destructive">*</span></label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="number"
                    className="w-full p-3 pl-10 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground"
                    placeholder="100"
                    value={details.hourlyRate}
                    onChange={e => setDetails({ ...details, hourlyRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Currency</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <select
                    className="w-full p-3 pl-10 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-muted/50 text-foreground"
                    value={details.currency}
                    onChange={e => setDetails({ ...details, currency: e.target.value })}
                  >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Project Status</label>
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <select
                    className="w-full p-3 pl-10 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-muted/50 text-foreground"
                    value={details.status}
                    onChange={e => setDetails({ ...details, status: e.target.value as any })}
                  >
                    {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Timeline</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    className="w-full p-3 pl-10 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground"
                    placeholder="e.g. 6 weeks"
                    value={details.timeline}
                    onChange={e => setDetails({ ...details, timeline: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="date"
                    className="w-full p-3 pl-10 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
                    value={details.startDate}
                    onChange={e => setDetails({ ...details, startDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">End Date (Estimated)</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="date"
                    className="w-full p-3 pl-10 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
                    value={details.endDate}
                    onChange={e => setDetails({ ...details, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: IN SCOPE */}
        {step === 2 && (
          <div className="p-6 sm:p-8 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-green-500 mb-2 flex items-center gap-2">
              <CheckCircle className="text-green-500" />
              In Scope Deliverables
            </h2>
            <p className="text-muted-foreground mb-6">What specifically are you delivering? Be as detailed as possible.</p>

            <div className={`bg-muted/30 p-4 rounded-lg border ${editingItemId ? 'border-primary ring-1 ring-primary/20' : 'border-border'} mb-6 transition-colors`}>
              {editingItemId && <div className="text-xs font-bold text-primary uppercase mb-2">Editing Item</div>}
              <div className="flex flex-col gap-3">
                <div className="w-full">
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-foreground placeholder:text-muted-foreground"
                    placeholder="e.g. Home page design with 2 rounds of revisions"
                    value={newItem.description}
                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="w-full sm:w-1/2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                    <select
                      className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-muted/50 text-foreground"
                      value={newItem.category}
                      onChange={e => setNewItem({ ...newItem, category: e.target.value as any })}
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="w-full sm:w-1/2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
                    <select
                      className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-muted/50 text-foreground"
                      value={newItem.status}
                      onChange={e => setNewItem({ ...newItem, status: e.target.value as any })}
                    >
                      {STATUSES.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-1">
                  {editingItemId && (
                    <button
                      onClick={handleCancelEdit}
                      className="bg-card text-muted-foreground border border-border px-4 py-2 rounded-lg hover:bg-muted flex items-center gap-2"
                    >
                      <X size={18} /> Cancel
                    </button>
                  )}
                  <button
                    onClick={handleAddItem}
                    disabled={!newItem.description.trim()}
                    className={`${editingItemId ? 'bg-primary hover:bg-primary/90' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[100px] transition-colors`}
                  >
                    {editingItemId ? <Save size={20} /> : <Plus size={20} />}
                    <span>{editingItemId ? 'Update' : 'Add'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {inScopeItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  No deliverables added yet. Add at least one to proceed.
                </div>
              )}
              {inScopeItems.map(item => (
                <div key={item.id} className={`flex items-center justify-between p-3 bg-card border rounded-lg shadow-sm group transition-colors ${editingItemId === item.id ? 'border-primary ring-1 ring-primary/20' : 'border-border'}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-green-500"><Check size={18} /></div>
                    <div>
                      <p className="font-medium text-foreground">{item.description}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span className="bg-muted px-2 py-0.5 rounded">{item.category}</span>
                        <span className={`px-2 py-0.5 rounded ${item.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                          item.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500' :
                            'bg-muted text-muted-foreground'
                          }`}>{item.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="text-muted-foreground hover:text-primary p-2 hover:bg-primary/10 rounded transition-colors"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-muted-foreground hover:text-destructive p-2 hover:bg-destructive/10 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: OUT OF SCOPE */}
        {step === 3 && (
          <div className="p-6 sm:p-8 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-destructive mb-2 flex items-center gap-2">
              <XCircle className="text-destructive" />
              Out of Scope (Exclusions)
            </h2>
            <p className="text-muted-foreground mb-6">Explicitly exclude items to prevent &quot;I thought that was included&quot; later.</p>

            <div className="mb-8">
              <h3 className="font-medium text-foreground mb-3">Common Exclusions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {COMMON_EXCLUSIONS.map(ex => (
                  <label
                    key={ex}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedCommonExclusions.includes(ex)
                      ? 'bg-destructive/10 border-destructive/30 text-destructive'
                      : 'hover:bg-muted/50 border-border text-foreground'
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-destructive rounded border-border focus:ring-destructive"
                      checked={selectedCommonExclusions.includes(ex)}
                      onChange={() => toggleCommonExclusion(ex)}
                    />
                    <span className="text-sm">{ex}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-foreground mb-3">Custom Exclusions</h3>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  className="flex-1 p-3 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-destructive outline-none text-foreground placeholder:text-muted-foreground"
                  placeholder="e.g. Hosting and domain registration"
                  value={newExclusion}
                  onChange={e => setNewExclusion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddExclusion()}
                />
                <button
                  onClick={handleAddExclusion}
                  disabled={!newExclusion.trim()}
                  className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus size={20} /> Add
                </button>
              </div>

              <div className="space-y-2">
                {outScopeCustomItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm group">
                    <div className="flex items-center gap-3">
                      <div className="text-destructive"><XCircle size={18} /></div>
                      <p className="font-medium text-foreground">{item.description}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveExclusion(item.id)}
                      className="text-muted-foreground hover:text-destructive p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer / Navigation */}
        <div className="bg-muted/30 px-6 py-4 border-t border-border flex justify-between items-center">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-muted font-medium flex items-center gap-2"
            >
              <ArrowLeft size={18} /> Back
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 text-muted-foreground hover:text-foreground font-medium"
            >
              Cancel
            </button>
          )}

          <div className="flex gap-3">
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !isStep1Valid}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 shadow-sm"
              >
                <Check size={18} /> Finish & Create Project
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScopeWizard;