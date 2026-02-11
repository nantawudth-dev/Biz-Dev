
import React, { useState } from 'react';
import { Project, Entrepreneur, ProjectCategory, Role } from '../types';
import Modal from './Modal';
import { PlusIcon, Squares2X2Icon, ListBulletIcon, FunnelIcon, MagnifyingGlassIcon } from './icons';
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
    entrepreneurId: '',
    status: 'Planned',
    category: 'Research',
    outcome: '',
};

const ProjectView: React.FC<ProjectViewProps> = ({ userRole, projects, setProjects, entrepreneurs, projectCategories }) => {
  const [displayMode, setDisplayMode] = useState<'card' | 'list'>('card');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({ ...emptyProject, entrepreneurId: entrepreneurs[0]?.id || '' });
  const { showNotification } = useNotification();

  const [selectedStatus, setSelectedStatus] = useState<'All' | Project['status']>('All');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProjectCategory>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.name && newProject.entrepreneurId) {
      setProjects([...projects, { ...newProject, id: `proj${Date.now()}` }]);
      setNewProject({ ...emptyProject, entrepreneurId: entrepreneurs[0]?.id || '' });
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
    const entrepreneur = entrepreneurs.find(e => e.id === proj.entrepreneurId);
    const searchMatch = proj.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (entrepreneur && entrepreneur.businessName.toLowerCase().includes(searchTerm.toLowerCase()));

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
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none font-semibold text-sm"
                >
                <option value="All">ทุกสถานะ</option>
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                </select>
                <FunnelIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
                <select
                value={selectedCategory}
                onChange={handleFilterChange(setSelectedCategory)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none font-semibold text-sm"
                >
                <option value="All">ทุกหมวดหมู่</option>
                {projectCategories.map(cat => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
                </select>
                <FunnelIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                const entrepreneur = entrepreneurs.find(e => e.id === proj.entrepreneurId);
                return (
                  <div key={proj.id} className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-slate-900">{proj.name}</h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(proj.status)}`}>{proj.status}</span>
                      </div>
                      <p className="text-slate-600 mb-4 flex-grow font-body">{proj.description}</p>
                      <div className="border-t border-slate-200 pt-4 mt-auto">
                          <p className="text-sm text-slate-500 font-medium">
                              สำหรับ: <span className="font-semibold text-slate-800">{entrepreneur?.businessName || 'ไม่ระบุ'}</span>
                          </p>
                      </div>
                    </div>
                  </div>
                )
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              {paginatedProjects.map((proj, index) => {
                const entrepreneur = entrepreneurs.find(e => e.id === proj.entrepreneurId);
                return (
                  <div key={proj.id} className={`p-4 flex flex-col md:flex-row md:items-center gap-4 ${index < paginatedProjects.length - 1 ? 'border-b border-slate-200' : ''}`}>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-slate-900">{proj.name}</p>
                      <p className="text-sm text-slate-500">สำหรับ: <span className="font-semibold text-slate-800">{entrepreneur?.businessName || 'ไม่ระบุ'}</span></p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(proj.status)}`}>{proj.status}</span>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="เพิ่มโครงการใหม่">
        <form onSubmit={handleAddProject} className="space-y-4">
          <input type="text" placeholder="ชื่อโครงการ" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" required />
          <textarea placeholder="รายละเอียด" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors h-24 font-body" />
          <select value={newProject.entrepreneurId} onChange={(e) => setNewProject({ ...newProject, entrepreneurId: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors appearance-none" required >
            <option value="">เลือกผู้ประกอบการ</option>
            {entrepreneurs.map(ent => (
              <option key={ent.id} value={ent.id}>{ent.businessName}</option>
            ))}
          </select>
          <select value={newProject.category} onChange={(e) => setNewProject({ ...newProject, category: e.target.value as ProjectCategory })} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors appearance-none" required >
              <option value="">เลือกหมวดหมู่โครงการ</option>
              {projectCategories.map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
              ))}
          </select>
          <select value={newProject.status} onChange={(e) => setNewProject({ ...newProject, status: e.target.value as Project['status'] })} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors appearance-none" >
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          {newProject.status === 'Completed' && (
            <textarea 
                placeholder="ผลลัพธ์โครงการ (Outcome)" 
                value={newProject.outcome} 
                onChange={(e) => setNewProject({ ...newProject, outcome: e.target.value })} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors h-24 font-body" 
            />
          )}
          <div className="flex justify-end pt-4">
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
