
import React from 'react';
import { Entrepreneur, Project, Course, Consultant } from '../types';
import { BuildingIcon, BriefcaseIcon, BookOpenIcon, UserGroupIcon } from './icons';

interface DashboardViewProps {
    entrepreneurs: Entrepreneur[];
    projects: Project[];
    courses: Course[];
    consultants: Consultant[];
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string; gradient: string }> = ({ icon, label, value, gradient }) => (
    <div className={`relative overflow-hidden rounded-xl shadow-lg p-6 flex items-center gap-6 ${gradient} text-white`}>
        <div className={`relative z-10 p-4 rounded-full bg-white/20 backdrop-blur-sm`}>
            {React.cloneElement(icon as React.ReactElement, { className: "w-8 h-8 text-white" })}
        </div>
        <div className="relative z-10">
            <p className="text-4xl font-bold">{value}</p>
            <p className="text-base font-semibold opacity-90">{label}</p>
        </div>
        {/* Faded Background Icon */}
        <div className="absolute -right-6 -bottom-6 opacity-10 transform rotate-12 pointer-events-none">
            {React.cloneElement(icon as React.ReactElement, { className: "w-40 h-40 text-white" })}
        </div>
    </div>
);

const DashboardView: React.FC<DashboardViewProps> = ({ entrepreneurs, projects, courses, consultants }) => {

    const completedProjects = [...projects].filter(p => p.status === 'Completed').reverse().slice(0, 3);

    const getStatusClass = (status: Project['status']) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'In Progress': return 'bg-amber-100 text-amber-800';
            case 'Planned': return 'bg-slate-200 text-slate-800';
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-4xl font-bold text-slate-900">ภาพรวมระบบ</h2>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<BuildingIcon />}
                    label="ผู้ประกอบการ"
                    value={entrepreneurs.length}
                    gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                />
                <StatCard
                    icon={<BriefcaseIcon />}
                    label="โครงการทั้งหมด"
                    value={projects.length}
                    gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
                />
                <StatCard
                    icon={<BookOpenIcon />}
                    label="คอร์สอบรม"
                    value={courses.length}
                    gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
                />
                <StatCard
                    icon={<UserGroupIcon />}
                    label="ที่ปรึกษา"
                    value={consultants.length}
                    gradient="bg-gradient-to-br from-amber-500 to-amber-700"
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold text-slate-800 p-6 border-b border-slate-200">โครงการที่เสร็จสมบูรณ์ล่าสุด</h3>
                <div className="p-4 space-y-3">
                    {completedProjects.length > 0 ? completedProjects.map(proj => (
                        <div key={proj.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-slate-800">{proj.name}</p>
                                <p className="text-sm text-slate-500">
                                    สำหรับ: {proj.entrepreneur}
                                </p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(proj.status)}`}>
                                {proj.status}
                            </span>
                        </div>
                    )) : <p className="text-slate-500 text-center p-8">ไม่มีโครงการที่เสร็จสมบูรณ์</p>}
                </div>
            </div>
        </div>
    );
};

export default DashboardView;