
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
  { id: 'proj1', name: 'พัฒนาระบบ CRM', description: 'พัฒนาและติดตั้งระบบ CRM สำหรับจัดการลูกค้า', entrepreneur: 'บริษัท เอ บี ซี จำกัด', status: 'Completed', category: 'Research', outcome: 'เพิ่มประสิทธิภาพการจัดการลูกค้าสัมพันธ์ได้ 30% และลดเวลาในการติดตามงาน', projectLeader: 'ดร.สมชาย ใจดี', coProjectLeader: 'นายวิชัย เก่งกาจ', budget: 50000, fiscalYear: '2567' },
  { id: 'proj2', name: 'ออกแบบบรรจุภัณฑ์ใหม่', description: 'ออกแบบแพคเกจจิ้งสำหรับสินค้าส่งออก', entrepreneur: 'หจก. สมใจการเกษตร', status: 'In Progress', category: 'Academic Services', projectLeader: 'ผศ.ดร.มานี รักไทย', budget: 30000, fiscalYear: '2567' },
  { id: 'proj3', name: 'วิเคราะห์ข้อมูลการตลาด', description: 'วิเคราะห์ข้อมูลลูกค้าเพื่อวางแผนการตลาด', entrepreneur: 'บริษัท เอ บี ซี จำกัด', status: 'Completed', category: 'Consulting', outcome: 'ค้นพบกลุ่มลูกค้าใหม่ในตลาดออนไลน์ และสร้างแคมเปญที่เพิ่มยอดขาย 15%', projectLeader: 'ดร.พิชัย จินดา', coProjectLeader: 'นางสาวสุดา ศรีงาม', budget: 15000, fiscalYear: '2566' },
  { id: 'proj4', name: 'ทดสอบคุณภาพผลิตภัณฑ์อาหาร', description: 'บริการทดสอบและรับรองคุณภาพอาหาร', entrepreneur: 'หจก. สมใจการเกษตร', status: 'Completed', category: 'Biz-Lab', outcome: 'ผลิตภัณฑ์ผ่านการรับรองมาตรฐาน อย. และ GMP พร้อมสำหรับวางจำหน่ายในห้างสรรพสินค้า', projectLeader: 'รศ.ดร.สุพัตรา มีลาภ', budget: 20000, fiscalYear: '2566' },

];

// Helper to generate mock projects
const generateMockProjects = (count: number): Project[] => {
  const statuses: Project['status'][] = ['Completed', 'In Progress', 'Planned'];
  const categories: Project['category'][] = ['Research', 'Consulting', 'Academic Services', 'Biz-Lab'];
  const years = ['2565', '2566', '2567'];
  const entrepreneursList = initialEntrepreneurs.map(e => e.name);
  const leaders = ['ดร.สมชาย ใจดี', 'ผศ.ดร.มานี รักไทย', 'ดร.พิชัย จินดา', 'รศ.ดร.สุพัตรา มีลาภ', 'อ.วิชัย เก่งกาจ'];

  return Array.from({ length: count }).map((_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const fiscalYear = years[Math.floor(Math.random() * years.length)];
    const budget = Math.floor(Math.random() * (2000000 - 50000 + 1)) + 50000; // 50k - 2M
    const entrepreneur = entrepreneursList[Math.floor(Math.random() * entrepreneursList.length)];
    const leader = leaders[Math.floor(Math.random() * leaders.length)];

    return {
      id: `mock-proj-${i + 1}`,
      name: `โครงการตัวอย่าง ${category} ${i + 1}`,
      description: `รายละเอียดจำลองสำหรับโครงการที่ ${i + 1} เพื่อทดสอบการแสดงผลกราฟและรายการ`,
      entrepreneur: entrepreneur,
      status: status,
      category: category,
      projectLeader: leader,
      budget: budget,
      fiscalYear: fiscalYear,
      outcome: status === 'Completed' ? 'ผลลัพธ์โครงการจำลองที่สำเร็จแล้ว' : undefined,
    };
  });
};

// Combine initial with mock data
const allProjects = [...initialProjects, ...generateMockProjects(30)];

const initialCourses: Course[] = [
  { id: 'crs1', title: 'การตลาดดิจิทัล 101', description: 'พื้นฐานการตลาดออนไลน์สำหรับ SME', duration: '3 วัน', instructor: 'อ.วิชัย ประเสริฐ' },
  { id: 'crs2', title: 'การจัดการการเงินเบื้องต้น', description: 'เรียนรู้การวางแผนการเงินสำหรับธุรกิจ', duration: '2 วัน', instructor: 'อ.สุดา ศรีงาม' },
];

const initialConsultants: Consultant[] = [
  { id: 'con1', name: 'ดร.สมเกียรติ ชาญชัย', expertise: ['การตลาด', 'การสร้างแบรนด์'], contact: 'somkiat.c@consult.co' },
  { id: 'con2', name: 'คุณพรทิพย์ วงศ์ใหญ่', expertise: ['การเงิน', 'การลงทุน', 'ภาษี'], contact: 'porntip.w@consult.co' },
];

