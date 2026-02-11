
import React, { useState } from 'react';
import { Course, Role } from '../types';
import Modal from './Modal';
import { PlusIcon, BookOpenIcon, Squares2X2Icon, ListBulletIcon, MagnifyingGlassIcon } from './icons';
import { useNotification } from '../contexts/NotificationContext';

interface CourseViewProps {
  userRole: Role;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}

const CourseView: React.FC<CourseViewProps> = ({ userRole, courses, setCourses }) => {
  const [displayMode, setDisplayMode] = useState<'card' | 'list'>('card');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', duration: '', instructor: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const { showNotification } = useNotification();

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCourse.title) {
      setCourses([...courses, { ...newCourse, id: `crs${Date.now()}` }]);
      setNewCourse({ title: '', description: '', duration: '', instructor: '' });
      setIsModalOpen(false);
      showNotification('เพิ่มคอร์สอบรมใหม่สำเร็จ', 'success');
    }
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-4xl font-bold text-slate-900">คอร์สอบรม</h2>
        {(userRole === 'admin' || userRole === 'officer') && (
            <button
            onClick={() => setIsModalOpen(true)}
            className="flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2.5 font-semibold rounded-lg shadow-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105"
            >
            <PlusIcon className="w-5 h-5 mr-2" />
            <span>เพิ่มคอร์ส</span>
            </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="w-full md:w-auto md:flex-1 relative">
            <input 
                type="text"
                placeholder="ค้นหาชื่อคอร์สหรือผู้สอน..."
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
        {displayMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
                <div key={course.id} className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-start mb-4">
                        <div className="bg-blue-100 p-3 rounded-lg mr-4 shrink-0">
                            <BookOpenIcon className="w-6 h-6 text-blue-600"/>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{course.title}</h3>
                    </div>
                    <p className="text-slate-600 mb-4 flex-grow font-body">{course.description}</p>
                    <div className="text-sm text-slate-500 space-y-2 border-t border-slate-200 pt-4 mt-auto">
                        <p><span className="font-semibold text-slate-500">ระยะเวลา:</span> <span className="text-slate-800">{course.duration}</span></p>
                        <p><span className="font-semibold text-slate-500">ผู้สอน:</span> <span className="text-slate-800">{course.instructor}</span></p>
                    </div>
                </div>
                </div>
            ))}
            </div>
        ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                {filteredCourses.map((course, index) => (
                    <div key={course.id} className={`p-4 flex flex-col md:flex-row md:items-center gap-4 ${index < courses.length - 1 ? 'border-b border-slate-200' : ''}`}>
                    <div className="flex-1">
                        <p className="text-lg font-bold text-slate-900">{course.title}</p>
                        <p className="text-sm text-slate-500">ผู้สอน: {course.instructor}</p>
                    </div>
                    <div className="flex-shrink-0">
                        <p className="text-base text-slate-600 font-body">ระยะเวลา: {course.duration}</p>
                    </div>
                    </div>
                ))}
            </div>
        )}
        </>
      ) : (
        <div className="text-center py-20 px-4 bg-white border border-slate-200 rounded-xl">
            <h3 className="text-xl font-semibold text-slate-700">ไม่พบคอร์สอบรม</h3>
            <p className="text-slate-500 mt-2 font-body">
              ไม่พบคอร์สอบรมที่ตรงกับการค้นหาของคุณ
            </p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="เพิ่มคอร์สอบรมใหม่">
        <form onSubmit={handleAddCourse} className="space-y-4">
          <input type="text" placeholder="ชื่อคอร์ส" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" required />
          <textarea placeholder="รายละเอียด" value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors h-24 font-body" />
          <input type="text" placeholder="ระยะเวลา" value={newCourse.duration} onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
          <input type="text" placeholder="ผู้สอน" value={newCourse.instructor} onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-colors">
              บันทึก
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CourseView;
