
import React, { useState } from 'react';
import { Entrepreneur, Project, Course, Consultant, User, UserAccount, ProjectCategory } from './types';
import AdminLayout from './components/AdminLayout';
import LoginPage from './components/LoginPage';
import { useNotification } from './contexts/NotificationContext';

// Initial mock data
const initialEntrepreneurs: Entrepreneur[] = [
  { id: 'ent1', name: 'สมชาย ใจดี', businessName: 'Siam Innovations', contact: '081-234-5678', establishmentType: 'ภาคเอกชน', businessCategory: 'การบริหารและบริการสนับสนุน', address: '123 ถนนสุขุมวิท, เขตวัฒนา, กรุงเทพฯ 10110', lineId: 'siam.innovations', facebook: 'facebook.com/SiamInnovations' },
  { id: 'ent2', name: 'มานี รักไทย', businessName: 'Tasty Thai Foods', contact: '082-345-6789', establishmentType: 'ภาคเอกชน', businessCategory: 'ที่พักและบริการด้านอาหาร', address: '456 ถนนสีลม, เขตบางรัก, กรุงเทพฯ 10500', lineId: 'tasty.thai', facebook: 'facebook.com/TastyThaiFoods' },
  { id: 'ent3', name: 'พิชัย จินดา', businessName: 'เชียงใหม่ ออร์แกนิค ฟาร์ม', contact: '083-111-2222', establishmentType: 'วิสาหกิจ', businessCategory: 'เกษตรกรรม การป่าไม้ และการประมง', address: '101 หมู่ 5 ต.สุเทพ อ.เมืองเชียงใหม่ จ.เชียงใหม่ 50200', lineId: 'cm.organicfarm', facebook: 'facebook.com/ChiangmaiOrganicFarm' },
  { id: 'ent4', name: 'สุพัตรา มีลาภ', businessName: 'ภูเก็ต พาราไดซ์ รีสอร์ท', contact: '084-222-3333', establishmentType: 'ภาคเอกชน', businessCategory: 'ที่พักและบริการด้านอาหาร', address: '25/5 หาดป่าตอง อ.กะทู้ จ.ภูเก็ต 83150', lineId: 'phuket.paradise', facebook: 'facebook.com/PhuketParadiseResort' },
  { id: 'ent5', name: 'อานนท์ วงศ์สว่าง', businessName: 'Beauty Bliss Spa', contact: '085-333-4444', establishmentType: 'ภาคเอกชน', businessCategory: 'การบริการอื่น ๆ', address: '789 ถนนนิมมานเหมินท์, อ.เมือง, จ.เชียงใหม่ 50200', lineId: 'beautybliss.spa', facebook: 'facebook.com/BeautyBlissSpa' },
  { id: 'ent6', name: 'กนกวรรณ แซ่ตั้ง', businessName: 'Chic & Cheap Fashion', contact: '086-444-5555', establishmentType: 'ผู้ประกอบการ', businessCategory: 'การผลิตสินค้า', address: 'สยามสแควร์ ซอย 5, เขตปทุมวัน, กรุงเทพฯ 10330', lineId: 'chiccheap.fashion', facebook: 'facebook.com/ChicCheapFashion' },
  { id: 'ent7', name: 'ธีรวัฒน์ เกียรติไพศาล', businessName: 'FastFlow Logistics', contact: '087-555-6666', establishmentType: 'ภาคเอกชน', businessCategory: 'การขนส่งและสถานที่เก็บสินค้า', address: 'คลังสินค้า TPARK, อ.วังน้อย, จ.พระนครศรีอยุธยา 13170', lineId: 'fastflow.logistics', facebook: 'facebook.com/FastFlowLogistics' },
  { id: 'ent8', name: 'ปรียานุช สุขใจ', businessName: 'Home Sweet Home Realty', contact: '088-666-7777', establishmentType: 'ภาคเอกชน', businessCategory: 'เกี่ยวกับอสังหาริมทรัพย์', address: 'อาคารเอ็มไพร์ทาวเวอร์ ชั้น 45, เขตสาทร, กรุงเทพฯ 10120', lineId: 'homesweethome.realty', facebook: 'facebook.com/HomeSweetHomeRealty' },
  { id: 'ent9', name: 'วรวุฒิ คงมั่น', businessName: 'CodeCraft Solutions', contact: '089-777-8888', establishmentType: 'ภาคเอกชน', businessCategory: 'การบริหารและบริการสนับสนุน', address: 'อาคารไซเบอร์เวิลด์, เขตห้วยขวาง, กรุงเทพฯ 10310', lineId: 'codecraft.th', facebook: 'facebook.com/CodeCraftSolutions' },
  { id: 'ent10', name: 'นันทิดา พรหมสุวรรณ', businessName: 'บ้านกาแฟ ขอนแก่น', contact: '091-888-9999', establishmentType: 'ผู้ประกอบการ', businessCategory: 'ที่พักและบริการด้านอาหาร', address: 'ถนนหน้าเมือง, อ.เมือง, จ.ขอนแก่น 40000', lineId: 'baankafee.kk', facebook: 'facebook.com/BaanKafeeKhonKaen' },
];


