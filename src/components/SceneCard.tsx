import React, { useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { SceneItem, CharacterProfile } from '../types';
import { VOICE_OPTIONS } from '../data/voices';
import { dramaAudio } from '../utils/audioTTS';

interface SceneCardProps {
  scene: SceneItem;
  characters: CharacterProfile[];
  onUpdateScene: (updated: Partial<SceneItem>) => void;
  onRegenerateImage: (sceneId: string) => void;
  onEnhanceDialogue: (sceneId: string, style: string) => void;
  onDeleteScene?: (sceneId: string) => void;
  isGeneratingImage?: boolean;
}

export const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  characters,
  onUpdateScene,
  onRegenerateImage,
  onEnhanceDialogue,
  onDeleteScene,
  isGeneratingImage = false,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);

  // Play Speech Audio
  const handleToggleVoice = () => {
    if (isPlayingAudio) {
      dramaAudio.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      dramaAudio.speakText(scene.dialogueText, scene.voiceId, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  // Speaker label
  const getSpeakerBadge = () => {
    switch (scene.dialogueSpeaker) {
      case 'narrator':
        return { label: 'คำบรรยาย', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'char1':
        return { label: characters[0]?.name || 'ตัวละคร 1', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' };
      case 'char2':
        return { label: characters[1]?.name || 'ตัวละคร 2', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'char3':
        return { label: characters[2]?.name || 'ตัวละคร 3', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'extra':
        return { label: 'ตัวประกอบ AI', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      default:
        return { label: 'บทสนทนา', color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const badge = getSpeakerBadge();

  return (
    <div className="w-[290px] sm:w-[310px] flex-shrink-0 flex flex-col gap-2.5 group">
      {/* Top Scene Header: Number Badge & Actions */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-lg uppercase font-mono tracking-wider">
          ฉากที่ {scene.sceneNumber}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onRegenerateImage(scene.id)}
            disabled={isGeneratingImage}
            className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-[#151926] cursor-pointer"
            title="สร้างภาพฉากนี้ใหม่ด้วย AI"
          >
            <RotateCcw className={`w-3 h-3 ${isGeneratingImage ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isGeneratingImage ? 'กำลังเจน...' : 'สร้างภาพใหม่'}</span>
          </button>

          {onDeleteScene && (
            <button
              onClick={() => onDeleteScene(scene.id)}
              className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="ลบฉากนี้"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Scene Media Box (9:16 portrait style) */}
      <div className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-[#202536] bg-[#10121a] shadow-xl group-hover:border-[#353d56] transition-all">
        {/* Scene Image / Video Visual */}
        <img
          src={scene.imageUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'}
          alt={scene.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-transparent to-black/60 pointer-events-none" />

        {/* Top Info overlay: Title & Setting */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1 pointer-events-none z-10">
          <div className="bg-black/75 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 max-w-[70%] shadow-md">
            <span className="text-[11px] font-semibold text-white block truncate leading-tight">{scene.title}</span>
          </div>
          {scene.settingTag && (
            <div className="bg-amber-500/25 backdrop-blur-md px-2 py-0.5 rounded-md border border-amber-500/40 shadow-md">
              <span className="text-[10px] font-medium text-amber-300">📍 {scene.settingTag}</span>
            </div>
          )}
        </div>

        {/* Video Player Controls Bar */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between bg-[#080a10]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleVoice}
              className="p-1 rounded-full text-white hover:text-amber-400 transition-colors cursor-pointer"
              title={isPlayingAudio ? 'หยุดเสียง' : 'เล่นเสียงพากย์ฉากนี้'}
            >
              {isPlayingAudio ? (
                <Pause className="w-4 h-4 text-amber-400 animate-pulse" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
            </button>
            <span className="text-[11px] font-mono text-slate-300">
              0:0{scene.durationSec || 5}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 text-slate-300 hover:text-white cursor-pointer"
              title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Editable Dialogue / Narration Box */}
      <div className="bg-[#11131c] border border-[#1e2333] rounded-xl p-3 space-y-2 group-hover:border-[#2f374e] transition-colors">
        {/* Dialogue Header with Speaker Selector */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <select
              value={scene.dialogueSpeaker}
              onChange={(e) => {
                const spk = e.target.value as any;
                let spkName = 'ผู้บรรยาย';
                let vId = scene.voiceId;
                if (spk === 'char1') {
                  spkName = characters[0]?.name || 'ตัวละคร 1';
                  vId = characters[0]?.voiceId || 'adult_female_gentle';
                } else if (spk === 'char2') {
                  spkName = characters[1]?.name || 'ตัวละคร 2';
                  vId = characters[1]?.voiceId || 'adult_male_confident';
                } else if (spk === 'char3') {
                  spkName = characters[2]?.name || 'ตัวละคร 3';
                  vId = characters[2]?.voiceId || 'elderly_male_calm';
                } else if (spk === 'extra') {
                  spkName = 'ตัวประกอบ';
                  vId = 'young_male_energetic';
                }
                onUpdateScene({
                  dialogueSpeaker: spk,
                  dialogueSpeakerName: spkName,
                  voiceId: vId,
                });
              }}
              className={`text-[11px] font-medium px-2 py-0.5 rounded-lg border cursor-pointer focus:outline-none max-w-full truncate ${badge.color}`}
            >
              <option value="narrator">บทบรรยาย</option>
              <option value="char1">ตัวละคร 1: {characters[0]?.name || 'ตัวเอก 1'}</option>
              <option value="char2">ตัวละคร 2: {characters[1]?.name || 'ตัวเอก 2'}</option>
              <option value="char3">ตัวละคร 3: {characters[2]?.name || 'ตัวเอก 3'}</option>
              <option value="extra">ตัวประกอบ (AI Extra)</option>
            </select>
          </div>

          {/* AI Dialogue Polish Menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 cursor-pointer"
              title="ปรับแต่งสำนวนบทพูดด้วย AI"
            >
              <Sparkles className="w-3 h-3" />
              <span>ปรับคำพูด</span>
            </button>

            {showStyleMenu && (
              <div className="absolute right-0 top-6 w-48 bg-[#141722] border border-[#272d42] rounded-xl shadow-2xl p-1.5 z-30 space-y-1">
                <div className="text-[10px] text-slate-400 px-2 py-1 border-b border-[#202536]">
                  เลือกสไตล์บทพูดภาษาไทย:
                </div>
                {[
                  { id: 'royal_mythology', name: '👑 เทพปกรณัม / วรรณคดี' },
                  { id: 'period_thai', name: '🪷 พีเรียดย้อนยุค (อโยธยา)' },
                  { id: 'modern_dramatic', name: '🔥 ดราม่าเชือดเฉือน' },
                  { id: 'sweet_romance', name: '💖 โรแมนติก หวานซึ้ง' },
                  { id: 'action_epic', name: '⚔️ แอ็กชัน ฮึกเหิม' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onEnhanceDialogue(scene.id, s.id);
                      setShowStyleMenu(false);
                    }}
                    className="w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 transition-colors"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Text Area for Dialogue Editing */}
        <textarea
          rows={3}
          value={scene.dialogueText}
          onChange={(e) => onUpdateScene({ dialogueText: e.target.value })}
          className="w-full bg-[#0a0c12] border border-[#202536] rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed resize-none font-['Sarabun','Prompt',sans-serif]"
          placeholder="พิมพ์บทสนทนาหรือคำบรรยาย..."
        />

        {/* Bottom Voice Selector & Speak indicator */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
          <div className="flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-amber-400" />
            <span className="truncate max-w-[150px]">
              {VOICE_OPTIONS.find((v) => v.id === scene.voiceId)?.name || 'เสียงมาตรฐาน'}
            </span>
          </div>

          <button
            onClick={handleToggleVoice}
            className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
          >
            {isPlayingAudio ? 'กำลังเล่น...' : 'ทดลองพูด'}
          </button>
        </div>
      </div>
    </div>
  );
};

