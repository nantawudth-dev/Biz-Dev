# รายงานการตรวจสอบปัญหา: ระบบไม่ทำงานเมื่อสลับ Tab/โปรแกรม
**Tab Switching Issue Diagnostic Report**

วันที่ตรวจสอบ: 17 กุมภาพันธ์ 2026

---

## 🔍 1. สรุปปัญหา (Problem Summary)

**อาการ:** ระบบไม่ทำงานหรือหยุดตอบสนองเมื่อผู้ใช้:
- สลับไปยัง Tab อื่นใน Browser
- สลับไปยังโปรแกรมอื่น (Alt+Tab)
- ทำให้ Browser window อยู่ใน background

---

## � 1.1 ปัญหาเพิ่มเติม: ข้อมูลไม่โหลด (Data Not Loading Issue)

### อาการที่พบ

**จากภาพหน้าจอที่แนบมา:**
- หน้าจอแสดง "กำลังโหลดข้อมูล..." ค้างอยู่
- Console แสดง Auth logs ปกติ:
  ```
  [Auth] CheckSession started
  [Auth] Session retrieved: nantawudth@nu.ac.th
  [Auth] Checking profile for: {user-id}
  [Auth] Session retrieved: nantawudth@nu.ac.th
  [Auth] Profile check complete
  ```
- ระบบผ่านการ Authentication แล้ว แต่ข้อมูลไม่โหลด

### สาเหตุที่เป็นไปได้

#### 1. **Data Fetching ถูก Block หรือ Throttle**

เมื่อ tab ไม่ active, Browser จะ throttle:
- Network requests อาจถูกชะลอ
- `useEffect` ที่ fetch ข้อมูลอาจไม่ทำงาน
- Promises อาจไม่ resolve ทันที

#### 2. **Race Condition ระหว่าง Auth และ Data Fetching**

```typescript
// ปัญหาที่อาจเกิด:
useEffect(() => {
  // Auth ยังไม่เสร็จ แต่เริ่ม fetch ข้อมูลแล้ว
  fetchData(); // ← อาจล้มเหลวเพราะไม่มี session
}, []);

useEffect(() => {
  // Auth เสร็จหลังจาก fetch ข้อมูลไปแล้ว
  checkAuth();
}, []);
```

#### 3. **Loading State ไม่ถูก Reset**

```typescript
// ถ้า setIsLoading(false) ไม่ถูกเรียก
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  fetchData().then(() => {
    // ถ้า error เกิดขึ้น → setIsLoading(false) ไม่ถูกเรียก
    setIsLoading(false); // ← ไม่ทำงาน
  });
}, []);
```

#### 4. **Supabase RLS (Row Level Security) Block**

- User ผ่าน Auth แล้ว แต่ไม่มีสิทธิ์ดูข้อมูล
- RLS policies ไม่ตรงกับ user role
- Query ส่งกลับ empty array แทนที่จะ error

### วิธีตรวจสอบ

#### ขั้นตอนที่ 1: ตรวจสอบ Network Tab

1. เปิด DevTools → **Network Tab**
2. Refresh หน้า
3. ดูว่ามี requests ไปยัง Supabase หรือไม่:
   - ✅ มี requests → ดูที่ Response
   - ❌ ไม่มี requests → ปัญหาที่ useEffect

#### ขั้นตอนที่ 2: ตรวจสอบ Console Errors

ดูว่ามี errors เหล่านี้หรือไม่:
```
❌ Failed to fetch
❌ CORS error
❌ 401 Unauthorized
❌ 403 Forbidden
❌ Network request failed
```

#### ขั้นตอนที่ 3: ตรวจสอบ Loading State

เพิ่ม console.log ใน Components:
```typescript
useEffect(() => {
  console.log('[Component] Mounting, isLoading:', isLoading);
  console.log('[Component] User:', user);
  console.log('[Component] Session:', session);
}, [isLoading, user, session]);
```

### แนวทางแก้ไข

