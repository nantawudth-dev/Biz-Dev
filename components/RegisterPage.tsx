import React, { useState } from 'react';
import { UserCircleIcon } from './icons';

interface RegisterPageProps {
    email: string;
    onSubmit: (fullName: string) => Promise<void>;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ email, onSubmit }) => {
    const [fullName, setFullName] = useState('');
    const [acceptPdpa, setAcceptPdpa] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPdpaModal, setShowPdpaModal] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(fullName);
        } catch (error) {
            console.error('Registration failed:', error);
            setIsSubmitting(false); // Only re-enable if failed, on success it will unmount
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4 font-title relative overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-blue-300/30 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[20%] right-[10%] w-[25%] h-[25%] bg-cyan-300/30 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="w-full max-w-lg animate-fade-in relative z-10">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col p-10">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                            <UserCircleIcon className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">ลงทะเบียนผู้ใช้ใหม่</h2>
                        <p className="text-slate-500 font-light text-sm">
                            กรุณาระบุชื่อ-นามสกุลจริง เพื่อใช้ในการตรวจสอบสิทธิ์
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 ml-1">บัญชีอีเมล (Google Account)</label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl cursor-not-allowed font-body text-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 ml-1">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="เช่น นพพร ใจดี"
                                required
                                autoFocus
                                className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-800 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-body"
                            />
                        </div>

                        <div className="flex items-start gap-3 p-1">
                            <div className="flex items-center h-5">
                                <input
                                    id="pdpa"
                                    name="pdpa"
                                    type="checkbox"
                                    checked={acceptPdpa}
                                    onChange={(e) => setAcceptPdpa(e.target.checked)}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300 rounded cursor-pointer mt-0.5"
                                />
                            </div>
                            <div className="text-sm">
                                <label htmlFor="pdpa" className="font-light text-slate-600 cursor-pointer">
                                    ข้าพเจ้ายินยอมให้เก็บรวบรวมและใช้ข้อมูลส่วนบุคคลตาม
                                    <button
                                        type="button"
                                        onClick={() => setShowPdpaModal(true)}
                                        className="font-medium text-blue-600 hover:text-blue-500 ml-1 underline decoration-blue-300 underline-offset-2 focus:outline-none"
                                    >
                                        นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)
                                    </button>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!fullName.trim() || !acceptPdpa || isSubmitting}
                            className={`w-full py-4 rounded-xl font-semibold text-white shadow-md transition-all duration-300 transform 
                                ${isSubmitting || !fullName.trim() || !acceptPdpa
                                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 hover:from-blue-700 hover:via-cyan-600 hover:to-green-600 hover:-translate-y-0.5 hover:shadow-lg'}`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    กำลังบันทึกข้อมูล...
                                </span>
                            ) : (
                                'ยืนยันเพื่อขอสิทธิ์เข้าใช้งาน'
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* PDPA Modal */}
            {showPdpaModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 transition-opacity" aria-hidden="true" onClick={() => setShowPdpaModal(false)}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-xl leading-6 font-bold text-slate-900 mb-4" id="modal-title">
                                            นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA) สำหรับระบบ BIZ-DEV
                                        </h3>
                                        <div className="mt-2 text-sm text-slate-600 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                                            <p>
                                                <strong>1. ข้อมูลส่วนบุคคลที่เราจัดเก็บ (Data Collection)</strong><br />
                                                เมื่อผู้ใช้งานเข้าสู่ระบบและลงทะเบียน BIZ-DEV จะทำการจัดเก็บ รหัสผู้ใช้งาน (Auth ID), ที่อยู่อีเมล (Email Address), ชื่อ-นามสกุลจริง, และประวัติการเข้าชมระบบ
                                            </p>
                                            <p>
                                                <strong>2. วัตถุประสงค์ในการเก็บรวบรวม (Purpose of Processing)</strong><br />
                                                เพื่อการยืนยันตัวตนและรักษาความปลอดภัย, เพื่อการติดต่อสื่อสารและแจ้งเตือน, เพื่อการบริหารจัดการภายใน (กำหนด Role-based Access), และเพื่อการตรวจสอบย้อนหลัง ผ่าน Activity Logs
                                            </p>
                                            <p>
                                                <strong>3. ระยะเวลาในการเก็บรักษา (Data Retention)</strong><br />
                                                บัญชีของคุณจะถูกเก็บรักษาไว้ตลอดระยะเวลาที่มีสถานะ Active ระบบจะมีการลบข้อมูลกิจกรรม (Logs) ที่เก่ากว่า 90 วันอัตโนมัติ เพื่อลดการกักเก็บข้อมูลที่ไม่จำเป็น
                                            </p>
                                            <p>
                                                <strong>4. สิทธิของเจ้าของข้อมูล (Data Subject Rights)</strong><br />
                                                ผู้ใช้งานมีสิทธิขอเข้าถึง ดู แก้ไข ระงับการใช้ หรือขอลบข้อมูลตนเองได้ โดยการแจ้งประสานงานไปยังผู้ดูแลระบบ (Admin)
                                            </p>
                                            <p>
                                                <strong>5. การรักษาความมั่นคงปลอดภัย (Data Security)</strong><br />
                                                ข้อมูลถูกเข้ารหัสและรักษาความปลอดภัยบนฐานข้อมูลมาตรฐาน และใช้การสวมรอยผ่าน OAuth 2.0 (Google Auth) เพื่อลดความเสี่ยง
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-200">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-2.5 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                                    onClick={() => {
                                        setAcceptPdpa(true);
                                        setShowPdpaModal(false);
                                    }}
                                >
                                    ฉันเข้าใจและยอมรับเงื่อนไข
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-6 py-2.5 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                                    onClick={() => setShowPdpaModal(false)}
                                >
                                    ปิดหน้านี้
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.1); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 8s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default RegisterPage;
