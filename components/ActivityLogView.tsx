
import React, { useState, useEffect, useCallback } from 'react';
import { ActivityLog, LogAction, LogEntityType } from '../types';
import { dataService } from '../services/dataService';
import { MagnifyingGlassIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

const ACTION_LABELS: Record<LogAction, { label: string; color: string }> = {
    create: { label: 'เพิ่ม', color: 'bg-emerald-100 text-emerald-800' },
    update: { label: 'แก้ไข', color: 'bg-blue-100 text-blue-800' },
    delete: { label: 'ลบ', color: 'bg-red-100 text-red-800' },
};

const ENTITY_LABELS: Record<LogEntityType, string> = {
    entrepreneur: 'ผู้ประกอบการ',
    project: 'โครงการ',
    course: 'หลักสูตร',
    consultant: 'ที่ปรึกษา',
    user: 'ผู้ใช้งาน',
    establishment_type: 'ประเภทสถานประกอบการ',
    business_category: 'หมวดธุรกิจ',
    fiscal_year: 'ปีงบประมาณ',
};

const DATE_RANGE_OPTIONS = [
    { value: 'today', label: 'วันนี้' },
    { value: '7days', label: '7 วันที่ผ่านมา' },
    { value: '30days', label: '30 วันที่ผ่านมา' },
    { value: 'all', label: 'ทั้งหมด' },
];

const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const ActivityLogView: React.FC = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState<LogAction | ''>('');
    const [entityFilter, setEntityFilter] = useState<LogEntityType | ''>('');
    const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all'>('7days');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await dataService.getActivityLogs({
                search: searchTerm || undefined,
                action: actionFilter || undefined,
                entityType: entityFilter || undefined,
                dateRange,
                limit: itemsPerPage,
                offset: (currentPage - 1) * itemsPerPage,
            });
            setLogs(result.logs);
            setTotal(result.total);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, actionFilter, entityFilter, dateRange, currentPage, itemsPerPage]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, actionFilter, entityFilter, dateRange]);

    const totalPages = Math.ceil(total / itemsPerPage);

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg animate-fade-in">
            {/* Header */}
            <div className="p-5 border-b border-slate-200">
                <h3 className="text-xl font-medium font-title text-slate-800 mb-4">บันทึกกิจกรรม</h3>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อรายการ หรืออีเมลผู้ใช้..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>

                    {/* Date Range */}
                    <div className="relative">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value as any)}
                            className="pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none text-sm font-body text-slate-600"
                        >
                            {DATE_RANGE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Action Filter */}
                    <div className="relative">
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value as LogAction | '')}
                            className="pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none text-sm font-body text-slate-600"
                        >
                            <option value="">ทุกการกระทำ</option>
                            <option value="create">เพิ่ม</option>
                            <option value="update">แก้ไข</option>
                            <option value="delete">ลบ</option>
                        </select>
                        <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Entity Type Filter */}
                    <div className="relative">
                        <select
                            value={entityFilter}
                            onChange={(e) => setEntityFilter(e.target.value as LogEntityType | '')}
                            className="pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none text-sm font-body text-slate-600"
                        >
                            <option value="">ทุกประเภทข้อมูล</option>
                            {Object.entries(ENTITY_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-500 font-title text-sm">กำลังโหลดข้อมูล...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <p className="text-center text-slate-400 py-12 text-sm">ไม่พบบันทึกกิจกรรม</p>
                ) : (
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">วันที่/เวลา</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ผู้ใช้</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider font-title">การกระทำ</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">ประเภทข้อมูล</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-title">รายการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-slate-600">{formatDateTime(log.createdAt)}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-slate-700">{log.userEmail}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ACTION_LABELS[log.action]?.color || 'bg-slate-100 text-slate-800'}`}>
                                            {ACTION_LABELS[log.action]?.label || log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-slate-600">{ENTITY_LABELS[log.entityType] || log.entityType}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-slate-900">{log.entityName || '-'}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {!isLoading && total > 0 && (
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <label htmlFor="log-items-per-page" className="sr-only">แสดงผลต่อหน้า</label>
                                <select
                                    id="log-items-per-page"
                                    value={itemsPerPage}
                                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                    className="pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none text-sm font-body text-slate-600"
                                >
                                    <option value={10}>10 / หน้า</option>
                                    <option value={20}>20 / หน้า</option>
                                    <option value={50}>50 / หน้า</option>
                                </select>
                                <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                            {totalPages > 1 && (
                                <p className="text-sm text-slate-600 font-body hidden sm:block">
                                    แสดง <span className="font-semibold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-slate-800">{Math.min(currentPage * itemsPerPage, total)}</span> จาก <span className="font-semibold text-slate-800">{total}</span>
                                </p>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <nav className="flex items-center gap-2" aria-label="Log Pagination">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center justify-center px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeftIcon className="w-4 h-4 mr-1" />
                                    ก่อนหน้า
                                </button>

                                <div className="hidden md:flex items-center gap-1">
                                    {pageNumbers.map(number => (
                                        <button
                                            key={number}
                                            onClick={() => setCurrentPage(number)}
                                            className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors ${currentPage === number
                                                    ? 'bg-blue-600 border-blue-600 text-white z-10'
                                                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                                                }`}
                                        >
                                            {number}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center justify-center px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    ถัดไป
                                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                                </button>
                            </nav>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityLogView;
