
import React, { useState } from 'react';
import { Consultant, Role } from '../types';
import Modal from './Modal';
import { PlusIcon, UserGroupIcon, Squares2X2Icon, ListBulletIcon, FunnelIcon, MagnifyingGlassIcon } from './icons';
import { useNotification } from '../contexts/NotificationContext';

interface ConsultantViewProps {
  userRole: Role;
  consultants: Consultant[];
  setConsultants: React.Dispatch<React.SetStateAction<Consultant[]>>;
}

const ConsultantView: React.FC<ConsultantViewProps> = ({ userRole, consultants, setConsultants }) => {
  const [displayMode, setDisplayMode] = useState<'card' | 'list'>('card');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newConsultant, setNewConsultant] = useState({ name: '', expertise: '', contact: '' });
  const [selectedExpertise, setSelectedExpertise] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const { showNotification } = useNotification();

  const handleAddConsultant = (e: React.FormEvent) => {
    e.preventDefault();
    if (newConsultant.name) {
      const expertiseArray = newConsultant.expertise.split(',').map(item => item.trim()).filter(Boolean);
      setConsultants([
        ...consultants, 
        { 
          id: `con${Date.now()}`, 
          name: newConsultant.name, 
          contact: newConsultant.contact, 
          expertise: expertiseArray 
        }
      ]);
      setNewConsultant({ name: '', expertise: '', contact: '' });
      setIsModalOpen(false);
      showNotification('เพิ่มที่ปรึกษาใหม่สำเร็จ', 'success');
    }
  };

  const allExpertise = Array.from(new Set(consultants.flatMap(c => c.expertise))).sort();

  const filteredConsultants = consultants
    .filter(consultant => 
        selectedExpertise === 'All' || consultant.expertise.includes(selectedExpertise)
    )
    .filter(consultant =>
        consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultant.expertise.join(' ').toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-4xl font-bold text-slate-900">ที่ปรึกษา</h2>
        {(userRole === 'admin' || userRole === 'officer') && (
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2.5 font-semibold rounded-lg shadow-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105"
            >
                <PlusIcon className="w-5 h-5 mr-2" />
                <span>เพิ่มที่ปรึกษา</span>
            </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="w-full md:w-auto md:flex-1 relative">
            <input 
                type="text"
                placeholder="ค้นหาชื่อหรือความเชี่ยวชาญ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <div className="w-full md:w-auto flex items-center justify-end gap-2">
            <div className="relative">
              <select
                  value={selectedExpertise}
                  onChange={(e) => setSelectedExpertise(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none font-semibold text-sm"
              >
                  <option value="All">ทุกความเชี่ยวชาญ</option>
                  {allExpertise.map(exp => (
                      <option key={exp} value={exp}>{exp}</option>
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


      {filteredConsultants.length > 0 ? (
        <>
            {displayMode === 'card' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredConsultants.map(consultant => (
                    <div key={consultant.id} className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    <div className="p-6">
                        <div className="flex items-start mb-5">
                            <div className="bg-blue-100 p-3 rounded-lg mr-4 shrink-0">
                                <UserGroupIcon className="w-6 h-6 text-blue-600"/>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{consultant.name}</h3>
                                <p className="text-base text-slate-500 font-body">{consultant.contact}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                        {consultant.expertise.map((skill, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                            {skill}
                            </span>
                        ))}
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                    {filteredConsultants.map((consultant, index) => (
                        <div key={consultant.id} className={`p-4 flex flex-col md:flex-row md:items-center gap-4 ${index < consultants.length - 1 ? 'border-b border-slate-200' : ''}`}>
                            <div className="flex-1">
                                <p className="text-lg font-bold text-slate-900">{consultant.name}</p>
                                <p className="text-base text-slate-500 font-body">{consultant.contact}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {consultant.expertise.map((skill, index) => (
                                    <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
      ) : (
        <div className="text-center py-20 px-4 bg-white border border-slate-200 rounded-xl">
            <h3 className="text-xl font-semibold text-slate-700">ไม่พบข้อมูลที่ปรึกษา</h3>
            <p className="text-slate-500 mt-2 font-body">
              ไม่พบที่ปรึกษาที่ตรงกับการค้นหาของคุณ
            </p>
        </div>
      )}
      

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="เพิ่มที่ปรึกษาใหม่">
        <form onSubmit={handleAddConsultant} className="space-y-4">
          <input type="text" placeholder="ชื่อที่ปรึกษา" value={newConsultant.name} onChange={(e) => setNewConsultant({ ...newConsultant, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" required />
          <input type="text" placeholder="ความเชี่ยวชาญ (คั่นด้วยจุลภาค ,)" value={newConsultant.expertise} onChange={(e) => setNewConsultant({ ...newConsultant, expertise: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
          <input type="text" placeholder="ข้อมูลติดต่อ (อีเมล)" value={newConsultant.contact} onChange={(e) => setNewConsultant({ ...newConsultant, contact: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
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

export default ConsultantView;
