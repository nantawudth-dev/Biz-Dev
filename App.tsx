
import React, { useState, useEffect } from 'react';
import { Role, ViewType } from './types';
import LoginPage from './components/LoginPage';
import { useNotification, NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Modal from './components/Modal';
import AccessDeniedModal from './components/AccessDeniedModal';
import { ExclamationTriangleIcon, CheckCircleIcon } from './components/icons';

import DashboardView from './components/DashboardView';
import EntrepreneurView from './components/EntrepreneurView';
import ProjectView from './components/ProjectView';
import BizProjectView from './components/BizProjectView';
import CourseView from './components/CourseView';
import ConsultantView from './components/ConsultantView';
import UserManagementView from './components/UserManagementView';
import SettingsView from './components/SettingsView';
import AIAnalysisView from './components/AIAnalysisView';

const MainApp = () => {
  const { user, isLoading: authLoading, logout, isAdmin, isOfficer, isAccessDenied } = useAuth();
  const { showNotification } = useNotification();

  // View management state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>(ViewType.Dashboard);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoginSuccessOpen, setIsLoginSuccessOpen] = useState(false);
  const [loginProgress, setLoginProgress] = useState(0);

  // Idle Timeout State
  const [isIdleWarningOpen, setIsIdleWarningOpen] = useState(false);
  const [idleCountdown, setIdleCountdown] = useState(120); // 2 minutes countdown
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  const WARNING_THRESHOLD_MS = 28 * 60 * 1000; // Show warning after 28 minutes

  // Idle Timeout Logic
  useEffect(() => {
    if (!user) return;

    const resetTimer = () => {
      setLastActivityTime(Date.now());
      if (isIdleWarningOpen) {
        setIsIdleWarningOpen(false);
      }
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    const checkInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityTime;

      if (elapsed >= IDLE_TIMEOUT_MS) {
        performLogout();
        setIsIdleWarningOpen(false);
      } else if (elapsed >= WARNING_THRESHOLD_MS) {
        const remaining = Math.max(0, Math.ceil((IDLE_TIMEOUT_MS - elapsed) / 1000));
        setIdleCountdown(remaining);
        setIsIdleWarningOpen(true);
      }
    }, 1000);

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearInterval(checkInterval);
    };
  }, [user, lastActivityTime, isIdleWarningOpen]);

  // Role determination based on AuthContext
  const userRole: Role = isAdmin ? 'admin' : (isOfficer ? 'officer' : 'user');
  const currentUser = { id: user?.id || '', username: user?.email || 'User', role: userRole };

  // Login Success Modal Logic
  useEffect(() => {
    if (user?.id) {
      const hasShownWelcome = sessionStorage.getItem(`welcome_shown_${user.id}`);
      if (!hasShownWelcome) {
        setIsLoginSuccessOpen(true);
        // Start animation slightly after mount to trigger transition
        setTimeout(() => setLoginProgress(100), 100);

        sessionStorage.setItem(`welcome_shown_${user.id}`, 'true');

        // Auto close after 2s
        const timer = setTimeout(() => {
          setIsLoginSuccessOpen(false);
          setLoginProgress(0);
        }, 2000);

        return () => clearTimeout(timer);
      }
    }
  }, [user?.id]);

  const confirmLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const performLogout = async () => {
    setIsLogoutModalOpen(false);
    await logout();
    showNotification('ออกจากระบบแล้ว', 'success');
  };

  const getHeaderTitle = () => {
    switch (activeView) {
      case ViewType.Dashboard: return 'ภาพรวมระบบ';
      case ViewType.Entrepreneurs: return 'ผู้ประกอบการ';
      case ViewType.Projects: return 'โครงการ';
      case ViewType.BizProjects: return 'โครงการ Biz-Lab';
      case ViewType.Courses: return 'หลักสูตรอบรม';
      case ViewType.Consultants: return 'ผู้เชี่ยวชาญ';
      case ViewType.UserManagement: return 'จัดการผู้ใช้งาน';
      case ViewType.Settings: return 'ตั้งค่าระบบ';
      case ViewType.AIAnalysis: return 'AI ช่วยวิเคราะห์';
      default: return '';
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-title animate-pulse">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (isAccessDenied) {
    return (
      <>
        <LoginPage /> {/* Show login background behind modal */}
        <AccessDeniedModal onLogout={logout} />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-body animate-fade-in overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        setIsOpen={setIsSidebarOpen}
        currentUser={currentUser}
        onRequestLogout={confirmLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden w-full relative md:ml-64">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          user={{ username: user.email || 'User', role: userRole }}
          onLogout={confirmLogout}
          title={getHeaderTitle()}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 md:p-6 pb-20 scrollbar-hide">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeView === ViewType.Dashboard && (
              <DashboardView />
            )}
            {activeView === ViewType.Entrepreneurs && (
              <EntrepreneurView />
            )}
            {activeView === ViewType.Projects && (
              <ProjectView />
            )}
            {activeView === ViewType.BizProjects && (
              <BizProjectView />
            )}
            {activeView === ViewType.Courses && (
              <CourseView />
            )}
            {activeView === ViewType.Consultants && (
              <ConsultantView />
            )}
            {activeView === ViewType.UserManagement && userRole === 'admin' && (
              <UserManagementView />
            )}
            {activeView === ViewType.AIAnalysis && (userRole === 'admin' || userRole === 'officer') && (
              <AIAnalysisView />
            )}
            {activeView === ViewType.Settings && (
              <SettingsView />
            )}
          </div>
        </main>
      </div>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title=""
        maxWidth="max-w-sm"
      >
        <div className="flex flex-col items-center justify-center p-4 text-center -mt-6">
          <div className="bg-amber-50 p-4 rounded-full mb-4 animate-bounce shadow-sm">
            <ExclamationTriangleIcon className="w-12 h-12 text-amber-500" />
          </div>

          <h2 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-2 font-title">
            ยืนยันการออกจากระบบ
          </h2>
          <p className="text-slate-500 mb-8 font-body">คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?</p>

          <div className="flex w-full gap-3">
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-semibold transition-all duration-200 hover:shadow-sm"
            >
              ยกเลิก
            </button>
            <button
              onClick={performLogout}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:shadow-lg hover:from-red-600 hover:to-pink-700 font-semibold transition-all duration-300 transform hover:-translate-y-0.5"
            >
              ยืนยัน
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isLoginSuccessOpen}
        onClose={() => setIsLoginSuccessOpen(false)}
        title=""
        maxWidth="max-w-sm"
      >
        <div className="flex flex-col items-center justify-center p-4 text-center -mt-6">
          <div className="bg-emerald-50 p-4 rounded-full mb-4 animate-bounce shadow-sm">
            <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
          </div>

          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent mb-2 font-title">
            เข้าสู่ระบบสำเร็จ
          </h2>
          <p className="text-slate-500 mb-6 font-body">ยินดีต้อนรับ, <span className="font-semibold text-slate-700">{currentUser.username}</span></p>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-500 h-1.5 rounded-full transition-all duration-[2000ms] ease-out"
              style={{ width: `${loginProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-400">กำลังเข้าสู่หน้าหลัก...</p>
        </div>
      </Modal>
      <Modal
        isOpen={isIdleWarningOpen}
        onClose={() => setLastActivityTime(Date.now())}
        title=""
        maxWidth="max-w-sm"
      >
        <div className="flex flex-col items-center justify-center p-4 text-center -mt-6">
          <div className="bg-blue-50 p-4 rounded-full mb-4 animate-pulse shadow-sm">
            <ExclamationTriangleIcon className="w-12 h-12 text-blue-500" />
          </div>

          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 font-title">
            ไม่มีการใช้งานมาระยะหนึ่ง
          </h2>
          <p className="text-slate-500 mb-6 font-body">คุณจะถูกออกจากระบบโดยอัตโนมัติในอีก</p>

          <div className="text-4xl font-bold text-slate-800 mb-8 font-title tabular-nums">
            {Math.floor(idleCountdown / 60)}:{(idleCountdown % 60).toString().padStart(2, '0')}
          </div>

          <button
            onClick={() => setLastActivityTime(Date.now())}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg font-semibold transition-all duration-300 transform hover:-translate-y-0.5"
          >
            ใช้งานต่อ
          </button>
        </div>
      </Modal>
    </div>
  );
};

const App = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <DataProvider>
          <MainApp />
        </DataProvider>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;