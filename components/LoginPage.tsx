import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleIcon } from './icons';

const LoginPage: React.FC = () => {
    const { loginWithGoogle } = useAuth();

    const handleLogin = async () => {
        await loginWithGoogle();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4 font-title relative overflow-hidden bg-gradient-to-br from-green-50 via-cyan-50 to-blue-50">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-cyan-300/30 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[20%] right-[10%] w-[25%] h-[25%] bg-green-300/30 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="w-full max-w-4xl animate-fade-in relative z-10">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[550px]">

                    {/* Left Side: System Info & Design */}
                    <div className="w-full md:w-1/2 p-10 flex flex-col justify-center items-center text-white relative overflow-hidden group bg-gradient-to-br from-blue-400 via-cyan-400 to-green-300">
                        {/* Background Image */}
                        <div className="absolute inset-0 z-0">
                            <img
                                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                alt="Background"
                                className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-1000"
                            />
                            {/* Gradient Overlay for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/60 via-cyan-500/60 to-green-400/60 mix-blend-multiply"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-green-100/20 to-transparent"></div>
                        </div>

                        {/* Decorative Circles */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40 z-10">
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl mix-blend-screen animate-pulse-slow"></div>
                            <div className="absolute bottom-10 right-10 w-32 h-32 bg-green-200 rounded-full blur-3xl mix-blend-screen animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
                        </div>

                        <div className="relative z-20 text-center flex flex-col items-center">
                            <img src="/uploads/logos/final-logo-biz-tr_white.png" alt="BIZ Logo" className="h-48 mb-8 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
                            <p className="text-lg font-medium tracking-widest uppercase opacity-90 drop-shadow-md text-white">
                                BIZ Center Service & Data Management System
                            </p>
                        </div>
                        <p className="mt-12 text-white/70 text-xs font-light absolute bottom-6 z-20">
                            &copy; {new Date().getFullYear()} BIZ Management. Modernized.
                        </p>
                    </div>

                    {/* Right Side: Login Form */}
                    <div className="w-full md:w-1/2 p-10 bg-white flex flex-col justify-center">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">ยินดีต้อนรับ</h2>
                            <p className="text-slate-500 font-light text-base">
                                กรุณาเข้าสู่ระบบ
                            </p>
                        </div>

                        <div className="space-y-8 flex flex-col items-center">
                            <div className="w-full text-center space-y-2">
                                <button
                                    onClick={handleLogin}
                                    className="w-full flex justify-center items-center gap-3 bg-white border border-slate-200 text-slate-700 px-6 py-4 font-medium rounded-xl shadow-sm hover:shadow-md hover:bg-slate-50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 transform group"
                                >
                                    <GoogleIcon className="w-6 h-6" />
                                    <span className="text-lg">เข้าสู่ระบบด้วย Google</span>
                                </button>
                                <p className="text-xs text-slate-400 font-light pt-2">
                                    สำหรับบัญชี <span className="font-semibold text-slate-500">@nu.ac.th</span> เท่านั้น
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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

export default LoginPage;
