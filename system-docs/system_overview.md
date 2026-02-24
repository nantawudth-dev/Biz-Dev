# 📘 เอกสารสรุประบบ BIZ System (System Overview)

> **ปรับปรุงล่าสุด**: 2026-02-24 | **เวอร์ชัน**: `0bdc501` | **Deploy**: Vercel

---

## 1. ข้อมูลทั่วไป (General Information)

| รายการ | รายละเอียด |
| :--- | :--- |
| **ชื่อระบบ** | BIZ System (biz-system) |
| **วัตถุประสงค์** | ระบบจัดการข้อมูลธุรกิจ ผู้ประกอบการ โครงการ หลักสูตรอบรม และที่ปรึกษา สำหรับศูนย์พัฒนาธุรกิจ (LDSC) |
| **ภาษาหลัก** | TypeScript + React |
| **UI** | Tailwind CSS (CDN) + Google Fonts (Kanit, Sarabun) |
| **Backend/DB** | Supabase (PostgreSQL + Auth + RLS) |
| **AI Features** | Google Gemini API (@google/genai) |
| **Charts** | Recharts |
| **Build Tool** | Vite 6.x |
| **Hosting** | Vercel |
| **Port (Dev)** | 3000 |

---

## 2. Tech Stack & Dependencies

### Production Dependencies
| Package | เวอร์ชัน | หน้าที่ |
| :--- | :--- | :--- |
| `react` / `react-dom` | ^19.2.4 | UI Framework |
| `@supabase/supabase-js` | ^2.95.3 | Database, Auth, RLS |
| `@google/genai` | latest | AI Analysis (Gemini) |
| `recharts` | ^3.7.0 | Dashboard Charts |

### Dev Dependencies
| Package | เวอร์ชัน | หน้าที่ |
| :--- | :--- | :--- |
| `vite` | ^6.2.0 | Build Tool & Dev Server |
| `@vitejs/plugin-react` | ^5.0.0 | React HMR/Transform |
| `typescript` | ~5.8.2 | Type Checking |
| `@types/node` | ^22.14.0 | Node.js Types |

### Build Optimization (Chunk Splitting)
```
vendor-react     → react, react-dom
vendor-supabase  → @supabase/supabase-js
vendor-charts    → recharts
```

---

## 3. โครงสร้างโปรเจกต์ (Project Structure)

```
Biz-Dev/
├── index.html              # Entry HTML + Tailwind Config + Import Map
├── index.tsx               # React DOM Root + Providers
├── App.tsx                 # Main App: Layout, Routing, Idle Timeout
├── types.ts                # TypeScript Types & Interfaces
├── constants.ts            # Project Category Constants
├── vite.config.ts          # Vite + Chunk Splitting Config
├── vercel.json             # Vercel Deploy Config
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript Config
│
├── components/             # React Components (21 files)
│   ├── LoginPage.tsx           # หน้า Login (Google OAuth)
│   ├── AdminLayout.tsx         # Layout สำหรับ Admin
│   ├── Sidebar.tsx             # เมนูด้านซ้าย + Role-based
│   ├── Header.tsx              # Header ด้านบน
│   ├── DashboardView.tsx       # ภาพรวมระบบ (Dashboard)
│   ├── DashboardCharts.tsx     # กราฟ Dashboard (Recharts)
│   ├── EntrepreneurView.tsx    # จัดการผู้ประกอบการ
│   ├── ProjectView.tsx         # จัดการโครงการ
│   ├── BizProjectView.tsx      # ผลสัมฤทธิ์โครงการ
│   ├── CourseView.tsx          # จัดการหลักสูตร
│   ├── ConsultantView.tsx      # จัดการที่ปรึกษา
│   ├── AIAnalysisView.tsx      # AI วิเคราะห์ปัญหาธุรกิจ
│   ├── UserManagementView.tsx  # จัดการผู้ใช้งาน (Admin)
│   ├── SettingsView.tsx        # ตั้งค่าระบบ + Master Data
│   ├── ActivityLogView.tsx     # บันทึกกิจกรรม
│   ├── Modal.tsx               # Modal Component (Reusable)
│   ├── Pagination.tsx          # Pagination Component (Reusable)
│   ├── NotificationModal.tsx   # แจ้งเตือน Modal
│   ├── NotificationToast.tsx   # แจ้งเตือน Toast
│   ├── AccessDeniedModal.tsx   # Modal ปฏิเสธการเข้าถึง
│   └── icons.tsx               # SVG Icons Collection (40+)
│
├── contexts/               # React Contexts (3 files)
│   ├── AuthContext.tsx         # Authentication + Role + Session
│   ├── DataContext.tsx         # Centralized Data Cache
│   └── NotificationContext.tsx # Toast Notifications
│
├── services/               # Service Layer (2 files)
│   ├── supabaseClient.ts      # Supabase Client Instance
│   └── dataService.ts         # All CRUD Operations + Activity Logging
│
├── styles/                 # CSS Files
│   ├── scrollbar.css           # Custom Scrollbar Styles
│   └── mobile-table.css        # Mobile Responsive Table
│
├── system-docs/            # System Documentation
│   ├── git_history.md          # Version History
│   └── system_overview.md      # This File
│
└── public/                 # Static Assets
```

