
export type Role = 'admin' | 'officer' | 'user';

export interface User {
  id: string;
  username: string;
  role: Role;
}

export interface UserAccount extends User {
  email: string;
  isActive: boolean;
}

export interface Entrepreneur {
  id: string;
  businessName: string; // ชื่อสถานประกอบการ
  establishmentType: string; // ประเภทของสถานประกอบการ
  businessCategory: string; // หมวดธุรกิจ
  name: string;         // ชื่อผู้ติดต่อ
  address: string;      // ที่อยู่
  contact: string;      // เบอร์โทร
  lineId: string;       // Line ID
  facebook: string;     // Facebook
  nickname?: string;    // ชื่อเล่น (Optional)
}

export type ProjectCategory = 'Consulting' | 'Research' | 'Academic Services' | 'Biz-Lab';

export interface Project {
  id: string;
  name: string;
  description: string;
  entrepreneur: string; // ชื่อผู้ประกอบการ (Text Input)
  status: 'Completed' | 'In Progress' | 'Planned';
  category: ProjectCategory;
  projectLeader: string; // หัวหน้าโครงการ
  coProjectLeader?: string; // ผู้ร่วมดำเนินการ (Optional)
  outcome?: string;
  budget: number; // งบประมาณ
  fiscalYear?: string; // ปีงบประมาณ
  completeReportLink?: string; // ลิงก์รายงานฉบับสมบูรณ์
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  instructor: string;
  syllabusLink?: string; // ลิงก์หลักสูตร
  contactPhone?: string; // เบอร์โทรศัพท์ติดต่อ
  contactEmail?: string; // อีเมลติดต่อ
}

export interface Consultant {
  id: string;
  name: string;
  expertise: string[];
  contact: string;
  phone?: string;
  workplace?: string;
}

export enum ViewType {
  Dashboard = 'dashboard',
  Entrepreneurs = 'entrepreneurs',
  Projects = 'projects',
  BizProjects = 'biz-projects',
  Courses = 'courses',
  Consultants = 'consultants',
  UserManagement = 'user-management',
  Settings = 'settings',
  AIAnalysis = 'ai-analysis',
}