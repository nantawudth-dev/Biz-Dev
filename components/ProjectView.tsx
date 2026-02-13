
import React, { useState } from 'react';
import { Project, Entrepreneur, ProjectCategory, Role } from '../types';
import { PlusIcon, Squares2X2Icon, ListBulletIcon, FunnelIcon, MagnifyingGlassIcon, ChevronDownIcon, ArrowLeftIcon, PencilIcon, TrashIcon, EyeIcon, CalendarIcon, ClipboardDocumentCheckIcon, DocumentTextIcon, BriefcaseIcon, EllipsisVerticalIcon, BuildingOffice2Icon, CurrencyDollarIcon, TagIcon, ChartBarIcon, CheckCircleIcon, UserCircleIcon, BookOpenIcon } from './icons';
import { useNotification } from '../contexts/NotificationContext';
import Pagination from './Pagination';
import { ProjectCategorySetting } from '../App';
import Modal from './Modal';

interface ProjectViewProps {
  userRole: Role;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  entrepreneurs: Entrepreneur[];
  projectCategories: ProjectCategorySetting[];
  fiscalYears: string[];
}

const emptyProject: Omit<Project, 'id'> = {
  name: '',
  description: '',
  entrepreneur: '',
  status: 'Planned',
  category: 'Research',
  outcome: '',
  projectLeader: '',
  coProjectLeader: '',
  budget: 0,
  fiscalYear: '',
};

