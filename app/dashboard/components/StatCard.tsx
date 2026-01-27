import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
    icon?: React.ElementType;
    color?: string; // Tailwind color class prefix e.g. 'blue'
}

export default function StatCard({ title, value, trend, trendUp, icon: Icon, color = 'blue' }: StatCardProps) {
    return (
        <div className="bg-neutral-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="flex justify-between items-start z-10 relative">
                <div>
                    <p className="text-sm font-medium text-neutral-400">{title}</p>
                    <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
                </div>
                {Icon && (
                    <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:bg-${color}-500/20 transition-colors`}>
                        <Icon size={22} />
                    </div>
                )}
            </div>

            {trend && (
                <div className="mt-4 flex items-center gap-2 text-sm z-10 relative">
                    <span className={`${trendUp ? 'text-green-400' : 'text-red-400'} flex items-center font-medium`}>
                        {trendUp ? '↑' : '↓'} {trend}
                    </span>
                    <span className="text-neutral-500">vs last month</span>
                </div>
            )}

            {/* Decorative Gradient Blob */}
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-${color}-500/20 blur-[40px] rounded-full group-hover:bg-${color}-500/30 transition-colors duration-500`} />
        </div>
    );
}
