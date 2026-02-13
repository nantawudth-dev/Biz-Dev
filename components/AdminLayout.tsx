
import React, { useState, useEffect } from 'react';
import { Entrepreneur, Project, Course, Consultant, ViewType, User, UserAccount, Role } from '../types';
import Sidebar from './Sidebar';
import DashboardView from './DashboardView';
import EntrepreneurView from './EntrepreneurView';
import ProjectView from './ProjectView';
import BizProjectView from './BizProjectView';
import CourseView from './CourseView';
import ConsultantView from './ConsultantView';
import AIAnalysisView from './AIAnalysisView';
import SettingsView from './SettingsView';
import Modal from './Modal';
import { Bars3Icon, ExclamationTriangleIcon } from './icons';
import { ProjectCategorySetting } from '../App';

interface AdminLayoutProps {
    currentUser: User;
    onLogout: () => void;
    entrepreneurs: Entrepreneur[];
    setEntrepreneurs: React.Dispatch<React.SetStateAction<Entrepreneur[]>>;
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    courses: Course[];
    setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
    consultants: Consultant[];
    setConsultants: React.Dispatch<React.SetStateAction<Consultant[]>>;
    users: UserAccount[];
    setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
    establishmentTypes: string[];
    setEstablishmentTypes: React.Dispatch<React.SetStateAction<string[]>>;
    businessCategories: string[];
    setBusinessCategories: React.Dispatch<React.SetStateAction<string[]>>;
    projectCategories: ProjectCategorySetting[];
    setProjectCategories: React.Dispatch<React.SetStateAction<ProjectCategorySetting[]>>;
    fiscalYears: string[];
    setFiscalYears: React.Dispatch<React.SetStateAction<string[]>>;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
    currentUser,
    onLogout,
    entrepreneurs, setEntrepreneurs,
    projects, setProjects,
    courses, setCourses,
    consultants, setConsultants,
    users, setUsers,
    establishmentTypes, setEstablishmentTypes,
    businessCategories, setBusinessCategories,
    projectCategories, setProjectCategories,
    fiscalYears, setFiscalYears,
}) => {
    const [activeView, setActiveView] = useState<ViewType>(ViewType.Dashboard);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleViewChange = (view: ViewType) => {
        setActiveView(view);
        setIsSidebarOpen(false); // Automatically close sidebar on navigation
    };

    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        if (isSidebarOpen && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isSidebarOpen]);

    // Force Dashboard view on initial mount (login)
    useEffect(() => {
        setActiveView(ViewType.Dashboard);
    }, []);

    // Redirect if non-admin tries to access Settings
    useEffect(() => {
        if (activeView === ViewType.Settings && currentUser.role !== 'admin') {
            setActiveView(ViewType.Dashboard);
        }
        if (activeView === ViewType.AIAnalysis && currentUser.role === 'user') {
            setActiveView(ViewType.Dashboard);
        }
    }, [activeView, currentUser.role]);

    const renderView = () => {
        const userRole = currentUser.role;
        let viewComponent;
        switch (activeView) {
            case ViewType.Dashboard:
                viewComponent = <DashboardView
                    entrepreneurs={entrepreneurs}
                    projects={projects}
                    courses={courses}
                    consultants={consultants}
                />;
                break;
            case ViewType.Entrepreneurs:
                viewComponent = <EntrepreneurView
                    userRole={userRole}
                    entrepreneurs={entrepreneurs}
                    setEntrepreneurs={setEntrepreneurs}
                    establishmentTypes={establishmentTypes}
                    businessCategories={businessCategories}
                />;
                break;
            case ViewType.Projects:
                viewComponent = <ProjectView userRole={userRole} projects={projects} setProjects={setProjects} entrepreneurs={entrepreneurs} projectCategories={projectCategories} fiscalYears={fiscalYears} />;
                break;
            case ViewType.BizProjects:
                viewComponent = <BizProjectView projects={projects} entrepreneurs={entrepreneurs} projectCategories={projectCategories} fiscalYears={fiscalYears} />;
                break;
            case ViewType.Courses:
                viewComponent = <CourseView userRole={userRole} courses={courses} setCourses={setCourses} />;
                break;
            case ViewType.Consultants:
                viewComponent = <ConsultantView userRole={userRole} consultants={consultants} setConsultants={setConsultants} />;
                break;
            case ViewType.AIAnalysis:
                if (userRole === 'admin' || userRole === 'officer') {
                    viewComponent = <AIAnalysisView consultants={consultants} entrepreneurs={entrepreneurs} />;
                } else {
                    viewComponent = <DashboardView entrepreneurs={entrepreneurs} projects={projects} courses={courses} consultants={consultants} />;
                }
                break;
            case ViewType.Settings:
                if (userRole === 'admin') {
                    viewComponent = <SettingsView
                        users={users}
                        setUsers={setUsers}
                        establishmentTypes={establishmentTypes}
                        setEstablishmentTypes={setEstablishmentTypes}
                        businessCategories={businessCategories}
                        setBusinessCategories={setBusinessCategories}
                        projectCategories={projectCategories}
                        setProjectCategories={setProjectCategories}
                        fiscalYears={fiscalYears}
                        setFiscalYears={setFiscalYears}
                    />;
                } else {
                    // Redirect is handled in useEffect
                    viewComponent = <DashboardView entrepreneurs={entrepreneurs} projects={projects} courses={courses} consultants={consultants} />;
                }
                break;
            default:
                viewComponent = <DashboardView
                    entrepreneurs={entrepreneurs}
                    projects={projects}
                    courses={courses}
                    consultants={consultants}
                />;
        }
        return <div key={activeView} className="animate-fade-in">{viewComponent}</div>;
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
            <Sidebar
                currentUser={currentUser}
                activeView={activeView}
                setActiveView={handleViewChange}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                onRequestLogout={() => setIsLogoutModalOpen(true)}
            />
            <main className="flex-1 md:ml-64 transition-all duration-300">
                <header className="flex items-center justify-between p-4 md:px-8 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-1 -ml-1 text-slate-700 hover:text-blue-600">
                            <Bars3Icon className="w-7 h-7" />
                        </button>
                        <h1 className="text-xl md:text-2xl font-medium font-title text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
                            {activeView === ViewType.Dashboard && 'ภาพรวม'}
                            {activeView === ViewType.Entrepreneurs && 'ผู้ประกอบการ'}
                            {activeView === ViewType.Projects && 'โครงการทั้งหมด'}
                            {activeView === ViewType.BizProjects && 'ผลลัพธ์โครงการ'}
                            {activeView === ViewType.Courses && 'หลักสูตรอบรม'}
                            {activeView === ViewType.Consultants && 'ผู้เชี่ยวชาญ'}
                            {activeView === ViewType.AIAnalysis && 'AI Analysis'}
                            {activeView === ViewType.Settings && 'ตั้งค่า'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-slate-700">{currentUser.username}</p>
                            <p className="text-xs text-slate-500">
                                {currentUser.role === 'admin' && 'ผู้ดูแลระบบ'}
                                {currentUser.role === 'officer' && 'เจ้าหน้าที่'}
                                {currentUser.role === 'user' && 'ผู้ใช้งานทั่วไป'}
                            </p>
                        </div>

                        {/* User Avatar with Role-based Gradient - Rounded Square */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-md ${currentUser.role === 'admin' ? 'bg-gradient-to-br from-orange-200 to-orange-300 text-orange-800' :
                                currentUser.role === 'officer' ? 'bg-gradient-to-br from-blue-200 to-blue-300 text-blue-800' :
                                    'bg-gradient-to-br from-green-200 to-green-300 text-green-800'
                            }`}>
                            {currentUser.username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>
                <div className="p-4 sm:p-6 md:p-8">
                    {renderView()}
                </div>
            </main>
            <Modal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                title="ยืนยันการออกจากระบบ"
                icon={<ExclamationTriangleIcon className="w-7 h-7 text-amber-500" />}
            >
                <div>
                    <p className="text-slate-600 mb-6 text-base font-body">คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?</p>
                    <div className="flex justify-end gap-4">
                        <button onClick={() => setIsLogoutModalOpen(false)} className="px-5 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold transition-colors">ยกเลิก</button>
                        <button onClick={onLogout} className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors">ออกจากระบบ</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminLayout;