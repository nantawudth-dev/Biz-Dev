
import React, { useState } from 'react';
import { Entrepreneur, Role } from '../types';
import Modal from './Modal';
import { PlusIcon, BuildingIcon, MapPinIcon, PhoneIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon, Squares2X2Icon, ListBulletIcon, BriefcaseIcon, UserGroupIcon, ChatBubbleLeftIcon, GlobeAltIcon, EyeIcon, ChevronDownIcon, FunnelIcon, MagnifyingGlassIcon, ArrowLeftIcon } from './icons';
import { useNotification } from '../contexts/NotificationContext';
import Pagination from './Pagination';

interface EntrepreneurViewProps {
  userRole: Role;
  entrepreneurs: Entrepreneur[];
  setEntrepreneurs: React.Dispatch<React.SetStateAction<Entrepreneur[]>>;
  establishmentTypes: string[];
  businessCategories: string[];
}

const emptyEntrepreneurForm: Omit<Entrepreneur, 'id'> & { id?: string } = {
  name: '', businessName: '', contact: '', establishmentType: '', businessCategory: '', address: '', lineId: '', facebook: '', nickname: ''
};

const CardView = ({ data, userRole, onView, onEdit, onDelete }: { data: Entrepreneur[], userRole: Role, onView: (ent: Entrepreneur) => void, onEdit: (ent: Entrepreneur) => void, onDelete: (ent: Entrepreneur) => void }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {data.map(ent => (
      <div key={ent.id} className="bg-white border border-slate-200 rounded-xl shadow-lg hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden">
        <div className="p-6 flex-grow flex flex-col relative z-10">
          <div className="flex items-start mb-4">
            <div className="bg-white/80 p-3 rounded-lg mr-4 shrink-0 shadow-sm"><BuildingIcon className="w-6 h-6 text-orange-600" /></div>
            <div>
              <h3 className="text-xl font-medium font-title text-slate-900 leading-tight">{ent.businessName}</h3>
              <p className="text-base text-slate-500 font-body">{ent.businessCategory}</p>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-auto pt-4 text-slate-600 space-y-3 font-body">
            <div className="flex items-center gap-3">
              <UserGroupIcon className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-700">{ent.name} {ent.nickname && <span className="text-slate-500 font-normal text-sm">({ent.nickname})</span>}</span>
            </div>
            <p className="flex items-center gap-3"><PhoneIcon className="w-5 h-5 text-slate-400 shrink-0" /><span>{ent.contact || '-'}</span></p>
          </div>
          <div className="border-t border-slate-200 pt-4 mt-4 flex gap-2">
            <button
              onClick={() => onView(ent)}
              className="flex-1 py-2 bg-white border border-emerald-200 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-all text-sm shadow-sm flex items-center justify-center gap-2"
            >
              <EyeIcon className="w-4 h-4" />
              ดูรายละเอียด
            </button>
            {(userRole === 'admin' || userRole === 'officer') && (
              <>
                <button
                  onClick={() => onEdit(ent)}
                  className="py-2 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  title="แก้ไขข้อมูล"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(ent)}
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

const ListView = ({ data, userRole, onView, onEdit, onDelete }: { data: Entrepreneur[], userRole: Role, onView: (ent: Entrepreneur) => void, onEdit: (ent: Entrepreneur) => void, onDelete: (ent: Entrepreneur) => void }) => (
  <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
    <table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-slate-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ชื่อสถานประกอบการ</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ประเภท</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">หมวดธุรกิจ</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ผู้ติดต่อ</th>
          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider font-title">จัดการ</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-slate-200">
        {data.map((ent) => (
          <tr key={ent.id} className="hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-slate-900">{ent.businessName}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-slate-500">{ent.establishmentType}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-slate-500">{ent.businessCategory}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-slate-900">{ent.name}</div>
              {ent.nickname && <div className="text-xs text-slate-500">({ent.nickname})</div>}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => onView(ent)}
                  className="text-slate-400 hover:text-blue-600 transition-colors"
                  title="ดูรายละเอียด"
                >
                  <EyeIcon className="w-5 h-5" />
                </button>
                {(userRole === 'admin' || userRole === 'officer') && (
                  <>
                    <button onClick={() => onEdit(ent)} className="text-slate-400 hover:text-blue-600 transition-colors" title="แก้ไขข้อมูล"><PencilIcon className="w-5 h-5" /></button>
                    <button onClick={() => onDelete(ent)} className="text-slate-400 hover:text-red-600 transition-colors" title="ลบข้อมูล"><TrashIcon className="w-5 h-5" /></button>
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


const EntrepreneurView: React.FC<EntrepreneurViewProps> = ({ userRole, entrepreneurs, setEntrepreneurs, establishmentTypes, businessCategories }) => {
  const [displayMode, setDisplayMode] = useState<'card' | 'list'>('card');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingEntrepreneur, setEditingEntrepreneur] = useState<Entrepreneur | null>(null);
  const [deletingEntrepreneur, setDeletingEntrepreneur] = useState<Entrepreneur | null>(null);
  const [viewingEntrepreneur, setViewingEntrepreneur] = useState<Entrepreneur | null>(null);
  const [formData, setFormData] = useState<Omit<Entrepreneur, 'id'> & { id?: string }>(emptyEntrepreneurForm);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [selectedEstablishment, setSelectedEstablishment] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const { showNotification } = useNotification();



  const handleOpenView = (ent: Entrepreneur) => { setViewingEntrepreneur(ent); };
  const handleOpenAdd = () => { setEditingEntrepreneur(null); setFormData(emptyEntrepreneurForm); setIsFormOpen(true); };
  const handleOpenEdit = (ent: Entrepreneur) => { setEditingEntrepreneur(ent); setFormData(ent); setIsFormOpen(true); };
  const handleOpenDeleteModal = (ent: Entrepreneur) => { setDeletingEntrepreneur(ent); setIsDeleteModalOpen(true); };

  // Close inline views
  const handleBackToList = () => { setIsFormOpen(false); setViewingEntrepreneur(null); };
  // Close delete modal
  const handleCloseDeleteModal = () => { setIsDeleteModalOpen(false); };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.businessName || !formData.establishmentType || !formData.businessCategory) return;
    if (editingEntrepreneur) {
      setEntrepreneurs(entrepreneurs.map(ent => (ent.id === editingEntrepreneur.id ? { ...formData, id: ent.id } : ent)));
      showNotification('บันทึกข้อมูลผู้ประกอบการสำเร็จ', 'success');
    } else {
      setEntrepreneurs([...entrepreneurs, { ...formData, id: `ent${Date.now()}` }]);
      showNotification('เพิ่มผู้ประกอบการใหม่สำเร็จ', 'success');
    }
    handleBackToList();
  };

  const handleConfirmDelete = () => {
    if (deletingEntrepreneur) {
      setEntrepreneurs(entrepreneurs.filter(ent => ent.id !== deletingEntrepreneur.id));
      showNotification('ลบผู้ประกอบการสำเร็จ', 'delete');
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

  const filteredEntrepreneurs = entrepreneurs
    .filter(ent => selectedEstablishment === 'All' || ent.establishmentType === selectedEstablishment)
    .filter(ent => selectedCategory === 'All' || ent.businessCategory === selectedCategory)
    .filter(ent =>
      ent.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ent.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const paginatedEntrepreneurs = filteredEntrepreneurs.slice(
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
          <h2 className="text-2xl font-medium font-title text-slate-900">{editingEntrepreneur ? 'แก้ไขข้อมูลผู้ประกอบการ' : 'เพิ่มผู้ประกอบการใหม่'}</h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อสถานประกอบการ</label>
                <input type="text" placeholder="ชื่อสถานประกอบการ" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" required />
              </div>

              <div className="md:col-span-1 relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">ประเภท</label>
                <div className="relative">
                  <select value={formData.establishmentType} onChange={e => setFormData({ ...formData, establishmentType: e.target.value })} className="w-full px-4 py-2 pr-10 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors appearance-none font-body" required>
                    <option value="" disabled>เลือกประเภท</option>
                    {establishmentTypes.map(type => (<option key={type} value={type}>{type}</option>))}
                  </select>
                  <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="md:col-span-1 relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">หมวดธุรกิจ</label>
                <div className="relative">
                  <select value={formData.businessCategory} onChange={e => setFormData({ ...formData, businessCategory: e.target.value })} className="w-full px-4 py-2 pr-10 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors appearance-none font-body" required>
                    <option value="" disabled>เลือกหมวดธุรกิจ</option>
                    {businessCategories.map(type => (<option key={type} value={type}>{type}</option>))}
                  </select>
                  <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ติดต่อ</label>
                <input type="text" placeholder="ชื่อผู้ติดต่อ" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" required />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อเล่น (ไม่บังคับ)</label>
                <input type="text" placeholder="ชื่อเล่น" value={formData.nickname || ''} onChange={e => setFormData({ ...formData, nickname: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทร</label>
                <input type="text" placeholder="เบอร์โทร" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Line ID</label>
                <input type="text" placeholder="Line ID" value={formData.lineId} onChange={e => setFormData({ ...formData, lineId: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Facebook</label>
                <input type="text" placeholder="Facebook" value={formData.facebook} onChange={e => setFormData({ ...formData, facebook: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ที่อยู่</label>
              <textarea placeholder="ที่อยู่" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors h-24 font-body" />
            </div>

            <div className="flex justify-end pt-4 gap-3">
              <button type="button" onClick={handleBackToList} className="bg-gradient-to-r from-orange-400 to-amber-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-colors shadow-md">ยกเลิก</button>
              <button type="submit" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-colors shadow-md">{editingEntrepreneur ? 'บันทึกข้อมูลผู้ประกอบการ' : 'บันทึกข้อมูลผู้ประกอบการ'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // View: Details
  if (viewingEntrepreneur) {
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
            <BriefcaseIcon className="w-8 h-8 text-emerald-600" />
            <h2 className="text-3xl font-medium font-title text-slate-900">{viewingEntrepreneur.businessName}</h2>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-8 space-y-6 font-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">ประเภทสถานประกอบการ</label>
              <p className="text-lg font-medium text-slate-900 mt-1">{viewingEntrepreneur.establishmentType}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">หมวดธุรกิจ</label>
              <p className="text-lg font-medium text-slate-900 mt-1">{viewingEntrepreneur.businessCategory}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">ผู้ติดต่อ</label>
              <p className="text-lg font-medium text-slate-900 mt-1">
                {viewingEntrepreneur.name}
                {viewingEntrepreneur.nickname && <span className="text-slate-500 text-base font-normal"> ({viewingEntrepreneur.nickname})</span>}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">เบอร์โทร</label>
              <p className="text-lg font-medium text-slate-900 mt-1">{viewingEntrepreneur.contact || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Line ID</label>
              <p className="text-lg font-medium text-slate-900 mt-1">{viewingEntrepreneur.lineId || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Facebook</label>
              <p className="text-lg font-medium text-slate-900 mt-1">{viewingEntrepreneur.facebook || '-'}</p>
            </div>
          </div>

          {viewingEntrepreneur.address && (
            <div className="border-t border-slate-200 pt-6">
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">ที่อยู่</label>
              <p className="text-lg font-medium text-slate-900 mt-1">{viewingEntrepreneur.address}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // View: List (Default)
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-medium font-title text-slate-900">ผู้ประกอบการ</h2>
        {(userRole === 'admin' || userRole === 'officer') && (
          <button onClick={handleOpenAdd} className="flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2.5 font-semibold rounded-lg shadow-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105"><PlusIcon className="w-5 h-5 mr-2" /><span>เพิ่มผู้ประกอบการ</span></button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="w-full md:w-auto md:flex-1 relative">
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ประกอบการหรือชื่อผู้ติดต่อ..."
            value={searchTerm}
            onChange={handleFilterChange(setSearchTerm)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <div className="w-full md:w-auto flex items-center justify-end gap-2">
          <div className="relative">
            <select
              value={selectedEstablishment}
              onChange={handleFilterChange(setSelectedEstablishment)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none font-semibold text-sm"
              aria-label="Filter by establishment type"
            >
              <option value="All">ทุกประเภท</option>
              {establishmentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <FunnelIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={handleFilterChange(setSelectedCategory)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none font-semibold text-sm"
              aria-label="Filter by business category"
            >
              <option value="All">ทุกหมวดธุรกิจ</option>
              {businessCategories.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <FunnelIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button onClick={() => setDisplayMode('card')} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${displayMode === 'card' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100'}`}><Squares2X2Icon className="w-5 h-5" /></button>
            <button onClick={() => setDisplayMode('list')} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${displayMode === 'list' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100'}`}><ListBulletIcon className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {filteredEntrepreneurs.length > 0 ? (
        <>
          {displayMode === 'card' ? <CardView data={paginatedEntrepreneurs} userRole={userRole} onView={handleOpenView} onEdit={handleOpenEdit} onDelete={handleOpenDeleteModal} /> : <ListView data={paginatedEntrepreneurs} userRole={userRole} onView={handleOpenView} onEdit={handleOpenEdit} onDelete={handleOpenDeleteModal} />}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredEntrepreneurs.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      ) : (<div className="text-center py-20 px-4 bg-white border border-slate-200 rounded-xl">
        <h3 className="text-xl font-medium font-title text-slate-700">ไม่พบข้อมูล</h3>
        <p className="text-slate-500 mt-2 font-body">
          ไม่พบข้อมูลผู้ประกอบการที่ตรงกับการค้นหาของคุณ
        </p>
      </div>)}

      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} title="ยืนยันการลบ" icon={<ExclamationTriangleIcon className="w-7 h-7 text-red-500" />}>
        {deletingEntrepreneur && (
          <div>
            <p className="text-slate-600 mb-6 text-base font-body">คุณแน่ใจหรือไม่ว่าต้องการลบ <span className="font-semibold text-slate-900">{deletingEntrepreneur.businessName}</span>? <br />การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className="flex justify-end gap-4"><button onClick={handleCloseDeleteModal} className="px-5 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold transition-colors">ยกเลิก</button><button onClick={handleConfirmDelete} className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors">ยืนยัน</button></div>
          </div>
        )}
      </Modal>


    </div>
  );
};

export default EntrepreneurView;
