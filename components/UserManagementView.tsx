
import React, { useState } from 'react';
import { UserAccount, Role } from '../types';
import Modal from './Modal';
import { PlusIcon, PencilIcon, TrashIcon, UserCircleIcon, ExclamationTriangleIcon, ChevronDownIcon } from './icons';
import { useNotification } from '../contexts/NotificationContext';

// Props interface
interface UserManagementViewProps {
  users: UserAccount[];
  setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
}

const emptyUserForm: Omit<UserAccount, 'id'> = {
  username: '',
  password: '',
  role: 'user',
};

const UserManagementView: React.FC<UserManagementViewProps> = ({ users, setUsers }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);
  const [formData, setFormData] = useState<Omit<UserAccount, 'id'> & { id?: string }>(emptyUserForm);
  
  const { showNotification } = useNotification();

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData(emptyUserForm);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (user: UserAccount) => {
    setEditingUser(user);
    // Don't pre-fill password for security, but allow setting a new one
    setFormData({ ...user, password: '' }); 
    setIsFormModalOpen(true);
  };
  
  const handleOpenDeleteModal = (user: UserAccount) => {
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username) return;

    if (editingUser) {
      // Update user
      setUsers(users.map(u => u.id === editingUser.id ? { ...editingUser, ...formData, password: formData.password || editingUser.password } : u));
      showNotification('อัปเดตข้อมูลผู้ใช้สำเร็จ', 'success');
    } else {
      // Add new user
      if (!formData.password) {
        showNotification('กรุณากำหนดรหัสผ่านสำหรับผู้ใช้ใหม่', 'error');
        return;
      }
      setUsers([...users, { ...formData, id: `user${Date.now()}` } as UserAccount]);
      showNotification('เพิ่มผู้ใช้ใหม่สำเร็จ', 'success');
    }
    handleCloseModals();
  };

  const handleConfirmDelete = () => {
    if (deletingUser) {
      setUsers(users.filter(u => u.id !== deletingUser.id));
      showNotification('ลบผู้ใช้สำเร็จ', 'delete');
      handleCloseModals();
    }
  };

  const getRoleDisplayName = (role: Role) => {
    switch(role) {
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'officer': return 'เจ้าหน้าที่';
      case 'user': return 'ผู้ใช้งานทั่วไป';
      default: return 'ไม่ระบุ';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg">
      <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">รายชื่อผู้ใช้งาน</h3>
          <button onClick={handleOpenAddModal} className="flex items-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 py-1.5 text-sm font-semibold rounded-md hover:opacity-90 transition-colors">
              <PlusIcon className="w-4 h-4 mr-1.5" />
              เพิ่มผู้ใช้
          </button>
      </div>

      <div className="p-4 space-y-2">
        {users.map((user) => (
          <div key={user.id} className="p-2 bg-slate-50 rounded-lg flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-slate-200 p-2 rounded-full">
                <UserCircleIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-slate-800 font-semibold">{user.username}</p>
                <p className="text-xs text-slate-500 font-medium">{getRoleDisplayName(user.role)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => handleOpenEditModal(user)} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md" aria-label={`แก้ไข ${user.username}`}>
                <PencilIcon className="w-4 h-4" />
              </button>
              <button onClick={() => handleOpenDeleteModal(user)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-md" aria-label={`ลบ ${user.username}`}>
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isFormModalOpen} onClose={handleCloseModals} title={editingUser ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="ชื่อผู้ใช้"
            value={formData.username}
            onChange={e => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            required
          />
          <input
            type="password"
            placeholder={editingUser ? 'กำหนดรหัสผ่านใหม่ (ถ้าต้องการ)' : 'รหัสผ่าน'}
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            required={!editingUser}
          />
          <div className="relative">
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors appearance-none font-body"
            >
              <option value="user">ผู้ใช้งานทั่วไป</option>
              <option value="officer">เจ้าหน้าที่</option>
              <option value="admin">ผู้ดูแลระบบ</option>
            </select>
            <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-colors">
              {editingUser ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มผู้ใช้'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseModals} title="ยืนยันการลบ" icon={<ExclamationTriangleIcon className="w-7 h-7 text-red-500" />}>
        {deletingUser && (
          <div>
            <p className="text-slate-600 mb-6 text-base font-body">คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ <span className="font-semibold text-slate-900">{deletingUser.username}</span>?</p>
            <div className="flex justify-end gap-4">
              <button onClick={handleCloseModals} className="px-5 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold transition-colors">ยกเลิก</button>
              <button onClick={handleConfirmDelete} className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors">ยืนยัน</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagementView;
