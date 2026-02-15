
import React, { useState, useEffect } from 'react';
import { Consultant, Entrepreneur, Course } from '../types';
import { SparklesIcon, BuildingOffice2Icon, UserCircleIcon, ArrowPathIcon, AcademicCapIcon, PhoneIcon, EnvelopeIcon } from './icons';
import { useNotification } from '../contexts/NotificationContext';
import { dataService } from '../services/dataService';

const AIAnalysisView: React.FC = () => { // Removed props
    const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
    const [consultants, setConsultants] = useState<Consultant[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const { showNotification } = useNotification();

    const [selectedEntrepreneurId, setSelectedEntrepreneurId] = useState<string>('');
    const [problemDescription, setProblemDescription] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [recommendedConsultants, setRecommendedConsultants] = useState<Consultant[]>([]);
    const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingData(true);
                const [fetchedEntrepreneurs, fetchedConsultants, fetchedCourses] = await Promise.all([
                    dataService.getEntrepreneurs(),
                    dataService.getConsultants(),
                    dataService.getCourses()
                ]);
                setEntrepreneurs(fetchedEntrepreneurs);
                setConsultants(fetchedConsultants);
                setCourses(fetchedCourses);
            } catch (error) {
                console.error('Failed to fetch data for AI Analysis:', error);
                showNotification('ไม่สามารถโหลดข้อมูลสำหรับวิเคราะห์ได้', 'error');
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, [showNotification]);

    const handleAnalyze = () => {
        if (!problemDescription.trim() || !selectedEntrepreneurId) return;

        setIsAnalyzing(true);
        setAnalysisResult(null);
        setRecommendedConsultants([]);
        setRecommendedCourses([]);

        // Simulate AI Analysis Delay
        setTimeout(() => {
            const result = generateAnalysis(problemDescription);
            const experts = findExperts(problemDescription, consultants);
            const suggestedCourses = findCourses(problemDescription, courses);

            setAnalysisResult(result);
            setRecommendedConsultants(experts);
            setRecommendedCourses(suggestedCourses);
            setIsAnalyzing(false);
        }, 2000);
    };

    // Start of AI Analysis Logic
    const generateAnalysis = (text: string): string => {
        const textLower = text.toLowerCase();
        let combinedResponse = '';
        const foundCategories = new Set<string>();

        Object.values(EXPERTISE_DICTIONARY).forEach(category => {
            if (category.terms.some(term => textLower.includes(term.toLowerCase()))) {
                if (!foundCategories.has(category.id)) {
                    combinedResponse += (combinedResponse ? '\n\n' : '') + category.response;
                    foundCategories.add(category.id);
                }
            }
        });

        if (!combinedResponse) {
            combinedResponse = 'จากการวิเคราะห์เบื้องต้น แนะนำให้ปรึกษาผู้เชี่ยวชาญเพื่อวิเคราะห์ปัญหาเชิงลึกและวางแผนแก้ไขปัญหาอย่างเป็นระบบ โดยอาจเริ่มจากการสำรวจสถานะปัจจุบันของธุรกิจ (Business Health Check) เพื่อระบุจุดอ่อนและจุดแข็งที่ชัดเจน';
        }

        return combinedResponse;
    };

    const findExperts = (text: string, allConsultants: Consultant[]): Consultant[] => {
        const textLower = text.toLowerCase();
        const matchedCategoryIds = new Set<string>();

        // 1. Identify relevant categories
        Object.values(EXPERTISE_DICTIONARY).forEach(category => {
            if (category.terms.some(term => textLower.includes(term.toLowerCase()))) {
                matchedCategoryIds.add(category.id);
            }
        });

        // 2. Filter consultants based on expertise string
        return allConsultants.filter(consultant => {
            if (!consultant.expertise) return false;
            const expLower = consultant.expertise.toLowerCase();
            return Array.from(matchedCategoryIds).some(catId => {
                const category = EXPERTISE_DICTIONARY[catId];
                // Check if any keyword matches the expertise description
                return category.terms.some(term => expLower.includes(term.toLowerCase()));
            });
        });
    };

    const findCourses = (text: string, allCourses: Course[]): Course[] => {
        const textLower = text.toLowerCase();
        const matchedCategoryIds = new Set<string>();

        // 1. Identify relevant categories
        Object.values(EXPERTISE_DICTIONARY).forEach(category => {
            if (category.terms.some(term => textLower.includes(term.toLowerCase()))) {
                matchedCategoryIds.add(category.id);
            }
        });

        // 2. Filter courses based on categories AND direct keyword match in title/desc
        return allCourses.filter(course => {
            const titleLower = course.title.toLowerCase();
            const descLower = course.description.toLowerCase();

            // Check if course matches any identified category keywords
            const matchesCategory = Array.from(matchedCategoryIds).some(catId => {
                const category = EXPERTISE_DICTIONARY[catId];
                return category.terms.some(term =>
                    titleLower.includes(term.toLowerCase()) ||
                    descLower.includes(term.toLowerCase())
                );
            });

            return matchesCategory;
        });
    };

    // Bilingual Expertise Dictionary
    const EXPERTISE_DICTIONARY: Record<string, { id: string, terms: string[], response: string }> = {
        marketing: {
            id: 'marketing',
            terms: ['marketing', 'sales', 'sell', 'brand', 'market', 'customer', 'crm', 'seo', 'sem', 'social media', 'online', 'ads', 'content', 'การตลาด', 'ขาย', 'ยอดขาย', 'แบรนด์', 'ลูกค้า', 'การสร้างแบรนด์', 'โฆษณา', 'คอนเทนต์', 'โปรโมชั่น'],
            response: '📊 **ด้านการตลาดและการขาย**: แนะนำให้เน้นการสร้างแบรนด์ (Branding) ให้แข็งแกร่งและการทำการตลาดออนไลน์ (Digital Marketing) เพื่อเพิ่มการเข้าถึงลูกค้ากลุ่มใหม่ รวมถึงการนำระบบ CRM มาใช้เพื่อรักษาฐานลูกค้าเก่าและวิเคราะห์พฤติกรรมผู้บริโภค'
        },
        finance: {
            id: 'finance',
            terms: ['finance', 'accounting', 'tax', 'profit', 'loss', 'cost', 'budget', 'money', 'invest', 'loan', 'debt', 'cash flow', 'statement', 'การเงิน', 'บัญชี', 'ภาษี', 'กำไร', 'ขาดทุน', 'ต้นทุน', 'งบประมาณ', 'ลงทุน', 'หนี้', 'กระแสเงินสด', 'กู้', 'สินเชื่อ'],
            response: '💰 **ด้านการเงินและบัญชี**: ควรเริ่มต้นจากการจัดทำบัญชีรายรับ-รายจ่ายที่ชัดเจน แยกบัญชีส่วนตัวกับธุรกิจ วิเคราะห์จุดคุ้มทุน (Break-even Point) และวางแผนกระแสเงินสด (Cash Flow Management) เพื่อให้ธุรกิจมีสภาพคล่องเพียงพอ รวมถึงการวางแผนภาษีอย่างถูกต้อง'
        },
        production: {
            id: 'production',
            terms: ['production', 'manufacture', 'factory', 'machine', 'quality', 'qc', 'qa', 'lean', 'waste', 'stock', 'inventory', 'warehouse', 'การผลิต', 'โรงงาน', 'เครื่องจักร', 'คุณภาพ', 'คลังสินค้า', 'สินค้าคงคลัง', 'ผลิต'],
            response: '🏭 **ด้านการผลิตและการจัดการ**: แนะนำให้ตรวจสอบกระบวนการผลิตเพื่อลดความสูญเสีย (Waste Reduction) ตามแนวคิด Lean Manufacturing เพิ่มประสิทธิภาพการจัดการสต็อกสินค้า (Inventory Management) และนำเทคโนโลยีมาช่วยในการควบคุมคุณภาพสินค้า (QC/QA)'
        },
        technology: {
            id: 'technology',
            terms: ['technology', 'it', 'software', 'app', 'system', 'digital', 'data', 'ai', 'iot', 'automation', 'dev', 'transformation', 'cloud', 'platform', 'เทคโนโลยี', 'ซอฟต์แวร์', 'แอปพลิเคชัน', 'ระบบ', 'ดิจิทัล', 'ข้อมูล', 'อัตโนมัติ', 'แพลตฟอร์ม', 'โปรแกรม'],
            response: '💻 **ด้านเทคโนโลยีและนวัตกรรม**: การนำเทคโนโลยีมาใช้จะช่วยเพิ่มประสิทธิภาพในการทำงานได้อย่างมาก (Digital Transformation) แนะนำให้เริ่มต้นจากระบบพื้นฐาน เช่น POS, ERP หรือระบบจัดการร้านค้าออนไลน์ และพิจารณาการใช้ Data Analytics เพื่อช่วยในการตัดสินใจทางธุรกิจ'
        },
        management: {
            id: 'management',
            terms: ['management', 'hr', 'human', 'employee', 'staff', 'team', 'recruit', 'strategy', 'business plan', 'kpi', 'okr', 'leadership', 'organization', 'การบริหาร', 'ทรัพยากรบุคคล', 'คน', 'พนักงาน', 'ทีมงาน', 'กลยุทธ์', 'แผนธุรกิจ', 'สรรหา', 'ผู้นำ', 'องค์กร', 'จัดการ'],
            response: '👥 **ด้านการบริหารจัดการและกลยุทธ์**: ปัญหาด้านคนและองค์กรเป็นเรื่องละเอียดอ่อน ควรเน้นการสื่อสารภายในองค์กรที่ชัดเจน (Communication) การกำหนดเป้าหมายร่วมกัน (KPI/OKR) และการพัฒนาทักษะพนักงาน (Upskilling) เพื่อให้ทีมงานมีประสิทธิภาพและมีความสุขในการทำงาน'
        },
        logistics: {
            id: 'logistics',
            terms: ['logistics', 'transport', 'shipping', 'delivery', 'supply chain', 'distribution', 'warehouse', 'fleet', 'route', 'export', 'import', 'โลจิสติกส์', 'ขนส่ง', 'จัดส่ง', 'กระจายสินค้า', 'คลังสินค้า', 'ซัพพลายเชน', 'นำเข้า', 'ส่งออก', 'ยานพาหนะ', 'เส้นทาง'],
            response: '🚚 **ด้านโลจิสติกส์และการขนส่ง**: เพื่อเพิ่มประสิทธิภาพในการดำเนินงาน ควรพิจารณาการบริหารจัดการซัพพลายเชน (Supply Chain Management) การวางแผนเส้นทางการขนส่งให้คุ้มค่า (Route Optimization) และการใช้เทคโนโลยีในการติดตามสถานะสินค้า (Tracking System) เพื่อความรวดเร็วและแม่นยำ'
        },
        sustainability: {
            id: 'sustainability',
            terms: ['sustainability', 'sustainable', 'green', 'environment', 'eco', 'circular economy', 'carbon', 'waste management', 'energy', 'solar', 'esg', 'ความยั่งยืน', 'สิ่งแวดล้อม', 'สีเขียว', 'ขยะ', 'พลังงาน', 'คาร์บอน', 'หมุนเวียน', 'นิเวศ', 'ลดโลกร้อน'],
            response: '🌿 **ด้านความยั่งยืนและสิ่งแวดล้อม**: การดำเนินธุรกิจที่ใส่ใจสิ่งแวดล้อม (ESG) เป็นเทรนด์สำคัญ ควรเริ่มจากการจัดการของเสีย (Waste Management) การใช้พลังงานทางเลือก (Renewable Energy) หรือการปรับโมเดลธุรกิจเป็นเศรษฐกิจหมุนเวียน (Circular Economy) ซึ่งจะช่วยลดต้นทุนและสร้างภาพลักษณ์ที่ดี'
        }
    };

    if (isLoadingData) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500 font-title">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <BuildingOffice2Icon className="w-5 h-5 text-slate-500" />
                            ข้อมูลบริษัทและปัญหา
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">เลือกผู้ประกอบการ</label>
                                <select
                                    value={selectedEntrepreneurId}
                                    onChange={(e) => setSelectedEntrepreneurId(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="">-- เลือกผู้ประกอบการ --</option>
                                    {entrepreneurs.map(ent => (
                                        <option key={ent.id} value={ent.id}>{ent.businessName} ({ent.name})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียดปัญหาที่พบ</label>
                                <textarea
                                    value={problemDescription}
                                    onChange={(e) => setProblemDescription(e.target.value)}
                                    placeholder="ระบุปัญหาที่ต้องการปรึกษา เช่น ยอดขายตก, ต้องการลดต้นทุนการผลิต, ขาดสภาพคล่องทางการเงิน..."
                                    className="w-full h-40 px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                                />
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !selectedEntrepreneurId || !problemDescription.trim()}
                                className={`w-full py-3 rounded-lg font-semibold text-white transition-all shadow-md flex items-center justify-center gap-2
                                    ${isAnalyzing || !selectedEntrepreneurId || !problemDescription.trim()
                                        ? 'bg-slate-300 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5'
                                    }
                                `}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                        กำลังวิเคราะห์ข้อมูล...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-5 h-5" />
                                        วิเคราะห์ปัญหาด้วย AI
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Result Section */}
                <div className="space-y-6">
                    {analysisResult && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in border-l-4 border-l-blue-500">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5 text-blue-600" />
                                ผลการวิเคราะห์และข้อเสนอแนะ
                            </h3>
                            <div className="bg-blue-50 p-4 rounded-lg text-slate-700 leading-relaxed">
                                {analysisResult}
                            </div>
                        </div>
                    )}

                    {recommendedConsultants.length > 0 && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <UserCircleIcon className="w-5 h-5 text-slate-500" />
                                ผู้เชี่ยวชาญที่แนะนำ
                            </h3>
                            <div className="space-y-3">
                                {recommendedConsultants.map(consultant => (
                                    <div key={consultant.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                            {consultant.firstName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-800">{consultant.title}{consultant.firstName} {consultant.lastName}</h4>
                                            <p className="text-sm text-slate-500 font-medium line-clamp-1">{consultant.workplace}</p>
                                            <p className="text-sm text-slate-600 mt-1 line-clamp-2 bg-slate-50 p-1 rounded">
                                                <span className="font-semibold text-xs text-slate-400 uppercase tracking-wide mr-1">ความเชี่ยวชาญ:</span>
                                                {consultant.expertise}
                                            </p>
                                            <div className="flex gap-3 mt-2 text-xs text-slate-500">
                                                {consultant.phone && <span className="flex items-center gap-1"><PhoneIcon className="w-3 h-3" /> {consultant.phone}</span>}
                                                {consultant.email && <span className="flex items-center gap-1"><EnvelopeIcon className="w-3 h-3" /> {consultant.email}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {recommendedCourses.length > 0 && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <AcademicCapIcon className="w-5 h-5 text-slate-500" />
                                หลักสูตรแนะนำ
                            </h3>
                            <div className="space-y-3">
                                {recommendedCourses.map(course => (
                                    <div key={course.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold shrink-0">
                                            <AcademicCapIcon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-800">{course.title}</h4>
                                            <p className="text-sm text-slate-500 line-clamp-2">{course.description}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                                <span>สอนโดย: {course.instructor}</span>
                                                {course.syllabusLink && (
                                                    <a href={course.syllabusLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                        ดูรายละเอียดหลักสูตร
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!analysisResult && !isAnalyzing && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-10 border-2 border-dashed border-slate-200 rounded-xl">
                            <SparklesIcon className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">ผลการวิเคราะห์จะแสดงที่นี่</p>
                            <p className="text-sm">กรุณาเลือกผู้ประกอบการและระบุปัญหาเพื่อเริ่มการวิเคราะห์</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIAnalysisView;
