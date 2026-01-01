
import React, { useState } from 'react';
import { Save, ArrowLeft, Mail, Lock, Server, AlertCircle, Info, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserSettings, EmailConfig } from '../types';

const CURRENCIES = [
  { code: 'USD', label: 'USD ($)' },
  { code: 'EUR', label: 'EUR (€)' },
  { code: 'GBP', label: 'GBP (£)' },
  { code: 'INR', label: 'INR (₹)' },
  { code: 'CAD', label: 'CAD ($)' },
  { code: 'AUD', label: 'AUD ($)' },
  { code: 'JPY', label: 'JPY (¥)' },
];

interface SettingsProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(settings.emailConfig || {
    provider: 'gmail',
    email: '',
    senderName: '',
    appPassword: '',
    host: 'smtp.gmail.com',
    port: 465
  });
  const [saved, setSaved] = useState(false);

  const handleEmailConfigChange = (field: keyof EmailConfig, value: any) => {
    const newConfig = { ...emailConfig, [field]: value };

    // Auto-set host/port for known providers
    if (field === 'provider') {
      if (value === 'gmail') {
        newConfig.host = 'smtp.gmail.com';
        newConfig.port = 465;
      } else if (value === 'outlook') {
        newConfig.host = 'smtp.office365.com';
        newConfig.port = 587;
      } else {
        newConfig.host = '';
        newConfig.port = 587;
      }
    }

    setEmailConfig(newConfig);
    setFormData(prev => ({ ...prev, emailConfig: newConfig }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const settingsToSave = {
      ...formData,
      emailConfig
    };
    onSave(settingsToSave);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">User Settings</h1>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">

          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Profile Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full p-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Contact Email</label>
                <input
                  type="email"
                  className="w-full p-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Business Name (Optional)</label>
              <input
                type="text"
                className="w-full p-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
                value={formData.businessName}
                onChange={e => setFormData({ ...formData, businessName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Project Defaults</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Default Hourly Rate</label>
                <input
                  type="number"
                  className="w-full p-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
                  value={formData.defaultHourlyRate}
                  onChange={e => setFormData({ ...formData, defaultHourlyRate: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Default Currency</label>
                <select
                  className="w-full p-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="text-lg font-semibold text-foreground">Email Configuration</h2>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Required for Sending</span>
            </div>

            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg flex gap-3 items-start">
              <Info className="text-primary shrink-0 mt-1" size={18} />
              <div className="text-sm text-primary">
                To send emails directly from the app, please provide your email provider details.
                For Gmail, you must use an <strong>App Password</strong>, not your regular login password.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-muted-foreground mb-1">Provider</label>
                <select
                  className="w-full p-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
                  value={emailConfig.provider}
                  onChange={e => handleEmailConfigChange('provider', e.target.value)}
                >
                  <option value="gmail">Gmail</option>
                  <option value="outlook">Outlook / Office 365</option>
                  <option value="custom">Custom SMTP</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-muted-foreground mb-1">Sender Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    className="w-full p-3 pl-10 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
                    value={emailConfig.senderName || ''}
                    onChange={e => handleEmailConfigChange('senderName', e.target.value)}
                    placeholder="e.g. John Doe Studio"
                  />
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-muted-foreground mb-1">Your Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="email"
                    className="w-full p-3 pl-10 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
                    value={emailConfig.email}
                    onChange={e => handleEmailConfigChange('email', e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {emailConfig.provider === 'gmail' ? 'App Password' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="password"
                    className="w-full p-3 pl-10 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
                    value={emailConfig.appPassword}
                    onChange={e => handleEmailConfigChange('appPassword', e.target.value)}
                    placeholder={emailConfig.provider === 'gmail' ? "16-character app password" : "Password"}
                  />
                </div>
              </div>

              {emailConfig.provider === 'gmail' && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">
                    Go to Google Account {'>'} Security {'>'} 2-Step Verification {'>'} App Passwords to generate one.
                  </p>
                </div>
              )}

              {emailConfig.provider === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">SMTP Host</label>
                    <div className="relative">
                      <Server className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                      <input
                        type="text"
                        className="w-full p-3 pl-10 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
                        value={emailConfig.host}
                        onChange={e => handleEmailConfigChange('host', e.target.value)}
                        placeholder="smtp.example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Port</label>
                    <input
                      type="number"
                      className="w-full p-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
                      value={emailConfig.port}
                      onChange={e => handleEmailConfigChange('port', parseInt(e.target.value))}
                      placeholder="465 or 587"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg flex gap-2 items-start mt-4">
              <AlertCircle className="text-yellow-500 shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-yellow-500">
                <strong>Security Note:</strong> Your credentials are stored locally in your browser for this demo.
                Always revoke App Passwords if you stop using the application.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex items-center justify-between">
            {saved && (
              <span className="text-green-500 font-medium animate-in fade-in">
                Settings saved successfully!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:bg-primary/90 font-medium flex items-center gap-2 shadow-sm transition-all"
            >
              <Save size={20} />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
