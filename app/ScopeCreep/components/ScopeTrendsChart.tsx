import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Project } from '../types';

interface ScopeTrendsChartProps {
    projects: Project[];
}

const ScopeTrendsChart: React.FC<ScopeTrendsChartProps> = ({ projects }) => {
    const data = projects.map(project => {
        const outOfScopeValue = project.requests
            .filter(r => r.scopeStatus === 'OUT_SCOPE')
            .reduce((sum, r) => sum + r.estimatedCost, 0);

        return {
            name: project.projectName,
            budget: project.projectPrice,
            creep: outOfScopeValue,
            currency: project.currency || '$'
        };
    });

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/90 border border-border p-3 rounded-lg shadow-lg backdrop-blur-md">
                    <p className="font-bold text-foreground mb-2">{label}</p>
                    <p className="text-primary text-sm">
                        Original Budget: {payload[0].payload.currency}{payload[0].value.toLocaleString()}
                    </p>
                    <p className="text-destructive text-sm">
                        Scope Creep: {payload[1].payload.currency}{payload[1].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (projects.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-white/[0.02] rounded-xl border border-border border-dashed backdrop-blur-md">
                Add projects to see scope trends
            </div>
        );
    }

    return (
        <div className="bg-white/[0.02] p-6 rounded-xl shadow-sm border border-border backdrop-blur-md h-[400px]">
            <h3 className="text-lg font-bold text-foreground mb-6">Budget vs. Scope Creep</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.2)' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar
                        dataKey="budget"
                        name="Original Budget"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={50}
                    />
                    <Bar
                        dataKey="creep"
                        name="Scope Creep Value"
                        fill="hsl(var(--destructive))"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={50}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ScopeTrendsChart;