---

## 4. สถาปัตยกรรมระบบ (Architecture)

```
┌─────────────────────────────────────────────────────┐
│                    App (Root)                        │
│  ┌─────────────────────────────────────────────────┐│
│  │           NotificationProvider                  ││
│  │  ┌───────────────────────────────────────────┐  ││
│  │  │           AuthProvider                    │  ││
│  │  │  ┌─────────────────────────────────────┐  │  ││
│  │  │  │         DataProvider                │  │  ││
│  │  │  │  ┌───────────────────────────────┐  │  │  ││
│  │  │  │  │          MainApp             │  │  │  ││
│  │  │  │  │  ┌─────────┐  ┌───────────┐  │  │  │  ││
│  │  │  │  │  │ Sidebar │  │  Header   │  │  │  │  ││
│  │  │  │  │  └─────────┘  └───────────┘  │  │  │  ││
│  │  │  │  │  ┌─────────────────────────┐  │  │  │  ││
│  │  │  │  │  │     Active View         │  │  │  │  ││
│  │  │  │  │  │  (Dashboard/Projects/…) │  │  │  │  ││
│  │  │  │  │  └─────────────────────────┘  │  │  │  ││
│  │  │  │  └───────────────────────────────┘  │  │  ││
│  │  │  └─────────────────────────────────────┘  │  ││
│  │  └───────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
              │                           │
              ▼                           ▼
┌──────────────────────┐    ┌──────────────────────────┐
│    dataService.ts    │    │     Supabase Client       │
│  (CRUD + Logging)    │───▶│  (Auth + DB + RLS)       │
└──────────────────────┘    └──────────────────────────┘
                                      │
                              ┌───────┴────────┐
                              ▼                ▼
                     ┌──────────────┐  ┌─────────────┐
                     │  PostgreSQL  │  │  Supabase   │
                     │  (12 Tables) │  │    Auth     │
                     └──────────────┘  └─────────────┘
```

### Context Flow
| Context | หน้าที่ | ข้อมูลที่ให้ |
| :--- | :--- | :--- |
| **AuthContext** | จัดการ Authentication | `user`, `session`, `isAdmin`, `isOfficer`, `logout()` |
| **DataContext** | Centralized Cache | `fetchData()`, `invalidateCache()`, cached data |
| **NotificationContext** | Toast Messages | `showNotification(message, type)` |

---

## 5. ฐานข้อมูล (Database Schema)

### Supabase Project
| รายการ | ค่า |
| :--- | :--- |
| **Project ID** | `khlpaacfbnxuqthnmyik` |
| **Region** | `ap-southeast-1` (Singapore) |
| **Database Version** | PostgreSQL 17.6 |

### ตารางทั้งหมด (12 Tables)

> ทุกตารางเปิดใช้ **Row Level Security (RLS)**

#### 5.1 `profiles` — ข้อมูลผู้ใช้งาน
| Column | Type | Note |
| :--- | :--- | :--- |
| `id` | uuid (PK) | เชื่อมกับ auth.users |
| `username` | text | ชื่อผู้ใช้ |
| `email` | text | อีเมล |
| `role` | text | `admin` / `officer` / `user` |
| `avatar_url` | text | รูปโปรไฟล์ |
| `is_active` | boolean | สถานะใช้งาน |
| `created_at` | timestamptz | วันที่สร้าง |

#### 5.2 `entrepreneurs` — ผู้ประกอบการ
| Column | Type | Note |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `business_name` | text | ชื่อสถานประกอบการ |
| `establishment_type` | text | ประเภทสถานประกอบการ |
| `business_category` | text | หมวดธุรกิจ |
| `contact_name` | text | ชื่อผู้ติดต่อ |
| `address` | text | ที่อยู่ |
| `phone` | text | เบอร์โทร |
| `line_id` | text | Line ID |
| `facebook` | text | Facebook |
| `email` | text | อีเมล |
| `nickname` | text | ชื่อเล่น |
| `position` | text | ตำแหน่ง |
| `created_by` | uuid (FK → auth.users) | ผู้สร้าง |
| `created_at` | timestamptz | วันที่สร้าง |

