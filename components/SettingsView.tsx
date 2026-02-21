
import React, { useState, useEffect } from 'react';
import UserManagementView from './UserManagementView';
import Modal from './Modal';
import { useNotification } from '../contexts/NotificationContext';
import { PlusIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon, UserCircleIcon, BuildingIcon, BriefcaseIcon } from './icons';
import { dataService } from '../services/dataService';
import { useData } from '../contexts/DataContext';

// Interface for items with active status
interface ManageableItem {
  value: string;
  isActive: boolean;
}


// Reusable component for managing a list of items with add/edit/delete
const ManageableStringList: React.FC<{
  title: string;
  items: string[];
  setItems: React.Dispatch<React.SetStateAction<string[]>>;
  noun: string;
  onAdd?: (value: string) => Promise<void>;
  onUpdate?: (oldValue: string, newValue: string) => Promise<void>;
  onDelete?: (value: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
}> = ({ title, items, setItems, noun, onAdd, onUpdate, onDelete, onRefresh }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<string | null>(null);
  const [currentItemValue, setCurrentItemValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { showNotification } = useNotification();

  const handleOpenAdd = () => {
    setEditingItem(null);
    setCurrentItemValue('');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: string) => {
    setEditingItem(item);
    setCurrentItemValue(item);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (item: string) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      if (onDelete) await onDelete(deletingItem);
      if (onRefresh) {
        await onRefresh();
      } else {
        setItems(items.filter(i => i !== deletingItem));
      }
      showNotification(`ลบ${noun}สำเร็จ`, 'delete');
    } catch (error) {
      console.error(error);
      showNotification(`เกิดข้อผิดพลาดในการลบ${noun}`, 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItemValue.trim()) return;
    setIsSaving(true);
    try {
      if (editingItem) {
        // Edit existing
        if (editingItem === currentItemValue.trim()) {
          setIsFormModalOpen(false);
          return;
        }
        if (items.some(i => i !== editingItem && i === currentItemValue.trim())) {
          showNotification(`${noun}นี้มีอยู่แล้ว`, 'error');
          return;
        }
        if (onUpdate) await onUpdate(editingItem, currentItemValue.trim());
        if (onRefresh) {
          await onRefresh();
        } else {
          setItems(items.map(i => i === editingItem ? currentItemValue.trim() : i));
        }
        showNotification(`อัปเดต${noun}สำเร็จ`, 'success');
      } else {
        // Add new
        if (items.includes(currentItemValue.trim())) {
          showNotification(`${noun}นี้มีอยู่แล้ว`, 'error');
          return;
        }
        if (onAdd) await onAdd(currentItemValue.trim());
        if (onRefresh) {
          await onRefresh();
        } else {
          setItems([...items, currentItemValue.trim()]);
        }
        showNotification(`เพิ่ม${noun}ใหม่สำเร็จ`, 'success');
      }
      setIsFormModalOpen(false);
    } catch (error) {
      console.error(error);
      showNotification(`เกิดข้อผิดพลาดในการบันทึก${noun}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg">
      <div className="p-5 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <button onClick={handleOpenAdd} className="flex items-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 py-1.5 text-sm font-semibold rounded-md hover:opacity-90 transition-colors">
          <PlusIcon className="w-4 h-4 mr-1.5" />
          เพิ่ม
        </button>
      </div>
      <div className="p-4 space-y-2">
        {items.length === 0 && (
          <p className="text-center text-slate-400 py-6 text-sm">ยังไม่มีข้อมูล กดปุ่ม "เพิ่ม" เพื่อเริ่มต้น</p>
        )}
        {items.map((item, index) => (
          <div key={index} className="p-3 rounded-lg bg-slate-50 flex justify-between items-center group hover:bg-slate-100 transition-colors">
            <span className="font-medium text-slate-700">{item}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="แก้ไข"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleOpenDelete(item)}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                title="ลบ"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={editingItem ? `แก้ไข${noun}` : `เพิ่ม${noun}ใหม่`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ{noun}</label>
            <input
              type="text"
              placeholder={`ชื่อ${noun}`}
              value={currentItemValue}
              onChange={(e) => setCurrentItemValue(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-5 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors">
              ยกเลิก
            </button>
            <button type="submit" disabled={isSaving} className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-60 transition-colors">
              {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={`ยืนยันการลบ${noun}`} icon={<ExclamationTriangleIcon className="w-7 h-7 text-red-500" />}>
        <p className="text-slate-600 mb-6 font-body">
          คุณแน่ใจหรือไม่ว่าต้องการลบ{noun} <span className="font-semibold text-slate-900">"{deletingItem}"</span>?<br />
          การกระทำนี้ไม่สามารถย้อนกลับได้
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold transition-colors">ยกเลิก</button>
          <button onClick={handleConfirmDelete} className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors">ยืนยันลบ</button>
        </div>
      </Modal>
    </div>
  );
};


const SettingsView: React.FC = () => {
  const [establishmentTypes, setEstablishmentTypes] = useState<string[]>([]);
  const [businessCategories, setBusinessCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data, fetchData, invalidateCache } = useData();
  const { showNotification } = useNotification();

  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', name: 'จัดการผู้ใช้งาน', icon: UserCircleIcon },
    { id: 'establishment', name: 'ประเภทสถานประกอบการ', icon: BuildingIcon },
    { id: 'category', name: 'หมวดธุรกิจ', icon: BriefcaseIcon },
    // Removed 'fiscal' year tab as it's now handled by constants and no dynamic CRUD provided yet
  ];

  // Fetch data using DataContext on mount
  useEffect(() => {
    const loadSettingsData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchData('establishmentTypes', () => dataService.getEstablishmentTypes()),
          fetchData('businessCategories', () => dataService.getBusinessCategories())
        ]);
      } catch (error) {
        console.error('Failed to fetch settings data:', error);
        showNotification('ไม่สามารถโหลดข้อมูลการตั้งค่าได้', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadSettingsData();
  }, [fetchData, showNotification]);

  // Sync from DataContext when the cached data changes
  useEffect(() => {
    if (data.establishmentTypes) setEstablishmentTypes(data.establishmentTypes);
    if (data.businessCategories) setBusinessCategories(data.businessCategories);
  }, [data.establishmentTypes, data.businessCategories]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-title">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-semibold text-base transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="pt-8">
          {activeTab === 'users' && <UserManagementView />}
          {activeTab === 'establishment' && <ManageableStringList
            title="จัดการประเภทของสถานประกอบการ"
            items={establishmentTypes}
            setItems={setEstablishmentTypes}
            noun="ประเภท"
            onAdd={dataService.createEstablishmentType.bind(dataService)}
            onUpdate={dataService.updateEstablishmentType.bind(dataService)}
            onDelete={dataService.deleteEstablishmentType.bind(dataService)}
            onRefresh={async () => {
              invalidateCache('establishmentTypes');
              const updated = await fetchData('establishmentTypes', () => dataService.getEstablishmentTypes());
              setEstablishmentTypes(updated);
            }}
          />}
          {activeTab === 'category' && <ManageableStringList
            title="จัดการหมวดธุรกิจ"
            items={businessCategories}
            setItems={setBusinessCategories}
            noun="หมวด"
            onAdd={dataService.createBusinessCategory.bind(dataService)}
            onUpdate={dataService.updateBusinessCategory.bind(dataService)}
            onDelete={dataService.deleteBusinessCategory.bind(dataService)}
            onRefresh={async () => {
              invalidateCache('businessCategories');
              const updated = await fetchData('businessCategories', () => dataService.getBusinessCategories());
              setBusinessCategories(updated);
            }}
          />}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
