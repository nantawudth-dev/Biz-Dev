
import React, { useState } from 'react';
import { Project, Entrepreneur, ProjectCategory, Role } from '../types';
import Modal from './Modal';
import { PlusIcon, Squares2X2Icon, ListBulletIcon, FunnelIcon, MagnifyingGlassIcon, ChevronDownIcon } from './icons';
import { useNotification } from '../contexts/NotificationContext';
import Pagination from './Pagination';
import { ProjectCategorySetting } from '../App';

interface ProjectViewProps {
  userRole: Role;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  entrepreneurs: Entrepreneur[];
  projectCategories: ProjectCategorySetting[];
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
};

const ProjectView: React.FC<ProjectViewProps> = ({ userRole, projects, setProjects, entrepreneurs, projectCategories }) => {
  const [displayMode, setDisplayMode] = useState<'card' | 'list'>('card');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({ ...emptyProject });
  const { showNotification } = useNotification();

  const [selectedStatus, setSelectedStatus] = useState<'All' | Project['status']>('All');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProjectCategory>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.name && newProject.entrepreneur && newProject.projectLeader) {
      setProjects([...projects, { ...newProject, id: `proj${Date.now()}` }]);
      setNewProject({ ...emptyProject });
      setIsModalOpen(false);
      showNotification('เพิ่มโครงการใหม่สำเร็จ', 'success');
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

  const filteredProjects = projects.filter(proj => {
    const statusMatch = selectedStatus === 'All' || proj.status === selectedStatus;
    const categoryMatch = selectedCategory === 'All' || proj.category === selectedCategory;
    const searchMatch = proj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proj.entrepreneur.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && categoryMatch && searchMatch;
  });

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-4xl font-bold text-slate-900">โครงการทั้งหมด</h2>
        {(userRole === 'admin' || userRole === 'officer') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2.5 font-semibold rounded-lg shadow-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            <span>เพิ่มโครงการ</span>
          </button>
        )}
      </div>

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
        <div className="w-full md:w-auto flex items-center justify-end gap-2">
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


      {filteredProjects.length > 0 ? (
        <>
          {displayMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProjects.map(proj => {
                return (
                  <div key={proj.id} className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-slate-900 line-clamp-1" title={proj.name}>{proj.name}</h3>
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
                      </div>

                      <div className="border-t border-slate-200 pt-4 mt-auto">
                        <p className="text-sm text-slate-500 font-medium mb-3">
                          สำหรับ: <span className="font-semibold text-slate-800">{proj.entrepreneur}</span>
                        </p>
                        <button
                          onClick={() => setSelectedProject(proj)}
                          className="w-full py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors text-sm"
                        >
                          ดูรายละเอียด
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              {paginatedProjects.map((proj, index) => {
                return (
                  <div key={proj.id} className={`p-4 flex flex-col md:flex-row md:items-center gap-4 ${index < paginatedProjects.length - 1 ? 'border-b border-slate-200' : ''}`}>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-slate-900">{proj.name}</p>
                      <p className="text-sm text-slate-500">สำหรับ: <span className="font-semibold text-slate-800">{proj.entrepreneur}</span></p>
                      <div className="flex gap-4 mt-1 text-sm text-slate-500">
                        <span>หัวหน้า: {proj.projectLeader}</span>
                        {proj.coProjectLeader && <span>ผู้ร่วม: {proj.coProjectLeader}</span>}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-4">
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(proj.status)}`}>{proj.status}</span>
                      <button
                        onClick={() => setSelectedProject(proj)}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm underline"
                      >
                        ดูรายละเอียด
                      </button>
                    </div>
                  </div>
                )
              })}
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
          <h3 className="text-xl font-semibold text-slate-700">ไม่พบข้อมูลโครงการ</h3>
          <p className="text-slate-500 mt-2 font-body">
            ไม่พบโครงการที่ตรงกับตัวกรองหรือการค้นหาของคุณ
          </p>
        </div>
      )}

      {/* Project Details Modal */}
      <Modal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        title={selectedProject?.name || ''}
        maxWidth="max-w-2xl"
      >
        {selectedProject && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-1">สถานะ</h4>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(selectedProject.status)}`}>
                  {selectedProject.status}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-1">หมวดหมู่</h4>
                <p className="font-semibold text-slate-800">
                  {projectCategories.find(c => c.key === selectedProject.category)?.label || selectedProject.category}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-1">ผู้ประกอบการ</h4>
                <p className="font-semibold text-slate-800">
                  {selectedProject.entrepreneur}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="text-sm font-medium text-slate-500 mb-2">ทีมงานโครงการ</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-400 block">หัวหน้าโครงการ</span>
                  <span className="font-semibold text-slate-800">{selectedProject.projectLeader}</span>
                </div>
                {selectedProject.coProjectLeader && (
                  <div>
                    <span className="text-xs text-slate-400 block">ผู้ร่วมดำเนินการ</span>
                    <span className="font-semibold text-slate-800">{selectedProject.coProjectLeader}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2">รายละเอียดโครงการ</h4>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-700 font-body leading-relaxed whitespace-pre-wrap">
                {selectedProject.description}
              </div>
            </div>

            {selectedProject.outcome && (
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">ผลลัพธ์โครงการ (Outcome)</h4>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-green-800 font-body leading-relaxed">
                  {selectedProject.outcome}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="เพิ่มโครงการใหม่" maxWidth="max-w-2xl">
        <form onSubmit={handleAddProject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อโครงการ</label>
            <input type="text" placeholder="ชื่อโครงการ" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" required />
          </div>

          <div className="md:col-span-1 relative">
            <label className="block text-sm font-medium text-slate-700 mb-1">สถานะ</label>
            <div className="relative">
              <select value={newProject.status} onChange={(e) => setNewProject({ ...newProject, status: e.target.value as Project['status'] })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors appearance-none cursor-pointer" >
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
              <select value={newProject.category} onChange={(e) => setNewProject({ ...newProject, category: e.target.value as ProjectCategory })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors appearance-none cursor-pointer" required >
                <option value="">เลือกหมวดหมู่โครงการ</option>
                {projectCategories.map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
              <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">ผู้ประกอบการ</label>
            <input type="text" placeholder="ระบุชื่อผู้ประกอบการ" value={newProject.entrepreneur} onChange={(e) => setNewProject({ ...newProject, entrepreneur: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" required />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">ผู้รับผิดชอบโครงการ</label>
            <input type="text" placeholder="ระบุชื่อหัวหน้าโครงการ" value={newProject.projectLeader} onChange={(e) => setNewProject({ ...newProject, projectLeader: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" required />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">ผู้ร่วมดำเนินการ (ถ้ามี)</label>
            <input type="text" placeholder="ระบุชื่อผู้ร่วมดำเนินการ" value={newProject.coProjectLeader} onChange={(e) => setNewProject({ ...newProject, coProjectLeader: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียด</label>
            <textarea placeholder="รายละเอียด" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors h-20 font-body" />
          </div>

          {newProject.status === 'Completed' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">ผลลัพธ์โครงการ (Outcome)</label>
              <textarea
                placeholder="ผลลัพธ์โครงการ (Outcome)"
                value={newProject.outcome}
                onChange={(e) => setNewProject({ ...newProject, outcome: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors h-20 font-body"
              />
            </div>
          )}
          <div className="md:col-span-2 flex justify-end pt-2">
            <button type="submit" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-colors">
              บันทึก
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectView;