#### 5.3 `projects` — โครงการ
| Column | Type | Note |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `name` | text | ชื่อโครงการ |
| `description` | text | รายละเอียด |
| `status` | text | `Completed` / `In Progress` / `Planned` |
| `category` | text | หมวดโครงการ |
| `project_leader` | text | หัวหน้าโครงการ |
| `co_project_leader` | text | ผู้ร่วมดำเนินการ |
| `budget` | numeric | งบประมาณ |
| `fiscal_year` | text | ปีงบประมาณ |
| `outcome` | text | ผลลัพธ์ |
| `complete_report_link` | text | ลิงก์รายงานฉบับสมบูรณ์ |
| `entrepreneur` | text | ชื่อผู้ประกอบการ (text) |
| `entrepreneur_id` | uuid (FK → entrepreneurs) | เชื่อมผู้ประกอบการ |
| `created_at` | timestamptz | วันที่สร้าง |

#### 5.4 `consultants` — ที่ปรึกษา
| Column | Type | Note |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `name` | text | ชื่อ-สกุล (พร้อมคำนำหน้า) |
| `expertise` | text[] | ความเชี่ยวชาญ |
| `contact_email` | text | อีเมล |
| `phone` | text | เบอร์โทร |
| `workplace` | text | สถานที่ทำงาน |
| `image_url` | text | รูปภาพ |
| `cv` | text | ประวัติย่อ (Text) สำหรับให้ AI วิเคราะห์ |
| `cv_url` | text | ลิงก์ไฟล์ CV ฉบับเต็ม |
| `created_at` | timestamptz | วันที่สร้าง |

#### 5.5 `courses` — หลักสูตรอบรม
| Column | Type | Note |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `title` | text | ชื่อหลักสูตร |
| `description` | text | รายละเอียด |
| `duration` | text | ระยะเวลา |
| `instructor` | text | วิทยากร |
| `syllabus_link` | text | ลิงก์หลักสูตร |
| `contact_phone` | text | เบอร์ติดต่อ |
| `contact_email` | text | อีเมลติดต่อ |
| `created_at` | timestamptz | วันที่สร้าง |

#### 5.6 `project_consultants` — ความสัมพันธ์โครงการ-ที่ปรึกษา
| Column | Type | Note |
| :--- | :--- | :--- |
| `project_id` | uuid (FK → projects) | |
| `consultant_id` | uuid (FK → consultants) | |

#### 5.7 `analysis_logs` — บันทึกการวิเคราะห์ AI
| Column | Type | Note |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `entrepreneur_id` | uuid (FK → entrepreneurs) | |
| `problem_description` | text | คำอธิบายปัญหา |
| `ai_analysis_result` | text | ผลวิเคราะห์จาก AI |
| `created_by` | uuid (FK → auth.users) | |
| `created_at` | timestamptz | |

#### 5.8 `ai_knowledge_base` — ชุดความรู้สำหรับ AI
| Column | Type | Note |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `category_id` | text | รหัสหมวดหมู่ปัญหา |
| `category_name_th` | text | ชื่อหมวดหมู่ปัญหา |
| `terms` | text[] | คำค้นที่เกี่ยวข้องกับหมวดหมู่ |
| `response` | text | คำตอบหรือแนวทางแก้ไข |
| `is_active` | boolean | สถานะการใช้งาน |
| `created_at` | timestamptz | |

#### 5.9 `establishment_types` — ประเภทสถานประกอบการ (Master Data)
| Column | Type | Note |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `name` | text | ชื่อประเภท |
| `is_active` | boolean | Soft Delete Flag |
| `created_at` | timestamptz | |

#### 5.10 `business_categories` — หมวดธุรกิจ (Master Data)
| Column | Type | Note |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `name` | text | ชื่อหมวด |
| `is_active` | boolean | Soft Delete Flag |
| `created_at` | timestamptz | |

#### 5.11 `fiscal_years` — ปีงบประมาณ (Master Data)
| Column | Type | Note |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `name` | text | ปีงบประมาณ |
| `is_active` | boolean | Soft Delete Flag |
| `created_at` | timestamptz | |

