import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Users,
  Settings2,
  Volume2,
  Wand2,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Play,
  Layers,
  Film,
  Mic,
  MessageSquare,
  Radio,
  Subtitles,
  RotateCcw,
  Dices
} from 'lucide-react';
import { CharacterProfile, DramaProject } from '../types';
import { VOICE_OPTIONS } from '../data/voices';
import { PRESET_DRAMAS } from '../data/presetStories';
import { dramaAudio } from '../utils/audioTTS';

interface SidebarProps {
  project: DramaProject;
  onUpdateProject: (updated: Partial<DramaProject>) => void;
  onGenerateStory: () => void;
  isGenerating: boolean;
  onOpenCharacterModal: (characterIndex: number) => void;
  onGenerateTitle?: (genreOrIdea?: string) => void;
  isGeneratingTitle?: boolean;
  onGenerateSynopsisFromTitle?: () => void;
  isGeneratingSynopsis?: boolean;
  onGenerateCharactersFromSynopsis?: () => void;
  isGeneratingCharacters?: boolean;
  onOpenCinemaPoster?: () => void;
  activeTab?: 'story' | 'characters' | 'settings';
  onTabChange?: (tab: 'story' | 'characters' | 'settings') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  project,
  onUpdateProject,
  onGenerateStory,
  isGenerating,
  onOpenCharacterModal,
  onGenerateTitle,
  isGeneratingTitle = false,
  onGenerateSynopsisFromTitle,
  isGeneratingSynopsis = false,
  onGenerateCharactersFromSynopsis,
  isGeneratingCharacters = false,
  onOpenCinemaPoster,
  activeTab: controlledTab,
  onTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<'story' | 'characters' | 'settings'>('story');
  const activeTab = controlledTab || internalTab;

