"use client";
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import ScopeWizard from './components/ScopeWizard';
import Settings from './components/Settings';
import { Project, UserSettings } from './types';
import { createClient } from '@/utils/supabase/client';
import { useGuestLimit } from '@/utils/useGuestLimit';
import { GuestLimitModal, GuestUsageBanner } from '@/app/components/GuestLimitModal';

const supabase = createClient();

const App: React.FC = () => {
  // State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  const { isGuest, usesLeft, limit, tryUse, requireAuth, showModal, authOnlyFeature, closeModal } = useGuestLimit('scopecreep');



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
        loadSettings(user.id);
      } else {
        setCurrentUser(null);
        setProjects([]);
        // Guest mode — don't redirect, let them view the app
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProjects = async (userId: string) => {
    setLoading(true);
    try {
      const { data: projectsData, error: projError } = await supabase
        .from('projects')
        .select(`
          *,
          deliverables(*),
          requests(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (projError) throw projError;

      const mappedProjects: Project[] = (projectsData || []).map((p: any) => ({
        id: p.id,
        projectName: p.project_name,
        clientName: p.client_name,
        clientEmail: p.client_email,
        projectPrice: Number(p.project_price),
        hourlyRate: Number(p.hourly_rate),
        currency: p.currency,
        timeline: p.timeline,
        startDate: p.start_date ? String(p.start_date).split('T')[0] : '',
        endDate: p.end_date ? String(p.end_date).split('T')[0] : '',
        status: p.status,
        deliverables: (p.deliverables || []).map((d: any) => ({
          id: d.id,
          description: d.description,
          category: d.category,
          status: d.status,
          type: d.scope_type
        })),
        requests: (p.requests || []).sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).map((r: any) => ({
          id: r.id,
          requestText: r.request_text,
          date: r.request_date ? String(r.request_date).split('T')[0] : '',
          category: r.category,
          scopeStatus: r.scope_status,
          estimatedHours: Number(r.estimated_hours),
          estimatedCost: Number(r.estimated_cost),
          timelineImpact: r.timeline_impact,
          justification: r.notes,
          status: r.status
        }))
      }));

      setProjects(mappedProjects);
    } catch (e) {
      console.error("Failed to fetch projects", e);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('scopecreep_user_settings')
        .select('settings')
        .eq('user_id', userId)
        .single();
      
      if (data?.settings) {
        setUserSettings(data.settings);
        // Backup to localStorage
        localStorage.setItem(`scp_settings_${userId}`, JSON.stringify(data.settings));
      } else {
        // Fallback to localStorage for legacy users
        const saved = localStorage.getItem(`scp_settings_${userId}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setUserSettings(parsed);
            // Save to DB now
            handleSaveSettings(parsed, userId);
          } catch (e) {}
        }
      }
    } catch (e) {
      console.error("Failed to load settings from DB", e);
    }
  };

  const handleSaveSettings = async (newSettings: UserSettings, userIdOverride?: string) => {
    const userId = userIdOverride || currentUser?.id;
    if (!userId) return;

    setUserSettings(newSettings);
    localStorage.setItem(`scp_settings_${userId}`, JSON.stringify(newSettings));

    try {
      await supabase.from('scopecreep_user_settings').upsert({
        user_id: userId,
        settings: newSettings,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error("Failed to save settings to DB", e);
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
      const { error: pError } = await supabase.from('projects').upsert({
        id: project.id,
        user_id: currentUser.id,
        project_name: project.projectName,
        client_name: project.clientName,
        client_email: project.clientEmail,
        project_price: project.projectPrice,
        hourly_rate: project.hourlyRate,
        currency: project.currency,
        timeline: project.timeline,
        start_date: project.startDate || null,
        end_date: project.endDate || null,
        status: project.status
      });

      if (pError) throw pError;

      // Clean out existing children to run fresh sync (mimicking original backend logic)
      await supabase.from('deliverables').delete().eq('project_id', project.id);
      await supabase.from('requests').delete().eq('project_id', project.id);

      if (project.deliverables && project.deliverables.length > 0) {
        await supabase.from('deliverables').insert(
          project.deliverables.map(d => ({
            id: d.id,
            project_id: project.id,
            description: d.description,
            category: d.category,
            status: d.status,
            scope_type: d.type
          }))
        );
      }

      if (project.requests && project.requests.length > 0) {
        await supabase.from('requests').insert(
          project.requests.map(r => ({
            id: r.id,
            project_id: project.id,
            request_text: r.requestText,
            request_date: r.date || null,
            category: r.category,
            scope_status: r.scopeStatus,
            estimated_hours: r.estimatedHours || 0,
            estimated_cost: r.estimatedCost || 0,
            timeline_impact: r.timelineImpact,
            notes: r.justification || '',
            status: r.status
          }))
        );
      }
    } catch (e) {
      console.error("Failed to save project", e);
      // Rollback optimistic update on failure by reloading true state
      fetchProjects(currentUser.id);
    }
  };

  const handleSaveNewProject = (newProject: Project) => {
    // Guest limit gate
    if (!tryUse()) return;

    // Ensure ID is a valid UUID for the DB
    const projectWithUuid = {
      ...newProject,
      id: crypto.randomUUID(),
      deliverables: newProject.deliverables.map(d => ({ ...d, id: crypto.randomUUID() })),
      requests: newProject.requests.map(r => ({ ...r, id: crypto.randomUUID() }))
    };

    // Optimistic Update
    setProjects(prev => [projectWithUuid, ...prev]);
    // Sync to DB (only when logged in)
    if (currentUser) saveProjectToBackend(projectWithUuid);
  };

  const updateCurrentUserProject = (updatedProject: Project) => {
    // Optimistic Update
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    // Sync to DB
    saveProjectToBackend(updatedProject);
  };

  const handleDeleteProject = async (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (currentUser) {
      try {
        await supabase.from('projects').delete().eq('id', projectId).eq('user_id', currentUser.id);
      } catch (e) {
        console.error("Failed to delete project", e);
      }
    }
  };

  const effectiveSettings = userSettings || {
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    businessName: '',
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

  return (
    <>
      <GuestLimitModal open={showModal} onClose={closeModal} toolName="ScopeCreep" usesLeft={usesLeft} limit={limit} authOnlyFeature={authOnlyFeature} />
      <GuestUsageBanner isGuest={isGuest} usesLeft={usesLeft} limit={limit} toolName="project creation" />
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
                  userName={currentUser?.name || currentUser?.email}
                  onDeleteProject={handleDeleteProject}
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
                  requireAuth={requireAuth}
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
