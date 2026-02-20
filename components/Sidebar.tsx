
import React from 'react';
import { ViewType, User } from '../types';
import { HomeIcon, BuildingIcon, BriefcaseIcon, BookOpenIcon, UserGroupIcon, XMarkIcon, ArrowLeftStartOnRectangleIcon, ChartBarIcon, Cog6ToothIcon, SparklesIcon } from './icons';

interface SidebarProps {
  currentUser: User;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onRequestLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, activeView, setActiveView, isOpen, setIsOpen, onRequestLogout }) => {
  const navItems = [
    { type: ViewType.Dashboard, label: 'ภาพรวม', icon: <HomeIcon className="w-6 h-6" />, roles: ['admin', 'officer', 'user'] },
    { type: ViewType.Entrepreneurs, label: 'ผู้ประกอบการ', icon: <BuildingIcon className="w-6 h-6" />, roles: ['admin', 'officer', 'user'] },
    { type: ViewType.Projects, label: 'โครงการทั้งหมด', icon: <BriefcaseIcon className="w-6 h-6" />, roles: ['admin', 'officer', 'user'] },
    { type: ViewType.BizProjects, label: 'ผลสัมฤทธิ์โครงการ', icon: <ChartBarIcon className="w-6 h-6" />, roles: ['admin', 'officer', 'user'] },
    { type: ViewType.Courses, label: 'หลักสูตรอบรม', icon: <BookOpenIcon className="w-6 h-6" />, roles: ['admin', 'officer', 'user'] },
    { type: ViewType.Consultants, label: 'ผู้เชี่ยวชาญ', icon: <UserGroupIcon className="w-6 h-6" />, roles: ['admin', 'officer', 'user'] },
    { type: ViewType.AIAnalysis, label: 'AI Analysis', icon: <SparklesIcon className="w-6 h-6" />, roles: ['admin', 'officer'] },
    { type: ViewType.Settings, label: 'ตั้งค่า', icon: <Cog6ToothIcon className="w-6 h-6" />, roles: ['admin'] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-white via-green-50/30 to-green-100/40 backdrop-blur-lg border-r border-green-200/50 flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="relative flex flex-col items-center justify-center pt-8 pb-6 border-b border-green-200/30 px-4 text-center bg-gradient-to-r from-blue-500/90 via-cyan-500/90 to-green-400/90 overflow-hidden">
          {/* Background Image - Buildings */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute inset-0" style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(1px)'
            }}></div>
          </div>

          <img src="/uploads/logos/final-logo-biz-tr_white.png" alt="BIZ Logo" className="h-16 object-contain drop-shadow-2xl transition-transform hover:scale-105 duration-300 relative z-10" />
          <button onClick={() => setIsOpen(false)} className="md:hidden absolute top-2 right-2 p-2 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full shadow-sm z-10">
            <span className="sr-only">Close menu</span>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-grow p-4">
          <ul className="space-y-2">
            {visibleNavItems.map((item) => (
              <li key={item.type}>
                <button
                  onClick={() => setActiveView(item.type)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-base font-medium font-title transition-all duration-200 ${activeView === item.type
                    ? 'bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-lg'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600'
                    }`}
                  aria-current={activeView === item.type ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button Area */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={onRequestLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-base font-medium font-title text-slate-700 hover:bg-slate-100 hover:text-red-600 transition-colors duration-200"
          >
            <ArrowLeftStartOnRectangleIcon className="w-6 h-6" />
            <span>ออกจากระบบ</span>
          </button>
        </div>

        <div className="p-4 pt-0 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} BIZ Management. Modernized.</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;