// Helper to generate mock courses
const generateMockCourses = (count: number): Course[] => {
  const titles = [
    'การตลาดดิจิทัลขั้นสูง', 'เทคนิคการเจรจาต่อรองทางธุรกิจ', 'การวางแผนภาษีสำหรับ SME',
    'การจัดการโลจิสติกส์ยุคใหม่', 'การสร้างแบรนด์ให้ยั่งยืน', 'การเขียนแผนธุรกิจฉบับมืออาชีพ',
    'นวัตกรรมบรรจุภัณฑ์', 'การจัดการทรัพยากรบุคคล', 'กฎหมายแรงงานที่ควรรู้',
    'เทคนิคการถ่ายภาพสินค้า', 'การทำบัญชีเบื้องต้น', 'กลยุทธ์การตั้งราคา'
  ];
  const instructors = [
    'อ.วิชัย ประเสริฐ', 'อ.สุดา ศรีงาม', 'ดร.สมชาย ใจดี', 'ผศ.ดร.มานี รักไทย', 'คุณธนินท์ เลิศสิน'
  ];
  const durations = ['1 วัน', '2 วัน', '3 วัน', '5 วัน'];

  return Array.from({ length: count }).map((_, i) => ({
    id: `mock-crs-${i + 1}`,
    title: titles[Math.floor(Math.random() * titles.length)] + ` (รุ่นที่ ${Math.floor(Math.random() * 5) + 1})`,
    description: `หลักสูตรอบรมเชิงปฏิบัติการเพื่อพัฒนาทักษะด้าน${titles[Math.floor(Math.random() * titles.length)].split(' ')[0]} สำหรับผู้ประกอบการ`,
    duration: durations[Math.floor(Math.random() * durations.length)],
    instructor: instructors[Math.floor(Math.random() * instructors.length)],
    contactPhone: '02-123-4567',
    contactEmail: 'training@bizdev.co.th'
  }));
};

const allCourses = [...initialCourses, ...generateMockCourses(15)];

// Helper to generate mock consultants
const generateMockConsultants = (count: number): Consultant[] => {
  const firstNames = ['สมยศ', 'กานดา', 'วิชัย', 'สุรีย์', 'ณัฐพล', 'พิมล', 'ธนากร', 'จิราพร'];
  const lastNames = ['ใจมั่น', 'มีทรัพย์', 'เก่งงาน', 'สุขสม', 'เจริญรุ่งเรือง', 'ทรัพย์ทวี'];
  const expertiseList = [
    'การตลาด', 'การเงิน', 'กฎหมายธุรกิจ', 'โลจิสติกส์', 'การผลิต',
    'ไอที/ดิจิทัล', 'ทรัพยากรบุคคล', 'การส่งออก', 'มาตรฐานคุณภาพ'
  ];

  return Array.from({ length: count }).map((_, i) => {
    const expertises: string[] = [];
    const expertiseCount = Math.floor(Math.random() * 3) + 1; // 1-3 skills
    for (let j = 0; j < expertiseCount; j++) {
      const skill = expertiseList[Math.floor(Math.random() * expertiseList.length)];
      if (!expertises.includes(skill)) expertises.push(skill);
    }

    return {
      id: `mock-con-${i + 1}`,
      name: `อ.${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      expertise: expertises,
      contact: `consultant${i + 1}@bizdev.co.th`,
      phone: `08${Math.floor(Math.random() * 90000000 + 10000000)}`,
      workplace: 'อิสระ'
    };
  });
};

const allConsultants = [...initialConsultants, ...generateMockConsultants(15)];

const initialUsers: UserAccount[] = [
  { id: 'user-admin-01', username: 'admin', email: 'admin@example.com', role: 'admin', isActive: true },
  { id: 'user-officer-01', username: 'janjira', email: 'janjira@example.com', role: 'officer', isActive: true },
  { id: 'user-basic-01', username: 'somchai', email: 'somchai@example.com', role: 'user', isActive: true },
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
  { key: 'Consulting', label: 'งานที่ปรึกษา' },
  { key: 'Research', label: 'งานวิจัย' },
  { key: 'Academic Services', label: 'งานบริการวิชาการ' },
  { key: 'Biz-Lab', label: 'งานโครงการ Biz-Lab' }
];

const initialFiscalYears: string[] = [
  '2567',
  '2566',
  '2565'
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>(initialEntrepreneurs);
  const [projects, setProjects] = useState<Project[]>(allProjects);
  const [courses, setCourses] = useState<Course[]>(allCourses);
  const [consultants, setConsultants] = useState<Consultant[]>(allConsultants);
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [establishmentTypes, setEstablishmentTypes] = useState<string[]>(initialEstablishmentTypes);
  const [businessCategories, setBusinessCategories] = useState<string[]>(initialBusinessCategories);
  const [projectCategories, setProjectCategories] = useState<ProjectCategorySetting[]>(initialProjectCategories);
  const [fiscalYears, setFiscalYears] = useState<string[]>(initialFiscalYears);

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
      fiscalYears={fiscalYears}
      setFiscalYears={setFiscalYears}
    />
  );
};

export default App;