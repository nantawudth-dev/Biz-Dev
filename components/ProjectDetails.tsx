import React from 'react';
import { Project } from '../types';
import { BriefcaseIcon, ArrowLeftIcon, CheckCircleIcon, UserCircleIcon, BookOpenIcon } from './icons';
import { PROJECT_CATEGORIES } from '../constants';
import Modal from './Modal';

interface ProjectDetailsProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
    icon?: React.ReactNode;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, isOpen, onClose, icon }) => {
    if (!project) return null;

    const statusConfig = {
        'Planned': { label: 'แผนงาน', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
        'In Progress': { label: 'กำลังดำเนินการ', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
        'Completed': { label: 'เสร็จสิ้น', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    };
    const currentStatus = statusConfig[project.status as keyof typeof statusConfig] || statusConfig['Planned'];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={project.name}
            maxWidth="max-w-5xl"
            icon={<div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm shrink-0"><BriefcaseIcon className="w-6 h-6 text-blue-600" /></div>}
            headerClassName="bg-white"
            subtitle={
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border} border shadow-sm`}>
                    <span className={`w-2 h-2 rounded-full ${currentStatus.dot} animate-pulse`}></span>
                    {currentStatus.label}
                </span>
            }
        >
            <div className="space-y-5">
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

                    {/* Left Column */}
                    <div className="lg:col-span-3 space-y-5">

                        {/* Overview Card */}
                        <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6 space-y-5">
                            {/* Budget Row (top) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">ปีงบประมาณ</span>
                                    <p className="text-base font-medium text-blue-600 mt-1">{project.fiscalYear || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">งบประมาณ</span>
                                    <p className="text-xl font-bold text-blue-600 mt-1">
                                        {project.budget ? project.budget.toLocaleString() : '0'}
                                        <span className="text-sm font-normal text-blue-400 ml-1">บาท</span>
                                    </p>
                                </div>
                            </div>

                            {/* Category & Entrepreneur */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-slate-200 pt-5">
                                <div>
                                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">หมวดหมู่</span>
                                    <p className="text-base font-medium text-slate-800 mt-1">
                                        {PROJECT_CATEGORIES.find(c => c.key === project.category)?.label || project.category}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">ผู้ประกอบการ/ หน่วยงาน / แหล่งทุน</span>
                                    <p className="text-base font-medium text-slate-800 mt-1">{project.entrepreneur || '-'}</p>
                                </div>
                            </div>

                            {/* Team */}
                            <div className="border-t border-slate-200 pt-5">
                                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 block">ทีมงาน</span>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                                            <UserCircleIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-slate-400 uppercase">หัวหน้าโครงการ</span>
                                            <p className="text-base font-medium text-slate-800 -mt-0.5">{project.projectLeader}</p>
                                        </div>
                                    </div>
                                    {project.coProjectLeader && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center shrink-0 shadow-sm">
                                                <UserCircleIcon className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-slate-400 uppercase">ผู้ร่วมดำเนินการ</span>
                                                <p className="text-base font-medium text-slate-800 -mt-0.5">{project.coProjectLeader}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {project.description && (
                            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6">
                                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 block">รายละเอียด</span>
                                <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">{project.description}</p>
                            </div>
                        )}

                        {/* Outcome */}
                        {project.outcome && (
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl border border-emerald-200/70 p-6">
                                <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                                    <CheckCircleIcon className="w-4 h-4" />
                                    ผลสัมฤทธิ์โครงการ
                                </span>
                                <p className="text-base text-slate-800 leading-relaxed whitespace-pre-wrap">{project.outcome}</p>
                            </div>
                        )}

                        {/* Report Link */}
                        {project.completeReportLink && (
                            <a
                                href={project.completeReportLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-base rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all font-semibold"
                            >
                                <BookOpenIcon className="w-5 h-5" />
                                ดูรายงานฉบับสมบูรณ์
                            </a>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-5">

                        {/* Vertical Status Timeline Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200/60 relative overflow-hidden">
                            {/* Faint background icon */}
                            <div className="absolute -right-4 -bottom-4 opacity-[0.06]">
                                <BriefcaseIcon className="w-36 h-36" />
                            </div>

                            <span className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-6 block relative z-10">สถานะโครงการ</span>
                            <div className="relative flex flex-col gap-8">
                                {/* Vertical track background */}
                                <div className="absolute left-[18px] top-0 w-1 h-full bg-blue-100 rounded-full z-0"></div>
                                {/* Vertical active track */}
                                <div
                                    className={`absolute left-[18px] top-0 w-1 rounded-full z-[1] transition-all duration-700 ease-in-out ${project.status === 'Completed' ? 'bg-gradient-to-b from-blue-500 via-amber-400 to-emerald-500' :
                                        project.status === 'In Progress' ? 'bg-gradient-to-b from-blue-500 to-amber-400' : 'bg-blue-500'
                                        }`}
                                    style={{
                                        height: project.status === 'Completed' ? '100%' :
                                            project.status === 'In Progress' ? '50%' : '0%'
                                    }}
                                ></div>

                                {/* Step 1 */}
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all duration-300 shrink-0 ${project.status === 'Planned' || project.status === 'In Progress' || project.status === 'Completed'
                                        ? 'bg-gradient-to-br from-blue-400 to-blue-600 border-white text-white shadow-md shadow-blue-500/30'
                                        : 'bg-white border-slate-200 text-slate-400'
                                        }`}>
                                        {project.status === 'In Progress' || project.status === 'Completed' ? <CheckCircleIcon className="w-5 h-5" /> : <span className="text-xs font-bold">1</span>}
                                    </div>
                                    <span className={`text-base font-semibold ${project.status === 'Planned' || project.status === 'In Progress' || project.status === 'Completed' ? 'text-blue-600' : 'text-slate-400'}`}>แผนงาน</span>
                                </div>

                                {/* Step 2 */}
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all duration-300 shrink-0 ${project.status === 'In Progress' || project.status === 'Completed'
                                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-white text-white shadow-md shadow-amber-500/30'
                                        : 'bg-white border-slate-200 text-slate-400'
                                        }`}>
                                        {project.status === 'Completed' ? <CheckCircleIcon className="w-5 h-5" /> : <span className="text-xs font-bold">2</span>}
                                    </div>
                                    <span className={`text-base font-semibold ${project.status === 'In Progress' || project.status === 'Completed' ? 'text-amber-600' : 'text-slate-400'}`}>กำลังดำเนินการ</span>
                                </div>

                                {/* Step 3 */}
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all duration-300 shrink-0 ${project.status === 'Completed'
                                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500 border-white text-white shadow-md shadow-emerald-500/30'
                                        : 'bg-white border-slate-200 text-slate-400'
                                        }`}>
                                        {project.status === 'Completed' ? <CheckCircleIcon className="w-5 h-5" /> : <span className="text-xs font-bold">3</span>}
                                    </div>
                                    <span className={`text-base font-semibold ${project.status === 'Completed' ? 'text-emerald-600' : 'text-slate-400'}`}>เสร็จสิ้น</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ProjectDetails;
