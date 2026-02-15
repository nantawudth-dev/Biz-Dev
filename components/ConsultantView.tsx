
import React, { useState, useEffect } from 'react';
import { Consultant, Role } from '../types';
import Modal from './Modal';
import { PlusIcon, PencilIcon, TrashIcon, UserCircleIcon, PhoneIcon, BriefcaseIcon, AcademicCapIcon, MapPinIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, FunnelIcon, ChevronDownIcon, ArrowLeftIcon, Squares2X2Icon, ListBulletIcon, EyeIcon } from './icons';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';
import Pagination from './Pagination';

const emptyConsultantForm: Omit<Consultant, 'id'> = {
  title: '',
  firstName: '',
  lastName: '',
  expertise: '',
  phone: '',
  workplace: '',
  email: '',
  imageUrl: '',
};

const ConsultantView: React.FC = () => { // Removed props
  const { isAdmin, isOfficer } = useAuth();
  const userRole: Role = isAdmin ? 'admin' : isOfficer ? 'officer' : 'user';

  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayMode, setDisplayMode] = useState<'card' | 'list'>('card');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingConsultant, setEditingConsultant] = useState<Consultant | null>(null);
  const [deletingConsultant, setDeletingConsultant] = useState<Consultant | null>(null);
  const [viewingConsultant, setViewingConsultant] = useState<Consultant | null>(null);
  const [formData, setFormData] = useState<Omit<Consultant, 'id'>>(emptyConsultantForm);
  const { showNotification } = useNotification();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const fetchedConsultants = await dataService.getConsultants();
        setConsultants(fetchedConsultants);
      } catch (error) {
        console.error('Failed to fetch consultants:', error);
        showNotification('ไม่สามารถโหลดข้อมูลที่ปรึกษาได้', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [showNotification]);

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

  const handleOpenAdd = () => { setEditingConsultant(null); setFormData(emptyConsultantForm); setIsFormOpen(true); };
  const handleOpenEdit = (consultant: Consultant) => { setEditingConsultant(consultant); const { id, ...data } = consultant; setFormData(data); setIsFormOpen(true); };
  const handleOpenView = (consultant: Consultant) => { setViewingConsultant(consultant); };
  const handleOpenDeleteModal = (consultant: Consultant) => { setDeletingConsultant(consultant); setIsDeleteModalOpen(true); };

  const handleBackToList = () => { setIsFormOpen(false); setViewingConsultant(null); };
  const handleCloseDeleteModal = () => { setIsDeleteModalOpen(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName) {
      try {
        if (editingConsultant) {
          await dataService.updateConsultant(editingConsultant.id, formData);
          setConsultants(consultants.map(c => c.id === editingConsultant.id ? { ...formData, id: c.id } : c));
          showNotification('แก้ไขข้อมูลที่ปรึกษาสำเร็จ', 'success');
        } else {
          const newConsultant = await dataService.createConsultant(formData);
          if (newConsultant) {
            setConsultants([...consultants, newConsultant]);
            showNotification('เพิ่มที่ปรึกษาใหม่สำเร็จ', 'success');
          }
        }
        handleBackToList();
      } catch (error) {
        console.error('Error saving consultant:', error);
        showNotification('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingConsultant) {
      try {
        await dataService.deleteConsultant(deletingConsultant.id);
        setConsultants(consultants.filter(c => c.id !== deletingConsultant.id));
        showNotification('ลบข้อมูลที่ปรึกษาสำเร็จ', 'delete');
        handleCloseDeleteModal();
      } catch (error) {
        console.error('Error deleting consultant:', error);
        showNotification('เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
      }
    }
  };

  const filteredConsultants = consultants.filter(consultant =>
    consultant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultant.expertise.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedConsultants = filteredConsultants.slice(
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

  // Add/Edit Form
  if (isFormOpen) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="flex items-center mb-6">
          <button onClick={handleBackToList} className="mr-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-medium font-title text-slate-900">{editingConsultant ? 'แก้ไขข้อมูลที่ปรึกษา' : 'เพิ่มที่ปรึกษาใหม่'}</h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">คำนำหน้า</label>
                <input type="text" placeholder="เช่น ดร., ผศ.ดร." value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ</label>
                <input type="text" placeholder="ชื่อจริง" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">นามสกุล</label>
                <input type="text" placeholder="นามสกุล" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">ความเชี่ยวชาญ</label>
                <textarea placeholder="ระบุความเชี่ยวชาญ" value={formData.expertise} onChange={e => setFormData({ ...formData, expertise: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors h-24 font-body" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                <input type="text" placeholder="เบอร์โทรศัพท์ติดต่อ" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">หน่วยงาน/สังกัด</label>
                <input type="text" placeholder="ระบุหน่วยงาน" value={formData.workplace || ''} onChange={e => setFormData({ ...formData, workplace: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">อีเมล</label>
                <input type="email" placeholder="ระบุอีเมล" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">ลิงก์รูปภาพ (Image URL)</label>
                <div className="flex gap-4 items-start">
                  <div className="flex-grow">
                    <input type="text" placeholder="ระบุลิงก์รูปภาพ (https://...)" value={formData.imageUrl || ''} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                    <p className="text-xs text-slate-500 mt-1">แนะนำให้ใช้รูปภาพสัดส่วน 1:1 หรือ Squareimage</p>
                  </div>
                  {formData.imageUrl && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error'; }} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 gap-3 border-t border-slate-100 mt-6">
              <button type="button" onClick={handleBackToList} className="bg-slate-100 text-slate-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-200 transition-colors">ยกเลิก</button>
              <button type="submit" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-colors shadow-md">{editingConsultant ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // View Details
  if (viewingConsultant) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={handleBackToList} className="mr-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"><ArrowLeftIcon className="w-6 h-6" /></button>
          <div className="flex items-center gap-3">
            <AcademicCapIcon className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-medium font-title text-slate-900">ข้อมูลที่ปรึกษา</h2>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <AcademicCapIcon className="w-64 h-64 text-slate-900" />
          </div>

          <div className="flex flex-col md:flex-row gap-8 relative z-10">
            {/* Image Column */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-xl overflow-hidden shadow-md border-4 border-white bg-slate-100 flex items-center justify-center">
                {viewingConsultant.imageUrl ? (
                  <img src={viewingConsultant.imageUrl} alt={`${viewingConsultant.title}${viewingConsultant.firstName}`} className="w-full h-full object-cover" />
                ) : (
                  <UserCircleIcon className="w-20 h-20 text-slate-400" />
                )}
              </div>
            </div>

            {/* Info Column */}
            <div className="flex-grow space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 font-title mb-2">
                  {viewingConsultant.title} {viewingConsultant.firstName} {viewingConsultant.lastName}
                </h3>
                <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                  {viewingConsultant.workplace && (
                    <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
                      <BriefcaseIcon className="w-4 h-4" />
                      {viewingConsultant.workplace}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-blue-500" /> ข้อมูลติดต่อ
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
                    <p className="text-slate-700 flex items-center gap-3">
                      <span className="w-24 text-slate-500 text-sm">เบอร์โทรศัพท์:</span>
                      <span className="font-medium">{viewingConsultant.phone || '-'}</span>
                    </p>
                    <p className="text-slate-700 flex items-center gap-3">
                      <span className="w-24 text-slate-500 text-sm">อีเมล:</span>
                      <span className="font-medium">{viewingConsultant.email || '-'}</span>
                    </p>
                  </div>
                </div>

                <div>
                  {/* Placeholder for other details if strictly needed, or leave empty/merged */}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <AcademicCapIcon className="w-4 h-4 text-orange-500" /> ความเชี่ยวชาญ
                </h4>
                <div className="bg-orange-50 p-5 rounded-lg border border-orange-100 text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {viewingConsultant.expertise}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="w-full md:w-auto md:flex-1 relative">
          <input
            type="text"
            placeholder="ค้นหาชื่อ หรือความเชี่ยวชาญ..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <div className="w-full md:w-auto flex items-center justify-end gap-2">
          <div className="hidden md:flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button onClick={() => setDisplayMode('card')} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${displayMode === 'card' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100'}`}><Squares2X2Icon className="w-5 h-5" /></button>
            <button onClick={() => setDisplayMode('list')} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${displayMode === 'list' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100'}`}><ListBulletIcon className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {filteredConsultants.length > 0 ? (
        <>
          {displayMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedConsultants.map(consultant => (
                <div key={consultant.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col relative overflow-hidden">
                  <div className="p-6 flex-grow flex flex-col relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                        {consultant.imageUrl ? (
                          <img src={consultant.imageUrl} alt={`${consultant.title}${consultant.firstName}`} className="w-full h-full object-cover" />
                        ) : (
                          <UserCircleIcon className="w-7 h-7 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold font-title text-slate-900">{consultant.title} {consultant.firstName} {consultant.lastName}</h3>
                        <p className="text-sm text-slate-500 font-medium truncate max-w-[180px]">{consultant.workplace || '-'}</p>
                      </div>
                    </div>
                    <div className="mt-2 mb-4 flex-grow">
                      <p className="text-sm text-slate-600 line-clamp-2 font-body bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-700 block mb-1 text-xs uppercase tracking-wide">ความเชี่ยวชาญ</span>
                        {consultant.expertise}
                      </p>
                    </div>
                    <div className="border-t border-slate-100 pt-4 flex gap-2 mt-auto">
                      <button onClick={() => handleOpenView(consultant)} className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                        <EyeIcon className="w-4 h-4" /> ดูข้อมูล
                      </button>
                      {(userRole === 'admin' || userRole === 'officer') && (
                        <>
                          <button onClick={() => handleOpenEdit(consultant)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"><PencilIcon className="w-4 h-4" /></button>
                          <button onClick={() => handleOpenDeleteModal(consultant)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                        </>
                      )}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ชื่อ-นามสกุล</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">หน่วยงาน</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ความเชี่ยวชาญ</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider font-title">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {paginatedConsultants.map((consultant) => (
                      <tr key={consultant.id} onClick={() => handleOpenView(consultant)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                        <td data-label="ชื่อ-นามสกุล" className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">{consultant.title} {consultant.firstName} {consultant.lastName}</div>
                          <div className="text-xs text-slate-500 md:hidden">{consultant.phone}</div>
                        </td>
                        <td data-label="หน่วยงาน" className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-500">{consultant.workplace || '-'}</div>
                        </td>
                        <td data-label="ความเชี่ยวชาญ" className="px-6 py-4">
                          <div className="text-sm text-slate-600 line-clamp-1">{consultant.expertise}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={(e) => { e.stopPropagation(); handleOpenView(consultant); }} className="text-slate-400 hover:text-blue-600 transition-colors"><EyeIcon className="w-5 h-5" /></button>
                            {(userRole === 'admin' || userRole === 'officer') && (
                              <>
                                <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(consultant); }} className="text-slate-400 hover:text-blue-600 transition-colors"><PencilIcon className="w-5 h-5" /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(consultant); }} className="text-slate-400 hover:text-red-600 transition-colors"><TrashIcon className="w-5 h-5" /></button>
                              </>
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
          <Pagination currentPage={currentPage} totalItems={filteredConsultants.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} />
        </>
      ) : (
        <div className="text-center py-20 px-4 bg-white border border-slate-200 rounded-xl">
          <h3 className="text-xl font-medium font-title text-slate-700">ไม่พบข้อมูล</h3>
          <p className="text-slate-500 mt-2 font-body">ไม่พบข้อมูลที่ปรึกษาที่ตรงกับการค้นหาของคุณ</p>
        </div>
      )}

      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} title="ยืนยันการลบ" icon={<ExclamationTriangleIcon className="w-7 h-7 text-red-500" />}>
        {deletingConsultant && (
          <div>
            <p className="text-slate-600 mb-6 text-base font-body">คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ <span className="font-semibold text-slate-900">{deletingConsultant.title}{deletingConsultant.firstName} {deletingConsultant.lastName}</span>? <br />การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className="flex justify-end gap-4">
              <button onClick={handleCloseDeleteModal} className="px-5 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold transition-colors">ยกเลิก</button>
              <button onClick={handleConfirmDelete} className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors">ยืนยัน</button>
            </div>
          </div>
        )}
      </Modal>

      {(userRole === 'admin' || userRole === 'officer') && (
        <div className="mt-8">
          <button onClick={handleOpenAdd} className="w-full group relative overflow-hidden bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 hover:from-orange-100 hover:via-amber-100 hover:to-yellow-100 border-2 border-orange-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] p-6 text-left">
            <div className="absolute inset-0 opacity-25 group-hover:opacity-30 transition-opacity"><img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop" alt="" className="w-full h-full object-cover" /></div>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-amber-400/20 to-yellow-400/20"></div>
            <div className="relative flex items-center gap-6">
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-4 rounded-xl group-hover:from-orange-600 group-hover:to-amber-700 transition-all shadow-md"><AcademicCapIcon className="w-8 h-8 text-white" /></div>
              <div className="text-left flex-1"><h3 className="text-xl font-bold mb-1 text-slate-800">เพิ่มที่ปรึกษา</h3><p className="text-slate-600 text-sm font-normal">เพิ่มข้อมูลผู้เชี่ยวชาญหรือที่ปรึกษาในเครือข่าย</p></div>
              <PlusIcon className="w-6 h-6 text-orange-600 opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default ConsultantView;
