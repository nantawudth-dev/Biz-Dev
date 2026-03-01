import React from 'react';
import { ClockIcon } from './icons';

interface AccessDeniedModalProps {
    onLogout: () => void;
}

const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({ onLogout }) => {
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

                {/* Centering spacer */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {/* Modal panel */}
                <div className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 sm:mx-0 sm:h-10 sm:w-10">
                                <ClockIcon className="h-6 w-6 text-amber-600" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
                                    อยู่ระหว่างการตรวจสอบ (Pending Approval)
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-slate-500">
                                        คุณได้สมัครสมาชิกสำเร็จแล้ว ขณะนี้ข้อมูลของคุณอยู่ระหว่างการตรวจสอบจากผู้ดูแลระบบ กรุณารอการอนุมัติสิทธิ์เพื่อเข้าใช้งาน
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-slate-800 text-base font-medium text-white hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                            onClick={onLogout}
                        >
                            ออกจากระบบ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccessDeniedModal;
