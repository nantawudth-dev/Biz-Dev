
import React, { useState } from 'react';
import { Project, Entrepreneur, ProjectCategory } from '../types';
import { SparklesIcon, Squares2X2Icon, ListBulletIcon, FunnelIcon, MagnifyingGlassIcon } from './icons';
import { ProjectCategorySetting } from '../App';

interface BizProjectViewProps {
  projects: Project[];
  entrepreneurs: Entrepreneur[];
  projectCategories: ProjectCategorySetting[];
}

const BizProjectView: React.FC<BizProjectViewProps> = ({ projects, entrepreneurs, projectCategories }) => {
    const [displayMode, setDisplayMode] = useState<'card' | 'list'>('card');
    const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'All'>('All');
    const [searchTerm, setSearchTerm] = useState('');

    const categoriesForFilter = [{ key: 'All', label: 'แสดงทั้งหมด' }, ...projectCategories];

    const filteredProjects = projects
        .filter(p => p.status === 'Completed')
        .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
        .filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.outcome || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    
    const CardView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(proj => {
                const entrepreneur = entrepreneurs.find(e => e.id === proj.entrepreneurId);
                return (
                    <div key={proj.id} className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                        <div className="p-6 flex-grow flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-xl font-bold text-slate-900">{proj.name}</h4>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800`}>Completed</span>
                            </div>
                            <div className="text-slate-600 mb-4 flex-grow font-body mt-2">
                                <p className="font-semibold text-slate-700 flex items-center gap-2 mb-2">
                                    <SparklesIcon className="w-5 h-5 text-green-500" />
                                    ผลลัพธ์ที่ได้:
                                </p>
                                <p className="pl-1">{proj.outcome || 'N/A'}</p>
                            </div>
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
    );

    const ListView = () => (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            {filteredProjects.map((proj, index) => {
                const entrepreneur = entrepreneurs.find(e => e.id === proj.entrepreneurId);
                const categoryLabel = projectCategories.find(c => c.key === proj.category)?.label;
                return (
                    <div key={proj.id} className={`p-4 ${index < filteredProjects.length - 1 ? 'border-b border-slate-200' : ''}`}>
                       <div className="flex flex-col md:flex-row md:items-start gap-4">
                            <div className="flex-1">
                                <p className="text-lg font-bold text-slate-900">{proj.name}</p>
                                <p className="text-sm text-slate-500">
                                    <span className="font-medium">สำหรับ:</span> {entrepreneur?.businessName || 'ไม่ระบุ'} | <span className="font-medium">ประเภท:</span> {categoryLabel}
                                </p>
                            </div>
                            <div className="flex-shrink-0">
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800`}>Completed</span>
                            </div>
                       </div>
                       <div className="text-slate-600 mt-2 font-body text-sm pl-1">
                          <p className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                            <SparklesIcon className="w-4 h-4 text-green-500" />
                            ผลลัพธ์:
                          </p>
                          <p className="pl-2">{proj.outcome || 'N/A'}</p>
                       </div>
                    </div>
                )
            })}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-4xl font-bold text-slate-900">ผลลัพธ์โครงการ</h2>
            </div>

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
                <div className="w-full md:w-auto flex items-center justify-end gap-2">
                    <div className="relative">
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value as ProjectCategory | 'All')}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none font-semibold text-sm"
                        >
                            {categoriesForFilter.map(cat => (
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
                displayMode === 'card' ? <CardView /> : <ListView />
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
};

export default BizProjectView;