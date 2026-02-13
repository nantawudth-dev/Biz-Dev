
import React, { useState } from 'react';
import { Consultant, Role } from '../types';
import Modal from './Modal';
import { PlusIcon, UserGroupIcon, Squares2X2Icon, ListBulletIcon, FunnelIcon, MagnifyingGlassIcon, ArrowLeftIcon, EyeIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon, PhoneIcon, BuildingOffice2Icon, EnvelopeIcon } from './icons';
import { useNotification } from '../contexts/NotificationContext';
import Pagination from './Pagination';

interface ConsultantViewProps {
  userRole: Role;
  consultants: Consultant[];
  setConsultants: React.Dispatch<React.SetStateAction<Consultant[]>>;
}

const emptyConsultantForm: Omit<Consultant, 'id'> & { id?: string } = {
  name: '', expertise: [], contact: '', phone: '', workplace: ''
};

const CardView = ({ data, userRole, onView, onEdit, onDelete }: { data: Consultant[], userRole: Role, onView: (consultant: Consultant) => void, onEdit: (consultant: Consultant) => void, onDelete: (consultant: Consultant) => void }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {data.map(consultant => (
      <div key={consultant.id} className="bg-white border border-slate-200 rounded-xl shadow-lg hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col">
        <div className="p-6 flex-grow flex flex-col">
          <div className="flex items-start mb-4">
            <div className="bg-blue-100 p-3 rounded-lg mr-4 shrink-0">
              <UserGroupIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-medium font-title text-slate-900">{consultant.name}</h3>
              {consultant.workplace && <p className="text-sm text-slate-500 font-body">{consultant.workplace}</p>}
            </div>
          </div>

          <div className="border-t border-slate-200 mt-auto pt-4 text-slate-600 space-y-2 font-body text-sm">
            {consultant.phone && (
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-slate-400" />
                <span>{consultant.phone}</span>
              </div>
            )}
            {consultant.contact && (
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                <span className="truncate">{consultant.contact}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              {consultant.expertise.map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 mt-4 flex gap-2">
            <button
              onClick={() => onView(consultant)}
              className="flex-1 py-2 bg-white border border-emerald-200 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-all text-sm shadow-sm flex items-center justify-center gap-2"
            >
              <EyeIcon className="w-4 h-4" />
              ดูรายละเอียด
            </button>
            {(userRole === 'admin' || userRole === 'officer') && (
              <>
                <button
                  onClick={() => onEdit(consultant)}
                  className="py-2 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  title="แก้ไขข้อมูล"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(consultant)}
                  className="py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  title="ลบข้อมูล"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ListView = ({ data, userRole, onView, onEdit, onDelete }: { data: Consultant[], userRole: Role, onView: (consultant: Consultant) => void, onEdit: (consultant: Consultant) => void, onDelete: (consultant: Consultant) => void }) => (
  <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
    <table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-slate-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ชื่อผู้เชี่ยวชาญ</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">สถานที่ทำงาน</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ความเชี่ยวชาญ</th>
          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider font-title">จัดการ</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-slate-200">
        {data.map((consultant) => (
          <tr key={consultant.id} className="hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-slate-900">{consultant.name}</div>
              {consultant.phone && <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><PhoneIcon className="w-3 h-3" /> {consultant.phone}</div>}
              {consultant.contact && <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><EnvelopeIcon className="w-3 h-3" /> {consultant.contact}</div>}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-slate-500">{consultant.workplace || '-'}</div>
            </td>
            <td className="px-6 py-4">
              <div className="flex flex-wrap gap-2">
                {consultant.expertise.map((skill, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {skill}
                  </span>
                ))}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => onView(consultant)}
                  className="text-slate-400 hover:text-blue-600 transition-colors"
                  title="ดูรายละเอียด"
                >
                  <EyeIcon className="w-5 h-5" />
                </button>
                {(userRole === 'admin' || userRole === 'officer') && (
                  <>
                    <button onClick={() => onEdit(consultant)} className="text-slate-400 hover:text-blue-600 transition-colors" title="แก้ไขข้อมูล"><PencilIcon className="w-5 h-5" /></button>
                    <button onClick={() => onDelete(consultant)} className="text-slate-400 hover:text-red-600 transition-colors" title="ลบข้อมูล"><TrashIcon className="w-5 h-5" /></button>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ConsultantView: React.FC<ConsultantViewProps> = ({ userRole, consultants, setConsultants }) => {
  const [displayMode, setDisplayMode] = useState<'card' | 'list'>('card');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingConsultant, setEditingConsultant] = useState<Consultant | null>(null);
  const [deletingConsultant, setDeletingConsultant] = useState<Consultant | null>(null);
  const [viewingConsultant, setViewingConsultant] = useState<Consultant | null>(null);
  const [formData, setFormData] = useState<Omit<Consultant, 'id'> & { id?: string }>(emptyConsultantForm);
  const [expertiseInput, setExpertiseInput] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [selectedExpertise, setSelectedExpertise] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const { showNotification } = useNotification();

  const handleOpenView = (consultant: Consultant) => { setViewingConsultant(consultant); };
  const handleOpenAdd = () => { setEditingConsultant(null); setFormData(emptyConsultantForm); setExpertiseInput(''); setIsFormOpen(true); };
  const handleOpenEdit = (consultant: Consultant) => {
    setEditingConsultant(consultant);
    setFormData(consultant);
    setExpertiseInput(consultant.expertise.join(', '));
    setIsFormOpen(true);
  };
  const handleOpenDeleteModal = (consultant: Consultant) => { setDeletingConsultant(consultant); setIsDeleteModalOpen(true); };

  const handleBackToList = () => { setIsFormOpen(false); setViewingConsultant(null); };
  const handleCloseDeleteModal = () => { setIsDeleteModalOpen(false); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const expertiseArray = expertiseInput.split(',').map(item => item.trim()).filter(Boolean);
    const consultantData = { ...formData, expertise: expertiseArray };

    if (editingConsultant) {
      setConsultants(consultants.map(c => (c.id === editingConsultant.id ? { ...consultantData, id: c.id } : c)));
      showNotification('บันทึกข้อมูลผู้เชี่ยวชาญสำเร็จ', 'success');
    } else {
      setConsultants([...consultants, { ...consultantData, id: `con${Date.now()}` }]);
      showNotification('เพิ่มผู้เชี่ยวชาญใหม่สำเร็จ', 'success');
    }
    handleBackToList();
  };

  const handleConfirmDelete = () => {
    if (deletingConsultant) {
      setConsultants(consultants.filter(c => c.id !== deletingConsultant.id));
      showNotification('ลบผู้เชี่ยวชาญสำเร็จ', 'delete');
      handleCloseDeleteModal();
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const allExpertise = Array.from(new Set(consultants.flatMap(c => c.expertise))).sort();

  const filteredConsultants = consultants
    .filter(consultant =>
      selectedExpertise === 'All' || consultant.expertise.includes(selectedExpertise)
    )
    .filter(consultant =>
      consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.expertise.join(' ').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (consultant.workplace && consultant.workplace.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const paginatedConsultants = filteredConsultants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // View: Add/Edit Form
  if (isFormOpen) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackToList}
            className="mr-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-medium font-title text-slate-900">{editingConsultant ? 'แก้ไขข้อมูลผู้เชี่ยวชาญ' : 'เพิ่มผู้เชี่ยวชาญใหม่'}</h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้เชี่ยวชาญ</label>
                <input type="text" placeholder="ชื่อผู้เชี่ยวชาญ" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" required />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                <div className="relative">
                  <PhoneIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="tel" placeholder="เบอร์โทรศัพท์" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">อีเมล</label>
                <div className="relative">
                  <EnvelopeIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="email" placeholder="example@email.com" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">สถานที่ทำงาน</label>
                <div className="relative">
                  <BuildingOffice2Icon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="สถานที่ทำงาน / องค์กร" value={formData.workplace} onChange={e => setFormData({ ...formData, workplace: e.target.value })} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">ความเชี่ยวชาญ (คั่นด้วยจุลภาค ,)</label>
                <input type="text" placeholder="ตัวอย่าง: การตลาด, บัญชี, กฎหมาย" value={expertiseInput} onChange={e => setExpertiseInput(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
              </div>
            </div>

            <div className="flex justify-end pt-4 gap-3">
              <button type="button" onClick={handleBackToList} className="bg-gradient-to-r from-orange-400 to-amber-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-colors shadow-md">ยกเลิก</button>
              <button type="submit" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-colors shadow-md">{editingConsultant ? 'บันทึกการแก้ไข' : 'บันทึกผู้เชี่ยวชาญ'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // View: Details
  if (viewingConsultant) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md font-semibold"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            กลับ
          </button>
          <div className="flex items-center gap-3">
            <UserGroupIcon className="w-8 h-8 text-emerald-600" />
            <h2 className="text-3xl font-medium font-title text-slate-900">{viewingConsultant.name}</h2>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-8 space-y-6 font-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {viewingConsultant.workplace && (
              <div>
                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">สถานที่ทำงาน</label>
                <p className="text-lg font-medium text-slate-900 mt-1">{viewingConsultant.workplace}</p>
              </div>
            )}
            {viewingConsultant.phone && (
              <div>
                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">เบอร์โทรศัพท์</label>
                <p className="text-lg font-medium text-slate-900 mt-1">{viewingConsultant.phone}</p>
              </div>
            )}
            {viewingConsultant.contact && (
              <div>
                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">อีเมล</label>
                <p className="text-lg font-medium text-slate-900 mt-1">{viewingConsultant.contact}</p>
              </div>
            )}
          </div>

          {viewingConsultant.expertise.length > 0 && (
            <div className="border-t border-slate-200 pt-6">
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide block mb-3">ความเชี่ยวชาญ</label>
              <div className="flex flex-wrap gap-2">
                {viewingConsultant.expertise.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // View: List (Default)
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="w-full md:w-auto md:flex-1 relative">
          <input
            type="text"
            placeholder="ค้นหาชื่อ, ความเชี่ยวชาญ, หรือสถานที่ทำงาน..."
            value={searchTerm}
            onChange={handleFilterChange(setSearchTerm)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <div className="w-full md:w-auto flex items-center justify-end gap-2">
          <div className="relative">
            <select
              value={selectedExpertise}
              onChange={handleFilterChange(setSelectedExpertise)}
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
            <CardView data={paginatedConsultants} userRole={userRole} onView={handleOpenView} onEdit={handleOpenEdit} onDelete={handleOpenDeleteModal} />
          ) : (
            <ListView data={paginatedConsultants} userRole={userRole} onView={handleOpenView} onEdit={handleOpenEdit} onDelete={handleOpenDeleteModal} />
          )}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredConsultants.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      ) : (
        <div className="text-center py-20 px-4 bg-white border border-slate-200 rounded-xl">
          <h3 className="text-xl font-semibold text-slate-700">ไม่พบข้อมูลผู้เชี่ยวชาญ</h3>
          <p className="text-slate-500 mt-2 font-body">
            ไม่พบผู้เชี่ยวชาญที่ตรงกับการค้นหาของคุณ
          </p>
        </div>
      )}

      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} title="ยืนยันการลบ" icon={<ExclamationTriangleIcon className="w-7 h-7 text-red-500" />}>
        {deletingConsultant && (
          <div>
            <p className="text-slate-600 mb-6 text-base font-body">คุณแน่ใจหรือไม่ว่าต้องการลบผู้เชี่ยวชาญ <span className="font-semibold text-slate-900">{deletingConsultant.name}</span>? <br />การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className="flex justify-end gap-4">
              <button onClick={handleCloseDeleteModal} className="px-5 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold transition-colors">ยกเลิก</button>
              <button onClick={handleConfirmDelete} className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors">ยืนยัน</button>
            </div>
          </div>
        )}
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
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-cyan-400/20 to-blue-400/20"></div>

            {/* Content */}
            <div className="relative flex items-center gap-6">
              <div className="bg-gradient-to-br from-green-500 to-cyan-500 p-4 rounded-xl group-hover:from-green-600 group-hover:to-cyan-600 transition-all shadow-md">
                <UserGroupIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-xl font-bold mb-1 text-slate-800">เพิ่มผู้เชี่ยวชาญ</h3>
                <p className="text-slate-600 text-sm font-normal">เพิ่มข้อมูลผู้เชี่ยวชาญและความเชี่ยวชาญ</p>
              </div>
              <PlusIcon className="w-6 h-6 text-green-600 opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        </div>
      )}

    </div>
  );
};

export default ConsultantView;
