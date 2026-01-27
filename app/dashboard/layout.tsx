import React from 'react';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-neutral-950 text-white overflow-hidden font-sans selection:bg-cyan-500/30">
            {/* Sidebar */}
            <div className="hidden md:flex flex-col w-64 fixed inset-y-0 z-50">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex flex-col flex-1 md:pl-64 h-full relative">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto bg-neutral-900/50 p-6 md:p-8 relative">
                    {/* Ambient background glow */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
                        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                    </div>
                    {children}
                </main>
            </div>
        </div>
    );
}
