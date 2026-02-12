
import React, { useState } from 'react';
import { Entrepreneur, Project, Course, Consultant } from '../types';
import { BuildingIcon, BriefcaseIcon, BookOpenIcon, UserGroupIcon, ArrowLeftIcon, CheckCircleIcon, UserCircleIcon, CalendarIcon, EyeIcon } from './icons';
import Pagination from './Pagination';

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
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const completedProjects = [...projects].filter(p => p.status === 'Completed').reverse();

    // Pagination
    const paginatedProjects = completedProjects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleBackToList = () => {
        setSelectedProject(null);
    };

    const getCategoryLabel = (category: Project['category']) => {
        switch (category) {
            case 'Consulting': return 'งานที่ปรึกษา';
            case 'Research': return 'งานวิจัย';
            case 'Academic Services': return 'งานบริการวิชาการ';
            case 'Biz-Lab': return 'งานโครงการ Biz-Lab';
            default: return category;
        }
    };

    // If a project is selected, show the detail view
    if (selectedProject) {
        return (
            <div className="space-y-6">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBackToList}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md font-semibold"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        กลับ
                    </button>
                    <div className="flex items-center gap-3">
                        <BriefcaseIcon className="w-8 h-8 text-emerald-600" />
                        <h2 className="text-3xl font-medium font-title text-slate-900">{selectedProject.name}</h2>
                    </div>
                </div>

                {/* Project Details Card */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">ชื่อโครงการ</label>
                            <p className="text-lg font-medium text-slate-900 mt-1">{selectedProject.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">สถานะ</label>
                            <div className="mt-1">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                                    <CheckCircleIcon className="w-4 h-4" />
                                    เสร็จสมบูรณ์
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">หมวดหมู่</label>
                            <p className="text-lg font-medium text-slate-900 mt-1">{getCategoryLabel(selectedProject.category)}</p>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">ผู้ประกอบการ</label>
                            <p className="text-lg font-medium text-slate-900 mt-1">{selectedProject.entrepreneur}</p>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">งบประมาณ</label>
                            <p className="text-lg font-medium text-slate-900 mt-1">{selectedProject.budget.toLocaleString()} บาท</p>
                        </div>
                        {selectedProject.fiscalYear && (
                            <div>
                                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">ปีงบประมาณ</label>
                                <p className="text-lg font-medium text-slate-900 mt-1">{selectedProject.fiscalYear}</p>
                            </div>
                        )}
                    </div>

                    {selectedProject.description && (
                        <div>
                            <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">รายละเอียด</label>
                            <p className="text-base text-slate-700 mt-2 leading-relaxed">{selectedProject.description}</p>
                        </div>
                    )}

                    {selectedProject.outcome && (
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6">
                            <label className="text-sm font-semibold text-emerald-700 uppercase tracking-wide flex items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5" />
                                ผลลัพธ์โครงการ
                            </label>
                            <p className="text-base text-slate-800 mt-3 leading-relaxed">{selectedProject.outcome}</p>
                        </div>
                    )}

                    {/* Team Information */}
                    <div className="border-t border-slate-200 pt-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">ทีมงาน</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <UserCircleIcon className="w-6 h-6 text-blue-600 mt-0.5" />
                                <div>
                                    <label className="text-sm font-semibold text-slate-500">หัวหน้าโครงการ</label>
                                    <p className="text-base font-medium text-slate-900">{selectedProject.projectLeader}</p>
                                </div>
                            </div>
                            {selectedProject.coProjectLeader && (
                                <div className="flex items-start gap-3">
                                    <UserCircleIcon className="w-6 h-6 text-slate-600 mt-0.5" />
                                    <div>
                                        <label className="text-sm font-semibold text-slate-500">ผู้ร่วมดำเนินการ</label>
                                        <p className="text-base font-medium text-slate-900">{selectedProject.coProjectLeader}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {selectedProject.completeReportLink && (
                        <div className="border-t border-slate-200 pt-6">
                            <a
                                href={selectedProject.completeReportLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
                            >
                                <BookOpenIcon className="w-5 h-5" />
                                ดูรายงานฉบับสมบูรณ์
                            </a>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-medium font-title text-slate-900">ภาพรวมระบบ</h2>

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
                    gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                />
                <StatCard
                    icon={<BookOpenIcon />}
                    label="หลักสูตร"
                    value={courses.length}
                    gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
                />
                <StatCard
                    icon={<UserGroupIcon />}
                    label="ผู้เชี่ยวชาญ"
                    value={consultants.length}
                    gradient="bg-gradient-to-br from-orange-500 to-red-600"
                />
            </div>

            {/* Completed Projects Section */}
            <div className="space-y-6">

                {/* Completed Projects Table */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-lg">
                    <h3 className="text-xl font-medium font-title text-slate-800 p-6 border-b border-slate-200">โครงการที่เสร็จสมบูรณ์</h3>
                    {completedProjects.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ชื่อโครงการ</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ผู้ประกอบการ</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">หมวดหมู่</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider font-title">งบประมาณ</th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ปีงบประมาณ</th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider font-title">การจัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {paginatedProjects.map((project) => (
                                            <tr
                                                key={project.id}
                                                className="hover:bg-slate-50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <BriefcaseIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                                        <span className="text-sm font-medium text-slate-900">{project.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-slate-600">{project.entrepreneur}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-slate-600">{getCategoryLabel(project.category)}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className="text-sm font-medium text-slate-900">{project.budget.toLocaleString()} บาท</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                                                        <CalendarIcon className="w-4 h-4" />
                                                        {project.fiscalYear || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <button
                                                        onClick={() => setSelectedProject(project)}
                                                        className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="ดูรายละเอียด"
                                                    >
                                                        <EyeIcon className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                currentPage={currentPage}
                                totalItems={completedProjects.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={(e) => setItemsPerPage(Number(e.target.value))}
                            />
                        </>
                    ) : (
                        <p className="text-slate-500 text-center p-8">ไม่มีโครงการที่เสร็จสมบูรณ์</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardView;