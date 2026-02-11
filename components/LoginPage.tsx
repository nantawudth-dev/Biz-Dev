
import React, { useState } from 'react';
import { User, Role } from '../types';
import { ChevronDownIcon } from './icons';

interface LoginPageProps {
    onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [role, setRole] = useState<Role>('user');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const usernameInput = (e.currentTarget as HTMLFormElement).elements.namedItem('username') as HTMLInputElement;
        const user: User = {
            id: `user${Date.now()}`,
            username: usernameInput.value || 'Demo User',
            role: role,
        };
        onLogin(user);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4 font-sans">
            <div className="w-full max-w-sm mx-auto animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
                        BIZ System
                    </h1>
                    <p className="mt-2 text-slate-500 font-body">
                        ระบบบริหารจัดการข้อมูลผู้ประกอบการ
                    </p>
                </div>
                
                <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">ยินดีต้อนรับ</h2>
                    <p className="text-center text-slate-500 mb-6 font-body">
                        กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                                ชื่อผู้ใช้
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                defaultValue="admin"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-slate-700 mb-1">
                                รหัสผ่าน
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                defaultValue="password"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">
                                บทบาท
                            </label>
                            <div className="relative">
                                <select
                                    id="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as Role)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors appearance-none font-body"
                                >
                                    <option value="user">ผู้ใช้งานทั่วไป (ดูข้อมูล)</option>
                                    <option value="officer">เจ้าหน้าที่ (แก้ไขข้อมูล)</option>
                                    <option value="admin">ผู้ดูแลระบบ (สิทธิ์ทั้งหมด)</option>
                                </select>
                                <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>


                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-3 font-semibold rounded-lg shadow-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105"
                            >
                                เข้าสู่ระบบ
                            </button>
                        </div>
                    </form>
                </div>
                <p className="text-center text-xs text-slate-400 mt-8">
                    &copy; {new Date().getFullYear()} BIZ System. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
