# แผนการพัฒนาระบบ Biz-Dev (Development Roadmap)

เอกสารฉบับนี้สรุปขั้นตอนการพัฒนาทั้งหมดเพื่อเปลี่ยนจากระบบ Mock Data ให้เป็นระบบที่ใช้งานได้จริง เชื่อมต่อกับฐานข้อมูล Supabase และเพิ่มประสิทธิภาพของ Architecture

## ระยะที่ 1: การวางโครงสร้างและเชื่อมต่อฐานข้อมูล (Infrastructure & Setup)
**เป้าหมาย:** ให้แอปพลิเคชันเชื่อมต่อกับ Supabase ได้อย่างสมบูรณ์ และจัดการสิทธิ์การเข้าถึงเบื้องต้น

1.  **ติดตั้งและตั้งค่า Supabase**
    - [ ] ติดตั้ง `supabase-js` client library
    - [ ] สร้างไฟล์ `.env.local` เพื่อใส่ `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY`
    - [ ] สร้างไฟล์ `services/supabaseClient.ts` เพื่อจัดการ instance ของการเชื่อมต่อ
    - [ ] ออกแบบ Schema ของฐานข้อมูล (Tables: `entrepreneurs`, `projects`, `consultants`, `users`)

2.  **ระบบยืนยันตัวตน (Authentication)**
    - [ ] เปลี่ยนหน้า Login ให้ใช้ Supabase Auth (Google OAuth)
    - [ ] สร้าง `AuthContext` เพื่อจัดการ session ของผู้ใช้งานจริง
    - [ ] แยกสิทธิ์การเข้าถึง (Admin/Officer/User) โดยตรวจสอบ Domain หรือ Email list

## ระยะที่ 2: การเชื่อมต่อข้อมูลหลัก (Data Integration)
**เป้าหมาย:** เลิกใช้ Mock Data และเปลี่ยนไปใช้ข้อมูลจริงจากฐานข้อมูลในทุกหน้าหลัก

1.  **บริการจัดการข้อมูล (Data Services)**
    - [ ] สร้าง Service files สำหรับแต่ละ Entity:
        - `services/entrepreneurService.ts`
        - `services/projectService.ts`
        - `services/consultantService.ts`
    - [ ] ย้าย Logic การ Query, Insert, Update, Delete ไปไว้ใน Service เหล่านี้

2.  **เชื่อมต่อหน้าจอต่างๆ (Connect Views)**
    - [ ] **หน้าผู้ประกอบการ (EntrepreneurView):** ดึงข้อมูล, เพิ่ม, แก้ไข, ลบ ผ่าน Service
    - [ ] **หน้าโครงการ (ProjectView):** แสดงรายการโครงการ, กรองข้อมูล
    - [ ] **หน้าผู้เชี่ยวชาญ (ConsultantView):** จัดการฐานข้อมูลผู้เชี่ยวชาญ
    - [ ] **หน้า Courses & Dashboard:** เชื่อมต่อข้อมูลสรุปผล

## ระยะที่ 3: ปรับปรุงโครงสร้างสถาปัตยกรรม (Architecture Refactoring)
**เป้าหมาย:** ทำให้โค้ดดูแลง่าย มีประสิทธิภาพ และรองรับการขยายตัว

1.  **ปรับปรุงระบบ Routing**
    - [ ] ติดตั้ง `react-router-dom`
    - [ ] เปลี่ยนจาก State-based Routing (`activeView`) เป็น URL-based Routing (เช่น `/entrepreneurs`, `/projects/123`)
    - [ ] สร้าง Layout Component ที่ชัดเจน (Sidebar, Navbar) ที่ไม่ผูกติดกับ State

2.  **การจัดการ State ขั้นสูง**
    - [ ] นำ `TanStack Query (React Query)` มาใช้จัดการ Server State (Caching, Loading state, Error handling) เพื่อลดความซับซ้อนใน `useEffect`
    - [ ] ใช้ `Context API` สำหรับ Global State ที่จำเป็นจริงๆ (เช่น User Session, Theme)

## ระยะที่ 4: การเก็บรายละเอียดและพัฒนาฟีเจอร์ (Polish & Features)
**เป้าหมาย:** ตรวจสอบความเรียบร้อยและเตรียมพร้อมใช้งานจริง

1.  **UI/UX Improvements**
    - [ ] เพิ่ม Loading Spinners และ Error Messages ที่ชัดเจนในทุกจุดที่มีการโหลดข้อมูล
    - [ ] ปรับปรุง Form Validation ให้แจ้งเตือนก่อนส่งข้อมูล
    - [ ] ตรวจสอบความถูกต้องของการแสดงผลบนมือถือ (Responsive Design)

2.  **ความปลอดภัย (Security)**
    - [ ] ตั้งค่า Row Level Security (RLS) ใน Supabase เพื่อป้องกันไม่ให้ User ทั่วไปแก้ไขข้อมูลสำคัญ
    - [ ] ตรวจสอบสิทธิ์ในฝั่ง Frontend อีกครั้งก่อนแสดงปุ่ม Edit/Delete

## สรุป
แผนงานนี้จะเปลี่ยน Biz-Dev จาก "โปรแกรมสาธิต" ให้เป็น "ระบบงานจริง" ที่มีความปลอดภัย จัดการข้อมูลได้ถูกต้อง และโค้ดมีคุณภาพมาตรฐานสากล โดยเริ่มจาก **ระยะที่ 1** ทันทีหลังจากได้รับอนุมัติ
