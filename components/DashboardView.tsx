
import React, { useState, useEffect } from 'react';
import { Entrepreneur, Project, Course, Consultant } from '../types';
import { BuildingIcon, BriefcaseIcon, BookOpenIcon, UserGroupIcon, ArrowLeftIcon, CheckCircleIcon, UserCircleIcon, CalendarIcon, EyeIcon, Squares2X2Icon, ListBulletIcon, MagnifyingGlassIcon, FunnelIcon, ChevronDownIcon } from './icons';
import { useNotification } from '../contexts/NotificationContext';
import { dataService } from '../services/dataService';
import { useData } from '../contexts/DataContext';
import Pagination from './Pagination';
import DashboardCharts from './DashboardCharts';

interface DashboardViewProps { }

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string; gradient: string }> = ({ icon, label, value, gradient }) => {
    return (
        <div className={`relative overflow-hidden rounded-xl shadow-lg p-6 flex items-center gap-6 ${gradient} text-white`}>
            <div className={`relative z-10 p-4 rounded-full bg-white/20 backdrop-blur-sm`}>
                {React.cloneElement(icon as React.ReactElement, { className: `w-8 h-8 text-white` })}
            </div>
            <div className="relative z-10">
                <p className={`text-4xl font-bold text-white`}>{value}</p>
                <p className={`text-base font-semibold text-white opacity-90`}>{label}</p>
            </div>
            {/* Faded Background Icon */}
            <div className="absolute -right-6 -bottom-6 opacity-10 transform rotate-12 pointer-events-none">
                {React.cloneElement(icon as React.ReactElement, { className: `w-40 h-40 text-white` })}
            </div>
        </div>
    );
};

