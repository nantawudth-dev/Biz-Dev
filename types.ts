
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
  contact: string;      // เบอร์โทร (Legacy, mapped to phone)
  phone?: string;       // เบอร์โทร (New field)
  lineId: string;       // Line ID
  facebook: string;     // Facebook
  nickname?: string;    // ชื่อเล่น (Optional)
  position?: string;   // ตำแหน่ง (Optional)
}

export type ProjectCategory = 'Consulting' | 'Research' | 'Academic Services' | 'Biz-Lab';

export interface ProjectCategorySetting {
  key: ProjectCategory;
  label: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  entrepreneur: string; // ชื่อผู้ประกอบการ (Text Input)
  entrepreneurId?: string; // ID for linking with Entrepreneurs table
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
  title: string;
  firstName: string;
  lastName: string;
  expertise: string; // Changed to string (previously string[])
  phone: string;
  workplace: string;
  email?: string;
  imageUrl?: string;
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