const ProjectView: React.FC<ProjectViewProps> = ({ userRole, projects, setProjects, entrepreneurs, projectCategories, fiscalYears }) => {
  const [displayMode, setDisplayMode] = useState<'card' | 'list'>('list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Omit<Project, 'id'> & { id?: string }>({ ...emptyProject, budget: 0 });
  const [reportingProject, setReportingProject] = useState<Project | null>(null);
  const [outcomeForm, setOutcomeForm] = useState('');
  const [reportLink, setReportLink] = useState('');
  const { showNotification } = useNotification();

  const [selectedStatus, setSelectedStatus] = useState<'All' | Project['status']>('All');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProjectCategory>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormData({ ...emptyProject, budget: 0 });
    setIsFormOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setFormData({ ...project });
    setIsFormOpen(true);
  };

  const handleOpenReport = (project: Project) => {
    setReportingProject(project);
    setOutcomeForm(project.outcome || '');
    setReportLink(project.completeReportLink || '');
  };

  const handleSaveOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (reportingProject) {
      setProjects(projects.map(p => p.id === reportingProject.id ? { ...p, outcome: outcomeForm, completeReportLink: reportLink } : p));
      showNotification('บันทึกผลสัมฤทธิ์เรียบร้อยแล้ว', 'success');
      setReportingProject(null);
      setOutcomeForm('');
      setReportLink('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.entrepreneur && formData.projectLeader) {
      if (editingProject) {
        setProjects(projects.map(p => p.id === editingProject.id ? { ...formData, id: p.id } as Project : p));
        showNotification('อัปเดตโครงการสำเร็จ', 'success');
      } else {
        setProjects([...projects, { ...formData, id: `proj${Date.now()}` } as Project]);
        showNotification('เพิ่มโครงการใหม่สำเร็จ', 'success');
      }
      setIsFormOpen(false);
    }
  };

  const confirmDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const executeDeleteProject = () => {
    if (projectToDelete) {
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      showNotification('ลบโครงการสำเร็จ', 'delete');
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const getStatusClass = (status: Project['status']) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-amber-100 text-amber-800';
      case 'Planned': return 'bg-slate-200 text-slate-800';
    }
  };

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<any>>) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const [selectedYear, setSelectedYear] = useState<string>('All');

  const filteredProjects = projects.filter(proj => {
    const statusMatch = selectedStatus === 'All' || proj.status === selectedStatus;
    const categoryMatch = selectedCategory === 'All' || proj.category === selectedCategory;
    const yearMatch = selectedYear === 'All' || proj.fiscalYear === selectedYear;
    const searchMatch = proj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proj.entrepreneur.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && categoryMatch && yearMatch && searchMatch;
  });

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summary Metrics
  const totalProjects = projects.length;
  const inProgressProjects = projects.filter(p => p.status === 'In Progress').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

  // View: Add/Edit Project Form
  if (isFormOpen) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setIsFormOpen(false)}
            className="mr-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-medium font-title text-slate-900">{editingProject ? 'แก้ไขโครงการ' : 'เพิ่มโครงการใหม่'}</h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 max-h-[80vh] overflow-y-auto custom-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อโครงการ</label>
              <input type="text" placeholder="ชื่อโครงการ" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" required />
            </div>

            <div className="md:col-span-1 relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">สถานะ</label>
              <div className="relative">
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors appearance-none cursor-pointer" >
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="md:col-span-1 relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">หมวดหมู่โครงการ</label>
              <div className="relative">
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as ProjectCategory })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors appearance-none cursor-pointer" required >
                  <option value="">เลือกหมวดหมู่โครงการ</option>
                  {projectCategories.map(cat => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
                <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="md:col-span-1 relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">ปีงบประมาณ</label>
              <div className="relative">
                <select value={formData.fiscalYear} onChange={(e) => setFormData({ ...formData, fiscalYear: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors appearance-none cursor-pointer" required >
                  <option value="">เลือกปีงบประมาณ</option>
                  {fiscalYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">ผู้ประกอบการ</label>
              <input type="text" placeholder="ระบุชื่อผู้ประกอบการ" value={formData.entrepreneur} onChange={(e) => setFormData({ ...formData, entrepreneur: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" required />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">ผู้รับผิดชอบโครงการ</label>
              <input type="text" placeholder="ระบุชื่อหัวหน้าโครงการ" value={formData.projectLeader} onChange={(e) => setFormData({ ...formData, projectLeader: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" required />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">ผู้ร่วมดำเนินการ (ถ้ามี)</label>
              <input type="text" placeholder="ระบุชื่อผู้ร่วมดำเนินการ" value={formData.coProjectLeader || ''} onChange={(e) => setFormData({ ...formData, coProjectLeader: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">งบประมาณ (บาท)</label>
              <input type="number" placeholder="ระบุงบประมาณ" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียด</label>
              <textarea placeholder="รายละเอียด" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors h-24 font-body" />
            </div>

            {/* Outcome field removed from Edit form as per request */}
            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button type="submit" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-colors shadow-md">
                {editingProject ? 'บันทึกการแก้ไข' : 'เพิ่มโครงการ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // View: Project Details
  if (selectedProject) {
    return (
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedProject(null)}
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
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(selectedProject.status)}`}>
                  {selectedProject.status === 'Completed' && <CheckCircleIcon className="w-4 h-4" />}
                  {selectedProject.status}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">หมวดหมู่</label>
              <p className="text-lg font-medium text-slate-900 mt-1">
                {projectCategories.find(c => c.key === selectedProject.category)?.label || selectedProject.category}
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
              <p className="text-base text-slate-700 mt-2 leading-relaxed whitespace-pre-wrap">{selectedProject.description}</p>
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

  // View: Project List (Default)
  return (
    <div className="space-y-6 animate-fade-in">

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="w-full md:w-auto md:flex-1 relative">
          <input
            type="text"
            placeholder="ค้นหาชื่อโครงการ..."
            value={searchTerm}
            onChange={handleFilterChange(setSearchTerm)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <div className="w-full md:w-auto flex flex-wrap items-center justify-end gap-2">
          <div className="relative">
            <select
              value={selectedYear}
              onChange={handleFilterChange(setSelectedYear)}
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none font-semibold text-sm cursor-pointer"
            >
              <option value="All">ทุกปีงบประมาณ</option>
              {fiscalYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <CalendarIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedStatus}
              onChange={handleFilterChange(setSelectedStatus)}
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none font-semibold text-sm cursor-pointer"
            >
              <option value="All">ทุกสถานะ</option>
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-400"></div>
          </div>

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={handleFilterChange(setSelectedCategory)}
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none font-semibold text-sm cursor-pointer"
            >
              <option value="All">ทุกหมวดหมู่</option>
              {projectCategories.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.label}</option>
              ))}
            </select>
            <FunnelIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button onClick={() => setDisplayMode('card')} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${displayMode === 'card' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100'}`} aria-pressed={displayMode === 'card'} title="Card View">
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button onClick={() => setDisplayMode('list')} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${displayMode === 'list' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100'}`} aria-pressed={displayMode === 'list'} title="List View">
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Project Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl shadow-md flex items-center text-white relative overflow-hidden group">
          <div className="absolute -bottom-4 -right-4 text-white opacity-10 group-hover:opacity-20 transition-opacity">
            <ListBulletIcon className="w-32 h-32" />
          </div>
          <div className="p-3 bg-white/20 rounded-full mr-4 backdrop-blur-sm relative z-10">
            <ListBulletIcon className="w-8 h-8 text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium opacity-90">โครงการทั้งหมด</p>
            <p className="text-2xl font-bold">{totalProjects}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-pink-600 p-6 rounded-xl shadow-md flex items-center text-white relative overflow-hidden group">
          <div className="absolute -bottom-4 -right-4 text-white opacity-10 group-hover:opacity-20 transition-opacity">
            <ChartBarIcon className="w-32 h-32" />
          </div>
          <div className="p-3 bg-white/20 rounded-full mr-4 backdrop-blur-sm relative z-10">
            <ChartBarIcon className="w-8 h-8 text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium opacity-90">กำลังดำเนินการ</p>
            <p className="text-2xl font-bold">{inProgressProjects}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-xl shadow-md flex items-center text-white relative overflow-hidden group">
          <div className="absolute -bottom-4 -right-4 text-white opacity-10 group-hover:opacity-20 transition-opacity">
            <ClipboardDocumentCheckIcon className="w-32 h-32" />
          </div>
          <div className="p-3 bg-white/20 rounded-full mr-4 backdrop-blur-sm relative z-10">
            <ClipboardDocumentCheckIcon className="w-8 h-8 text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium opacity-90">โครงการแล้วเสร็จ</p>
            <p className="text-2xl font-bold">{completedProjects}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 rounded-xl shadow-md flex items-center text-white relative overflow-hidden group">
          <div className="absolute -bottom-4 -right-4 text-white opacity-10 group-hover:opacity-20 transition-opacity">
            <CurrencyDollarIcon className="w-32 h-32" />
          </div>
          <div className="p-3 bg-white/20 rounded-full mr-4 backdrop-blur-sm relative z-10">
            <span className="w-8 h-8 flex items-center justify-center text-xl font-bold">฿</span>
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium opacity-90">งบประมาณรวม</p>
            <p className="text-2xl font-bold">{totalBudget.toLocaleString()}</p>
          </div>
        </div>
      </div>


      {filteredProjects.length > 0 ? (
        <>
          {displayMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProjects.map(proj => {
                return (
                  <div key={proj.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group flex flex-col">
                    <div className="p-6 relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-medium font-title text-slate-800 line-clamp-1" title={proj.name}>{proj.name}</h3>
                        <span className={`flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(proj.status)}`}>{proj.status}</span>
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
                          onClick={() => setSelectedProject(proj)}
                          className="flex-1 py-2 bg-white border border-emerald-200 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                          <EyeIcon className="w-4 h-4" />
                          ดูรายละเอียด
                        </button>
                        {(userRole === 'admin' || userRole === 'officer') && (
                          <>
                            {proj.status === 'Completed' && (
                              <button
                                onClick={() => handleOpenReport(proj)}
                                className="py-2 px-3 bg-white border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 transition-all shadow-sm"
                                title="รายงานผลสัมฤทธิ์"
                              >
                                <ClipboardDocumentCheckIcon className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEditProject(proj)}
                              className="py-2 px-3 bg-white border border-slate-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                              title="แก้ไข/อัปเดต"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => confirmDeleteProject(proj)}
                              className="py-2 px-3 bg-white border border-slate-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                              title="ลบ"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ชื่อโครงการ</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ปีงบ</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">สถานะ</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">หมวดหมู่</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ผู้ประกอบการ</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ทีมงาน</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider font-title">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {paginatedProjects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900" title={proj.name}>{proj.name.length > 30 ? proj.name.substring(0, 30) + '...' : proj.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {proj.fiscalYear || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(proj.status)}`}>{proj.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500">{projectCategories.find(c => c.key === proj.category)?.label || proj.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{proj.entrepreneur}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-slate-500">
                          <div><span className="font-semibold">หน:</span> {proj.projectLeader}</div>
                          {proj.coProjectLeader && <div><span className="font-semibold">ร่วม:</span> {proj.coProjectLeader}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setSelectedProject(proj)}
                            className="text-slate-400 hover:text-emerald-600 transition-colors"
                            title="ดูรายละเอียด"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          {proj.status === 'Completed' && (userRole === 'admin' || userRole === 'officer') && (
                            <button onClick={() => handleOpenReport(proj)} className="text-slate-400 hover:text-indigo-600 transition-colors" title="รายงานผลสัมฤทธิ์">
                              <ClipboardDocumentCheckIcon className="w-5 h-5" />
                            </button>
                          )}
                          {(userRole === 'admin' || userRole === 'officer') && (
                            <>
                              <button onClick={() => handleEditProject(proj)} className="text-slate-400 hover:text-blue-600 transition-colors" title="แก้ไข"><PencilIcon className="w-5 h-5" /></button>
                              <button onClick={() => confirmDeleteProject(proj)} className="text-slate-400 hover:text-red-600 transition-colors" title="ลบ"><TrashIcon className="w-5 h-5" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredProjects.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      ) : (
        <div className="text-center py-20 px-4 bg-white border border-slate-200 rounded-xl">
          <h3 className="text-xl font-medium font-title text-slate-700">ไม่พบข้อมูลโครงการ</h3>
          <p className="text-slate-500 mt-2 font-body">
            ไม่พบโครงการที่ตรงกับตัวกรองหรือการค้นหาของคุณ
          </p>
        </div>
      )}

      {/* Report Outcome Modal */}
      {reportingProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/75 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={() => setReportingProject(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-200">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ClipboardDocumentCheckIcon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-slate-900 font-title" id="modal-title">
                      รายงานผลสัมฤทธิ์โครงการ
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-500 mb-4 font-body">
                        โครงการ: <span className="font-semibold text-slate-700">{reportingProject.name}</span>
                      </p>
                      <form onSubmit={handleSaveOutcome}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียดผลสัมฤทธิ์ (Outcome)</label>
                        <textarea
                          value={outcomeForm}
                          onChange={(e) => setOutcomeForm(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors h-32 font-body resize-none mb-4"
                          placeholder="ระบุผลลัพธ์ที่ได้จากโครงการ..."
                          required
                        />

                        <label className="block text-sm font-medium text-slate-700 mb-1">ลิงก์รายงานฉบับสมบูรณ์ (Link)</label>
                        <div className="relative">
                          <input
                            type="url"
                            value={reportLink}
                            onChange={(e) => setReportLink(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
                            placeholder="https://example.com/report.pdf"
                          />
                          <DocumentTextIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        <div className="mt-5 sm:flex sm:flex-row-reverse gap-3">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:w-auto sm:text-sm"
                          >
                            บันทึกผล
                          </button>
                          <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                            onClick={() => setReportingProject(null)}
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="ยืนยันการลบโครงการ"
        icon={<TrashIcon className="w-6 h-6 text-red-600" />}
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            คุณแน่ใจหรือไม่ว่าต้องการลบโครงการ <span className="font-semibold text-slate-900">"{projectToDelete?.name}"</span>?
            <br />
            การกระทำนี้ไม่สามารถเรียกคืนได้
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={executeDeleteProject}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm"
            >
              ยืนยันการลบ
            </button>
          </div>
        </div>
      </Modal>

      {/* Quick Menu Card */}
      {(userRole === 'admin' || userRole === 'officer') && (
        <div className="mt-8">
          <button
            onClick={handleOpenAdd}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-green-50 via-cyan-50 to-blue-50 hover:from-green-100 hover:via-cyan-100 hover:to-blue-100 border-2 border-green-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] p-6"
          >
            {/* Background Image */}
            <div className="absolute inset-0 opacity-25 group-hover:opacity-30 transition-opacity">
              <img
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-cyan-400/20 to-blue-400/20"></div>

            {/* Content */}
            <div className="relative flex items-center gap-6">
              <div className="bg-gradient-to-br from-green-500 to-cyan-500 p-4 rounded-xl group-hover:from-green-600 group-hover:to-cyan-600 transition-all shadow-md">
                <BriefcaseIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-xl font-bold mb-1 text-slate-800">เพิ่มโครงการ</h3>
                <p className="text-slate-600 text-sm font-normal">สร้างโครงการใหม่และกำหนดรายละเอียด</p>
              </div>
              <PlusIcon className="w-6 h-6 text-green-600 opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        </div>
      )}

    </div>
  );
};

export default ProjectView;
