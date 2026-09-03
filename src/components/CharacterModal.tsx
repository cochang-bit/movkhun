import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Wand2, Volume2, Sparkles, UserCheck } from 'lucide-react';
import { CharacterProfile } from '../types';
import { VOICE_OPTIONS } from '../data/voices';
import { dramaAudio } from '../utils/audioTTS';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterIndex: number;
  character: CharacterProfile;
  onSaveCharacter: (index: number, updated: CharacterProfile) => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  isOpen,
  onClose,
  characterIndex,
  character,
  onSaveCharacter,
}) => {
  const [name, setName] = useState(character.name || '');
  const [role, setRole] = useState(character.role || '');
  const [appearance, setAppearance] = useState(character.appearance || '');
  const [avatarUrl, setAvatarUrl] = useState(character.avatarUrl || '');
  const [visualPrompt, setVisualPrompt] = useState(character.visualPrompt || '');
  const [voiceId, setVoiceId] = useState(character.voiceId || 'adult_female_gentle');
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  useEffect(() => {
    setName(character.name || '');
    setRole(character.role || '');
    setAppearance(character.appearance || '');
    setAvatarUrl(character.avatarUrl || '');
    setVisualPrompt(character.visualPrompt || '');
    setVoiceId(character.voiceId || 'adult_female_gentle');
  }, [character]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setAvatarUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTestVoice = () => {
    setIsTestingVoice(true);
    dramaAudio.speakText(`สวัสดี ข้าคือ ${name || `ตัวละครที่ ${characterIndex + 1}`} ยินดีที่ได้ร่วมแสดงในละครเรื่องนี้`, voiceId, () => {
      setIsTestingVoice(false);
    });
  };

  const handleSave = () => {
    onSaveCharacter(characterIndex, {
      ...character,
      name,
      role,
      appearance,
      avatarUrl,
      visualPrompt,
      voiceId,
    });
    onClose();
  };

  const quickAppearanceTags = [
    'ห่มสไบทอง เครื่องประดับศิราภรณ์มรกต',
    'นุ่งโจงกระเบน เสื้อราชปะแตนสง่างาม',
    'มหาเทพ ผิวประกายแสงคราม มงกุฎชฎาสูง',
    'เกราะรบทองคำ ดาบคู่คู่ใจ',
    'ชุดสูทสากลเรียบหรู ทันสมัย',
    'ชุดชาวบ้านผ้าฝ้าย เรียบง่าย อบอุ่น'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-[#0e1018] border border-[#202536] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1c202e] flex items-center justify-between bg-[#121520]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                ปรับแต่งตัวละครที่ {characterIndex + 1}
              </h3>
              <p className="text-xs text-slate-400">
                กำหนดชื่อ บทบาท ลักษณะเด่น/การแต่งกาย และเสียงพากย์
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#181c28] transition-colors border border-transparent hover:border-[#2b3348] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 bg-[#0c0e15] overflow-y-auto">
          {/* Avatar Upload / Preview */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-[#141724] flex-shrink-0 shadow-lg">
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl bg-[#141724] hover:bg-[#1c2132] border border-[#262d42] hover:border-amber-500/40 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-amber-400" />
                <span>แนบรูปตัวละคร (จากเครื่อง)</span>
              </button>
              <p className="text-[11px] text-slate-400">
                รองรับไฟล์ JPG, PNG (AI จะนำหน้าตาและคาแรคเตอร์นี้ไปใช้ในทุกฉาก)
              </p>
            </div>
          </div>

          {/* Character Name */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              ชื่อตัวละคร
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น พระแม่ลักษมี, ออกหมื่นเดช, แม่มณี..."
              className="w-full bg-[#121520] border border-[#202536] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Character Role */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              บทบาท / นิสัย / ภูมิหลัง (Role & Personality)
            </label>
            <textarea
              rows={2}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="เช่น พระเอกผู้เสียสละ, เทวีแห่งความมั่งคั่ง, คู่ปรับเจ้าสำราญ..."
              className="w-full bg-[#121520] border border-[#202536] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none font-['Sarabun','Prompt',sans-serif]"
            />
          </div>

          {/* Appearance & Characteristics (New requested feature!) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>ลักษณะเด่น / การแต่งกาย / รูปร่าง (Appearance Traits)</span>
              </label>
              <span className="text-[10px] text-slate-400">ระบุเพิ่มได้ตามต้องการ</span>
            </div>
            <textarea
              rows={2}
              value={appearance}
              onChange={(e) => setAppearance(e.target.value)}
              placeholder="เช่น ชายหนุ่มวัย 28 ปี คมเข้ม นุ่งโจงกระเบนสีเข้ม เสื้อราชปะแตน สร้อยคอทองคำ หรือ สตรีเลอโฉม นุ่งสไบทอง ดอกบัวทิพย์..."
              className="w-full bg-[#121520] border border-amber-500/30 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none font-['Sarabun','Prompt',sans-serif]"
            />
            {/* Quick characteristic tags */}
            <div className="mt-1.5 flex flex-wrap gap-1">
              {quickAppearanceTags.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAppearance(prev => prev ? `${prev}, ${tag}` : tag)}
                  className="text-[10px] bg-[#171b29] hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-[#23293d] hover:border-amber-500/40 rounded-md px-2 py-0.5 transition-colors cursor-pointer"
                >
                  +{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                เสียงพากย์ประจำตัวละคร
              </label>
              <button
                type="button"
                onClick={handleTestVoice}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isTestingVoice ? 'กำลังพูด...' : 'ฟังเสียงตัวอย่าง'}</span>
              </button>
            </div>
            <select
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="w-full bg-[#121520] border border-[#202536] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {VOICE_OPTIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} ({v.tone})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#1c202e] flex items-center justify-end gap-3 bg-[#121520]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#181c28] hover:bg-[#222738] border border-[#293046] text-slate-300 text-xs font-medium cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            บันทึกตัวละคร
          </button>
        </div>
      </div>
    </div>
  );
};
