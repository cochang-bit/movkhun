import React from 'react';
import { X, Server, Key, AlertTriangle, CheckCircle2, ExternalLink, Globe, Sparkles, Copy, Check } from 'lucide-react';

interface DeploymentHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'checking' | 'connected' | 'missing_key' | 'unreachable';
}

export const DeploymentHelpModal: React.FC<DeploymentHelpModalProps> = ({
  isOpen,
  onClose,
  status,
}) => {
  const [copiedKeyName, setCopiedKeyName] = React.useState(false);

  if (!isOpen) return null;

  const copyKeyName = () => {
    navigator.clipboard.writeText('GEMINI_API_KEY');
    setCopiedKeyName(true);
    setTimeout(() => setCopiedKeyName(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0e111a] border border-[#222838] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1f2434] flex items-center justify-between bg-[#131622]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                วิธีเปิดใช้งานบนเว็บแอพ <span className="text-amber-400">(Vercel / โฮสติ้งภายนอก)</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                สาเหตุที่กดใช้ AI ไม่ได้ และ 3 ขั้นตอนในการเปิดใช้งานให้สมบูรณ์
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f2434] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs text-slate-300 leading-relaxed custom-scrollbar">
          {/* Current Status Badge */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            status === 'connected'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            {status === 'connected' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-bold text-sm text-white">
                สถานะปัจจุบัน:{' '}
                {status === 'connected'
                  ? '✅ เชื่อมต่อ Backend AI เรียบร้อยพร้อมใช้งาน'
                  : status === 'missing_key'
                  ? '⚠️ พบบริการ Server แล้ว แต่ยังไม่ได้ใส่ GEMINI_API_KEY บนโฮสต์'
                  : '⚠️ ไม่พบ Backend Server บนโฮสติ้ง (Vercel รันเฉพาะหน้า Static HTML)'}
              </div>
              <p className="text-[11px] text-slate-300">
                {status === 'connected'
                  ? 'ระบบพร้อมสร้างบทละคร คิดพล็อต และสร้างภาพ AI 4K ได้ทันที'
                  : 'แอปนี้เป็นแบบ Full-Stack ต้องการ Backend Server (Express/Node.js) และ Gemini API Key เพื่อประมวลผลคำสั่ง AI'}
              </p>
            </div>
          </div>

          {/* Section: Why it didn't work on Vercel */}
          <div className="bg-[#121520] border border-[#202536] rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>ทำไมนำขึ้น Vercel แล้วกดปุ่ม AI ถึงไม่ตอบสนอง?</span>
            </h3>
            <p className="text-slate-300 leading-normal pl-4">
              1. <b>Vercel ค่าเริ่มต้นรันเฉพาะหน้าบ้าน (Static HTML/Vite):</b> ทำให้เมื่อกดสร้างละครหรือเจนภาพ เบราว์เซอร์จะยิงหา <code>/api/...</code> แล้วพบว่าไม่มี Server คอยตอบกลับ (Error 404)<br />
              2. <b>ยังไม่มี API Key:</b> ใน Google AI Studio มีระบบคีย์ให้อัตโนมัติ แต่บน Vercel คุณต้องเพิ่ม <code>GEMINI_API_KEY</code> ในแดชบอร์ด Vercel ด้วยตัวเอง
            </p>
          </div>

          {/* Solution 1: Direct Link in AI Studio */}
          <div className="bg-gradient-to-r from-[#171c2b] to-[#121622] border border-amber-500/40 rounded-xl p-4 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>ทางเลือกที่ 1 (เร็วที่สุด): ใช้งานผ่าน Google AI Studio Cloud Run</span>
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                แนะนำ 100%
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-normal">
              ใน Google AI Studio มีเซิร์ฟเวอร์ Cloud Run ที่รันทั้ง <b>Frontend + Express Server + Gemini API Key</b> ให้ครบพร้อมใช้งานทันทีโดยไม่ต้องตั้งค่าใดๆ:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 pl-1">
              <li>กลับไปที่แท็บเบราว์เซอร์ <b>Google AI Studio</b> ที่เปิดอยู่</li>
              <li>ใช้ปุ่ม <b>"Share"</b> หรือ <b>"Deploy"</b> ที่มุมขวาบนของ AI Studio เพื่อสร้างลิงก์สำหรับเปิดดูและแชร์ได้ทันที</li>
            </ul>
          </div>

          {/* Solution 2: Setup Vercel */}
          <div className="bg-[#121520] border border-[#202536] rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              <span>ทางเลือกที่ 2: ตั้งค่า Vercel (khunchangmov.vercel.app) ให้ใช้งานได้</span>
            </h3>
            <p className="text-[11px] text-slate-300">
              เราได้เพิ่มไฟล์ <b><code>vercel.json</code></b> และ <b><code>api/index.ts</code></b> ลงในโค้ดให้แล้ว เพียงทำตาม 3 ขั้นตอนดังนี้:
            </p>

            <div className="space-y-2.5 pl-2">
              {/* Step 1 */}
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                  1
                </div>
                <div className="space-y-1 flex-1">
                  <div className="font-semibold text-slate-200">นำโค้ดล่าสุดขึ้น GitHub</div>
                  <p className="text-[11px] text-slate-400">
                    Export โค้ดหรือ Sync การเปลี่ยนแปลงที่มีไฟล์ <code>vercel.json</code> และ <code>api/index.ts</code> เข้าไปใน Git Repository
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="font-semibold text-slate-200">เพิ่ม Environment Variable บน Vercel</div>
                  <p className="text-[11px] text-slate-400">
                    ไปที่ Vercel Dashboard &gt; เลือกโปรเจกต์ <code>khunchangmov</code> &gt; เมนู <b>Settings</b> &gt; <b>Environment Variables</b>
                  </p>
                  <div className="bg-[#0b0e15] border border-[#1f2537] rounded-lg p-2 flex items-center justify-between">
                    <div className="font-mono text-amber-300 text-[11px]">
                      Key: <span className="text-white font-bold">GEMINI_API_KEY</span>
                    </div>
                    <button
                      onClick={copyKeyName}
                      className="px-2 py-1 bg-[#1a2030] hover:bg-[#252d45] text-slate-300 text-[10px] rounded border border-[#2a344d] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedKeyName ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKeyName ? 'คัดลอกแล้ว' : 'คัดลอกชื่อ Key'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    ส่วน Value ให้ใส่ Gemini API Key ที่ได้จาก{' '}
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 underline hover:text-amber-300 inline-flex items-center gap-0.5"
                    >
                      Google AI Studio API Keys <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                  3
                </div>
                <div className="space-y-1 flex-1">
                  <div className="font-semibold text-slate-200">กดสั่ง Redeploy บน Vercel</div>
                  <p className="text-[11px] text-slate-400">
                    ไปที่แท็บ <b>Deployments</b> บน Vercel &gt; คลิกปุ่ม <b>...</b> ที่ Deployment ล่าสุด &gt; เลือก <b>Redeploy</b> เพื่อให้คีย์และ Vercel Serverless Function เริ่มทำงาน
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1f2434] bg-[#131622] flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            สตูดิโอละครไทย AI "ขุนช้างสร้างเรื่อง"
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            เข้าใจแล้ว ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
