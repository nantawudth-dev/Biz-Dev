
import React, { useState } from 'react';
import { Consultant, Entrepreneur } from '../types';
import { SparklesIcon, BuildingOffice2Icon, UserCircleIcon, ArrowPathIcon } from './icons';

interface AIAnalysisViewProps {
    consultants: Consultant[];
    entrepreneurs: Entrepreneur[];
}

const AIAnalysisView: React.FC<AIAnalysisViewProps> = ({ consultants, entrepreneurs }) => {
    const [selectedEntrepreneurId, setSelectedEntrepreneurId] = useState<string>('');
    const [problemDescription, setProblemDescription] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [recommendedConsultants, setRecommendedConsultants] = useState<Consultant[]>([]);

    const handleAnalyze = () => {
        if (!problemDescription.trim() || !selectedEntrepreneurId) return;

        setIsAnalyzing(true);
        setAnalysisResult(null);
        setRecommendedConsultants([]);

        // Simulate AI Analysis Delay
        setTimeout(() => {
            const result = generateAnalysis(problemDescription);
            const experts = findExperts(problemDescription, consultants);

            setAnalysisResult(result);
            setRecommendedConsultants(experts);
            setIsAnalyzing(false);
        }, 2000);
    };

    const generateAnalysis = (text: string): string => {
        const keywords = [
            { terms: ['การตลาด', 'marketing', 'ขาย', 'ยอดขาย', 'ลูกค้า'], response: 'จากการวิเคราะห์ปัญหาด้านการตลาด แนะนำให้เน้นการสร้างแบรนด์และการทำการตลาดออนไลน์เพื่อเพิ่มการเข้าถึงลูกค้ากลุ่มใหม่ รวมถึงการวิเคราะห์ข้อมูลลูกค้าเพื่อปรับปรุงผลิตภัณฑ์และบริการให้ตรงใจกลุ่มเป้าหมายมากขึ้น' },
            { terms: ['การเงิน', 'finance', 'บัญชี', 'งบประมาณ', 'ขาดทุน', 'กำไร', 'ภาษี'], response: 'ปัญหาด้านการเงินและบัญชี ควรเริ่มต้นจากการจัดทำบัญชีรายรับ-รายจ่ายที่ชัดเจน วิเคราะห์จุดคุ้มทุน และวางแผนกระแสเงินสด (Cash Flow) เพื่อให้ธุรกิจมีสภาพคล่องเพียงพอ รวมถึงการตรวจสอบสิทธิประโยชน์ทางภาษีที่อาจช่วยลดต้นทุนได้' },
            { terms: ['ผลิต', 'production', 'โรงงาน', 'เครื่องจักร', 'คุณภาพ', 'loss', 'เสีย'], response: 'สำหรับปัญหาด้านการผลิต แนะนำให้ตรวจสอบกระบวนการผลิตเพื่อลดความสูญเสีย (Waste) และเพิ่มประสิทธิภาพด้วยแนวคิด Lean Manufacturing หรือการนำเทคโนโลยีมาช่วยในการควบคุมคุณภาพสินค้า' },
            { terms: ['เทคโนโลยี', 'technology', 'ซอฟต์แวร์', 'ระบบ', 'แอปพลิเคชัน', 'ออนไลน์', 'digital'], response: 'การนำเทคโนโลยีมาใช้จะช่วยเพิ่มประสิทธิภาพในการทำงานได้มาก แนะนำให้เริ่มต้นจากระบบจัดการพื้นฐาน เช่น POS หรือ CRM ที่เหมาะสมกับขนาดธุรกิจ และพิจารณาการทำ Digital Transformation เพื่อยกระดับความสามารถในการแข่งขัน' },
            { terms: ['คน', 'พนักงาน', 'hr', 'บริหาร', 'ทีม'], response: 'ปัญหาด้านการบริหารจัดการพนักงาน ควรเน้นการสื่อสารภายในองค์กรที่ชัดเจน การกำหนด KPI ที่เหมาะสม และการพัฒนาทักษะพนักงาน (Upskilling/Reskilling) เพื่อให้ทีมงานมีประสิทธิภาพและมีความสุขในการทำงาน' }
        ];

        let combinedResponse = '';

        keywords.forEach(k => {
            if (k.terms.some(term => text.toLowerCase().includes(term))) {
                combinedResponse += (combinedResponse ? ' ' : '') + k.response;
            }
        });

        if (!combinedResponse) {
            combinedResponse = 'จากการวิเคราะห์เบื้องต้น แนะนำให้ปรึกษาผู้เชี่ยวชาญเพื่อวิเคราะห์ปัญหาเชิงลึกและวางแผนแก้ไขปัญหาอย่างเป็นระบบ โดยอาจเริ่มจากการสำรวจสถานะปัจจุบันของธุรกิจ (Business Health Check) เพื่อระบุจุดอ่อนและจุดแข็งที่ชัดเจน';
        }

        return combinedResponse;
    };

    const findExperts = (text: string, allConsultants: Consultant[]): Consultant[] => {
        const textLower = text.toLowerCase();

        // Return consultants whose expertise matches keywords in the text
        return allConsultants.filter(consultant => {
            return consultant.expertise.some(exp => textLower.includes(exp.toLowerCase()) ||
                (exp === 'การตลาด' && (textLower.includes('marketing') || textLower.includes('ขาย'))) ||
                (exp === 'การเงิน' && (textLower.includes('finance') || textLower.includes('บัญชี')))
                // Add more mappings as needed
            );
        });
    };

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
                                            {consultant.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-800">{consultant.name}</h4>
                                            <p className="text-sm text-slate-500">ความเชี่ยวชาญ: {consultant.expertise.join(', ')}</p>
                                            <p className="text-sm text-slate-500 mt-1">ติดต่อ: {consultant.contact}</p>
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
