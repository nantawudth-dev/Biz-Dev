
import React, { useState, useEffect } from 'react';
import { UserAccount, Role } from '../types';
import Modal from './Modal';
import { PlusIcon, PencilIcon, TrashIcon, UserCircleIcon, ExclamationTriangleIcon, ChevronDownIcon, MagnifyingGlassIcon } from './icons';
import { useNotification } from '../contexts/NotificationContext';
import { dataService } from '../services/dataService';
import { useData } from '../contexts/DataContext';
import Pagination from './Pagination';

// Props interface - Empty now as data is fetched internally
interface UserManagementViewProps { }

const emptyUserForm: Omit<UserAccount, 'id'> = {
  username: '',
  email: '',
  role: 'user',
  isActive: true,
};

const UserManagementView: React.FC<UserManagementViewProps> = () => {
  const { data, fetchData, invalidateCache } = useData();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);
  const [formData, setFormData] = useState<Omit<UserAccount, 'id'> & { id?: string }>(emptyUserForm);

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const { showNotification } = useNotification();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!data.profiles) {
          setIsLoading(true);
        }
        await fetchData('profiles', () => dataService.getProfiles());
      } catch (error) {
        console.error('Error loading users:', error);
        showNotification('ไม่สามารถโหลดข้อมูลผู้ใช้งานได้', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, [fetchData, showNotification, data.profiles]);

  // Sync users from DataContext when the cached data changes
  useEffect(() => {
    if (data.profiles) {
      const mappedUsers: UserAccount[] = data.profiles.map((p: any) => ({
        id: p.id,
        username: p.username,
        email: p.email,
        role: p.role as Role,
        isActive: p.is_active
      }));
      setUsers(mappedUsers);
    }
  }, [data.profiles]);

  const handleOpenEditModal = (user: UserAccount) => {
    setEditingUser(user);
    setFormData({ ...user });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email) return;

    try {
      if (editingUser) {
        // Update existing user profile
        const profileUpdates: any = {
          role: formData.role,
          is_active: formData.isActive
        };

        if (editingUser.id) {
          await dataService.updateProfile(editingUser.id, profileUpdates);
          invalidateCache('profiles');
          await fetchData('profiles', () => dataService.getProfiles());
        }

        showNotification('อัปเดตข้อมูลผู้ใช้สำเร็จ', 'success');
      } else {
        // Add new user profile
        const newProfile = await dataService.createProfile({
          username: formData.username,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive
        });

        if (newProfile) {
          invalidateCache('profiles');
          await fetchData('profiles', () => dataService.getProfiles());
          showNotification('เพิ่มผู้ใช้สำเร็จ (ผู้ใช้ต้องทำการลงทะเบียนด้วยอีเมลนี้)', 'success');
        }
      }
      handleCloseModals();
    } catch (error: any) {
      console.error('Error saving user:', error);
      const errorMessage = error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
      showNotification(`บันทึกไม่สำเร็จ: ${errorMessage}`, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingUser) {
      try {
        // Remove from profiles
        if (deletingUser.id) {
          await dataService.deleteProfile(deletingUser.id);
          invalidateCache('profiles');
          await fetchData('profiles', () => dataService.getProfiles());
        }

        showNotification('ลบผู้ใช้สำเร็จ', 'delete');
        handleCloseModals();
      } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
      }
    }
  };

  const getRoleDisplayName = (role: Role) => {
    switch (role) {
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'officer': return 'เจ้าหน้าที่';
      case 'user': return 'ผู้ใช้งานทั่วไป';
      default: return 'ไม่ระบุ';
    }
  };

  // Filtered & paginated users
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(term) ||
      (user.email || '').toLowerCase().includes(term)
    );
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-title">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg animate-fade-in">
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-xl font-medium font-title text-slate-800">รายชื่อผู้ใช้งาน</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="ค้นหาชื่อผู้ใช้ หรืออีเมล..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              setFormData(emptyUserForm);
              setIsFormModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-all shadow-md font-semibold text-sm whitespace-nowrap"
          >
            <PlusIcon className="w-5 h-5" />
            เพิ่มผู้ใช้งาน
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ชื่อผู้ใช้งาน</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">อีเมล</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">บทบาท</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider font-title">สถานะ</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider font-title">จัดการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-full shrink-0">
                      <UserCircleIcon className="w-5 h-5 text-slate-500" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">{user.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-600">{user.email || '-'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'officer' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                    {getRoleDisplayName(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={async () => {
                      try {
                        await dataService.updateProfile(user.id, { is_active: !user.isActive });
                        invalidateCache('profiles');
                        await fetchData('profiles', () => dataService.getProfiles());
                        showNotification(`${user.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}ผู้ใช้สำเร็จ`, 'success');
                      } catch (error) {
                        console.error('Error toggling status:', error);
                        showNotification('เกิดข้อผิดพลาด', 'error');
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${user.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => handleOpenEditModal(user)} className="text-slate-400 hover:text-blue-600 transition-colors" title={`แก้ไข ${user.username}`}>
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleOpenDeleteModal(user)} className="text-slate-400 hover:text-red-600 transition-colors" title={`ลบ ${user.username}`}>
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4">
        <Pagination
          currentPage={currentPage}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(e) => setItemsPerPage(Number(e.target.value))}
        />
      </div>

      <Modal isOpen={isFormModalOpen} onClose={handleCloseModals} title={editingUser ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ใช้</label>
            <input
              type="text"
              placeholder="ชื่อผู้ใช้ (เฉพาะดูข้อมูล)"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              readOnly={!!editingUser} // Allow edit only for new users
              className={`w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${editingUser ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50 focus:bg-white'}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">อีเมล</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">บทบาท</label>
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
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-slate-700">สถานะการใช้งาน</label>
              <p className="text-xs text-slate-500 mt-1">{formData.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
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
