"use client"
import React, { useState } from 'react';
import { ShieldAlert, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

interface AuthProps {
  onLogin: (email: string, pass: string) => void;
  onSignup: (email: string, pass: string, name: string) => void;
  error?: string;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onSignup, error }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [localError, setLocalError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (isLogin) {
      onLogin(formData.email, formData.password);
    } else {
      // Signup Validations
      if (formData.password.length < 6) {
        setLocalError('Password must be at least 6 characters long');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }

      onSignup(formData.email, formData.password, formData.name);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setLocalError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-xl shadow-lg overflow-hidden border border-border backdrop-blur-sm">
        <div className="bg-primary/10 p-6 text-center border-b border-border">
          <div className="mx-auto w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary mb-4">
            <ShieldAlert size={28} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Scope Creep Protector</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Stop doing unpaid work. Start tracking properly.
          </p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>

          {(error || localError) && (
            <div className="mb-6 p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20 flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    required
                    className="w-full p-3 pl-10 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="email"
                  required
                  className="w-full p-3 pl-10 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="password"
                  required
                  className="w-full p-3 pl-10 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground"
                  placeholder="••••••••"
                  minLength={6}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              {!isLogin && <p className="text-xs text-muted-foreground mt-1 ml-1">Min. 6 characters</p>}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="password"
                    required
                    className="w-full p-3 pl-10 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm flex justify-center items-center gap-2 mt-4"
            >
              {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={toggleMode}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? 'Sign up now' : 'Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
