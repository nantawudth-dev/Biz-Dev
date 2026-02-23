
import React, { useState, useEffect } from 'react';
import { Consultant, Entrepreneur, Course, AiKnowledgeBase } from '../types';
import { SparklesIcon, BuildingOffice2Icon, UserCircleIcon, ArrowPathIcon, AcademicCapIcon, PhoneIcon, EnvelopeIcon } from './icons';
import { useNotification } from '../contexts/NotificationContext';
import { dataService } from '../services/dataService';
import { useData } from '../contexts/DataContext';

const AIAnalysisView: React.FC = () => { // Removed props
    const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
    const [consultants, setConsultants] = useState<Consultant[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [aiKnowledgeBase, setAiKnowledgeBase] = useState<AiKnowledgeBase[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const { data, fetchData } = useData();
    const { showNotification } = useNotification();

    const [selectedEntrepreneurId, setSelectedEntrepreneurId] = useState<string>('');
    const [entrepreneurSearch, setEntrepreneurSearch] = useState<string>('');
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [problemDescription, setProblemDescription] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [recommendedConsultants, setRecommendedConsultants] = useState<{ consultant: Consultant, score: number, reasons: string[] }[]>([]);
    const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);

    // Fetch data using DataContext on mount
    useEffect(() => {
        const loadAIAnalysisData = async () => {
            try {
                const hasAllData = data.entrepreneurs && data.consultants && data.courses && data.aiKnowledgeBase;
                if (!hasAllData) {
                    setIsLoadingData(true);
                }

                await Promise.all([
                    fetchData('entrepreneurs', () => dataService.getEntrepreneurs()),
                    fetchData('consultants', () => dataService.getConsultants()),
                    fetchData('courses', () => dataService.getCourses()),
                    fetchData('aiKnowledgeBase', () => dataService.getAiKnowledgeBase())
                ]);
            } catch (error) {
                console.error('Failed to fetch data for AI Analysis:', error);
                showNotification('ไม่สามารถโหลดข้อมูลสำหรับวิเคราะห์ได้', 'error');
            } finally {
                setIsLoadingData(false);
            }
        };
        loadAIAnalysisData();
    }, [fetchData, showNotification, data.entrepreneurs, data.consultants, data.courses, data.aiKnowledgeBase]);

    // Sync from DataContext when the cached data changes
    useEffect(() => {
        if (data.entrepreneurs) setEntrepreneurs(data.entrepreneurs);
        if (data.consultants) setConsultants(data.consultants);
        if (data.courses) setCourses(data.courses);
        if (data.aiKnowledgeBase) setAiKnowledgeBase(data.aiKnowledgeBase.filter((kb: AiKnowledgeBase) => kb.isActive));
    }, [data.entrepreneurs, data.consultants, data.courses, data.aiKnowledgeBase]);

    const handleAnalyze = async () => {
        if (!problemDescription.trim() || !selectedEntrepreneurId) return;

        setIsAnalyzing(true);
        setAnalysisResult(null);
        setRecommendedConsultants([]);
        setRecommendedCourses([]);

        const ent = entrepreneurs.find(e => e.id === selectedEntrepreneurId);
        let llmKeywords: string[] = [];
        let llmStage: string = '';

        try {
            const prompt = `ในฐานะผู้เชี่ยวชาญด้านที่ปรึกษาธุรกิจ กรุณาวิเคราะห์ปัญหาและให้คำแนะนำเบื้องต้นที่นำไปปฏิบัติได้จริง (Actionable Advice) สำหรับธุรกิจดังต่อไปนี้:
ชื่อบริษัท: ${ent?.businessName || 'ไม่ระบุ'}
ประเภทธุรกิจ: ${ent?.businessCategory || 'ไม่ระบุ'}
ปัญหาที่พบ: ${problemDescription}

กรุณาวิเคราะห์และตอบกลับในรูปแบบ JSON ตาม Format นี้เท่านั้น (ห้ามแทรกข้อความอื่น):
{
  "analysis": "คำแนะนำเชิงลึกแบบย่อหน้า ไม่เกิน 3-4 ประเด็นหลัก แนะนำวิธีแก้ปัญหาเบื้องต้นในทางปฏิบัติ",
  "keywords": ["คำสำคัญ1", "คำสำคัญ2"],
  "business_stage": "startup, sme, หรือ enterprise"
}`;

            const result = await dataService.analyzeWithGemini(prompt);
            setAnalysisResult(result.analysis);
            llmKeywords = result.keywords || [];
            llmStage = result.business_stage || '';
        } catch (error: any) {
            console.error('LLM Analysis Error:', error);
            if (error.message === 'RATE_LIMIT') {
                showNotification('ระบบวิเคราะห์ AI มีผู้ใช้งานจำนวนมาก กรุณารอสักครู่ (ประมาณ 1 นาที) แล้วลองใหม่อีกครั้ง', 'warning');
            } else if (error.message === 'API_KEY_MISSING') {
                showNotification('ตั้งค่า GEMINI_API_KEY ไม่สมบูรณ์ กำลังสลับไปใช้การวิเคราะห์แบบพื้นฐานแทน', 'warning');
            } else {
                showNotification('เกิดข้อผิดพลาดในการเชื่อมต่อ AI กำลังสลับไปใช้การวิเคราะห์แบบพื้นฐานแทน', 'error');
            }

            // Fallback to Rule-based algorithm
            const fallbackResult = generateAnalysis(problemDescription);
            setAnalysisResult(fallbackResult);
        } finally {
            // These steps run whether LLM success or fail
            const experts = findExperts(problemDescription, consultants, ent, llmKeywords);
            const suggestedCourses = findCourses(problemDescription, courses, llmKeywords, llmStage);

            setRecommendedConsultants(experts);
            setRecommendedCourses(suggestedCourses);
            setIsAnalyzing(false);
        }
    };

    // Start of AI Analysis Logic
    const generateAnalysis = (text: string): string => {
        const textLower = text.toLowerCase();
        let combinedResponse = '';
        const foundCategories = new Set<string>();

        aiKnowledgeBase.forEach(category => {
            if (category.terms.some(term => textLower.includes(term.toLowerCase()))) {
                if (!foundCategories.has(category.categoryId)) {
                    combinedResponse += (combinedResponse ? '\n\n' : '') + category.response;
                    foundCategories.add(category.categoryId);
                }
            }
        });

        if (!combinedResponse) {
            combinedResponse = 'จากการวิเคราะห์เบื้องต้น แนะนำให้ปรึกษาผู้เชี่ยวชาญเพื่อวิเคราะห์ปัญหาเชิงลึกและวางแผนแก้ไขปัญหาอย่างเป็นระบบ โดยอาจเริ่มจากการสำรวจสถานะปัจจุบันของธุรกิจ (Business Health Check) เพื่อระบุจุดอ่อนและจุดแข็งที่ชัดเจน';
        }

        return combinedResponse;
    };

    const findExperts = (text: string, allConsultants: Consultant[], entrepreneur: Entrepreneur | undefined, llmKeywords: string[] = []): { consultant: Consultant, score: number, reasons: string[] }[] => {
        const textLower = text.toLowerCase();
        const matchedCategoryIds = new Set<string>();
        // Extract all individual words/phrases from problem description for direct matching
        // Simple tokenization by spaces and common Thai/English punctuation
        const stopWords = ['และ', 'หรือ', 'แต่', 'ของ', 'ใน', 'การ', 'เพื่อ', 'ที่', 'ไป', 'เป็น', 'สำหรับ'];
        const textTokens = textLower.split(/[\s,.;()-]+/).filter(w => w.length > 2 && !stopWords.includes(w));

        // Add LLM Keywords to tokens
        const allKeywords = [...textTokens, ...(llmKeywords.map(kw => kw.toLowerCase()))];

        // 1. Identify relevant categories
        aiKnowledgeBase.forEach(category => {
            if (category.terms.some(term => textLower.includes(term.toLowerCase()) || llmKeywords.some(kw => kw.toLowerCase().includes(term.toLowerCase())))) {
                matchedCategoryIds.add(category.categoryId);
            }
        });

        // 2. Score and filter consultants
        const scoredConsultants = allConsultants.map(consultant => {
            let score = 0;
            const reasons: string[] = [];
            const expLower = (consultant.expertise || '').toLowerCase();
            const cvLower = (consultant.cv || '').toLowerCase();

            if (!expLower && !cvLower) return { consultant, score, reasons };

            // A. High Score for Direct Word Match between Problem Text and Expertise string
            const matchedKeywords: string[] = [];
            allKeywords.forEach(token => {
                let matched = false;
                if (expLower.includes(token)) {
                    score += 10; // High weight for direct problem keyword matching expertise
                    matchedKeywords.push(token);
                    matched = true;
                }
                if (!matched && cvLower.includes(token)) {
                    score += 7; // Medium-High weight for direct problem keyword matching CV text
                    if (!matchedKeywords.includes(token)) matchedKeywords.push(token);
                }
            });
            if (matchedKeywords.length > 0) {
                reasons.push(`พบคำสำคัญที่เกี่ยวข้อง: ${matchedKeywords.join(', ')}`);
            }

            // B. Medium Score for Category Match
            const matchedCategories: string[] = [];
            Array.from(matchedCategoryIds).forEach(catId => {
                const category = aiKnowledgeBase.find(kb => kb.categoryId === catId);
                if (category && category.terms.some(term => expLower.includes(term.toLowerCase()) || cvLower.includes(term.toLowerCase()))) {
                    score += 5; // Base score for being in the right category
                    matchedCategories.push(category.categoryNameTh);
                }
            });
            if (matchedCategories.length > 0) {
                reasons.push(`ความเชี่ยวชาญตรงกับหมวดหมู่ปัญหา: ${matchedCategories.join(', ')}`);
            }

            // C. Experience Bonus based on Entrepreneur's business category
            if (entrepreneur && entrepreneur.businessCategory) {
                const businessCatLower = entrepreneur.businessCategory.toLowerCase();
                if (expLower.includes(businessCatLower) || cvLower.includes(businessCatLower)) {
                    score += 5; // Bonus for explicit business category matching
                    reasons.push(`มีประสบการณ์ตรงในอุตสาหกรรม/หมวดธุรกิจ: ${entrepreneur.businessCategory}`);
                }
            }

            return { consultant, score, reasons };
        });

        // 3. Filter out zero scores and sort by highest score first
        return scoredConsultants
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score);
    };

    const findCourses = (text: string, allCourses: Course[], llmKeywords: string[] = [], businessStage: string = ''): Course[] => {
        const textLower = text.toLowerCase();
        const stageLower = businessStage.toLowerCase();
        const matchedCategoryIds = new Set<string>();

        // 1. Identify relevant categories based on rules + LLM keywords
        aiKnowledgeBase.forEach(category => {
            if (category.terms.some(term => textLower.includes(term.toLowerCase()) || llmKeywords.some(kw => kw.toLowerCase().includes(term.toLowerCase())))) {
                matchedCategoryIds.add(category.categoryId);
            }
        });

        // 2. Filter courses based on categories AND direct keyword match in title/desc
        return allCourses.filter(course => {
            const titleLower = course.title.toLowerCase();
            const descLower = course.description.toLowerCase();

            // Check if course matches any identified category keywords
            const matchesCategory = Array.from(matchedCategoryIds).some(catId => {
                const category = aiKnowledgeBase.find(kb => kb.categoryId === catId);
                if (!category) return false;
                return category.terms.some(term =>
                    titleLower.includes(term.toLowerCase()) ||
                    descLower.includes(term.toLowerCase())
                );
            });

            // Check business stage matching if provided
            let matchesStage = true;
            if (stageLower) {
                // If the description explicitly mentions a specific stage, increase priority or let it pass
                // We're keeping it simple for now and letting matchesCategory be the main decider, but adding a basic stage check
                if (stageLower === 'startup' && (descLower.includes('enterprise') || descLower.includes('ขนาดใหญ่'))) {
                    matchesStage = false; // Exclude enterprise courses for startups
                }
            }

            return matchesCategory && matchesStage;
        });
    };


    // Dictionary for translating terms to academic Thai format
    const ACADEMIC_TERMS_DICTIONARY: Record<string, string> = {
        'marketing': 'กลยุทธ์การตลาด (Marketing Strategy)',
        'sales': 'การบริหารงานขาย (Sales Management)',
        'brand': 'การสร้างและบริหารแบรนด์ (Brand Management)',
        'market': 'การวิเคราะห์การตลาด (Market Analysis)',
        'finance': 'การบัญชีและการบริหารการเงิน (Financial Management & Accounting)',
        'accounting': 'การบัญชี (Accounting)',
        'tax': 'การวางแผนภาษีอากร (Tax Planning)',
        'budget': 'การจัดการงบประมาณ (Budget Management)',
        'invest': 'การวิเคราะห์การลงทุน (Investment Analysis)',
        'production': 'การบริหารการจัดการการผลิต (Production Management)',
        'quality': 'การควบคุมคุณภาพ (Quality Control)',
        'lean': 'ระบบการผลิตแบบลีน (Lean Manufacturing System)',
        'technology': 'เทคโนโลยีสารสนเทศเพื่อการจัดการ (Management Information Technology)',
        'software': 'วิศวกรรมซอฟต์แวร์ (Software Engineering)',
        'data': 'วิทยาการข้อมูลและการวิเคราะห์ (Data Science & Analytics)',
        'hr': 'การบริหารทรัพยากรมนุษย์ (Human Resource Management)',
        'strategy': 'การบริหารเชิงกลยุทธ์ (Strategic Management)',
        'leadership': 'ภาวะผู้นำทางธุรกิจ (Business Leadership)',
        'supply chain': 'การจัดการโซ่อุปทาน (Supply Chain Management)',
        'logistics': 'การจัดการลอจิสติกส์และโซ่อุปทาน (Logistics and Supply Chain Management)',
        'sustainability': 'การพัฒนาอย่างยั่งยืน (Sustainable Development)',
        'environment': 'การจัดการสิ่งแวดล้อม (Environmental Management)',
        'project management': 'การบริหารโครงการ (Project Management)',
        'construction engineering': 'วิศวกรรมการก่อสร้าง (Construction Engineering)',
        'construction': 'การบริหารวิศวกรรมก่อสร้าง (Construction Engineering Management)',
        'traffic': 'วิศวกรรมการจราจรและการขนส่ง (Traffic & Transportation Engineering)',
        'transportation': 'วิศวกรรมการจราจรและการขนส่ง (Traffic & Transportation Engineering)',
        'real estate': 'การพัฒนาอสังหาริมทรัพย์ (Real Estate Development)',
        'family business': 'การบริหารธุรกิจครอบครัว (Family Business Management)',
        'management': 'การบริหารจัดการและกลยุทธ์องค์กร (Strategic Organization Management)', // generic generic last
    };

    // Helper to extract and format expertise text to Thai Academic Context
    const getTranslatedExpertise = (expertiseStr: string): string => {
        if (!expertiseStr) return 'ไม่ระบุ';
        const rawExpertises = expertiseStr.split(',').map(s => s.trim());
        const mappedTerms: string[] = [];

        // Sort dictionary keys by length descending to match longest (most specific) terms first
        const sortedDictKeys = Object.keys(ACADEMIC_TERMS_DICTIONARY).sort((a, b) => b.length - a.length);

        rawExpertises.forEach(exp => {
            const expLower = exp.toLowerCase();
            let hasMatch = false;

            // Check against academic glossary
            for (const key of sortedDictKeys) {
                if (expLower.includes(key)) {
                    mappedTerms.push(ACADEMIC_TERMS_DICTIONARY[key]);
                    hasMatch = true;
                    break; // Use the first match per term to avoid overlaps
                }
            }

            // Fallback: If not mapped, keep original
            if (!hasMatch) {
                mappedTerms.push(exp);
            }
        });

        // Deduplicate and join
        return Array.from(new Set(mappedTerms)).join(', ');
    };

    const filteredEntrepreneurs = entrepreneurs.filter(ent =>
        ent.businessName.toLowerCase().includes(entrepreneurSearch.toLowerCase()) ||
        ent.name.toLowerCase().includes(entrepreneurSearch.toLowerCase())
    );

    const handleSelectEntrepreneur = (ent: Entrepreneur) => {
        setSelectedEntrepreneurId(ent.id);
        setEntrepreneurSearch(`${ent.businessName} (${ent.name})`);
        setIsDropdownOpen(false);
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
                            <div className="relative">
                                <label className="block text-sm font-medium text-slate-700 mb-1">เลือกผู้ประกอบการ</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={entrepreneurSearch}
                                        onChange={(e) => {
                                            setEntrepreneurSearch(e.target.value);
                                            setIsDropdownOpen(true);
                                            if (e.target.value === '') setSelectedEntrepreneurId('');
                                        }}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        placeholder="พิมพ์เพื่อค้นหาชื่อบริษัทหรือผู้ประกอบการ..."
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
                                    />
                                    {entrepreneurSearch && (
                                        <button
                                            onClick={() => {
                                                setEntrepreneurSearch('');
                                                setSelectedEntrepreneurId('');
                                                setIsDropdownOpen(false);
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <ArrowPathIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {isDropdownOpen && (entrepreneurSearch || filteredEntrepreneurs.length > 0) && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                        {filteredEntrepreneurs.length > 0 ? (
                                            filteredEntrepreneurs.map(ent => (
                                                <button
                                                    key={ent.id}
                                                    onClick={() => handleSelectEntrepreneur(ent)}
                                                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 flex flex-col
                                                        ${selectedEntrepreneurId === ent.id ? 'bg-blue-50' : ''}
                                                    `}
                                                >
                                                    <span className="font-semibold text-slate-800">{ent.businessName}</span>
                                                    <span className="text-xs text-slate-500">ผู้ประกอบการ: {ent.name}</span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-slate-500 text-sm italic">ไม่พบข้อมูลผู้ประกอบการ</div>
                                        )}
                                    </div>
                                )}

                                {isDropdownOpen && (
                                    <div
                                        className="fixed inset-0 z-0"
                                        onClick={() => setIsDropdownOpen(false)}
                                    ></div>
                                )}
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
                            <div className="space-y-4">
                                {recommendedConsultants.map((item, index) => (
                                    <div key={item.consultant.id || index} className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all bg-white shadow-sm">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-semibold text-slate-800 text-lg">{item.consultant.title}{item.consultant.firstName} {item.consultant.lastName}</h4>
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full font-bold text-sm">
                                                    <span>⭐</span> Match Score: {item.score}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 font-medium mb-2">{item.consultant.workplace}</p>

                                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 mb-3">
                                                <p className="text-sm text-slate-700">
                                                    <span className="font-semibold text-xs text-slate-500 uppercase tracking-wide mr-2">ความเชี่ยวชาญ:</span>
                                                    {getTranslatedExpertise(item.consultant.expertise)}
                                                </p>
                                            </div>

                                            {item.reasons.length > 0 && (
                                                <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-100 mb-3">
                                                    <span className="text-xs font-semibold text-blue-800 flex items-center gap-1 mb-1.5">
                                                        <SparklesIcon className="w-3.5 h-3.5" />
                                                        เหตุผลที่แนะนำ (AI Reasoning):
                                                    </span>
                                                    <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside ml-1">
                                                        {item.reasons.map((reason, idx) => (
                                                            <li key={idx} className="leading-relaxed">{reason}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
                                                {item.consultant.phone && <span className="flex items-center gap-1"><PhoneIcon className="w-3.5 h-3.5" /> {item.consultant.phone}</span>}
                                                {item.consultant.email && <span className="flex items-center gap-1"><EnvelopeIcon className="w-3.5 h-3.5" /> {item.consultant.email}</span>}
                                                {item.consultant.cv_url && (
                                                    <a href={item.consultant.cv_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium transition-colors ml-auto">
                                                        <span className="text-sm">📄</span> ดูประวัติย่อฉบับเต็ม
                                                    </a>
                                                )}
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
        </div >
    );
};

export default AIAnalysisView;