#### 5.12 `activity_logs` — บันทึกกิจกรรม
| Column | Type | Note |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `user_id` | uuid | ผู้ดำเนินการ |
| `user_email` | text | อีเมลผู้ดำเนินการ |
| `action` | text | `create` / `update` / `delete` |
| `entity_type` | text | ประเภทข้อมูลที่ดำเนินการ |
| `entity_id` | text | ID ของข้อมูล |
| `entity_name` | text | ชื่อข้อมูล |
| `details` | jsonb | รายละเอียดเพิ่มเติม |
| `created_at` | timestamptz | |

### Indexes
| ตาราง | Index | Columns |
| :--- | :--- | :--- |
| `activity_logs` | `idx_activity_logs_created_at` | `created_at DESC` |
| `activity_logs` | `idx_activity_logs_user_id` | `user_id` |
| `activity_logs` | `idx_activity_logs_entity_type` | `entity_type` |

### Foreign Key Relationships
```
profiles.id ──────── auth.users.id
entrepreneurs.created_by ──── auth.users.id
projects.entrepreneur_id ──── entrepreneurs.id
project_consultants ──── projects.id + consultants.id
analysis_logs.entrepreneur_id ──── entrepreneurs.id
analysis_logs.created_by ──── auth.users.id
```

---

## 6. ระบบ Authentication & Authorization

### Authentication (Supabase Auth)
- **Login**: Google OAuth (Google Sign-In)
- **Session**: จัดการผ่าน `AuthContext` ด้วย `onAuthStateChange()`
- **Idle Timeout**: ระบบตัดการเชื่อมต่ออัตโนมัติหลังไม่ใช้งาน 30 นาที (แจ้งเตือนที่ 28 นาที)

### Authorization (Role-Based)
| Role | ระดับ | สิทธิ์การเข้าถึง |
| :--- | :--- | :--- |
| `admin` | ผู้ดูแลระบบ | ทุกหน้า + จัดการผู้ใช้ + ตั้งค่า + AI วิเคราะห์ + บันทึกกิจกรรม |
| `officer` | เจ้าหน้าที่ | ทุกหน้าข้อมูล + AI วิเคราะห์ (ไม่เห็นจัดการผู้ใช้) |
| `user` | ผู้ใช้ทั่วไป | ดูข้อมูลอย่างเดียว (ถ้า is_active = false จะถูก deny) |

### Access Control Matrix
| หน้า | admin | officer | user |
| :--- | :---: | :---: | :---: |
| Dashboard | ✅ | ✅ | ✅ |
| ผู้ประกอบการ | ✅ CRUD | ✅ CRUD | ✅ View Only |
| โครงการ | ✅ CRUD | ✅ CRUD | ✅ View Only |
| ผลสัมฤทธิ์โครงการ | ✅ | ✅ | ✅ |
| หลักสูตร | ✅ CRUD | ✅ CRUD | ✅ View Only |
| ที่ปรึกษา | ✅ CRUD | ✅ CRUD | ✅ View Only |
| AI วิเคราะห์ | ✅ | ✅ | ❌ |
| จัดการผู้ใช้ | ✅ | ❌ | ❌ |
| ตั้งค่าระบบ | ✅ | ✅ | ✅ |
| บันทึกกิจกรรม | ✅ (RLS) | ❌ (RLS) | ❌ (RLS) |

---

## 7. หน้าจอของระบบ (Views & Features)

### 7.1 Dashboard (ภาพรวม)
- สรุปจำนวนข้อมูลทุกประเภท
- กราฟ Recharts สำหรับข้อมูลเชิงสถิติ
- Card-based Overview

### 7.2 ผู้ประกอบการ (Entrepreneurs)
- CRUD: เพิ่ม/ดู/แก้ไข/ลบ
- แสดงแบบ Card หรือ Table (สลับได้)
- ข้อมูล: ชื่อธุรกิจ, ประเภท, หมวด, ผู้ติดต่อ, ที่อยู่, โทร, Line, Facebook, E-mail, ชื่อเล่น, ตำแหน่ง

### 7.3 โครงการ (Projects)
- CRUD: เพิ่ม/ดู/แก้ไข/ลบ
- กรองตามหมวด (งานที่ปรึกษา, งานวิจัย, งานบริการวิชาการ, Biz-Lab)
- กรองตามสถานะ (Completed, In Progress, Planned)
- กรองตามปีงบประมาณ
- เชื่อมโยงกับผู้ประกอบการ
- ลิงก์รายงานฉบับสมบูรณ์

