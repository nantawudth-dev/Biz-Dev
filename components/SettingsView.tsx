
import React, { useState } from 'react';
import { UserAccount, ProjectCategory } from '../types';
import UserManagementView from './UserManagementView';
import Modal from './Modal';
import { useNotification } from '../contexts/NotificationContext';
import { PlusIcon, PencilIcon, TrashIcon, UserCircleIcon, BuildingIcon, BriefcaseIcon } from './icons';
import { ProjectCategorySetting } from '../App';

// Props for the entire settings view
interface SettingsViewProps {
  users: UserAccount[];
  setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  establishmentTypes: string[];
  setEstablishmentTypes: React.Dispatch<React.SetStateAction<string[]>>;
  businessCategories: string[];
  setBusinessCategories: React.Dispatch<React.SetStateAction<string[]>>;
  projectCategories: ProjectCategorySetting[];
  setProjectCategories: React.Dispatch<React.SetStateAction<ProjectCategorySetting[]>>;
}

// Reusable component for managing a list of simple strings (like industry types)
const ManageableStringList: React.FC<{
  title: string;
  items: string[];
  setItems: React.Dispatch<React.SetStateAction<string[]>>;
  noun: string;
}> = ({ title, items, setItems, noun }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [currentItemValue, setCurrentItemValue] = useState('');
  const { showNotification } = useNotification();

  const handleOpenAdd = () => {
    setEditingItem(null);
    setCurrentItemValue('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: string) => {
    setEditingItem(item);
    setCurrentItemValue(item);
    setIsModalOpen(true);
  };

  const handleDelete = (itemToDelete: string) => {
    setItems(items.filter(item => item !== itemToDelete));
    showNotification(`ลบ${noun}สำเร็จ`, 'delete');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItemValue) return;

    if (editingItem) { // Editing existing item
      setItems(items.map(item => item === editingItem ? currentItemValue : item));
      showNotification(`อัปเดต${noun}สำเร็จ`, 'success');
    } else { // Adding new item
      if (items.includes(currentItemValue)) {
        showNotification(`${noun}นี้มีอยู่แล้ว`, 'error');
        return;
      }
      setItems([...items, currentItemValue]);
      showNotification(`เพิ่ม${noun}ใหม่สำเร็จ`, 'success');
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
            {items.map((item, index) => (
                <div key={index} className="p-2 bg-slate-50 rounded-lg flex justify-between items-center">
                    <span className="text-slate-700 font-medium">{item}</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md"><PencilIcon className="w-4 h-4" /></button>
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


const SettingsView: React.FC<SettingsViewProps> = ({ 
    users, setUsers,
    establishmentTypes, setEstablishmentTypes,
    businessCategories, setBusinessCategories,
    projectCategories, setProjectCategories
}) => {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
      { id: 'users', name: 'จัดการผู้ใช้งาน', icon: UserCircleIcon },
      { id: 'establishment', name: 'ประเภทสถานประกอบการ', icon: BuildingIcon },
      { id: 'category', name: 'หมวดธุรกิจ', icon: BriefcaseIcon },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold text-slate-900">ตั้งค่าระบบ</h2>
      
      <div>
        <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-semibold text-base transition-colors ${
                            activeTab === tab.id
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
            {activeTab === 'users' && <UserManagementView users={users} setUsers={setUsers} />}
            {activeTab === 'establishment' && <ManageableStringList 
                title="จัดการประเภทของสถานประกอบการ"
                items={establishmentTypes}
                setItems={setEstablishmentTypes}
                noun="ประเภท"
            />}
            {activeTab === 'category' && <ManageableStringList 
                title="จัดการหมวดธุรกิจ"
                items={businessCategories}
                setItems={setBusinessCategories}
                noun="หมวด"
            />}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
