import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { dataService } from '../services/dataService';
import { useNotification } from '../contexts/NotificationContext';
import { AiKnowledgeBase } from '../types';
import Modal from './Modal';
import Pagination from './Pagination';
import { PlusIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon, MagnifyingGlassIcon } from './icons';

const AiKnowledgeBaseView: React.FC = () => {
    const { data, fetchData, invalidateCache } = useData();
    const { showNotification } = useNotification();
    const [knowledgeBases, setKnowledgeBases] = useState<AiKnowledgeBase[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingKb, setEditingKb] = useState<AiKnowledgeBase | null>(null);
    const [deletingKb, setDeletingKb] = useState<AiKnowledgeBase | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Search and Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Form states
    const [categoryId, setCategoryId] = useState('');
    const [categoryNameTh, setCategoryNameTh] = useState('');
    const [termsStr, setTermsStr] = useState('');
    const [response, setResponse] = useState('');

    const fetchKnowledgeBases = async () => {
        try {
            setIsLoading(true);
            const kbData = await fetchData('aiKnowledgeBase', () => dataService.getAiKnowledgeBase());
            setKnowledgeBases(kbData);
        } catch (error) {
            console.error('Error fetching knowledge bases:', error);
            showNotification('ไม่สามารถโหลดข้อมูลฐานความรู้ได้', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchKnowledgeBases();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (data.aiKnowledgeBase) {
            setKnowledgeBases(data.aiKnowledgeBase);
        }
    }, [data.aiKnowledgeBase]);

    const filteredKbs = knowledgeBases.filter(kb =>
        !searchTerm ||
        kb.categoryNameTh.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kb.categoryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kb.terms.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const paginatedKbs = filteredKbs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleOpenAdd = () => {
        setEditingKb(null);
        setCategoryId('');
        setCategoryNameTh('');
        setTermsStr('');
        setResponse('');
        setIsFormModalOpen(true);
    };

    const handleOpenEdit = (kb: AiKnowledgeBase) => {
        setEditingKb(kb);
        setCategoryId(kb.categoryId);
        setCategoryNameTh(kb.categoryNameTh);
        setTermsStr(kb.terms.join(', '));
        setResponse(kb.response);
        setIsFormModalOpen(true);
    };

    const handleOpenDelete = (kb: AiKnowledgeBase) => {
        setDeletingKb(kb);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryId.trim() || !categoryNameTh.trim() || !response.trim()) {
            showNotification('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
            return;
        }

        setIsSaving(true);
        const termsArray = termsStr.split(',').map(t => t.trim()).filter(t => t !== '');

        try {
            if (editingKb) {
                await dataService.updateAiKnowledgeBase(editingKb.id, {
                    categoryId: categoryId.trim(),
                    categoryNameTh: categoryNameTh.trim(),
                    terms: termsArray,
                    response: response.trim(),
                    isActive: true
                });
                showNotification('อัปเดตข้อมูลสำเร็จ', 'success');
            } else {
                await dataService.createAiKnowledgeBase({
                    categoryId: categoryId.trim().toLowerCase(),
                    categoryNameTh: categoryNameTh.trim(),
                    terms: termsArray,
                    response: response.trim(),
                    isActive: true
                });
                showNotification('เพิ่มข้อมูลใหม่สำเร็จ', 'success');
            }
            invalidateCache('aiKnowledgeBase');
            await fetchKnowledgeBases();
            setIsFormModalOpen(false);
        } catch (error: any) {
            console.error('Save error:', error);
            // Handle unique constraint error
            if (error?.code === '23505') {
                showNotification('รหัสหมวดหมู่นี้มีอยู่ในระบบแล้ว', 'error');
            } else {
                showNotification('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingKb) return;
        try {
            await dataService.deleteAiKnowledgeBase(deletingKb.id);
            invalidateCache('aiKnowledgeBase');
            await fetchKnowledgeBases();
            showNotification('ลบข้อมูลสำเร็จ', 'delete');
        } catch (error) {
            console.error('Delete error:', error);
            showNotification('เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setDeletingKb(null);
        }
    };

    if (isLoading && knowledgeBases.length === 0) {
        return (
            <div className="flex justify-center py-10">
                <div className="animate-spin w-8 h-8 focus-spinner"></div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="text-xl font-medium font-title text-slate-800">จัดการฐานความรู้ AI</h3>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <input
                            type="text"
                            placeholder="ค้นหาหมวดหมู่ หรือ คำสำคัญ..."
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-all shadow-md font-semibold text-sm whitespace-nowrap">
                        <PlusIcon className="w-5 h-5" />
                        เพิ่มหมวดหมู่
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                {filteredKbs.length === 0 ? (
                    <p className="text-center text-slate-400 py-8 text-sm">ไม่พบข้อมูลที่ค้นหา</p>
                ) : (
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ID / ชื่อหมวดหมู่</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">คำสำคัญ (Keywords)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title w-1/3">ข้อความตอบกลับ</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider font-title">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {paginatedKbs.map((kb) => (
                                <tr key={kb.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-slate-900">{kb.categoryNameTh}</div>
                                        <div className="text-xs text-slate-500 font-mono mt-1">{kb.categoryId}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1 max-w-xs">
                                            {kb.terms.slice(0, 5).map((term, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100">
                                                    {term}
                                                </span>
                                            ))}
                                            {kb.terms.length > 5 && (
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                                                    +{kb.terms.length - 5}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600 line-clamp-2" title={kb.response}>
                                            {kb.response}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-3">
                                            <button onClick={() => handleOpenEdit(kb)} className="text-slate-400 hover:text-blue-600 transition-colors" title="แก้ไข">
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleOpenDelete(kb)} className="text-slate-400 hover:text-red-600 transition-colors" title="ลบ">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="px-4 pb-4">
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredKbs.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(e) => setItemsPerPage(Number(e.target.value))}
                />
            </div>

            {/* Add/Edit Form Modal */}
            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={editingKb ? 'แก้ไขข้อมูลหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'} className="max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">รหัสหมวดหมู่ (Category ID)</label>
                            <input
                                type="text"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                placeholder="เช่น marketing, finance"
                                disabled={!!editingKb} // Disable ID edit when updating
                                required
                            />
                            {!editingKb && <p className="text-xs text-slate-500 mt-1">ใช้ภาษาอังกฤษตัวพิมพ์เล็ก ห้ามเว้นวรรค</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อหมวดหมู่ภาษาไทย</label>
                            <input
                                type="text"
                                value={categoryNameTh}
                                onChange={(e) => setCategoryNameTh(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="เช่น การตลาดและการขาย"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">คำสำคัญ (Keywords)</label>
                        <textarea
                            value={termsStr}
                            onChange={(e) => setTermsStr(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="พิมพ์คำสำคัญ โดยคั่นด้วยเครื่องหมายจุลภาค (,) เช่น ตลาด, ขาย, โปรโมชั่น, online"
                            rows={3}
                        />
                        <p className="text-xs text-slate-500 mt-1">ใช้สำหรับจับคู่กับปัญหาของผู้ประกอบการ</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ข้อความตอบกลับ (Response Template)</label>
                        <textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="ข้อความที่ระบบ AI จะแสดงเป็นคำแนะนำเบื้องต้น..."
                            rows={4}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-5 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors text-sm">
                            ยกเลิก
                        </button>
                        <button type="submit" disabled={isSaving} className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-60 transition-colors text-sm">
                            {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="ยืนยันการลบหมวดหมู่" icon={<ExclamationTriangleIcon className="w-7 h-7 text-red-500" />}>
                <p className="text-slate-600 mb-6 font-body">
                    คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ <span className="font-semibold text-slate-900">"{deletingKb?.categoryNameTh}"</span> โพสต์นี้?<br />
                    การกระทำนี้ไม่สามารถย้อนกลับได้
                </p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold transition-colors text-sm">ยกเลิก</button>
                    <button onClick={handleConfirmDelete} className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors text-sm">ยืนยันลบ</button>
                </div>
            </Modal>
        </div>
    );
};

export default AiKnowledgeBaseView;
