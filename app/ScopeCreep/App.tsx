"use client";
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import ScopeWizard from './components/ScopeWizard';
import Settings from './components/Settings';
import { Project, UserSettings } from './types';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

const App: React.FC = () => {
  // State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  // API Base URL
  const API_URL = 'http://127.0.0.1:3001/api';

  // Load Supabase Auth Session
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const user = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email,
        };
        setCurrentUser(user);
        fetchProjects(user.id);
        loadSettings(user.id);
      }
      setIsAuthChecking(false);
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email,
        };
        setCurrentUser(user);
        fetchProjects(user.id);
      } else {
        setCurrentUser(null);
        setProjects([]);
        // Redirect to main app login
        window.location.href = '/auth/login';
      }
    });

    return () => subscription.unsubscribe();
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

  const loadSettings = (userId: string) => {
    const saved = localStorage.getItem(`scp_settings_${userId}`);
    if (saved) {
      try {
        setUserSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setProjects([]);
    window.location.href = '/auth/login';
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
    if (currentUser) {
      setUserSettings(newSettings);
      localStorage.setItem(`scp_settings_${currentUser.id}`, JSON.stringify(newSettings));
    }
  };

  const effectiveSettings = userSettings || {
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    defaultHourlyRate: 100,
    currency: 'USD'
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    // Middleware already redirects to /auth/login, but just in case:
    window.location.href = '/auth/login';
    return null;
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
                  userSettings={effectiveSettings}
                />
              }
            />
            <Route
              path="/new"
              element={
                <ScopeWizard
                  onSave={handleSaveNewProject}
                  defaultSettings={effectiveSettings}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <Settings
                  settings={effectiveSettings}
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
