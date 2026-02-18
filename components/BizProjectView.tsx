
import React, { useState, useEffect } from 'react';
import { Project, ProjectCategory } from '../types';
import { SparklesIcon, Squares2X2Icon, ListBulletIcon, FunnelIcon, MagnifyingGlassIcon, CalendarIcon, DocumentTextIcon, ChevronDownIcon, EyeIcon, BriefcaseIcon, ArrowLeftIcon, TagIcon, CheckCircleIcon, UserCircleIcon, BookOpenIcon } from './icons';
import { PROJECT_CATEGORIES, FISCAL_YEARS } from '../constants'; // Import constants
import Pagination from './Pagination';
import { useNotification } from '../contexts/NotificationContext';
import { dataService } from '../services/dataService';
import { useData } from '../contexts/DataContext';

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


const BizProjectView: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { data, fetchData } = useData();
    const { showNotification } = useNotification();

    const [displayMode, setDisplayMode] = useState<'card' | 'list'>('list');

    // Fetch data using DataContext on mount
    useEffect(() => {
        const loadProjectData = async () => {
            try {
                if (!data.projects) {
                    setIsLoading(true);
                }
                await fetchData('projects', () => dataService.getProjects());
            } catch (error) {
                console.error('Failed to fetch project data:', error);
                showNotification('ไม่สามารถโหลดข้อมูลโครงการได้', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        loadProjectData();
    }, [fetchData, showNotification, data.projects]);

    // Sync and filter from DataContext when the cached data changes
    useEffect(() => {
        if (data.projects) {
            // Filter for Biz-Lab projects only
            const bizProjects = data.projects.filter((p: Project) => p.category === 'Biz-Lab');
            setProjects(bizProjects);
        }
    }, [data.projects]);

    // Force card view on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setDisplayMode('card');
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'All'>('All');
    const [selectedYear, setSelectedYear] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);

    const categoriesForFilter = [{ key: 'All', label: 'แสดงทั้งหมด' }, ...PROJECT_CATEGORIES];

    const handleBackToList = () => {
        setSelectedProject(null);
    };

    const filteredProjects = projects
        .filter(p => p.status === 'Completed')
        .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
        .filter(p => selectedYear === 'All' || p.fiscalYear === selectedYear)
        .filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.outcome || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, selectedYear, searchTerm]);

    // Pagination Logic
    const paginatedProjects = filteredProjects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500 font-title">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    const CardView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProjects.map(proj => {
                return (
                    <div key={proj.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group flex flex-col">
                        <div className="p-6 relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-xl font-medium font-title text-slate-900 line-clamp-1" title={proj.name}>{proj.name}</h4>
                                <span className={`flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800`}>Completed</span>
                            </div>
                            <div className="text-slate-600 mb-4 flex-grow font-body mt-2">
                                <p className="font-semibold text-slate-700 flex items-center gap-2 mb-2">
                                    <SparklesIcon className="w-5 h-5 text-amber-500" />
                                    ผลลัพธ์ที่ได้:
                                </p>
                                <p className="pl-1 line-clamp-3">{proj.outcome || 'N/A'}</p>
                            </div>
                            <div className="text-sm text-slate-500 mb-4 space-y-1">
                                <p className="flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                                    <span>ปีงบประมาณ: <span className="font-semibold text-slate-700">{proj.fiscalYear || '-'}</span></span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <TagIcon className="w-4 h-4 text-slate-400" />
                                    <span>{PROJECT_CATEGORIES.find(c => c.key === proj.category)?.label || proj.category}</span>
                                </p>
                            </div>

                            <div className="border-t border-slate-200/60 pt-4 mt-auto flex gap-2">
                                <button
                                    onClick={() => setSelectedProject(proj)}
                                    className="flex-1 py-2 bg-white border border-emerald-200 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                    <EyeIcon className="w-4 h-4" />
                                    ดูรายละเอียด
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    );

    const ListView = () => (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto mobile-card-wrapper">
                <table className="min-w-full divide-y divide-slate-200 mobile-card-table">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ชื่อโครงการ</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ปีงบ</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ผู้ประกอบการ</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ประเภท</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ผลลัพธ์</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider font-title">สถานะ</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider font-title">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {paginatedProjects.map((proj) => {
                            const categoryLabel = PROJECT_CATEGORIES.find(c => c.key === proj.category)?.label;
                            return (
                                <tr
                                    key={proj.id}
                                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                                    onClick={() => setSelectedProject(proj)}
                                >
                                    <td data-label="ชื่อโครงการ" className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900">{proj.name}</div>
                                    </td>
                                    <td data-label="ปีงบ" className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-500">{proj.fiscalYear || '-'}</div>
                                    </td>
                                    <td data-label="ผู้ประกอบการ" className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-500">{proj.entrepreneur || '-'}</div>
                                    </td>
                                    <td data-label="ประเภท" className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-500">{categoryLabel}</div>
                                    </td>
                                    <td data-label="ผลลัพธ์" className="px-6 py-4">
                                        <div className="text-sm text-slate-600 font-body line-clamp-2" title={proj.outcome}>
                                            {proj.outcome || '-'}
                                        </div>
                                    </td>
                                    <td data-label="สถานะ" className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800`}>
                                            Completed
                                        </span>
                                    </td>
                                    <td data-label="จัดการ" className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedProject(proj)}
                                                className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                                                title="ดูรายละเอียด"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                            {proj.completeReportLink && (
                                                <a
                                                    href={proj.completeReportLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                                                    title="ดูรายงานฉบับสมบูรณ์"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <DocumentTextIcon className="w-5 h-5" />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // View: Project Details
    const detailsView = selectedProject ? (
        <div className="space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleBackToList}
                    className="mr-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
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
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-full">
                                {selectedProject.status === 'Completed' && <CheckCircleIcon className="w-4 h-4" />}
                                {selectedProject.status}
                            </span>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">หมวดหมู่</label>
                        <p className="text-lg font-medium text-slate-900 mt-1">
                            {PROJECT_CATEGORIES.find(c => c.key === selectedProject.category)?.label || selectedProject.category}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">ผู้ประกอบการ</label>
                        <p className="text-lg font-medium text-slate-900 mt-1">{selectedProject.entrepreneur}</p>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">งบประมาณ</label>
                        <p className="text-lg font-medium text-slate-900 mt-1">{selectedProject.budget ? selectedProject.budget.toLocaleString() : '0'} บาท</p>
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
                        <p className="text-base text-slate-800 mt-3 leading-relaxed">{selectedProject.outcome || 'ยังไม่มีข้อมูลผลลัพธ์'}</p>
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
    ) : null;

    // View: Project List (Default)
    const listView = (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="w-full md:w-auto md:flex-1 relative">
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อโครงการหรือผลลัพธ์..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <div className="w-full md:w-auto flex flex-wrap items-center justify-end gap-2">
                    <div className="relative">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none font-semibold text-sm cursor-pointer"
                        >
                            <option value="All">ทุกปีงบประมาณ</option>
                            {FISCAL_YEARS.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <CalendarIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value as ProjectCategory | 'All')}
                            className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none font-semibold text-sm"
                        >
                            {categoriesForFilter.map(cat => (
                                <option key={cat.key} value={cat.key}>{cat.label}</option>
                            ))}
                        </select>
                        <FunnelIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <div className="hidden md:flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        <button onClick={() => setDisplayMode('card')} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${displayMode === 'card' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100'}`} aria-pressed={displayMode === 'card'} title="Card View">
                            <Squares2X2Icon className="w-5 h-5" />
                        </button>
                        <button onClick={() => setDisplayMode('list')} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${displayMode === 'list' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100'}`} aria-pressed={displayMode === 'list'} title="List View">
                            <ListBulletIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Project Category Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<BriefcaseIcon />}
                    label="งานที่ปรึกษา"
                    value={projects.filter(p => p.status === 'Completed' && p.category === 'Consulting').length}
                    gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
                />
                <StatCard
                    icon={<BriefcaseIcon />}
                    label="งานวิจัย"
                    value={projects.filter(p => p.status === 'Completed' && p.category === 'Research').length}
                    gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
                />
                <StatCard
                    icon={<BriefcaseIcon />}
                    label="งานบริการวิชาการ"
                    value={projects.filter(p => p.status === 'Completed' && p.category === 'Academic Services').length}
                    gradient="bg-gradient-to-br from-purple-500 to-violet-600"
                />
                <StatCard
                    icon={<BriefcaseIcon />}
                    label="งานโครงการ Biz-Lab"
                    value={projects.filter(p => p.status === 'Completed' && p.category === 'Biz-Lab').length}
                    gradient="bg-gradient-to-br from-orange-500 to-amber-600"
                />
            </div>

            {filteredProjects.length > 0 ? (
                <>
                    {displayMode === 'card' ? <CardView /> : <ListView />}
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredProjects.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(e) => setItemsPerPage(Number(e.target.value))}
                    />
                </>
            ) : (
                <div className="text-center py-20 px-4 bg-white border border-slate-200 rounded-xl">
                    <h3 className="text-xl font-semibold text-slate-700">ไม่พบผลลัพธ์โครงการ</h3>
                    <p className="text-slate-500 mt-2 font-body">
                        ไม่พบข้อมูลที่ตรงกับการค้นหาของคุณ
                    </p>
                </div>
            )}
        </div>
    );

    return (
        <div className="p-6 min-h-screen bg-slate-50">


            {selectedProject ? detailsView : listView}
        </div>
    );
};

export default BizProjectView;