
import React, { useState, useEffect } from 'react';
import { Project, ProjectCategory } from '../types';
import { SparklesIcon, Squares2X2Icon, ListBulletIcon, FunnelIcon, MagnifyingGlassIcon, CalendarIcon, DocumentTextIcon, ChevronDownIcon, EyeIcon, BriefcaseIcon, ArrowLeftIcon, TagIcon, CheckCircleIcon, UserCircleIcon, BookOpenIcon, ClipboardDocumentCheckIcon, AcademicCapIcon } from './icons';
import { PROJECT_CATEGORIES } from '../constants';
import Pagination from './Pagination';
import { useNotification } from '../contexts/NotificationContext';
import { dataService } from '../services/dataService';
import { useData } from '../contexts/DataContext';

const BizProjectView: React.FC = () => {
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { data, fetchData } = useData();
    const { showNotification } = useNotification();
    const [fiscalYears, setFiscalYears] = useState<string[]>([]);

    const [displayMode, setDisplayMode] = useState<'card' | 'list'>('list');
    const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'All'>('All');
    const [selectedYear, setSelectedYear] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);

    useEffect(() => {
        const loadProjectData = async () => {
            try {
                if (!data.projects) setIsLoading(true);
                await Promise.all([
                    fetchData('projects', () => dataService.getProjects()),
                    fetchData('fiscalYears', () => dataService.getFiscalYears())
                ]);
            } catch (error) {
                console.error('Failed to fetch project data:', error);
                showNotification('ไม่สามารถโหลดข้อมูลโครงการได้', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        loadProjectData();
    }, [fetchData, showNotification, data.projects]);

    // Only projects that have outcome (รายงานผลสัมฤทธิ์)
    useEffect(() => {
        if (data.projects) {
            const withOutcome = data.projects.filter((p: Project) => p.outcome && p.outcome.trim() !== '');
            setAllProjects(withOutcome);
        }
        if (data.fiscalYears) setFiscalYears(data.fiscalYears);
    }, [data.projects, data.fiscalYears]);

    // Force card view on mobile
    useEffect(() => {
        const handleResize = () => { if (window.innerWidth < 768) setDisplayMode('card'); };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const categoriesForFilter = [{ key: 'All', label: 'แสดงทั้งหมด' }, ...PROJECT_CATEGORIES];

    const filteredProjects = allProjects
        .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
        .filter(p => selectedYear === 'All' || p.fiscalYear === selectedYear)
        .filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.outcome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.entrepreneur || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

    useEffect(() => { setCurrentPage(1); }, [selectedCategory, selectedYear, searchTerm]);

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

    // Detail view
    if (selectedProject) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedProject(null)} className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-3">
                        <ClipboardDocumentCheckIcon className="w-8 h-8 text-emerald-600" />
                        <h2 className="text-3xl font-medium font-title text-slate-900">{selectedProject.name}</h2>
                    </div>
                </div>

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
                                    <CheckCircleIcon className="w-4 h-4" /> ดำเนินการเสร็จสิ้น
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
                            <p className="text-lg font-medium text-slate-900 mt-1">{selectedProject.entrepreneur || '-'}</p>
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

                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6">
                        <label className="text-sm font-semibold text-emerald-700 uppercase tracking-wide flex items-center gap-2">
                            <CheckCircleIcon className="w-5 h-5" />
                            ผลสัมฤทธิ์โครงการ
                        </label>
                        <p className="text-base text-slate-800 mt-3 leading-relaxed whitespace-pre-wrap">{selectedProject.outcome}</p>
                    </div>

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
                            <a href={selectedProject.completeReportLink} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold">
                                <BookOpenIcon className="w-5 h-5" />
                                ดูรายงานฉบับสมบูรณ์
                            </a>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // List view
    return (
        <div className="p-6 space-y-6 min-h-screen bg-slate-50">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="w-full md:w-auto md:flex-1 relative">
                    <input type="text" placeholder="ค้นหาชื่อโครงการหรือผลสัมฤทธิ์..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <div className="w-full md:w-auto flex flex-wrap items-center justify-end gap-2">
                    <div className="relative">
                        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="pl-10 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-semibold text-sm cursor-pointer">
                            <option value="All">ทุกปีงบประมาณ</option>
                            {fiscalYears.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                        <CalendarIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as ProjectCategory | 'All')} className="pl-10 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-semibold text-sm">
                            {categoriesForFilter.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
                        </select>
                        <FunnelIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <div className="hidden md:flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        <button onClick={() => setDisplayMode('card')} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${displayMode === 'card' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100'}`}><Squares2X2Icon className="w-5 h-5" /></button>
                        <button onClick={() => setDisplayMode('list')} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${displayMode === 'list' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100'}`}><ListBulletIcon className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-2">
                {/* งานที่ปรึกษา */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-xl shadow-md flex items-center text-white relative overflow-hidden group">
                    <div className="absolute -bottom-4 -right-4 text-white opacity-10 group-hover:opacity-20 transition-opacity">
                        <BriefcaseIcon className="w-28 h-28" />
                    </div>
                    <div className="p-2.5 bg-white/20 rounded-full mr-4 backdrop-blur-sm relative z-10">
                        <BriefcaseIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-2xl font-bold">{allProjects.filter(p => p.category === 'Consulting').length}</p>
                        <p className="text-xs font-medium opacity-90 mt-0.5">งานที่ปรึกษา</p>
                    </div>
                </div>

                {/* งานวิจัย */}
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-5 rounded-xl shadow-md flex items-center text-white relative overflow-hidden group">
                    <div className="absolute -bottom-4 -right-4 text-white opacity-10 group-hover:opacity-20 transition-opacity">
                        <BookOpenIcon className="w-28 h-28" />
                    </div>
                    <div className="p-2.5 bg-white/20 rounded-full mr-4 backdrop-blur-sm relative z-10">
                        <BookOpenIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-2xl font-bold">{allProjects.filter(p => p.category === 'Research').length}</p>
                        <p className="text-xs font-medium opacity-90 mt-0.5">งานวิจัย</p>
                    </div>
                </div>

                {/* งานบริการวิชาการ */}
                <div className="bg-gradient-to-br from-cyan-500 to-sky-600 p-5 rounded-xl shadow-md flex items-center text-white relative overflow-hidden group">
                    <div className="absolute -bottom-4 -right-4 text-white opacity-10 group-hover:opacity-20 transition-opacity">
                        <AcademicCapIcon className="w-28 h-28" />
                    </div>
                    <div className="p-2.5 bg-white/20 rounded-full mr-4 backdrop-blur-sm relative z-10">
                        <AcademicCapIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-2xl font-bold">{allProjects.filter(p => p.category === 'Academic Services').length}</p>
                        <p className="text-xs font-medium opacity-90 mt-0.5">งานบริการวิชาการ</p>
                    </div>
                </div>

                {/* งานโครงการ Biz-Lab */}
                <div className="bg-gradient-to-br from-orange-500 to-pink-600 p-5 rounded-xl shadow-md flex items-center text-white relative overflow-hidden group">
                    <div className="absolute -bottom-4 -right-4 text-white opacity-10 group-hover:opacity-20 transition-opacity">
                        <SparklesIcon className="w-28 h-28" />
                    </div>
                    <div className="p-2.5 bg-white/20 rounded-full mr-4 backdrop-blur-sm relative z-10">
                        <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-2xl font-bold">{allProjects.filter(p => p.category === 'Biz-Lab').length}</p>
                        <p className="text-xs font-medium opacity-90 mt-0.5">งานโครงการ Biz-Lab</p>
                    </div>
                </div>

                {/* ผลสัมฤทธิ์โครงการ (total) */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-xl shadow-md flex items-center text-white relative overflow-hidden group col-span-2 md:col-span-1">
                    <div className="absolute -bottom-4 -right-4 text-white opacity-10 group-hover:opacity-20 transition-opacity">
                        <ClipboardDocumentCheckIcon className="w-28 h-28" />
                    </div>
                    <div className="p-2.5 bg-white/20 rounded-full mr-4 backdrop-blur-sm relative z-10">
                        <ClipboardDocumentCheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-2xl font-bold">{allProjects.length}</p>
                        <p className="text-xs font-medium opacity-90 mt-0.5">ผลสัมฤทธิ์โครงการ</p>
                    </div>
                </div>
            </div>

            {filteredProjects.length > 0 ? (
                <>
                    {displayMode === 'card' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedProjects.map(proj => (
                                <div key={proj.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group flex flex-col">
                                    <div className="p-6 relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-medium font-title text-slate-800 line-clamp-1" title={proj.name}>{proj.name}</h3>
                                            <span className="flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">ดำเนินการเสร็จสิ้น</span>
                                        </div>

                                        <div className="space-y-2 mb-4 flex-grow">
                                            <div className="text-sm">
                                                <span className="text-slate-500">หัวหน้าโครงการ:</span>
                                                <span className="ml-2 font-medium text-slate-800">{proj.projectLeader}</span>
                                            </div>
                                            {proj.coProjectLeader && (
                                                <div className="text-sm">
                                                    <span className="text-slate-500">ผู้ร่วมดำเนินการ:</span>
                                                    <span className="ml-2 font-medium text-slate-800">{proj.coProjectLeader}</span>
                                                </div>
                                            )}
                                            <div className="text-sm">
                                                <span className="text-slate-500">ปีงบประมาณ:</span>
                                                <span className="ml-2 font-medium text-slate-800">{proj.fiscalYear || '-'}</span>
                                            </div>

                                        </div>

                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200/60">
                                            <div className="text-sm text-slate-500">
                                                งบประมาณ: <span className="font-semibold text-slate-800">{proj.budget ? proj.budget.toLocaleString() : '0'}</span> บาท
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-200/60 pt-4 mt-auto flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedProject(proj)}
                                                className="flex-1 py-2 bg-white border border-emerald-200 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-all shadow-sm flex items-center justify-center gap-2"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                                ดูรายละเอียด
                                            </button>
                                            {proj.completeReportLink && (
                                                <a
                                                    href={proj.completeReportLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="py-2 px-3 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-all shadow-sm"
                                                    title="ดูรายงานฉบับสมบูรณ์"
                                                >
                                                    <DocumentTextIcon className="w-5 h-5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ชื่อโครงการ</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ปีงบ</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ผู้ประกอบการ</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ประเภท</th>

                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {paginatedProjects.map((proj) => (
                                            <tr key={proj.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedProject(proj)}>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-900">{proj.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-500">{proj.fiscalYear || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-500">{proj.entrepreneur || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-500">
                                                        {PROJECT_CATEGORIES.find(c => c.key === proj.category)?.label || proj.category}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); setSelectedProject(proj); }}
                                                            className="text-slate-400 hover:text-emerald-600 transition-colors p-1"
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
                                                                title="ดูรายงาน"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <DocumentTextIcon className="w-5 h-5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
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
                    <ClipboardDocumentCheckIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700">ยังไม่มีรายงานผลสัมฤทธิ์</h3>
                    <p className="text-slate-500 mt-2">
                        สร้างรายงานผลสัมฤทธิ์ได้จากหน้า <span className="font-semibold text-blue-600">โครงการทั้งหมด</span> โดยกดปุ่ม{' '}
                        <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold">
                            <ClipboardDocumentCheckIcon className="inline w-4 h-4" /> รายงานผลสัมฤทธิ์
                        </span>{' '}
                        ที่โครงการที่เสร็จสิ้นแล้ว
                    </p>
                </div>
            )}
        </div>
    );
};

export default BizProjectView;