const DashboardView: React.FC<DashboardViewProps> = () => {
    const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [consultants, setConsultants] = useState<Consultant[]>([]);
    const [fiscalYears, setFiscalYears] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { data, fetchData } = useData();
    const { showNotification } = useNotification();

    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [displayMode, setDisplayMode] = useState<'card' | 'list'>('list');

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState<string>('All');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedStatus, setSelectedStatus] = useState<string>('All');

    // Fetch data using DataContext on mount
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // Only show loading if we don't have data yet
                const hasAllData = data.entrepreneurs && data.projects && data.courses && data.consultants;
                if (!hasAllData) {
                    setIsLoading(true);
                }

                await Promise.all([
                    fetchData('entrepreneurs', () => dataService.getEntrepreneurs()),
                    fetchData('projects', () => dataService.getProjects()),
                    fetchData('courses', () => dataService.getCourses()),
                    fetchData('consultants', () => dataService.getConsultants()),
                    fetchData('fiscalYears', () => dataService.getFiscalYears())
                ]);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
                showNotification('ไม่สามารถโหลดข้อมูลแดชบอร์ดได้', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        loadDashboardData();
    }, [fetchData, showNotification, data.entrepreneurs, data.projects, data.courses, data.consultants]);

    // Sync from DataContext when the cached data changes
    useEffect(() => {
        if (data.entrepreneurs) setEntrepreneurs(data.entrepreneurs);
        if (data.projects) setProjects(data.projects);
        if (data.courses) setCourses(data.courses);
        if (data.consultants) setConsultants(data.consultants);
        if (data.fiscalYears) setFiscalYears(data.fiscalYears);
    }, [data.entrepreneurs, data.projects, data.courses, data.consultants, data.fiscalYears]);

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

    // Derived data for filters
    const projectCategories = ['Research', 'Consulting', 'Academic Services', 'Biz-Lab'];

    // Filter projects based on status AND search/filters
    const filteredProjects = projects.filter(project => {
        const matchesStatus = selectedStatus === 'All' || project.status === selectedStatus;
        const matchesSearch = searchTerm === '' ||
            project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.entrepreneur.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesYear = selectedYear === 'All' || project.fiscalYear === selectedYear;
        const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;

        return matchesStatus && matchesSearch && matchesYear && matchesCategory;
    });

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedYear, selectedCategory, selectedStatus]);

    // Pagination
    const paginatedProjects = filteredProjects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleBackToList = () => {
        setSelectedProject(null);
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'Consulting': return 'งานที่ปรึกษา';
            case 'Research': return 'งานวิจัย';
            case 'Academic Services': return 'งานบริการวิชาการ';
            case 'Biz-Lab': return 'งานโครงการ Biz-Lab';
            default: return category;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            case 'Planned': return 'bg-slate-100 text-slate-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Completed': return 'เสร็จสิ้น';
            case 'In Progress': return 'กำลังดำเนินการ';
            case 'Planned': return 'แผนงาน';
            default: return status;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500 font-title">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    // If a project is selected, show the detail view
    if (selectedProject) {
        return (
            <div className="space-y-6 animate-fade-in">
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
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedProject.status)}`}>
                                    {getStatusLabel(selectedProject.status)}
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
        <div className="space-y-8 animate-fade-in">
            {/* Completed Projects Header & Filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="w-full md:w-auto md:flex-1 relative">
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อโครงการ หรือผู้ประกอบการ..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <div className="w-full md:w-auto flex flex-wrap items-center justify-end gap-2">
                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none font-semibold text-sm cursor-pointer"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="All">ทุกสถานะ</option>
                            <option value="Completed">เสร็จสิ้น</option>
                            <option value="In Progress">กำลังดำเนินการ</option>
                            <option value="Planned">แผนงาน</option>
                        </select>
                        <CheckCircleIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {/* Year Filter */}
                    <div className="relative">
                        <select
                            className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none font-semibold text-sm cursor-pointer"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            <option value="All">ปีงบประมาณ</option>
                            {fiscalYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <CalendarIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Category Filter */}
                    <div className="relative">
                        <select
                            className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none font-semibold text-sm cursor-pointer"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="All">หมวดหมู่ทั้งหมด</option>
                            {projectCategories.map(cat => (
                                <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                            ))}
                        </select>
                        <FunnelIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* View Toggle */}
                    <div className="hidden md:flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        <button
                            onClick={() => setDisplayMode('card')}
                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${displayMode === 'card' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100'}`}
                            aria-pressed={displayMode === 'card'}
                            title="Card View"
                        >
                            <Squares2X2Icon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setDisplayMode('list')}
                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${displayMode === 'list' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100'}`}
                            aria-pressed={displayMode === 'list'}
                            title="List View"
                        >
                            <ListBulletIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

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


                {/* System Graphs */}
                <DashboardCharts projects={filteredProjects} />




                {filteredProjects.length > 0 ? (
                    <>
                        {displayMode === 'card' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedProjects.map(project => (
                                    <div key={project.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group flex flex-col">
                                        <div className="p-6 relative z-10 flex flex-col h-full">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-medium font-title text-slate-800 line-clamp-1" title={project.name}>{project.name}</h3>
                                                <span className={`flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                                                    {getStatusLabel(project.status)}
                                                </span>
                                            </div>

                                            <div className="space-y-2 mb-4 flex-grow">
                                                <div className="text-sm">
                                                    <span className="text-slate-500">ผู้ประกอบการ:</span>
                                                    <span className="ml-2 font-medium text-slate-800">{project.entrepreneur}</span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-slate-500">ปีงบประมาณ:</span>
                                                    <span className="ml-2 font-medium text-slate-800">{project.fiscalYear || '-'}</span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-slate-500">หมวดหมู่:</span>
                                                    <span className="ml-2 font-medium text-slate-800">{getCategoryLabel(project.category)}</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200/60">
                                                <div className="text-sm text-slate-500">
                                                    งบประมาณ: <span className="font-semibold text-slate-800">{project.budget ? project.budget.toLocaleString() : '0'}</span> บาท
                                                </div>
                                            </div>

                                            <div className="border-t border-slate-200/60 pt-4 mt-auto">
                                                <button
                                                    onClick={() => setSelectedProject(project)}
                                                    className="w-full py-2 bg-white border border-emerald-200 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-all shadow-sm flex items-center justify-center gap-2"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                    ดูรายละเอียด
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                                <div className="overflow-x-auto mobile-card-wrapper">
                                    <table className="min-w-full divide-y divide-slate-200 mobile-card-table">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ชื่อโครงการ</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">สถานะ</th>
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
                                                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                                                    onClick={() => setSelectedProject(project)}
                                                >
                                                    <td data-label="ชื่อโครงการ" className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <BriefcaseIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                                            <span className="text-sm font-medium text-slate-900">{project.name}</span>
                                                        </div>
                                                    </td>
                                                    <td data-label="สถานะ" className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                                            {getStatusLabel(project.status)}
                                                        </span>
                                                    </td>
                                                    <td data-label="ผู้ประกอบการ" className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-slate-600">{project.entrepreneur}</span>
                                                    </td>
                                                    <td data-label="หมวดหมู่" className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-slate-600">{getCategoryLabel(project.category)}</span>
                                                    </td>
                                                    <td data-label="งบประมาณ" className="px-6 py-4 whitespace-nowrap text-right">
                                                        <span className="text-sm font-medium text-slate-900">{project.budget.toLocaleString()} บาท</span>
                                                    </td>
                                                    <td data-label="ปีงบประมาณ" className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                                                            <CalendarIcon className="w-4 h-4" />
                                                            {project.fiscalYear || '-'}
                                                        </span>
                                                    </td>
                                                    <td data-label="การจัดการ" className="px-6 py-4 whitespace-nowrap text-center">
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
                    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-8 text-center">
                        <p className="text-slate-500">ไม่พบโครงการที่ตรงกับเงื่อนไข</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardView;