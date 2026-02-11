
import React, { useState } from 'react';
import { Entrepreneur, Role } from '../types';
import Modal from './Modal';
import { PlusIcon, BuildingIcon, MapPinIcon, PhoneIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon, Squares2X2Icon, ListBulletIcon, SparklesIcon, BriefcaseIcon, UserGroupIcon, ChatBubbleLeftIcon, GlobeAltIcon, EyeIcon, ChevronDownIcon, FunnelIcon, MagnifyingGlassIcon } from './icons';
import { GoogleGenAI, Type } from "@google/genai";
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
  name: '', businessName: '', contact: '', establishmentType: '', businessCategory: '', address: '', lineId: '', facebook: ''
};

const CardView = ({ data, userRole }: { data: Entrepreneur[], userRole: Role }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {data.map(ent => (
      <div key={ent.id} className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col group">
        <div className="p-6">
          <div className="flex items-start mb-4">
            <div className="bg-blue-100 p-3 rounded-lg mr-4 shrink-0"><BuildingIcon className="w-6 h-6 text-blue-600"/></div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">{ent.businessName}</h3>
              <p className="text-base text-slate-500 font-body">{ent.businessCategory}</p>
            </div>
          </div>
          <p className="text-base text-slate-600 mb-4">ผู้ติดต่อ: <span className="font-semibold text-slate-800">{ent.name}</span></p>
          <div className="border-t border-slate-200 mt-auto pt-4 text-slate-600 space-y-3 font-body">
            <p className="flex items-start gap-3"><MapPinIcon className="w-5 h-5 text-slate-400 shrink-0 mt-1" /><span>{ent.address}</span></p>
            <p className="flex items-center gap-3"><PhoneIcon className="w-5 h-5 text-slate-400 shrink-0" /><span>{ent.contact || '-'}</span></p>
          </div>
        </div>
        <div className="border-t border-slate-200 mt-auto p-3 flex justify-end items-center gap-2 bg-slate-50/50 rounded-b-xl">
          <button onClick={() => (window as any).handleOpenViewModal(ent)} className="flex items-center text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors py-1 px-3 rounded-md hover:bg-slate-200" aria-label={`ดูรายละเอียด ${ent.businessName}`}><EyeIcon className="w-4 h-4 mr-1.5" /> ดู</button>
          {(userRole === 'admin' || userRole === 'officer') && (
            <>
              <button onClick={() => (window as any).handleOpenEditModal(ent)} className="flex items-center text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors py-1 px-3 rounded-md hover:bg-slate-200" aria-label={`แก้ไข ${ent.businessName}`}><PencilIcon className="w-4 h-4 mr-1.5" /> แก้ไข</button>
              <button onClick={() => (window as any).handleOpenDeleteModal(ent)} className="flex items-center text-sm text-slate-500 hover:text-red-600 font-medium transition-colors py-1 px-3 rounded-md hover:bg-red-100" aria-label={`ลบ ${ent.businessName}`}><TrashIcon className="w-4 h-4 mr-1.5" /> ลบ</button>
            </>
          )}
          <button onClick={() => (window as any).handleGetAiSuggestions(ent)} className="flex items-center text-sm text-blue-600 hover:text-white font-medium transition-colors py-1 px-3 rounded-md hover:bg-blue-600" aria-label={`รับคำแนะนำ AI สำหรับ ${ent.businessName}`}><SparklesIcon className="w-4 h-4 mr-1.5" /> AI</button>
        </div>
      </div>
    ))}
  </div>
);

const ListView = ({ data, userRole }: { data: Entrepreneur[], userRole: Role }) => (
  <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
    {data.map((ent, index) => (
      <div key={ent.id} className={`p-4 flex flex-col md:flex-row md:items-center gap-4 ${index < data.length - 1 ? 'border-b border-slate-200' : ''}`}>
        <div className="flex-1">
            <p className="text-lg font-bold text-slate-900">{ent.businessName}</p>
            <p className="text-base text-slate-500">ผู้ติดต่อ: {ent.name}</p>
        </div>
        <div className="flex-shrink-0"><p className="text-base text-slate-600 font-body">{ent.businessCategory}</p></div>
        <div className="flex-shrink-0 flex items-center gap-2">
          <button onClick={() => (window as any).handleOpenViewModal(ent)} className="flex items-center text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors py-1 px-3 rounded-md hover:bg-slate-200" aria-label={`ดูรายละเอียด ${ent.businessName}`}><EyeIcon className="w-4 h-4 mr-1.5" /> ดู</button>
          {(userRole === 'admin' || userRole === 'officer') && (
            <>
              <button onClick={() => (window as any).handleOpenEditModal(ent)} className="flex items-center text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors py-1 px-3 rounded-md hover:bg-slate-200" aria-label={`แก้ไข ${ent.businessName}`}><PencilIcon className="w-4 h-4 mr-1.5" /> แก้ไข</button>
              <button onClick={() => (window as any).handleOpenDeleteModal(ent)} className="flex items-center text-sm text-slate-500 hover:text-red-600 font-medium transition-colors py-1 px-3 rounded-md hover:bg-red-100" aria-label={`ลบ ${ent.businessName}`}><TrashIcon className="w-4 h-4 mr-1.5" /> ลบ</button>
            </>
          )}
          <button onClick={() => (window as any).handleGetAiSuggestions(ent)} className="flex items-center text-sm text-blue-600 hover:text-white font-medium transition-colors py-1 px-3 rounded-md hover:bg-blue-600" aria-label={`รับคำแนะนำ AI สำหรับ ${ent.businessName}`}><SparklesIcon className="w-4 h-4 mr-1.5" /> AI</button>
        </div>
      </div>
    ))}
  </div>
);


const EntrepreneurView: React.FC<EntrepreneurViewProps> = ({ userRole, entrepreneurs, setEntrepreneurs, establishmentTypes, businessCategories }) => {
  const [displayMode, setDisplayMode] = useState<'card' | 'list'>('card');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingEntrepreneur, setEditingEntrepreneur] = useState<Entrepreneur | null>(null);
  const [deletingEntrepreneur, setDeletingEntrepreneur] = useState<Entrepreneur | null>(null);
  const [viewingEntrepreneur, setViewingEntrepreneur] = useState<Entrepreneur | null>(null);
  const [formData, setFormData] = useState<Omit<Entrepreneur, 'id'> & { id?: string }>(emptyEntrepreneurForm);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [selectedEntForAi, setSelectedEntForAi] = useState<Entrepreneur | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [selectedEstablishment, setSelectedEstablishment] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const { showNotification } = useNotification();

  const handleGetAiSuggestions = async (entrepreneur: Entrepreneur) => {
    if (!process.env.API_KEY) {
      alert("API Key is not configured.");
      return;
    }
    setSelectedEntForAi(entrepreneur);
    setIsAiModalOpen(true);
    setIsAiLoading(true);
    setAiSuggestions([]);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Based on a Thai business named "${entrepreneur.businessName}" which is a "${entrepreneur.establishmentType}" in the "${entrepreneur.businessCategory}" category, provide 3 actionable and concise growth suggestions. Suggestions could relate to potential projects, relevant training courses, or types of consultants they might need. Respond in Thai.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING, description: 'An actionable suggestion' }
                        }
                    },
                    required: ['suggestions']
                }
            }
        });

        const jsonText = response.text;
        if (jsonText) {
          const result = JSON.parse(jsonText.trim());
          setAiSuggestions(result.suggestions || []);
        } else {
          setAiSuggestions([]);
          showNotification("ไม่ได้รับคำแนะนำจาก AI", "error");
          setIsAiModalOpen(false);
        }
    } catch (error) {
        console.error("Error fetching AI suggestions:", error);
        setAiSuggestions([]);
        showNotification("เกิดข้อผิดพลาดในการดึงข้อมูลคำแนะนำจาก AI", "error");
        setIsAiModalOpen(false);
    } finally {
        setIsAiLoading(false);
    }
  };

  const handleOpenViewModal = (ent: Entrepreneur) => { setViewingEntrepreneur(ent); setIsViewModalOpen(true); };
  const handleOpenAddModal = () => { setEditingEntrepreneur(null); setFormData(emptyEntrepreneurForm); setIsFormModalOpen(true); };
  const handleOpenEditModal = (ent: Entrepreneur) => { setEditingEntrepreneur(ent); setFormData(ent); setIsFormModalOpen(true); };
  const handleOpenDeleteModal = (ent: Entrepreneur) => { setDeletingEntrepreneur(ent); setIsDeleteModalOpen(true); };
  const handleCloseModals = () => { setIsFormModalOpen(false); setIsDeleteModalOpen(false); setIsViewModalOpen(false); };

  (window as any).handleOpenViewModal = handleOpenViewModal;
  (window as any).handleOpenEditModal = handleOpenEditModal;
  (window as any).handleOpenDeleteModal = handleOpenDeleteModal;
  (window as any).handleGetAiSuggestions = handleGetAiSuggestions;


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
    handleCloseModals();
  };

  const handleConfirmDelete = () => {
    if (deletingEntrepreneur) {
      setEntrepreneurs(entrepreneurs.filter(ent => ent.id !== deletingEntrepreneur.id));
      showNotification('ลบผู้ประกอบการสำเร็จ', 'delete');
      handleCloseModals();
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-4xl font-bold text-slate-900">ผู้ประกอบการ</h2>
        {(userRole === 'admin' || userRole === 'officer') && (
            <button onClick={handleOpenAddModal} className="flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2.5 font-semibold rounded-lg shadow-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105"><PlusIcon className="w-5 h-5 mr-2" /><span>เพิ่มผู้ประกอบการ</span></button>
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
            {displayMode === 'card' ? <CardView data={paginatedEntrepreneurs} userRole={userRole} /> : <ListView data={paginatedEntrepreneurs} userRole={userRole} />}
            <Pagination
                currentPage={currentPage}
                totalItems={filteredEntrepreneurs.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={handleItemsPerPageChange}
            />
        </>
      ) : (<div className="text-center py-20 px-4 bg-white border border-slate-200 rounded-xl">
            <h3 className="text-xl font-semibold text-slate-700">ไม่พบข้อมูล</h3>
            <p className="text-slate-500 mt-2 font-body">
              ไม่พบข้อมูลผู้ประกอบการที่ตรงกับการค้นหาของคุณ
            </p>
          </div>)}

      <Modal isOpen={isFormModalOpen} onClose={handleCloseModals} title={editingEntrepreneur ? 'แก้ไขข้อมูลผู้ประกอบการ' : 'เพิ่มผู้ประกอบการใหม่'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="ชื่อสถานประกอบการ" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" required />
          <div className="relative">
            <select value={formData.establishmentType} onChange={e => setFormData({ ...formData, establishmentType: e.target.value })} className="w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors appearance-none font-body" required>
              <option value="" disabled>เลือกประเภทสถานประกอบการ</option>
              {establishmentTypes.map(type => (<option key={type} value={type}>{type}</option>))}
            </select>
            <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={formData.businessCategory} onChange={e => setFormData({ ...formData, businessCategory: e.target.value })} className="w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors appearance-none font-body" required>
              <option value="" disabled>เลือกหมวดธุรกิจ</option>
              {businessCategories.map(type => (<option key={type} value={type}>{type}</option>))}
            </select>
            <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <input type="text" placeholder="ชื่อผู้ติดต่อ" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" required/>
          <textarea placeholder="ที่อยู่" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors h-24 font-body" />
          <input type="text" placeholder="เบอร์โทร" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
          <input type="text" placeholder="Line ID" value={formData.lineId} onChange={e => setFormData({ ...formData, lineId: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
          <input type="text" placeholder="Facebook" value={formData.facebook} onChange={e => setFormData({ ...formData, facebook: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />

          <div className="flex justify-end pt-4"><button type="submit" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-colors">{editingEntrepreneur ? 'บันทึก' : 'เพิ่ม'}</button></div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseModals} title="ยืนยันการลบ" icon={<ExclamationTriangleIcon className="w-7 h-7 text-red-500" />}>
        {deletingEntrepreneur && (
          <div>
            <p className="text-slate-600 mb-6 text-base font-body">คุณแน่ใจหรือไม่ว่าต้องการลบ <span className="font-semibold text-slate-900">{deletingEntrepreneur.businessName}</span>? <br/>การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className="flex justify-end gap-4"><button onClick={handleCloseModals} className="px-5 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold transition-colors">ยกเลิก</button><button onClick={handleConfirmDelete} className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors">ยืนยัน</button></div>
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={isViewModalOpen} 
        onClose={handleCloseModals} 
        title={viewingEntrepreneur?.businessName || 'ข้อมูลผู้ประกอบการ'}
        icon={<BuildingIcon className="w-6 h-6 text-blue-600" />}
      >
        {viewingEntrepreneur && (
          <div className="space-y-4 font-body">
            <div className="space-y-3 text-base text-slate-700">
              <div className="flex items-start gap-4 p-2 rounded-lg bg-slate-50">
                <BriefcaseIcon className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                <div>
                  <strong className="block text-sm text-slate-500">ประเภทสถานประกอบการ</strong>
                  <span>{viewingEntrepreneur.establishmentType}</span>
                </div>
              </div>
               <div className="flex items-start gap-4 p-2 rounded-lg">
                <BriefcaseIcon className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                <div>
                  <strong className="block text-sm text-slate-500">หมวดธุรกิจ</strong>
                  <span>{viewingEntrepreneur.businessCategory}</span>
                </div>
              </div>
              <div className="flex items-start gap-4 p-2 rounded-lg bg-slate-50">
                <UserGroupIcon className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                <div>
                  <strong className="block text-sm text-slate-500">ผู้ติดต่อ</strong>
                  <span>{viewingEntrepreneur.name}</span>
                </div>
              </div>
              <div className="flex items-start gap-4 p-2 rounded-lg">
                <MapPinIcon className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                <div>
                  <strong className="block text-sm text-slate-500">ที่อยู่</strong>
                  <span>{viewingEntrepreneur.address}</span>
                </div>
              </div>
              <div className="flex items-start gap-4 p-2 rounded-lg bg-slate-50">
                <PhoneIcon className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                <div>
                  <strong className="block text-sm text-slate-500">เบอร์โทร</strong>
                  <span>{viewingEntrepreneur.contact}</span>
                </div>
              </div>
              <div className="flex items-start gap-4 p-2 rounded-lg">
                <ChatBubbleLeftIcon className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                <div>
                  <strong className="block text-sm text-slate-500">Line ID</strong>
                  <span>{viewingEntrepreneur.lineId}</span>
                </div>
              </div>
              <div className="flex items-start gap-4 p-2 rounded-lg bg-slate-50">
                <GlobeAltIcon className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                <div>
                  <strong className="block text-sm text-slate-500">Facebook</strong>
                  <span>{viewingEntrepreneur.facebook}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title={`AI Suggestions for ${selectedEntForAi?.businessName}`} icon={<SparklesIcon className="w-7 h-7 text-blue-600"/>}>
        {isAiLoading ? (<div className="flex justify-center items-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div><p className="ml-4 text-slate-600">กำลังวิเคราะห์...</p></div>) : (<ul className="space-y-4">{aiSuggestions.map((s, i) => <li key={i} className="p-3 bg-slate-100 rounded-lg text-slate-700 font-body border-l-4 border-blue-500">{s}</li>)}</ul>)}
      </Modal>
    </div>
  );
};

export default EntrepreneurView;