### 7.4 ผลสัมฤทธิ์โครงการ (Biz Projects)
- แสดงข้อมูลโครงการในรูปแบบ Card/List
- แสดงข้อมูลผลลัพธ์/ผลสัมฤทธิ์

### 7.5 หลักสูตรอบรม (Courses)
- CRUD: เพิ่ม/ดู/แก้ไข/ลบ
- ข้อมูล: ชื่อหลักสูตร, รายละเอียด, ระยะเวลา, วิทยากร, ลิงก์หลักสูตร, เบอร์/อีเมลติดต่อ

### 7.6 ที่ปรึกษา (Consultants)
- CRUD: เพิ่ม/ดู/แก้ไข/ลบ
- ข้อมูล: คำนำหน้า, ชื่อ-นามสกุล, ความเชี่ยวชาญ, สถานที่ทำงาน, เบอร์โทร, อีเมล

### 7.7 AI วิเคราะห์ (AI Analysis)
- เลือกผู้ประกอบการ → กรอกปัญหา → AI วิเคราะห์ผ่าน Google Gemini
- แสดงผลวิเคราะห์ และข้อเสนอแนะเชิงลึก โดยเลือก Mode ได้ 2 แบบ:
  - `Semantic LLM Integration`: วิเคราะห์โดยใช้ LLM ตาม Prompt แบบกว้างๆ พร้อมดึงข้อมูล CV ที่ปรึกษามาจับคู่แบบ Semantic
  - `Dynamic Knowledge Base`: นำเข้าชุดข้อมูลความรู้เพื่อใช้เป็นบริบทในการวิเคราะห์ปัญหาแบบเจาะจงเฉพาะกลุ่ม
- แนะนำที่ปรึกษาที่มีความเชี่ยวชาญตรงกัน (ดึงจาก CV Text หรือ Expertise)
- รองรับทั้ง Thai/English

### 7.8 จัดการผู้ใช้ (User Management) — Admin Only
- ดูรายชื่อผู้ใช้ทั้งหมด
- เพิ่ม/แก้ไข/ลบ ผู้ใช้
- เปลี่ยน role (admin/officer/user)
- เปิด/ปิดสถานะผู้ใช้
- ค้นหา + แบ่งหน้า

### 7.9 ตั้งค่าระบบ (Settings)
5 แท็บย่อย:
1. **จัดการผู้ใช้งาน** — เหมือน User Management
2. **ประเภทสถานประกอบการ** — CRUD + Search + Pagination
3. **หมวดธุรกิจ** — CRUD + Search + Pagination
4. **ปีงบประมาณ** — CRUD + Search + Pagination
5. **บันทึกกิจกรรม** — ตาราง Activity Logs + Filter/Search/Pagination (Admin Only)

---

## 8. ระบบบันทึกกิจกรรม (Activity Logging)

### หลักการทำงาน
- ทุกการดำเนินการ Create/Update/Delete ใน `dataService.ts` จะเรียก `logActivity()` อัตโนมัติ
- Logging เป็นแบบ fire-and-forget (ไม่บล็อค operation หลัก)
- ข้อมูลที่บันทึก: ใคร ทำอะไร กับข้อมูลอะไร เมื่อไหร่

### Entity Types ที่บันทึก (8 ประเภท)
| Entity Type | Label | ตัวอย่าง Entity Name |
| :--- | :--- | :--- |
| `entrepreneur` | ผู้ประกอบการ | ชื่อสถานประกอบการ |
| `project` | โครงการ | ชื่อโครงการ |
| `course` | หลักสูตร | ชื่อหลักสูตร |
| `consultant` | ที่ปรึกษา | ชื่อ-นามสกุล |
| `user` | ผู้ใช้งาน | username/email |
| `establishment_type` | ประเภทสถานประกอบการ | ชื่อประเภท |
| `business_category` | หมวดธุรกิจ | ชื่อหมวด |
| `fiscal_year` | ปีงบประมาณ | ชื่อปีงบ |

### RLS Policies
| Policy | Rule |
| :--- | :--- |
| Admin can read logs | `SELECT` — ต้องเป็น admin ในตาราง profiles |
| Authenticated can insert | `INSERT` — ผู้ใช้ทุกคนที่ login แล้ว |

---

## 9. Data Service Layer (`dataService.ts`)

### โครงสร้าง Functions

