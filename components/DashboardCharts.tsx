import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { Project } from '../types';

interface DashboardChartsProps {
    projects: Project[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl">
                <p className="text-sm font-semibold text-slate-700 mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: <span className="font-bold">{entry.value.toLocaleString()}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const DashboardCharts: React.FC<DashboardChartsProps> = ({ projects }) => {
    // 1. Status Distribution
    const statusData = [
        { name: 'Completed', value: projects.filter(p => p.status === 'Completed').length },
        { name: 'In Progress', value: projects.filter(p => p.status === 'In Progress').length },
        { name: 'Planned', value: projects.filter(p => p.status === 'Planned').length },
    ].filter(d => d.value > 0);

    // 2. Budget by Fiscal Year (Trend)
    const budgetByYear = projects.reduce((acc, project) => {
        const year = project.fiscalYear || 'Unknown';
        if (!acc[year]) acc[year] = 0;
        acc[year] += project.budget || 0;
        return acc;
    }, {} as Record<string, number>);

    const budgetData = Object.keys(budgetByYear)
        .sort()
        .map(year => ({
            year,
            budget: budgetByYear[year]
        }));

    // 3. Projects by Category
    const categoryCounts = projects.reduce((acc, project) => {
        const cat = project.category || 'Other';
        if (!acc[cat]) acc[cat] = 0;
        acc[cat]++;
        return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.keys(categoryCounts).map(cat => ({
        name: cat.length > 10 ? cat.substring(0, 10) + '...' : cat,
        fullName: cat,
        count: categoryCounts[cat]
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
            {/* Status Chart - Donut */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 text-center">สถานะโครงการ</h3>
                <div className="h-48 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={65}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                        <span className="text-2xl font-bold text-slate-700">{projects.length}</span>
                    </div>
                </div>
            </div>

            {/* Budget Trend - Area Chart */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 text-center">แนวโน้มงบประมาณ</h3>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={budgetData} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="budget"
                                name="งบประมาณ"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorBudget)"
                                animationDuration={1500}
                                dot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                                label={{
                                    position: 'top',
                                    fill: '#10b981',
                                    fontSize: 11,
                                    formatter: (val: number) => `${(val / 1000000).toFixed(1)}M`,
                                    dy: -5
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>


            {/* Category Chart - Bar */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 text-center">หมวดหมู่โครงการ</h3>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0.8} />
                                </linearGradient>
                                <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0.8} />
                                </linearGradient>
                                <linearGradient id="gradPink" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ec4899" stopOpacity={1} />
                                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0.8} />
                                </linearGradient>
                                <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0.8} />
                                </linearGradient>
                                <linearGradient id="gradAmber" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0.8} />
                                </linearGradient>
                                <linearGradient id="gradIndigo" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0.8} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} interval={0} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                            <Bar
                                dataKey="count"
                                name="จำนวน"
                                radius={[6, 6, 0, 0]}
                                barSize={40}
                                animationDuration={1500}
                                stroke="none"
                                label={{ position: 'top', fill: '#64748b', fontSize: 12 }}
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={[
                                        'url(#gradBlue)',
                                        'url(#gradPurple)',
                                        'url(#gradPink)',
                                        'url(#gradGreen)',
                                        'url(#gradAmber)',
                                        'url(#gradIndigo)',
                                    ][index % 6]}
                                        style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.05))' }}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;
