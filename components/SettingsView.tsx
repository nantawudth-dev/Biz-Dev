
import React, { useState, useEffect } from 'react';
import UserManagementView from './UserManagementView';
import Modal from './Modal';
import { useNotification } from '../contexts/NotificationContext';
import { PlusIcon, PencilIcon, TrashIcon, UserCircleIcon, BuildingIcon, BriefcaseIcon, CalendarIcon } from './icons';
import { dataService } from '../services/dataService';
import { useData } from '../contexts/DataContext';

// Interface for items with active status
interface ManageableItem {
  value: string;
  isActive: boolean;
}

// Reusable component for managing a list of items with active/inactive toggles
const ManageableStringList: React.FC<{
  title: string;
  items: string[];
  setItems: React.Dispatch<React.SetStateAction<string[]>>;
  noun: string;
  onAdd?: (value: string) => Promise<void>;
  onDelete?: (value: string) => Promise<void>;
}> = ({ title, items, setItems, noun, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [currentItemValue, setCurrentItemValue] = useState('');
  const [itemsWithStatus, setItemsWithStatus] = useState<ManageableItem[]>(
    items.map(item => ({ value: item, isActive: true }))
  );
  const { showNotification } = useNotification();

  // Sync items with status when items prop changes
  useEffect(() => {
    const existingValues = itemsWithStatus.map(i => i.value);
    const newItems = items.filter(item => !existingValues.includes(item));
    if (newItems.length > 0) {
      setItemsWithStatus(prev => [...prev, ...newItems.map(item => ({ value: item, isActive: true }))]);
    }
    // Also remove items that are no longer in the list (e.g. deleted externally, though unlikely here)
    // But for local delete, we handle it in handleDelete
  }, [items]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setCurrentItemValue('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ManageableItem) => {
    setEditingItem(item.value);
    setCurrentItemValue(item.value);
    setIsModalOpen(true);
  };

  const handleDelete = async (itemToDelete: ManageableItem) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ ${noun} "${itemToDelete.value}"?`)) {
      try {
        if (onDelete) {
          await onDelete(itemToDelete.value);
        }
        setItemsWithStatus(itemsWithStatus.filter(item => item.value !== itemToDelete.value));
        setItems(items.filter(item => item !== itemToDelete.value));
        showNotification(`ลบ${noun}สำเร็จ`, 'delete');
      } catch (error) {
        console.error(error);
        showNotification(`เกิดข้อผิดพลาดในการลบ${noun}`, 'error');
      }
    }
  };

  const handleToggleActive = (item: ManageableItem) => {
    // Note: Toggle active usually means soft delete or update status. 
    // Since our dataService delete uses soft delete (is_active=false), "Delete" button does that.
    // "Toggle Active" button logic in UI is local only for now unless we add update method.
    // The previously implemented delete IS soft delete. So "Delete" button calls soft delete.
    // The "Toggle Active" button here flips local state. 
    // If user wants to "Deactivate", they can use Delete button? 
    // Or we should map Toggle Active to delete/restore?
    // Start with local behavior to match previous code, but warn user or implement properly if asked.
    // For now, let's leave it local as existing code, but Delete is real.
    setItemsWithStatus(itemsWithStatus.map(i =>
      i.value === item.value ? { ...i, isActive: !i.isActive } : i
    ));
    showNotification(`${item.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}${noun}สำเร็จ`, 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItemValue) return;

    if (editingItem) { // Editing existing item
      // Editing name might be complex (need ID). Skipping sync for edit for now.
      setItemsWithStatus(itemsWithStatus.map(item =>
        item.value === editingItem ? { ...item, value: currentItemValue } : item
      ));
      setItems(items.map(item => item === editingItem ? currentItemValue : item));
      showNotification(`อัปเดต${noun}สำเร็จ`, 'success');
    } else { // Adding new item
      if (items.includes(currentItemValue)) {
        showNotification(`${noun}นี้มีอยู่แล้ว`, 'error');
        return;
      }
      try {
        if (onAdd) {
          await onAdd(currentItemValue);
        }
        // State update happens via useEffect on 'items' change if parent updates it, 
        // OR we update purely local if parent doesn't auto-refresh.
        // But onAdd is async void. We should update local state manually.
        setItemsWithStatus([...itemsWithStatus, { value: currentItemValue, isActive: true }]);
        setItems([...items, currentItemValue]);
        showNotification(`เพิ่ม${noun}ใหม่สำเร็จ`, 'success');
      } catch (error) {
        console.error(error);
        showNotification(`เกิดข้อผิดพลาดในการเพิ่ม${noun}`, 'error');
      }
    }
    setIsModalOpen(false);
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
        {itemsWithStatus.map((item, index) => (
          <div key={index} className={`p-3 rounded-lg flex justify-between items-center transition-all ${item.isActive ? 'bg-slate-50' : 'bg-slate-100 opacity-60'}`}>
            <div className="flex items-center gap-3 flex-1">
              <span className={`font-medium ${item.isActive ? 'text-slate-700' : 'text-slate-500'}`}>{item.value}</span>
              {!item.isActive && <span className="text-xs px-2 py-0.5 bg-slate-300 text-slate-600 rounded-full">ไม่ใช้งาน</span>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleActive(item)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${item.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                title={item.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              {/* Edit button disabled for synced items for now as complexity of ID lookup is high without full refactor */}
              {/* <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md"><PencilIcon className="w-4 h-4" /></button> */}
              <button onClick={() => handleDelete(item)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-md"><TrashIcon className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? `แก้ไข${noun}` : `เพิ่ม${noun}ใหม่`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder={`ชื่อ${noun}`}
            value={currentItemValue}
            onChange={(e) => setCurrentItemValue(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90">
              บันทึก
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


const SettingsView: React.FC = () => { // Removed props
  const [establishmentTypes, setEstablishmentTypes] = useState<string[]>([]);
  const [businessCategories, setBusinessCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data, fetchData } = useData();
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
            onAdd={dataService.createEstablishmentType}
            onDelete={dataService.deleteEstablishmentType}
          />}
          {activeTab === 'category' && <ManageableStringList
            title="จัดการหมวดธุรกิจ"
            items={businessCategories}
            setItems={setBusinessCategories}
            noun="หมวด"
            onAdd={dataService.createBusinessCategory}
            onDelete={dataService.deleteBusinessCategory}
          />}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
