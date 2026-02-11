
export type Role = 'admin' | 'officer' | 'user';

export interface User {
  id: string;
  username: string;
  role: Role;
}

export interface UserAccount extends User {
  password?: string;
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

export type ProjectCategory = 'Research' | 'Academic Services' | 'Student Projects' | 'Lab Services';

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
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  instructor: string;
}

export interface Consultant {
  id: string;
  name: string;
  expertise: string[];
  contact: string;
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
}