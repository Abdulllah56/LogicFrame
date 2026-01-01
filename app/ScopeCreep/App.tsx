"use client";
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import ScopeWizard from './components/ScopeWizard';
import Settings from './components/Settings';
import Auth from './components/Auth';
import { Project, UserSettings } from './types';

const App: React.FC = () => {
  // State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // API Base URL
  const API_URL = 'http://127.0.0.1:3001/api';

  // Load User Session
  useEffect(() => {
    const savedUser = localStorage.getItem('scp_user_session');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        fetchProjects(user.id);
      } catch (e) {
        console.error("Failed to parse user session", e);
        localStorage.removeItem('scp_user_session');
      }
    }
    setIsAuthChecking(false);
  }, []);

  const fetchProjects = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/projects?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (e) {
      console.error("Failed to fetch projects", e);
    } finally {
      setLoading(false);
    }
  };

  // Auth Handlers
  const handleLogin = async (email: string, pass: string) => {
    setAuthError('');
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data);
        localStorage.setItem('scp_user_session', JSON.stringify(data));
        fetchProjects(data.id);
      } else {
        setAuthError(data.error || 'Login failed');
      }
    } catch (e) {
      setAuthError('Connection error. Is server running?');
    }
  };

  const handleSignup = async (email: string, pass: string, name: string) => {
    setAuthError('');
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, name })
      });

      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data);
        localStorage.setItem('scp_user_session', JSON.stringify(data));
        setProjects([]); // New user has no projects
      } else {
        setAuthError(data.error || 'Signup failed');
      }
    } catch (e) {
      setAuthError('Connection error. Is server running?');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setProjects([]);
    localStorage.removeItem('scp_user_session');
  };

  // Data Saving Helpers
  const saveProjectToBackend = async (project: Project) => {
    if (!currentUser) return;
    try {
      await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, project })
      });
      // Reload to ensure sync
      fetchProjects(currentUser.id);
    } catch (e) {
      console.error("Failed to save project", e);
    }
  };

  const handleSaveNewProject = (newProject: Project) => {
    // Ensure ID is a valid UUID for the DB
    const projectWithUuid = {
      ...newProject,
      id: crypto.randomUUID(),
      deliverables: newProject.deliverables.map(d => ({ ...d, id: crypto.randomUUID() })),
      requests: newProject.requests.map(r => ({ ...r, id: crypto.randomUUID() }))
    };

    // Optimistic Update
    setProjects(prev => [projectWithUuid, ...prev]);
    // Sync to DB
    saveProjectToBackend(projectWithUuid);
  };

  const updateCurrentUserProject = (updatedProject: Project) => {
    // Optimistic Update
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    // Sync to DB
    saveProjectToBackend(updatedProject);
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    // For prototype, we update local state. In production, add PUT /api/user endpoint
    if (currentUser) {
      const updatedUser = { ...currentUser, settings: newSettings };
      setCurrentUser(updatedUser);
      localStorage.setItem('scp_user_session', JSON.stringify(updatedUser));
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onLogin={handleLogin} onSignup={handleSignup} error={authError} />;
  }

  return (
    <>
      <div className="fixed inset-0 bg-gradient-radial from-[rgba(0,217,255,0.08)] from-0% to-transparent to-50% via-[rgba(0,217,255,0.06)] via-80% z-[-1] pointer-events-none"></div>
      <div className="fixed w-[300px] h-[300px] bg-[rgba(0,217,255,0.3)] rounded-full blur-[80px] opacity-30 top-[10%] left-[10%] animate-float z-[-1] pointer-events-none"></div>
      <div className="fixed w-[400px] h-[400px] bg-[rgba(0,217,255,0.2)] rounded-full blur-[80px] opacity-30 bottom-[10%] right-[10%] animate-float animation-delay-7000 z-[-1] pointer-events-none"></div>

      <Router>
        <div className="min-h-screen bg-transparent pb-20">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  projects={projects}
                  onLogout={handleLogout}
                  userName={currentUser.name || currentUser.email}
                />
              }
            />
            <Route
              path="/project/:slug"
              element={
                <ProjectDetail
                  projects={projects}
                  updateProject={updateCurrentUserProject}
                  userSettings={currentUser.settings || {}}
                />
              }
            />
            <Route
              path="/new"
              element={
                <ScopeWizard
                  onSave={handleSaveNewProject}
                  defaultSettings={currentUser.settings || {}}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <Settings
                  settings={currentUser.settings || {
                    name: currentUser.name,
                    email: currentUser.email,
                    defaultHourlyRate: 100,
                    currency: 'USD'
                  }}
                  onSave={handleSaveSettings}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </>
  );
};

export default App;
