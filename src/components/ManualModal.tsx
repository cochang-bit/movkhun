import React from 'react';
import { X, BookOpen, Sparkles, Mic, Film, MessageSquare, Subtitles, CheckCircle2, Sliders } from 'lucide-react';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualModal: React.FC<ManualModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0e111a] border border-[#222838] rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#1f2434] flex items-center justify-between bg-[#131622]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                คู่มือการใช้งานแอพ <span className="text-amber-400 font-normal">"ขุนช้างสร้างเรื่อง"</span>
              </h2>
              <p className="text-[11px] text-slate-400">ขั้นตอนการสร้างละครไทย AI ตั้งแต่เริ่มคิดพล็อตจนถึงเรนเดอร์วิดีโอ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f2434] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-300 leading-relaxed custom-scrollbar">
          {/* Step 1 */}
          <div className="bg-[#121520] border border-[#202536] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-mono">1</div>
              <span>คิดชื่อเรื่อง & พล็อตเรื่องย่อ (Synopsis)</span>
            </div>
            <p className="text-slate-300 pl-7">
              • ไปที่แถบ <b>"โครงเรื่อง" (Story)</b> พิมพ์ชื่อเรื่องที่คุณต้องการลงในช่อง <i>"ชื่อเรื่องตั้งต้น"</i>
              <br />• กดปุ่ม <span className="text-amber-300 font-semibold">"คิดพล็อต AI"</span> เพื่อให้ระบบแต่งเรื่องย่อ คำโปรย และชื่อภาษาอังกฤษให้อัตโนมัติ หรือจะพิมพ์เรื่องย่อเองก็ได้
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#121520] border border-[#202536] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-mono">2</div>
              <span>เลือกโหมดคำบรรยาย & เสียงพากย์ (Narration Mode)</span>
            </div>
            <p className="text-slate-300 pl-7">
              เลือกรูปแบบบทพูดที่เหมาะกับละครของคุณในกล่อง <b>"โหมดคำบรรยาย & เสียงพากย์"</b>:
              <br />• <b>โหมดผสมผสาน:</b> มีทั้งเสียงบรรยายเปิดเรื่องและบทสนทนาของตัวละครอย่างสมดุล
              <br />• <b>โหมดเสียงบรรยายล้วน:</b> ทุกฉากเน้นการเล่าเรื่อง บรรยายอารมณ์ เหมาะกับแนวสารคดี นิทาน ตำนาน
              <br />• <b>โหมดบทสนทนาล้วน:</b> เน้นบทตัวละครโต้ตอบดราม่า เชือดเฉือน จัดจ้าน
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#121520] border border-[#202536] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-mono">3</div>
              <span>สร้างบทละคร & ปรับแต่งฉาก (Scenes & Dialogue)</span>
            </div>
            <p className="text-slate-300 pl-7">
              • กำหนดจำนวนฉาก (1-20 ฉาก) แล้วกดปุ่ม <b>"สร้างโครงเรื่อง & ทุกฉากด้วย AI"</b>
              <br />• ในแต่ละฉาก คุณสามารถแก้ไขข้อความบทพูด/คำบรรยาย เปลี่ยนผู้พูด หรือกดปุ่ม <b>"ปรับคำพูด"</b> เพื่อแปลงภาษาเป็นพีเรียดย้อนยุค วรรณคดี หรือดราม่า
              <br />• กด <b>"ทดลองพูด"</b> เพื่อฟังเสียงพากย์ และกด <b>สร้างภาพใหม่</b> เพื่อสุ่มภาพฉากด้วย AI
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-[#121520] border border-[#202536] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-mono">4</div>
              <span>สร้างโปสเตอร์ & รวมวิดีโอ (Export Video 9:16)</span>
            </div>
            <p className="text-slate-300 pl-7">
              • กดปุ่ม <b>"สร้างปกหนัง 4K"</b> ด้านบนเพื่อออกแบบโปสเตอร์ละครระดับโรงภาพยนตร์
              <br />• กดปุ่ม <span className="text-amber-400 font-bold">"รวมวิดีโอ & ส่งออก"</span> เพื่อเรนเดอร์ภาพเคลื่อนไหว (Ken-Burns Motion) รวมเสียงพากย์ ดนตรี และคำบรรยาย ออกมาเป็นไฟล์วิดีโอแนวตั้ง 9:16 พร้อมลง TikTok, Shorts, Reels
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1f2434] bg-[#10131d] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs cursor-pointer shadow-md transition-all active:scale-95"
          >
            เข้าใจแล้ว เริ่มสร้างละครเลย
          </button>
        </div>
      </div>
    </div>
  );
};