| กลุ่ม | Get | Create | Update | Delete |
| :--- | :--- | :--- | :--- | :--- |
| ผู้ประกอบการ | `getEntrepreneurs()` | `createEntrepreneur()` | `updateEntrepreneur()` | `deleteEntrepreneur()` |
| โครงการ | `getProjects()` | `createProject()` | `updateProject()` | `deleteProject()` |
| ที่ปรึกษา | `getConsultants()` | `createConsultant()` | `updateConsultant()` | `deleteConsultant()` |
| หลักสูตร | `getCourses()` | `createCourse()` | `updateCourse()` | `deleteCourse()` |
| ประเภทสถานประกอบการ | `getEstablishmentTypes()` | `createEstablishmentType()` | `updateEstablishmentType()` | `deleteEstablishmentType()` |
| หมวดธุรกิจ | `getBusinessCategories()` | `createBusinessCategory()` | `updateBusinessCategory()` | `deleteBusinessCategory()` |
| ปีงบประมาณ | `getFiscalYears()` | `createFiscalYear()` | `updateFiscalYear()` | `deleteFiscalYear()` |
| ผู้ใช้ | `getProfiles()` | `createProfile()` | `updateProfile()` | `deleteProfile()` |
| AI Knowledge Base | `getAiKnowledgeBase()` | `createAiKnowledgeBase()` | `updateAiKnowledgeBase()` | `deleteAiKnowledgeBase()` (Soft Delete) |
| Activity Log | `getActivityLogs()` | `logActivity()` | — | — |

> **หมายเหตุ**: Master Data (ประเภทสถานประกอบการ, หมวดธุรกิจ, ปีงบประมาณ) ใช้ **Soft Delete** (`is_active = false`)

---

## 10. การ Cache ข้อมูล (DataContext)

### กลไก
- ใช้ `DataContext` เป็น Centralized Cache Layer
- `fetchData(key, fetcher)` — ดึงข้อมูลจาก cache ก่อน ถ้าไม่มีจึงเรียก API
- `invalidateCache(key)` — ล้าง cache เมื่อมีการ create/update/delete
- ลดการเรียก API ซ้ำซ้อนเมื่อสลับหน้า ~80%

---

## 11. UI/UX Design System

### Typography
| ตัวแปร | Font | ใช้กับ |
| :--- | :--- | :--- |
| `font-title` | Kanit | หัวข้อ, ปุ่ม, Label |
| `font-body` / `font-sans` | Sarabun | เนื้อหา, ข้อความทั่วไป |

### Color Palette
| สี | Tailwind Class | ใช้กับ |
| :--- | :--- | :--- |
| Primary | `blue-600` | ปุ่มหลัก, Link |
| Accent | `emerald-500` | สถานะสำเร็จ |
| Warning | `amber-500` | แจ้งเตือน |
| Danger | `red-500` | ลบ, Error |
| Background | `slate-50` | พื้นหลังหลัก |

### Animations
| ชื่อ | ลักษณะ | ใช้กับ |
| :--- | :--- | :--- |
| `fade-in` | Opacity 0→1 (0.5s) | โหลดหน้าใหม่ |
| `scale-in` | Scale 0.95→1 + Opacity | Modal, Card |
| `progress-bar-fill` | Width 0→100% (2s) | Login Success |

### Reusable Components
| Component | หน้าที่ |
| :--- | :--- |
| `Modal` | Reusable Modal Wrapper |
| `Pagination` | แบ่งหน้า + เลือกจำนวนต่อหน้า |
| `NotificationToast` | Toast แจ้งเตือน |
| `icons.tsx` | SVG Icons (40+ icons) |

---

## 12. Environment Variables

```env
VITE_SUPABASE_URL=https://khlpaacfbnxuqthnmyik.supabase.co
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
VITE_GEMINI_API_KEY=<gemini-api-key>
```

---

## 13. คำสั่งพัฒนา (Development Commands)

```bash
# ติดตั้ง dependencies
npm install

# รัน development server (port 3000)
npm run dev

# ตรวจสอบ TypeScript errors
npx tsc --noEmit

# Build สำหรับ production
npm run build

# Preview production build
npm run preview

# Git workflow
git add .
git commit -m "message"
git push
```

---

## 14. Deployment (Vercel)

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- ทุก route จะ redirect ไปที่ `index.html` (SPA)
- Auto-deploy เมื่อ push ไป `main` branch
- Environment Variables ต้องตั้งค่าใน Vercel Dashboard

---

> [!NOTE]
> เอกสารนี้สรุปโครงสร้างและรายละเอียดทั้งหมดของระบบ BIZ System ปรับปรุงล่าสุด ณ วันที่ 2026-02-24
