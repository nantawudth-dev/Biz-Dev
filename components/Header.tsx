
import React from 'react';
import { Role } from '../types';
import { Bars3Icon, BellIcon, ArrowRightOnRectangleIcon, UserCircleIcon } from './icons';

interface HeaderProps {
    onMenuClick: () => void;
    user: { username: string; role: Role };
    onLogout: () => void;
    title: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, user, onLogout, title }) => {
    return (
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm/50">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <Bars3Icon className="w-6 h-6" />
                </button>
                <h1 className="text-xl md:text-2xl font-bold font-title text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 tracking-tight">{title}</h1>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all relative group">
                    <BellIcon className="w-6 h-6" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

                <div className="flex items-center gap-3 pl-2 md:pl-0">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-semibold text-slate-700">{user.username}</span>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded-full">
                            {user.role}
                        </span>
                    </div>
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white shadow-md ring-2 ring-white">
                        <UserCircleIcon className="w-6 h-6" />
                    </div>


                </div>
            </div>
        </header>
    );
};

export default Header;
