import React, { useState } from 'react';
import { Request } from '../types';
import { REQUEST_CATEGORIES } from '../constants';
import { X, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

interface RequestLogFormProps {
  hourlyRate: number;
  currency?: string;
  onCancel: () => void;
  onSave: (request: Omit<Request, 'id'>) => void;
}

const RequestLogForm: React.FC<RequestLogFormProps> = ({ hourlyRate, currency = '$', onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    requestText: '',
    category: 'New Feature',
    scopeStatus: 'OUT_SCOPE' as 'IN_SCOPE' | 'OUT_SCOPE' | 'UNCLEAR',
    estimatedHours: 0,
    timelineImpact: '',
    justification: ''
  });

  const calculatedCost = formData.estimatedHours * hourlyRate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      requestText: formData.requestText,
      category: formData.category as any,
      scopeStatus: formData.scopeStatus,
      estimatedHours: formData.estimatedHours,
      timelineImpact: formData.timelineImpact,
      justification: formData.justification,
      date: new Date().toISOString(),
      estimatedCost: calculatedCost,
      status: formData.scopeStatus === 'IN_SCOPE' ? 'Approved' : 'Pending'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Log Client Request</h2>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Request Description</label>
            <textarea
              required
              rows={3}
              className="w-full p-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-foreground placeholder:text-muted-foreground"
              placeholder="Paste what the client asked for..."
              value={formData.requestText}
              onChange={e => setFormData({ ...formData, requestText: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
              <select
                className="w-full p-2.5 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                {REQUEST_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Timeline Impact</label>
              <input
                type="text"
                className="w-full p-2.5 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground"
                placeholder="e.g., +2 days"
                value={formData.timelineImpact}
                onChange={e => setFormData({ ...formData, timelineImpact: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-3">Is this In Scope?</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className={`
                cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all
                ${formData.scopeStatus === 'IN_SCOPE' ? 'border-green-500 bg-green-500/10 ring-1 ring-green-500' : 'border-border hover:bg-muted/30'}
              `}>
                <input type="radio" className="hidden" name="scope" onClick={() => setFormData({ ...formData, scopeStatus: 'IN_SCOPE' })} />
                <CheckCircle className={formData.scopeStatus === 'IN_SCOPE' ? 'text-green-500' : 'text-muted-foreground'} />
                <span className="font-medium text-sm text-foreground">In Scope</span>
                <span className="text-xs text-muted-foreground">Included in budget</span>
              </label>

              <label className={`
                cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all
                ${formData.scopeStatus === 'OUT_SCOPE' ? 'border-destructive bg-destructive/10 ring-1 ring-destructive' : 'border-border hover:bg-muted/30'}
              `}>
                <input type="radio" className="hidden" name="scope" onClick={() => setFormData({ ...formData, scopeStatus: 'OUT_SCOPE' })} />
                <AlertCircle className={formData.scopeStatus === 'OUT_SCOPE' ? 'text-destructive' : 'text-muted-foreground'} />
                <span className="font-medium text-sm text-foreground">Out of Scope</span>
                <span className="text-xs text-muted-foreground">Extra payment needed</span>
              </label>

              <label className={`
                cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all
                ${formData.scopeStatus === 'UNCLEAR' ? 'border-yellow-500 bg-yellow-500/10 ring-1 ring-yellow-500' : 'border-border hover:bg-muted/30'}
              `}>
                <input type="radio" className="hidden" name="scope" onClick={() => setFormData({ ...formData, scopeStatus: 'UNCLEAR' })} />
                <HelpCircle className={formData.scopeStatus === 'UNCLEAR' ? 'text-yellow-500' : 'text-muted-foreground'} />
                <span className="font-medium text-sm text-foreground">Unclear</span>
                <span className="text-xs text-muted-foreground">Needs discussion</span>
              </label>
            </div>
          </div>

          {formData.scopeStatus === 'OUT_SCOPE' && (
            <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20 animate-in fade-in slide-in-from-top-2">
              <h4 className="font-medium text-destructive mb-3">Cost Estimation</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-destructive mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="w-full p-2 border border-destructive/30 bg-destructive/5 rounded-md focus:ring-2 focus:ring-destructive outline-none text-foreground"
                    value={formData.estimatedHours}
                    onChange={e => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-destructive mb-1">Hourly Rate</label>
                  <input
                    type="number"
                    disabled
                    className="w-full p-2 border border-destructive/20 bg-destructive/10 text-muted-foreground rounded-md"
                    value={hourlyRate}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center border-t border-destructive/20 pt-3">
                <span className="text-destructive font-medium">Total Additional Cost:</span>
                <span className="text-2xl font-bold text-destructive">{currency}{calculatedCost.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Justification (Optional)</label>
            <textarea
              rows={2}
              className="w-full p-2.5 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground"
              placeholder="Why is this in/out of scope? Any dependencies?"
              value={formData.justification}
              onChange={e => setFormData({ ...formData, justification: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium shadow-sm"
            >
              Log Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestLogForm;