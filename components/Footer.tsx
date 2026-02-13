import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gradient-to-r from-green-50 via-cyan-50 to-blue-50 border-t border-green-200/50 py-4 mt-8">
            <div className="max-w-7xl mx-auto px-6">
                <p className="text-center text-sm text-slate-600">
                    &copy; {new Date().getFullYear()} BIZ System. Modernized.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