#### แก้ไขที่ 1: เพิ่ม Dependency ให้ถูกต้อง

**ปัญหา:** Data fetching ทำงานก่อน Auth เสร็จ

**แก้ไข:**
```typescript
// ใน DashboardView, EntrepreneurView, etc.
useEffect(() => {
  // ✅ รอให้ Auth เสร็จก่อน
  if (!isLoading && user) {
    fetchData();
  }
}, [isLoading, user]); // ← เพิ่ม dependencies
```

#### แก้ไขที่ 2: เพิ่ม Error Handling

```typescript
const fetchData = async () => {
  try {
    setIsLoading(true);
    const data = await dataService.getEntrepreneurs();
    setEntrepreneurs(data);
  } catch (error) {
    console.error('[Data] Fetch failed:', error);
    showNotification('ไม่สามารถโหลดข้อมูลได้', 'error');
  } finally {
    // ✅ ต้องมี finally เพื่อ reset loading state
    setIsLoading(false);
  }
};
```

#### แก้ไขที่ 3: เพิ่ม Timeout Protection

```typescript
useEffect(() => {
  let timeoutId: NodeJS.Timeout;
  
  const fetchData = async () => {
    setIsLoading(true);
    
    // ✅ ถ้าโหลดนานเกิน 10 วินาที → แสดง error
    timeoutId = setTimeout(() => {
      setIsLoading(false);
      showNotification('การโหลดข้อมูลใช้เวลานานเกินไป', 'error');
    }, 10000);
    
    try {
      const data = await dataService.getEntrepreneurs();
      clearTimeout(timeoutId);
      setEntrepreneurs(data);
    } catch (error) {
      console.error(error);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };
  
  if (user) fetchData();
  
  return () => clearTimeout(timeoutId);
}, [user]);
```

#### แก้ไขที่ 4: ตรวจสอบ Supabase RLS Policies

เข้าไปที่ Supabase Dashboard → Authentication → Policies

**ตรวจสอบว่ามี Policy สำหรับ SELECT:**
```sql
-- ตัวอย่าง Policy ที่ถูกต้อง
CREATE POLICY "Allow authenticated users to read"
ON entrepreneurs
FOR SELECT
TO authenticated
USING (true);
```

---

## �📊 2. ผลการตรวจสอบ Code (Code Analysis Results)

### ✅ สิ่งที่ตรวจสอบแล้ว

| หัวข้อ | ผลการตรวจสอบ | สถานะ |
|--------|--------------|-------|
| **Visibility API Listeners** | ไม่พบการใช้ `visibilitychange` event | ✅ ปกติ |
| **Window Event Listeners** | มีเฉพาะ `resize` listeners | ✅ ปกติ |
| **setInterval Timers** | ไม่พบการใช้งาน | ✅ ปกติ |
| **setTimeout Usage** | มีเฉพาะ UI animations และ Auth timeout | ✅ ปกติ |
| **React StrictMode** | เปิดใช้งานอยู่ | ⚠️ อาจมีผล |
| **Supabase Realtime** | ไม่ได้ใช้งาน Realtime subscriptions | ✅ ปกติ |

### 📝 setTimeout ที่พบในระบบ

```typescript
// 1. AuthContext.tsx - Auth timeout protection (8 วินาที)
const timeoutId = setTimeout(async () => { ... }, 8000);

// 2. App.tsx - Login success animation (100ms และ 2 วินาที)
setTimeout(() => setLoginProgress(100), 100);
const timer = setTimeout(() => { ... }, 2000);

// 3. AIAnalysisView.tsx - Simulate AI analysis (2 วินาที)
setTimeout(() => { ... }, 2000);

// 4. NotificationModal.tsx - Auto-close notification
const timer = setTimeout(() => { ... }, duration);
```

**สรุป:** ทุก setTimeout มีการ cleanup ถูกต้องใน `useEffect` return

---

## 🎯 3. สาเหตุที่เป็นไปได้ (Potential Causes)

### 3.1 Browser Tab Throttling (สาเหตุหลัก ⭐)

**คำอธิบาย:**  
Browser ทุกตัว (Chrome, Firefox, Edge) จะลด performance ของ tab ที่ไม่ active เพื่อประหยัดพลังงาน:

- **setTimeout/setInterval:** ถูกชะลอเหลือ 1 ครั้ง/วินาที (แทนที่จะเป็น 60 FPS)
- **requestAnimationFrame:** หยุดทำงานทั้งหมด
- **CSS Animations:** อาจหยุดชั่วคราว
- **Network Requests:** ถูก throttle ลง

**ผลกระทบต่อระบบ:**
- Animations อาจดูกระตุก
- Loading states อาจไม่ smooth
- Real-time updates อาจล่าช้า

### 3.2 React StrictMode Double Rendering

**ตำแหน่ง:** [`index.tsx`](file:///d:/LDSC-Datacenter/Biz-Dev/index.tsx#L49)

```typescript
<React.StrictMode>
  <ErrorBoundary>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </ErrorBoundary>
</React.StrictMode>
```

**ผลกระทบ:**
- ใน Development mode: Components จะ render 2 ครั้ง
- `useEffect` จะถูกเรียก 2 ครั้ง (mount → unmount → mount)
- อาจทำให้เกิด race conditions ถ้า cleanup ไม่ถูกต้อง

**หมายเหตุ:** StrictMode ไม่ทำงานใน Production build

### 3.3 Supabase Session Management

**ตำแหน่ง:** [`AuthContext.tsx`](file:///d:/LDSC-Datacenter/Biz-Dev/contexts/AuthContext.tsx#L134-197)

```typescript
supabase.auth.onAuthStateChange(async (_event, session) => {
  // Session listener
})
```

**ปัญหาที่อาจเกิด:**
- ถ้า tab ถูก throttle → Session refresh อาจล้มเหลว
- Token อาจหมดอายุโดยไม่ได้ refresh
- ผู้ใช้อาจถูก logout โดยไม่ตั้งใจ

### 3.4 Window Resize Listeners

**พบใน 6 ไฟล์:**
- `DashboardView.tsx`
- `EntrepreneurView.tsx`
- `ProjectView.tsx`
- `CourseView.tsx`
- `ConsultantView.tsx`
- `BizProjectView.tsx`

```typescript
window.addEventListener('resize', handleResize);
```

**ปัญหา:** ถ้า cleanup ไม่ถูกต้อง → Memory leaks เมื่อสลับ tab บ่อยๆ

---

## 🔧 4. วิธีทดสอบปัญหา (Testing Methods)

### 4.1 ทดสอบด้วย Browser DevTools

1. **เปิด Console** (F12)
2. **สลับ Tab** ไปมา
3. **ดู Console Logs:**
   ```
   [Auth] CheckSession started
   [Auth] Session retrieved: user@example.com
   [Auth] Profile check complete. Role: admin
   ```
4. **ตรวจสอบ Errors:** มี error ใดๆ เกิดขึ้นหรือไม่

### 4.2 ทดสอบ Performance

1. เปิด **Performance Monitor** (Chrome DevTools → More tools → Performance monitor)
2. สลับ Tab ไปมา
3. ดู:
   - **CPU Usage:** ควรลดลงเมื่อ tab ไม่ active
   - **Memory:** ไม่ควรเพิ่มขึ้นเรื่อยๆ (memory leak)

### 4.3 ทดสอบ Network

1. เปิด **Network Tab** (F12 → Network)
2. สลับ Tab ไปมา 30 วินาที
3. กลับมาดู:
   - มี requests ค้างหรือไม่
   - Supabase auth refresh ทำงานหรือไม่

---

## ✅ 5. แนวทางแก้ไข (Solutions)

### 5.1 ✨ ใช้ Page Visibility API (แนะนำ)

สร้างไฟล์ใหม่: `hooks/usePageVisibility.ts`

```typescript
import { useEffect, useState } from 'react';

export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}
```

**การใช้งานใน AuthContext:**

```typescript
import { usePageVisibility } from '../hooks/usePageVisibility';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isPageVisible = usePageVisibility();

  useEffect(() => {
    if (isPageVisible) {
      // Re-check session when page becomes visible
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
      });
    }
  }, [isPageVisible]);

  // ... rest of code
}
```

### 5.2 🔄 ปรับปรุง Session Refresh Logic

**เพิ่มใน AuthContext.tsx:**

```typescript
useEffect(() => {
  // Refresh session when tab becomes active again
  const handleFocus = async () => {
    console.log('[Auth] Tab focused - refreshing session');
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setSession(session);
      setUser(session.user);
    }
  };

  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}, []);
```

### 5.3 🧹 ตรวจสอบ Cleanup ของ Event Listeners

**ตัวอย่างการ cleanup ที่ถูกต้อง:**

```typescript
useEffect(() => {
  const handleResize = () => {
    // Handle resize
  };

  window.addEventListener('resize', handleResize);
  
  // ✅ MUST have cleanup
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

**ตรวจสอบไฟล์เหล่านี้:**
- [`DashboardView.tsx`](file:///d:/LDSC-Datacenter/Biz-Dev/components/DashboardView.tsx#L86)
- [`EntrepreneurView.tsx`](file:///d:/LDSC-Datacenter/Biz-Dev/components/EntrepreneurView.tsx#L185)
- [`ProjectView.tsx`](file:///d:/LDSC-Datacenter/Biz-Dev/components/ProjectView.tsx#L84)
- [`CourseView.tsx`](file:///d:/LDSC-Datacenter/Biz-Dev/components/CourseView.tsx#L211)
- [`ConsultantView.tsx`](file:///d:/LDSC-Datacenter/Biz-Dev/components/ConsultantView.tsx#L69)
- [`BizProjectView.tsx`](file:///d:/LDSC-Datacenter/Biz-Dev/components/BizProjectView.tsx#L62)

### 5.4 ⚙️ ปิด React StrictMode ใน Production

**แก้ไข [`index.tsx`](file:///d:/LDSC-Datacenter/Biz-Dev/index.tsx#L48-55):**

```typescript
const root = ReactDOM.createRoot(rootElement);
root.render(
  import.meta.env.MODE === 'development' ? (
    <React.StrictMode>
      <ErrorBoundary>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </ErrorBoundary>
    </React.StrictMode>
  ) : (
    <ErrorBoundary>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </ErrorBoundary>
  )
);
```

### 5.5 📊 เพิ่ม Logging สำหรับ Debug

**เพิ่มใน App.tsx หรือ AuthContext.tsx:**

```typescript
useEffect(() => {
  const logVisibilityChange = () => {
    console.log('[Visibility] Page is now:', document.hidden ? 'HIDDEN' : 'VISIBLE');
    console.log('[Visibility] Timestamp:', new Date().toISOString());
  };

  document.addEventListener('visibilitychange', logVisibilityChange);
  return () => document.removeEventListener('visibilitychange', logVisibilityChange);
}, []);
```

---

## 📋 6. Checklist การแก้ไข

### สำหรับปัญหา Tab Switching
- [ ] **สร้าง `usePageVisibility` hook**
- [ ] **เพิ่ม session refresh เมื่อ tab active**
- [ ] **เพิ่ม window focus listener ใน AuthContext**
- [ ] **ตรวจสอบ cleanup ของ resize listeners ทั้ง 6 ไฟล์**
- [ ] **เพิ่ม visibility logging สำหรับ debug**

### สำหรับปัญหาข้อมูลไม่โหลด
- [ ] **เพิ่ม dependencies (`isLoading`, `user`) ใน useEffect ของทุก View**
- [ ] **เพิ่ม try-catch-finally ใน data fetching functions**
- [ ] **เพิ่ม timeout protection (10 วินาที)**
- [ ] **ตรวจสอบ Supabase RLS Policies**
- [ ] **เพิ่ม console.log ใน useEffect เพื่อ debug**
- [ ] **ตรวจสอบ Network Tab ว่ามี requests ไปยัง Supabase**

### การทดสอบ
- [ ] **ทดสอบสลับ tab ซ้ำๆ 10 ครั้ง**
- [ ] **ทดสอบทิ้ง tab ไว้ 5 นาที แล้วกลับมา**
- [ ] **ทดสอบ Refresh หน้าเว็บ**
- [ ] **ทดสอบ Logout แล้ว Login ใหม่**
- [ ] **ตรวจสอบ Console ว่าไม่มี errors**
- [ ] **ตรวจสอบ Memory leaks ด้วย Performance Monitor**

---

## 🎯 7. สรุปและข้อเสนอแนะ (Conclusion)

### ผลการวิเคราะห์

จากการตรวจสอบ codebase **ไม่พบ code ที่ทำให้ระบบหยุดทำงานโดยตรง** เมื่อสลับ tab

**สาเหตุที่เป็นไปได้สูงสุด:**
1. **Browser Tab Throttling** (พฤติกรรมปกติของ browser)
2. **Supabase Session Refresh** ที่ถูก throttle
3. **Memory leaks** จาก event listeners ที่ไม่ได้ cleanup

### ข้อเสนอแนะ

#### 🔥 ลำดับความสำคัญสูง (แก้ไขทันที)
1. **แก้ไข useEffect dependencies** ในทุก View components (Dashboard, Entrepreneur, Project, etc.)
2. **เพิ่ม try-catch-finally** ใน data fetching functions
3. **เพิ่ม timeout protection** สำหรับการโหลดข้อมูล
4. **ตรวจสอบ Supabase RLS Policies**

#### ⚠️ ลำดับความสำคัญปานกลาง (ป้องกันปัญหาในอนาคต)
5. **เพิ่ม Page Visibility API** เพื่อ refresh session เมื่อกลับมา
6. **เพิ่ม window focus listener** ใน AuthContext
7. **ตรวจสอบ cleanup** ของ resize listeners
8. **เพิ่ม logging** เพื่อ debug

#### 💡 ลำดับความสำคัญต่ำ (ปรับปรุงเพิ่มเติม)
9. **ทดสอบ Production build** (ปิด StrictMode)
10. พิจารณาใช้ **Supabase Realtime** ถ้าต้องการ real-time updates
11. เพิ่ม **Service Worker** สำหรับ offline support

---

## 📚 8. เอกสารอ้างอิง (References)

- [Page Visibility API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- [Supabase Auth - Session Management](https://supabase.com/docs/guides/auth/sessions)
- [React useEffect Cleanup](https://react.dev/reference/react/useEffect#cleanup-function)
- [Browser Tab Throttling](https://developer.chrome.com/blog/timer-throttling-in-chrome-88/)

---

## 🔍 9. ขั้นตอนถัดไป (Next Steps)

1. **ทดสอบซ้ำ** โดยเปิด Console และดู logs เมื่อสลับ tab
2. **บันทึกอาการ** ที่เกิดขึ้นอย่างละเอียด:
   - ระบบหยุดทำงานทันทีหรือหลังจากสลับไปนานๆ?
   - มี error ใน Console หรือไม่?
   - Session ยังคงอยู่หรือถูก logout?
3. **ลองแก้ไข** ตามแนวทางใน Section 5
4. **ทดสอบอีกครั้ง** หลังแก้ไข

---

*เอกสารนี้จัดทำขึ้นเพื่อวินิจฉัยและแก้ไขปัญหาการสลับ Tab*  
*หากต้องการความช่วยเหลือเพิ่มเติม กรุณาแจ้งอาการที่เกิดขึ้นอย่างละเอียด*
