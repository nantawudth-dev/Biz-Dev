
import React, { useState } from 'react';
import { Course, Role } from '../types';
import Modal from './Modal';
import { PlusIcon, BookOpenIcon, Squares2X2Icon, ListBulletIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon, ArrowLeftIcon, EyeIcon, CalendarIcon, PhoneIcon, GlobeAltIcon, EnvelopeIcon } from './icons';
import { useNotification } from '../contexts/NotificationContext';
import Pagination from './Pagination';

interface CourseViewProps {
  userRole: Role;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}

const emptyCourseForm: Omit<Course, 'id'> & { id?: string } = {
  title: '', description: '', duration: '', instructor: '', syllabusLink: '', contactPhone: '', contactEmail: ''
};

const CardView = ({ data, userRole, onView, onEdit, onDelete }: { data: Course[], userRole: Role, onView: (course: Course) => void, onEdit: (course: Course) => void, onDelete: (course: Course) => void }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {data.map(course => (
      <div key={course.id} className="bg-white border border-slate-200 rounded-xl shadow-lg hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden">
        <div className="p-6 flex-grow flex flex-col relative z-10">
          <div className="flex items-start mb-4">
            <div className="bg-blue-100 p-3 rounded-lg mr-4 shrink-0 shadow-sm">
              <BookOpenIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-medium font-title text-slate-900 leading-tight line-clamp-2" title={course.title}>{course.title}</h3>
              <p className="text-sm text-slate-500 font-body mt-1">{course.instructor}</p>
            </div>
          </div>

          <p className="text-slate-600 mb-4 flex-grow font-body line-clamp-3 text-sm">{course.description}</p>

          <div className="border-t border-slate-200 mt-auto pt-4 text-slate-600 space-y-2 font-body text-sm">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              <span><span className="font-semibold">ระยะเวลา:</span> {course.duration}</span>
            </div>
            {course.contactPhone && (
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-slate-400" />
                <span>{course.contactPhone}</span>
              </div>
            )}
            {course.contactEmail && (
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                <span className="truncate">{course.contactEmail}</span>
              </div>
            )}
            {course.syllabusLink && (
              <div className="flex items-center gap-2 text-blue-600">
                <GlobeAltIcon className="w-4 h-4" />
                <a href={course.syllabusLink} target="_blank" rel="noopener noreferrer" className="truncate max-w-[200px] hover:underline hover:text-blue-800 transition-colors" onClick={(e) => e.stopPropagation()}>ลิงก์หลักสูตร</a>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4 mt-4 flex gap-2">
            <button
              onClick={() => onView(course)}
              className="flex-1 py-2 bg-white border border-emerald-200 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-all text-sm shadow-sm flex items-center justify-center gap-2"
            >
              <EyeIcon className="w-4 h-4" />
              ดูรายละเอียด
            </button>
            {(userRole === 'admin' || userRole === 'officer') && (
              <>
                <button
                  onClick={() => onEdit(course)}
                  className="py-2 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  title="แก้ไขข้อมูล"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(course)}
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

const ListView = ({ data, userRole, onView, onEdit, onDelete }: { data: Course[], userRole: Role, onView: (course: Course) => void, onEdit: (course: Course) => void, onDelete: (course: Course) => void }) => (
  <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
    <table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-slate-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ชื่อหลักสูตร</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ผู้สอน</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ระยะเวลา</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ลิงก์หลักสูตร</th>
          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider font-title">จัดการ</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-slate-200">
        {data.map((course) => (
          <tr key={course.id} className="hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-slate-900">{course.title}</div>
              {course.contactPhone && <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><PhoneIcon className="w-3 h-3" /> {course.contactPhone}</div>}
              {course.contactEmail && <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><EnvelopeIcon className="w-3 h-3" /> {course.contactEmail}</div>}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-slate-500">{course.instructor}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-slate-500">{course.duration}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {course.syllabusLink ? (
                <a href={course.syllabusLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors">
                  <GlobeAltIcon className="w-4 h-4" />
                  เปิดลิงก์
                </a>
              ) : <span className="text-sm text-slate-400">-</span>}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => onView(course)}
                  className="text-slate-400 hover:text-blue-600 transition-colors"
                  title="ดูรายละเอียด"
                >
                  <EyeIcon className="w-5 h-5" />
                </button>
                {(userRole === 'admin' || userRole === 'officer') && (
                  <>
                    <button onClick={() => onEdit(course)} className="text-slate-400 hover:text-blue-600 transition-colors" title="แก้ไขข้อมูล"><PencilIcon className="w-5 h-5" /></button>
                    <button onClick={() => onDelete(course)} className="text-slate-400 hover:text-red-600 transition-colors" title="ลบข้อมูล"><TrashIcon className="w-5 h-5" /></button>
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

const CourseView: React.FC<CourseViewProps> = ({ userRole, courses, setCourses }) => {
  const [displayMode, setDisplayMode] = useState<'card' | 'list'>('card');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<Omit<Course, 'id'> & { id?: string }>(emptyCourseForm);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const { showNotification } = useNotification();

  const handleOpenView = (course: Course) => { setViewingCourse(course); };
  const handleOpenAdd = () => { setEditingCourse(null); setFormData(emptyCourseForm); setIsFormOpen(true); };
  const handleOpenEdit = (course: Course) => { setEditingCourse(course); setFormData(course); setIsFormOpen(true); };
  const handleOpenDeleteModal = (course: Course) => { setDeletingCourse(course); setIsDeleteModalOpen(true); };

  const handleBackToList = () => { setIsFormOpen(false); setViewingCourse(null); };
  const handleCloseDeleteModal = () => { setIsDeleteModalOpen(false); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.instructor) return;

    if (editingCourse) {
      setCourses(courses.map(c => (c.id === editingCourse.id ? { ...formData, id: c.id } as Course : c)));
      showNotification('บันทึกข้อมูลหลักสูตรสำเร็จ', 'success');
    } else {
      setCourses([...courses, { ...formData, id: `crs${Date.now()}` } as Course]);
      showNotification('เพิ่มหลักสูตรใหม่สำเร็จ', 'success');
    }
    handleBackToList();
  };

  const handleConfirmDelete = () => {
    if (deletingCourse) {
      setCourses(courses.filter(c => c.id !== deletingCourse.id));
      showNotification('ลบหลักสูตรสำเร็จ', 'delete');
      handleCloseDeleteModal();
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCourses = filteredCourses.slice(
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
          <h2 className="text-2xl font-medium font-title text-slate-900">{editingCourse ? 'แก้ไขข้อมูลหลักสูตร' : 'เพิ่มหลักสูตรใหม่'}</h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อหลักสูตร</label>
                <input type="text" placeholder="ชื่อหลักสูตร" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" required />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">ผู้สอน</label>
                <input type="text" placeholder="ชื่อผู้สอน / วิทยากร" value={formData.instructor} onChange={e => setFormData({ ...formData, instructor: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" required />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">ระยะเวลา</label>
                <input type="text" placeholder="เช่น 3 วัน, 15 ชั่วโมง" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
                <div className="relative">
                  <PhoneIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="tel" placeholder="เบอร์โทรศัพท์" value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">อีเมลติดต่อ</label>
                <div className="relative">
                  <EnvelopeIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="email" placeholder="example@email.com" value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียดหลักสูตร</label>
                <textarea placeholder="รายละเอียดเนื้อหา, วัตถุประสงค์, กลุ่มเป้าหมาย" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors h-32 font-body" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">ลิงก์หลักสูตร (URL)</label>
                <div className="relative">
                  <GlobeAltIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="url" placeholder="https://example.com/course-syllabus" value={formData.syllabusLink} onChange={e => setFormData({ ...formData, syllabusLink: e.target.value })} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-4 gap-3">
              <button type="button" onClick={handleBackToList} className="bg-gradient-to-r from-orange-400 to-amber-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-colors shadow-md">ยกเลิก</button>
              <button type="submit" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-colors shadow-md">{editingCourse ? 'บันทึกการแก้ไข' : 'บันทึกหลักสูตร'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // View: Details
  if (viewingCourse) {
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
            <BookOpenIcon className="w-8 h-8 text-emerald-600" />
            <h2 className="text-3xl font-medium font-title text-slate-900">{viewingCourse.title}</h2>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-8 space-y-6 font-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">ผู้สอน / วิทยากร</label>
              <p className="text-lg font-medium text-slate-900 mt-1">{viewingCourse.instructor}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">ระยะเวลา</label>
              <p className="text-lg font-medium text-slate-900 mt-1">{viewingCourse.duration}</p>
            </div>
            {viewingCourse.contactPhone && (
              <div>
                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">เบอร์โทรศัพท์</label>
                <p className="text-lg font-medium text-slate-900 mt-1">{viewingCourse.contactPhone}</p>
              </div>
            )}
            {viewingCourse.contactEmail && (
              <div>
                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">อีเมลติดต่อ</label>
                <p className="text-lg font-medium text-slate-900 mt-1">{viewingCourse.contactEmail}</p>
              </div>
            )}
          </div>

          {viewingCourse.description && (
            <div className="border-t border-slate-200 pt-6">
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">รายละเอียดหลักสูตร</label>
              <p className="text-base text-slate-800 mt-3 leading-relaxed whitespace-pre-wrap">{viewingCourse.description}</p>
            </div>
          )}

          {viewingCourse.syllabusLink && (
            <div className="border-t border-slate-200 pt-6">
              <a
                href={viewingCourse.syllabusLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
              >
                <BookOpenIcon className="w-5 h-5" />
                ดูหลักสูตรออนไลน์
              </a>
            </div>
          )}
        </div>
      </div>
    )
  }

  // View: List (Default)
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-medium font-title text-slate-900">หลักสูตรอบรม</h2>
        {(userRole === 'admin' || userRole === 'officer') && (
          <button
            onClick={handleOpenAdd}
            className="flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2.5 font-semibold rounded-lg shadow-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            <span>เพิ่มหลักสูตร</span>
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="w-full md:w-auto md:flex-1 relative">
          <input
            type="text"
            placeholder="ค้นหาชื่อหลักสูตร หรือผู้สอน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
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

      {filteredCourses.length > 0 ? (
        <>
          {displayMode === 'card' ?
            <CardView data={paginatedCourses} userRole={userRole} onView={handleOpenView} onEdit={handleOpenEdit} onDelete={handleOpenDeleteModal} /> :
            <ListView data={paginatedCourses} userRole={userRole} onView={handleOpenView} onEdit={handleOpenEdit} onDelete={handleOpenDeleteModal} />
          }
          <Pagination
            currentPage={currentPage}
            totalItems={filteredCourses.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      ) : (
        <div className="text-center py-20 px-4 bg-white border border-slate-200 rounded-xl">
          <h3 className="text-xl font-semibold text-slate-700">ไม่พบข้อมูลหลักสูตร</h3>
          <p className="text-slate-500 mt-2 font-body">
            ไม่พบหลักสูตรอบรมที่ตรงกับการค้นหาของคุณ
          </p>
        </div>
      )}

      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} title="ยืนยันการลบ" icon={<ExclamationTriangleIcon className="w-7 h-7 text-red-500" />}>
        {deletingCourse && (
          <div>
            <p className="text-slate-600 mb-6 text-base font-body">คุณแน่ใจหรือไม่ว่าต้องการลบหลักสูตร <span className="font-semibold text-slate-900">{deletingCourse.title}</span>? <br />การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className="flex justify-end gap-4">
              <button onClick={handleCloseDeleteModal} className="px-5 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold transition-colors">ยกเลิก</button>
              <button onClick={handleConfirmDelete} className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors">ยืนยัน</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CourseView;