const initialProjects: Project[] = [
  { id: 'proj1', name: 'พัฒนาระบบ CRM', description: 'พัฒนาและติดตั้งระบบ CRM สำหรับจัดการลูกค้า', entrepreneurId: 'ent1', status: 'Completed', category: 'Research', outcome: 'เพิ่มประสิทธิภาพการจัดการลูกค้าสัมพันธ์ได้ 30% และลดเวลาในการติดตามงาน' },
  { id: 'proj2', name: 'ออกแบบบรรจุภัณฑ์ใหม่', description: 'ออกแบบแพคเกจจิ้งสำหรับสินค้าส่งออก', entrepreneurId: 'ent2', status: 'In Progress', category: 'Academic Services' },
  { id: 'proj3', name: 'วิเคราะห์ข้อมูลการตลาด', description: 'วิเคราะห์ข้อมูลลูกค้าเพื่อวางแผนการตลาด', entrepreneurId: 'ent1', status: 'Completed', category: 'Student Projects', outcome: 'ค้นพบกลุ่มลูกค้าใหม่ในตลาดออนไลน์ และสร้างแคมเปญที่เพิ่มยอดขาย 15%' },
  { id: 'proj4', name: 'ทดสอบคุณภาพผลิตภัณฑ์อาหาร', description: 'บริการทดสอบและรับรองคุณภาพอาหาร', entrepreneurId: 'ent2', status: 'Completed', category: 'Lab Services', outcome: 'ผลิตภัณฑ์ผ่านการรับรองมาตรฐาน อย. และ GMP พร้อมสำหรับวางจำหน่ายในห้างสรรพสินค้า' },
];

const initialCourses: Course[] = [
  { id: 'crs1', title: 'การตลาดดิจิทัล 101', description: 'พื้นฐานการตลาดออนไลน์สำหรับ SME', duration: '3 วัน', instructor: 'อ.วิชัย ประเสริฐ' },
  { id: 'crs2', title: 'การจัดการการเงินเบื้องต้น', description: 'เรียนรู้การวางแผนการเงินสำหรับธุรกิจ', duration: '2 วัน', instructor: 'อ.สุดา ศรีงาม' },
];

const initialConsultants: Consultant[] = [
  { id: 'con1', name: 'ดร.สมเกียรติ ชาญชัย', expertise: ['การตลาด', 'การสร้างแบรนด์'], contact: 'somkiat.c@consult.co' },
  { id: 'con2', name: 'คุณพรทิพย์ วงศ์ใหญ่', expertise: ['การเงิน', 'การลงทุน', 'ภาษี'], contact: 'porntip.w@consult.co' },
];

const initialUsers: UserAccount[] = [
    { id: 'user-admin-01', username: 'admin', role: 'admin', password: 'password' },
    { id: 'user-officer-01', username: 'janjira', role: 'officer', password: 'password123' },
    { id: 'user-basic-01', username: 'somchai', role: 'user', password: 'password123' },
];

const initialEstablishmentTypes: string[] = [
  'ภาครัฐ',
  'ภาคเอกชน',
  'วิสาหกิจ',
  'ผู้ประกอบการ'
];

const initialBusinessCategories: string[] = [
  'การขนส่งและสถานที่เก็บสินค้า',
  'เกษตรกรรม การป่าไม้ และการประมง',
  'การผลิตสินค้า',
  'การก่อสร้าง',
  'พลังงาน',
  'ที่พักและบริการด้านอาหาร',
  'เกี่ยวกับอสังหาริมทรัพย์',
  'การบริหารและบริการสนับสนุน',
  'การศึกษา',
  'การบริการอื่น ๆ'
];

export interface ProjectCategorySetting {
  key: ProjectCategory;
  label: string;
}

const initialProjectCategories: ProjectCategorySetting[] = [
  { key: 'Research', label: 'งานวิจัย' },
  { key: 'Academic Services', label: 'งานบริการวิชาการ' },
  { key: 'Student Projects', label: 'งานนิสิตโครงงานร่วมกับผู้ประกอบการ' },
  { key: 'Lab Services', label: 'งานบริการห้องปฏิบัติการ' }
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>(initialEntrepreneurs);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [consultants, setConsultants] = useState<Consultant[]>(initialConsultants);
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [establishmentTypes, setEstablishmentTypes] = useState<string[]>(initialEstablishmentTypes);
  const [businessCategories, setBusinessCategories] = useState<string[]>(initialBusinessCategories);
  const [projectCategories, setProjectCategories] = useState<ProjectCategorySetting[]>(initialProjectCategories);
  
  const { showNotification } = useNotification();

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    const roleText = {
        admin: 'ผู้ดูแลระบบ',
        officer: 'เจ้าหน้าที่',
        user: 'ผู้ใช้งาน'
    };
    // Use a short delay to allow the UI to transition before showing the modal
    setTimeout(() => {
        showNotification(`เข้าสู่ระบบสำเร็จในฐานะ ${roleText[user.role]}`, 'success');
    }, 100);
  };

  const handleLogout = () => {
    // Show notification first, then log out when the user closes the modal
    showNotification('ออกจากระบบสำเร็จ', 'success', () => {
      setCurrentUser(null);
    });
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }
  
  return (
    <AdminLayout
      currentUser={currentUser}
      onLogout={handleLogout}
      entrepreneurs={entrepreneurs}
      setEntrepreneurs={setEntrepreneurs}
      projects={projects}
      setProjects={setProjects}
      courses={courses}
      setCourses={setCourses}
      consultants={consultants}
      setConsultants={setConsultants}
      users={users}
      setUsers={setUsers}
      establishmentTypes={establishmentTypes}
      setEstablishmentTypes={setEstablishmentTypes}
      businessCategories={businessCategories}
      setBusinessCategories={setBusinessCategories}
      projectCategories={projectCategories}
      setProjectCategories={setProjectCategories}
    />
  );
};

export default App;