  const handleSelectTab = (tab: 'story' | 'characters' | 'settings') => {
    setInternalTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const [isTestingVoice, setIsTestingVoice] = useState<string | null>(null);

  // Test Voice Playback
  const handleTestVoice = (voiceId: string, testText: string) => {
    setIsTestingVoice(voiceId);
    dramaAudio.speakText(testText, voiceId, () => {
      setIsTestingVoice(null);
    });
  };

  // Load Preset Story
  const handleLoadPreset = (preset: DramaProject) => {
    onUpdateProject({
      title: preset.title,
      englishTitle: preset.englishTitle,
      subtitle: preset.subtitle,
      synopsis: preset.synopsis,
      sceneCount: preset.sceneCount,
      narratorVoiceId: preset.narratorVoiceId,
      characters: preset.characters,
      scenes: preset.scenes,
      posterUrl: preset.posterUrl,
      cinemaPoster: preset.cinemaPoster,
    });
  };

  return (
    <aside className="w-80 sm:w-96 flex-shrink-0 bg-[#0b0d14] border-r border-[#1c202e] flex flex-col h-[calc(100vh-4rem)] select-none">
      {/* Top 3-Tab Segmented Control (Clean, modern, uncluttered) */}
      <div className="p-3 border-b border-[#1c202e] bg-[#0e1018]">
        <div className="grid grid-cols-3 gap-1 bg-[#08090f] p-1 rounded-xl border border-[#1a1e2c]">
          <button
            onClick={() => handleSelectTab('story')}
            className={`py-2 px-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'story'
                ? 'bg-[#181c28] text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. โครงเรื่อง</span>
          </button>

          <button
            onClick={() => handleSelectTab('characters')}
            className={`py-2 px-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'characters'
                ? 'bg-[#181c28] text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2. ตัวละคร & สคริปต์</span>
          </button>

          <button
            onClick={() => handleSelectTab('settings')}
            className={`py-2 px-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#181c28] text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>3. วิดีโอ</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-200 custom-scrollbar">
        {/* ================= TAB 1: STORY & SCENES ================= */}
        {activeTab === 'story' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Quick Preset Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>✨ เรื่องย่อต้นแบบ (1-คลิกโหลด)</span>
                <span className="text-[10px] text-amber-400 font-normal">เปลี่ยนได้อิสระ</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_DRAMAS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLoadPreset(preset)}
                    className={`text-left p-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      project.title === preset.title
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-xs'
                        : 'bg-[#11141e] border-[#1d2232] text-slate-300 hover:border-[#2f374e] hover:bg-[#151926]'
                    }`}
                  >
                    <div className="truncate font-semibold text-slate-200">{preset.title.split(':')[0]}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {preset.sceneCount} ฉาก • {preset.characters.length} ตัวละคร
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Drama Title & Auto-Generate Synopsis */}
            <div className="space-y-2.5 bg-[#11141e] border border-[#202536] rounded-xl p-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>ชื่อเรื่องละคร (Drama Title)</span>
                </label>
                {onGenerateTitle && (
                  <button
                    type="button"
                    onClick={() => onGenerateTitle()}
                    disabled={isGeneratingTitle}
                    className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer disabled:opacity-50"
                    title="ให้ AI ช่วยคิดชื่อเรื่องละครใหม่ที่น่าสนใจ"
                  >
                    {isGeneratingTitle ? (
                      <div className="w-2.5 h-2.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Dices className="w-3 h-3" />
                    )}
                    <span>เจนชื่อเรื่อง AI</span>
                  </button>
                )}
              </div>

              {/* Quick Genre Pills for Title Generation */}
              {onGenerateTitle && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { label: '🎲 สุ่มชื่อ', genre: 'ละครไทยแฟนตาซีดราม่า' },
                    { label: '👑 พีเรียดไทย', genre: 'ละครพีเรียดย้อนยุคอโยธยา' },
                    { label: '🔮 แฟนตาซีเทพนิยาย', genre: 'ละครแฟนตาซีอภินิหารเทพเจ้า' },
                    { label: '💔 รักดราม่าเข้มข้น', genre: 'ละครรักโรแมนติกดราม่าเชือดเฉือน' },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isGeneratingTitle}
                      onClick={() => onGenerateTitle(p.genre)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#181d2c] hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-[#262f45] hover:border-amber-500/40 whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => onUpdateProject({ title: e.target.value })}
                  placeholder="พิมพ์ชื่อเรื่อง เช่น รอยรักรอยแค้น, พระอภัยมณี 2026..."
                  className="flex-1 bg-[#090b10] border border-[#202536] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
                />
                <button
                  type="button"
                  id="btn-auto-gen-synopsis"
                  onClick={onGenerateSynopsisFromTitle}
                  disabled={isGeneratingSynopsis || !project.title.trim()}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer flex-shrink-0 transition-all"
                  title="ให้ AI คิดพล็อตและเรื่องย่อให้อัตโนมัติจากชื่อเรื่อง"
                >
                  {isGeneratingSynopsis ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span className="hidden sm:inline">กำลังคิด...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5 text-slate-950" />
                      <span>คิดพล็อต AI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status Note: Synced to Cinema Poster */}
              <div className="bg-[#0b0e17] border border-amber-500/30 rounded-lg p-2.5 flex items-center justify-between text-[11px] shadow-xs">
                <div className="flex items-center gap-1.5 text-amber-300 truncate mr-2">
                  <Film className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="truncate">
                    ส่งข้อมูลให้เมนู <b>สร้างปกหนัง 4K</b> แล้ว
                  </span>
                </div>
                {onOpenCinemaPoster && (
                  <button
                    type="button"
                    onClick={onOpenCinemaPoster}
                    className="text-[10px] text-amber-400 hover:text-amber-200 font-semibold underline flex items-center gap-0.5 cursor-pointer flex-shrink-0"
                    title="เปิดหน้าต่างสร้างปกหนังโรงภาพยนตร์เพื่อดูตัวอย่างโปสเตอร์ 4K ทันที"
                  >
                    <span>เปิดดูปกหนัง 4K</span>
                    <span>→</span>
                  </button>
                )}
              </div>

              <p className="text-[10px] text-slate-400">
                💡 เมื่อเจนชื่อเรื่องหรือพล็อต ระบบจะอัปเดตชื่อภาษาไทย, อังกฤษ, และคำโปรยไปยังเมนู <b>"สร้างปกหนัง"</b> ทันที
              </p>
            </div>

            {/* Synopsis Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  เรื่องย่อ (Synopsis)
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {project.synopsis.length} ตัวอักษร
                </span>
              </div>
              <textarea
                rows={4}
                value={project.synopsis}
                onChange={(e) => onUpdateProject({ synopsis: e.target.value })}
                placeholder="พิมพ์เรื่องย่อ หรือพล็อตละครที่ต้องการ เช่น เรื่องราวความรักข้ามภพชาติ หรือตำนานกำเนิดพระแม่ลักษมี..."
                className="w-full bg-[#11141e] border border-[#202536] rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed resize-none font-['Sarabun','Prompt',sans-serif] transition-colors"
              />
            </div>

            {/* Step 2 Workflow: Send Synopsis to Script to Generate Characters */}
            {onGenerateCharactersFromSynopsis && (
              <div className="bg-gradient-to-br from-[#141829] to-[#0c0e17] border border-amber-500/40 rounded-xl p-3.5 space-y-2.5 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>ส่งเรื่องย่อไปเจนตัวละคร (AI)</span>
                  </span>
                  <span className="text-[10px] text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md font-medium">
                    แนะนำ
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  ส่งเรื่องย่อเข้าสู่ฝั่งสคริปต์ เพื่อให้ AI ออกแบบ 3 ตัวละครหลัก พร้อมระบุลักษณะเด่น รูปร่าง และการแต่งกาย จากนั้นจึงสร้างฉากคลิปสั้นต่อ
                </p>
                <button
                  type="button"
                  id="btn-send-synopsis-to-characters"
                  onClick={onGenerateCharactersFromSynopsis}
                  disabled={isGeneratingCharacters || !project.synopsis.trim()}
                  className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-98 disabled:opacity-50 cursor-pointer transition-all"
                >
                  {isGeneratingCharacters ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>กำลังส่งเรื่องย่อ & วิเคราะห์ตัวละคร...</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 text-slate-950" />
                      <span>ส่งเรื่องย่อ & เจน 3 ตัวละครหลัก (AI)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Narration Mode Selector */}
            <div className="bg-[#11141e] border border-[#202536] rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-amber-400" />
                  <span>โหมดคำบรรยาย & เสียงพากย์ (Narration Mode)</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  {
                    id: 'mixed',
                    label: 'ผสมผสาน',
                    sub: 'บทพูด + บรรยาย',
                    icon: Radio,
                  },
                  {
                    id: 'full_narrator',
                    label: 'เสียงบรรยายล้วน',
                    sub: 'เล่าเรื่อง/นิทาน',
                    icon: Mic,
                  },
                  {
                    id: 'dialogue_only',
                    label: 'บทสนทนาล้วน',
                    sub: 'ตัวละครโต้ตอบ',
                    icon: MessageSquare,
                  },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = (project.narrationMode || 'mixed') === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => onUpdateProject({ narrationMode: mode.id as any })}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-xs'
                          : 'bg-[#0b0d14] border-[#1f2434] text-slate-400 hover:text-slate-200 hover:border-[#2f374e]'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                      <div className="text-[11px] font-semibold leading-tight">{mode.label}</div>
                      <div className="text-[9px] text-slate-400 leading-tight truncate max-w-full">{mode.sub}</div>
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                {(project.narrationMode || 'mixed') === 'full_narrator' && '🎙️ ทุกฉากจะเน้นเสียงบรรยายเล่าเรื่อง ลึกซึ้ง ไพเราะ เหมาะกับแนวสารคดี นิทาน หรือมหากาพย์'}
                {(project.narrationMode || 'mixed') === 'dialogue_only' && '💬 ทุกฉากจะเน้นบทสนทนาโต้ตอบระหว่างตัวละคร ดราม่าเข้มข้น จัดจ้าน'}
                {(project.narrationMode || 'mixed') === 'mixed' && '🎭 ผสมผสานทั้งเสียงบรรยายเปิดเรื่องและบทสนทนาของตัวละครอย่างสมดุล'}
              </p>
            </div>

            {/* Scene Count (1-20 scenes) */}
            <div className="bg-[#11141e] border border-[#202536] rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>จำนวนฉากของละคร</span>
                </span>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-lg border border-amber-500/30 font-mono">
                  {project.sceneCount} ฉาก
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-4 gap-1.5">
                {[3, 5, 8, 12].map((num) => (
                  <button
                    key={num}
                    onClick={() => onUpdateProject({ sceneCount: num })}
                    className={`py-1 text-xs rounded-lg border transition-all cursor-pointer font-medium ${
                      project.sceneCount === num
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-[#161a26] border-[#252b3e] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {num} ฉาก
                  </button>
                ))}
              </div>

              <input
                type="range"
                min={1}
                max={20}
                value={project.sceneCount}
                onChange={(e) => onUpdateProject({ sceneCount: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-[#1b202e] rounded-lg mt-1"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 ฉาก (สั้น)</span>
                <span>10 ฉาก</span>
                <span>20 ฉาก (จุใจ)</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              id="btn-generate-ai-story"
              onClick={onGenerateStory}
              disabled={isGenerating || !project.synopsis.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>กำลังเขียนบทและสร้างฉาก ({project.sceneCount} ฉาก)...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-slate-950" />
                  <span>สร้างบทละครด้วย AI (Gemini 3.8 Flash)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ================= TAB 2: CHARACTERS & SCRIPT ================= */}
        {activeTab === 'characters' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Quick Re-generate from Synopsis Action */}
            {onGenerateCharactersFromSynopsis && (
              <div className="bg-gradient-to-r from-[#141828] to-[#101320] border border-[#232a3e] rounded-xl p-3 flex items-center justify-between gap-2 shadow-xs">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>วิเคราะห์ตัวละครจากเรื่องย่อ</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    ระบุลักษณะเด่น รูปร่าง หรือการแต่งกายเพิ่มเติมได้
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onGenerateCharactersFromSynopsis}
                  disabled={isGeneratingCharacters || !project.synopsis.trim()}
                  className="px-2.5 py-1.5 rounded-lg bg-[#181c2b] hover:bg-amber-500/20 border border-[#2d364f] hover:border-amber-500/40 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 disabled:opacity-50"
                  title="ให้ AI วิเคราะห์เรื่องย่อเพื่อคิดตัวละครใหม่"
                >
                  {isGeneratingCharacters ? (
                    <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <RotateCcw className="w-3 h-3" />
                  )}
                  <span>{isGeneratingCharacters ? 'กำลังคิด...' : 'เจนใหม่'}</span>
                </button>
              </div>
            )}

            {/* Narrator Voice */}
            <div className="bg-[#11141e] border border-[#202536] rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>เสียงผู้บรรยาย (Narrator)</span>
                </label>
                <button
                  onClick={() =>
                    handleTestVoice(
                      project.narratorVoiceId,
                      'ในยุคบรรพกาล ความมั่งคั่งและสิริมงคลมีจุดกำเนิดอันยิ่งใหญ่'
                    )
                  }
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 cursor-pointer"
                  title="ทดลองฟังเสียงผู้บรรยาย"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isTestingVoice === project.narratorVoiceId ? 'กำลังพูด...' : 'ฟังตัวอย่าง'}</span>
                </button>
              </div>

              <select
                value={project.narratorVoiceId}
                onChange={(e) => onUpdateProject({ narratorVoiceId: e.target.value })}
                className="w-full bg-[#0b0d14] border border-[#222738] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {VOICE_OPTIONS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 3 Main Characters */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-0.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>3 ตัวละครหลัก (ระบุลักษณะเด่นได้)</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  คลิกที่รูปเพื่อปรับแต่งภาพ
                </span>
              </div>

              <div className="space-y-3">
                {project.characters.map((char, index) => (
                  <div
                    key={char.id}
                    className="bg-[#11141e] border border-[#202536] rounded-xl p-3 space-y-2.5 hover:border-[#2f374e] transition-colors shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      {/* Character Avatar thumbnail */}
                      <button
                        onClick={() => onOpenCharacterModal(index)}
                        className="relative group w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-[#2c3246] bg-[#1a1d2b] cursor-pointer shadow-xs"
                        title="คลิกเพื่อแนบรูปหรือแก้ไขรายละเอียดตัวละคร"
                      >
                        <img
                          src={char.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                          alt={char.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Wand2 className="w-4 h-4 text-amber-300" />
                        </div>
                      </button>

                      {/* Character Name input & Voice Test */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-amber-400 font-mono uppercase">
                            ตัวละครที่ {index + 1}
                          </span>
                          <button
                            onClick={() =>
                              handleTestVoice(
                                char.voiceId,
                                `สวัสดี ข้าคือ ${char.name} พร้อมแสดงบทบาทในละครเรื่องนี้แล้ว`
                              )
                            }
                            className="text-[10px] text-slate-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                            title="ทดสอบเสียงตัวละคร"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>{isTestingVoice === char.voiceId ? 'กำลังพูด...' : 'ฟังเสียง'}</span>
                          </button>
                        </div>

                        <input
                          type="text"
                          value={char.name}
                          onChange={(e) => {
                            const updatedChars = [...project.characters];
                            updatedChars[index] = { ...char, name: e.target.value };
                            onUpdateProject({ characters: updatedChars });
                          }}
                          placeholder={`ชื่อตัวละคร ${index + 1}`}
                          className="w-full bg-[#0b0d14] border border-[#202536] rounded-md px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                        />
                      </div>
                    </div>

                    {/* Role Input */}
                    <div>
                      <input
                        type="text"
                        value={char.role || ''}
                        onChange={(e) => {
                          const updatedChars = [...project.characters];
                          updatedChars[index] = { ...char, role: e.target.value };
                          onUpdateProject({ characters: updatedChars });
                        }}
                        placeholder="บทบาท เช่น เทวีแห่งความมั่งคั่ง, ชายหนุ่มผู้กตัญญู..."
                        className="w-full bg-[#090b10] border border-[#1f2434] rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Appearance & Characteristics Input (Requested feature) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-semibold text-amber-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>ลักษณะเด่น / การแต่งกาย / รูปร่าง</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => onOpenCharacterModal(index)}
                          className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                        >
                          +ตั้งค่าละเอียด
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={char.appearance || ''}
                        onChange={(e) => {
                          const updatedChars = [...project.characters];
                          updatedChars[index] = { ...char, appearance: e.target.value };
                          onUpdateProject({ characters: updatedChars });
                        }}
                        placeholder="ระบุลักษณะเด่น รูปร่าง การแต่งกาย เช่น สตรีเลอโฉม นุ่งสไบทอง ดอกบัวทิพย์, ชายหนุ่มนุ่งโจงกระเบนเข้ม..."
                        className="w-full bg-[#090b10] border border-[#1f2434] hover:border-amber-500/40 rounded-lg p-2 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed resize-none font-['Sarabun','Prompt',sans-serif]"
                      />
                      {/* Quick Tag additions */}
                      <div className="flex flex-wrap gap-1">
                        {['+ห่มสไบทอง', '+นุ่งโจงกระเบน', '+ชุดสูทสากล', '+เกราะรบทองคำ'].map((tag, tIdx) => (
                          <button
                            key={tIdx}
                            type="button"
                            onClick={() => {
                              const cleanTag = tag.replace('+', '');
                              const currentVal = char.appearance || '';
                              const newVal = currentVal ? `${currentVal}, ${cleanTag}` : cleanTag;
                              const updatedChars = [...project.characters];
                              updatedChars[index] = { ...char, appearance: newVal };
                              onUpdateProject({ characters: updatedChars });
                            }}
                            className="text-[9px] bg-[#141724] hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border border-[#212638] rounded px-1.5 py-0.5 cursor-pointer transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Voice Selector */}
                    <div>
                      <select
                        value={char.voiceId}
                        onChange={(e) => {
                          const updatedChars = [...project.characters];
                          updatedChars[index] = { ...char, voiceId: e.target.value };
                          onUpdateProject({ characters: updatedChars });
                        }}
                        className="w-full bg-[#0b0d14] border border-[#202536] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer truncate"
                      >
                        {VOICE_OPTIONS.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.label} ({v.tone})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue to Generate Short Video Scenes Button (Requested next step!) */}
            <div className="pt-2 space-y-2">
              <button
                id="btn-generate-scenes-from-characters"
                onClick={onGenerateStory}
                disabled={isGenerating || !project.synopsis.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>กำลังเจนฉากคลิปสั้น ({project.sceneCount} ฉาก)...</span>
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4 text-slate-950" />
                    <span>🎬 เจนฉากคลิปสั้นต่อ ({project.sceneCount} ฉาก)</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-slate-400">
                AI จะนำตัวละครและลักษณะเด่นที่คุณระบุ ไปเขียนบทและสร้างฉากคลิปสั้นทันที
              </p>
            </div>
          </div>
        )}

        {/* ================= TAB 3: VIDEO SETTINGS & ENGINE ================= */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Subtitle Display Settings */}
            <div className="bg-[#11141e] border border-[#202536] rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Subtitles className="w-3.5 h-3.5 text-amber-400" />
                  <span>การแสดงผลคำบรรยายในวิดีโอ</span>
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateProject({ subtitleEnabled: project.subtitleEnabled === false ? true : false })}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    project.subtitleEnabled !== false ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      project.subtitleEnabled !== false ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {project.subtitleEnabled !== false
                  ? '✅ เปิดแสดงกล่องคำบรรยายและชื่อผู้พูดด้านล่างวิดีโออย่างคมชัด'
                  : '❌ ปิดคำบรรยาย (แสดงเฉพาะภาพเคลื่อนไหวและเสียงพากย์)'}
              </p>
            </div>

            {/* Video Model Selector */}
            <div className="bg-[#11141e] border border-[#202536] rounded-xl p-3.5 space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                โมเดลวิดีโอ (Video Model)
              </label>
              <div className="bg-[#0b0d14] border border-[#222738] rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-200">
                    {project.videoModel || 'Veo 3.1 - Lite [Lower Priority]'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    ความละเอียดระดับ 1080p แบบแนวตั้ง (9:16)
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md font-medium">
                  พร้อมใช้งาน
                </span>
              </div>
            </div>

            {/* AI Continuity Engine info */}
            <div className="bg-[#11141e] border border-[#202536] rounded-xl p-3.5 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>AI Story Continuity & Thai Literary Tone</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                ระบบใช้โมเดล Gemini 3.7 Flash ในการคุมเนื้อเรื่องให้ต่อเนื่องตั้งแต่ฉากที่ 1 จนถึงฉากสุดท้ายโดยไม่มีหลุดพล็อต พร้อมสร้างบทตัวประกอบและเสียงพากย์อัตโนมัติ
              </p>
            </div>

            {/* Export Format Note */}
            <div className="bg-[#11141e] border border-[#202536] rounded-xl p-3.5 space-y-1.5 text-xs text-slate-400">
              <div className="font-medium text-slate-200 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                <span>รูปแบบการส่งออก (Export)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                วิดีโอ MP4 / WebM แนวตั้ง 9:16 พร้อมเสียงพากย์ภาษาไทย และเสียงดนตรีประกอบ สามารถนำไปอัปโหลดบน TikTok, YouTube Shorts และ Reels ได้ทันที
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
