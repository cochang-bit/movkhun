import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Film,
  Video,
  Layers,
  Plus,
  Wand2,
  Music,
  Volume2,
  VolumeX,
  AlertCircle,
  LayoutGrid,
  Columns,
  FileText,
  Trash2,
  Play,
  RotateCcw
} from 'lucide-react';
import { DramaProject, SceneItem, CharacterProfile } from './types';
import { PRESET_DRAMAS } from './data/presetStories';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PosterCard } from './components/PosterCard';
import { SceneCard } from './components/SceneCard';
import { CinemaPosterModal } from './components/CinemaPosterModal';
import { VideoExportModal } from './components/VideoExportModal';
import { CharacterModal } from './components/CharacterModal';
import { ManualModal } from './components/ManualModal';
import { DeploymentHelpModal } from './components/DeploymentHelpModal';
import { dramaAudio } from './utils/audioTTS';

export default function App() {
  const [project, setProject] = useState<DramaProject>(PRESET_DRAMAS[0]);
  const [sidebarTab, setSidebarTab] = useState<'story' | 'characters' | 'settings'>('story');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isGeneratingSynopsis, setIsGeneratingSynopsis] = useState(false);
  const [isGeneratingCharacters, setIsGeneratingCharacters] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [generatingImages, setGeneratingImages] = useState<Record<string, boolean>>({});

  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'missing_key' | 'unreachable'>('checking');
  const [isDeployHelpOpen, setIsDeployHelpOpen] = useState(false);

  const [isCinemaPosterOpen, setIsCinemaPosterOpen] = useState(false);
  const [isVideoExportOpen, setIsVideoExportOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [editingCharacterIndex, setEditingCharacterIndex] = useState<number | null>(null);
  const [isAmbientBgmPlaying, setIsAmbientBgmPlaying] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid' | 'script'>('carousel');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [playingSceneAudioId, setPlayingSceneAudioId] = useState<string | null>(null);

  // Check Backend and API Key on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then((data) => {
        if (data?.hasApiKey) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('missing_key');
        }
      })
      .catch((err) => {
        console.warn('Backend health check error:', err);
        setBackendStatus('unreachable');
      });
  }, []);


  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Update Project State
  const handleUpdateProject = (updated: Partial<DramaProject>) => {
    setProject((prev) => ({ ...prev, ...updated }));
  };

  // Helper to handle API errors, especially for Vercel/external hosting
  const handleApiError = async (res: Response, defaultMsg: string) => {
    if (res.status === 404) {
      setIsDeployHelpOpen(true);
      return new Error('ไม่พบ Backend Server บนโฮสต์ (Vercel): กรุณาดู 3 ขั้นตอนตั้งค่าในหน้าต่างคำแนะนำ หรือใช้ AI Studio');
    }
    const errData = await res.json().catch(() => ({}));
    if (errData?.needsApiKey) {
      setIsDeployHelpOpen(true);
      return new Error('ยังไม่ได้ใส่ GEMINI_API_KEY ใน Vercel Environment Variables');
    }
    return new Error(errData?.error || defaultMsg);
  };

  // Generate Creative Drama Title & Movie Poster Concept
  const handleGenerateTitle = async (genreOrIdea?: string) => {
    setIsGeneratingTitle(true);
    showToast('กำลังให้ AI คิดชื่อเรื่องละครและคำโปรยโปสเตอร์หนัง...');
    try {
      const response = await fetch('/api/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: genreOrIdea || project.title || '',
          genre: genreOrIdea || 'ละครไทยฟอร์มยักษ์',
        }),
      });

      if (!response.ok) {
        throw await handleApiError(response, 'ไม่สามารถคิดชื่อเรื่องได้ในขณะนี้');
      }

      const data = await response.json();
      if (data.title) {
        setProject((prev) => ({
          ...prev,
          title: data.title,
          englishTitle: data.englishTitle || data.title.toUpperCase(),
          subtitle: data.subtitle || prev.subtitle,
          synopsis: data.synopsis || prev.synopsis,
          cinemaPoster: {
            tagline: data.tagline || data.subtitle || `เรื่องราวแห่งชะตากรรมใน ${data.title}`,
            director: prev.cinemaPoster?.director || 'AI STUDIO PRODUCTIONS',
            releaseDate: prev.cinemaPoster?.releaseDate || 'เร็วๆ นี้ ในโรงภาพยนตร์ทั่วประเทศ',
            rating: prev.cinemaPoster?.rating || 'ทั่วไป',
            aspectRatio: prev.cinemaPoster?.aspectRatio || '2:3',
          },
        }));
        showToast(`เจนชื่อเรื่อง "${data.title}" สำเร็จ! ส่งข้อมูลไปยังเมนูสร้างปกหนังแล้ว`);
      }
    } catch (err: any) {
      console.error('Title generate error:', err);
      showToast(err.message || 'เกิดข้อผิดพลาดในการคิดชื่อเรื่อง');
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  // Auto-generate synopsis and plot from drama title
  const handleGenerateSynopsisFromTitle = async () => {
    if (!project.title.trim()) {
      showToast('กรุณาระบุชื่อเรื่องเพื่อคิดพล็อต');
      return;
    }

    setIsGeneratingSynopsis(true);
    showToast(`กำลังคิดพล็อตเรื่องย่อจากชื่อเรื่อง "${project.title}"...`);
    try {
      const response = await fetch('/api/generate-synopsis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: project.title,
        }),
      });

      if (!response.ok) {
        throw await handleApiError(response, 'ไม่สามารถคิดพล็อตเรื่องได้ในขณะนี้');
      }

      const data = await response.json();
      if (data.synopsis) {
        setProject((prev) => ({
          ...prev,
          synopsis: data.synopsis,
          subtitle: data.subtitle || prev.subtitle,
          englishTitle: data.englishTitle || prev.englishTitle,
          cinemaPoster: {
            tagline: data.tagline || data.subtitle || prev.cinemaPoster?.tagline || `เรื่องราวใน ${prev.title}`,
            director: prev.cinemaPoster?.director || 'AI STUDIO PRODUCTIONS',
            releaseDate: prev.cinemaPoster?.releaseDate || 'เร็วๆ นี้ ในโรงภาพยนตร์ทั่วประเทศ',
            rating: prev.cinemaPoster?.rating || 'ทั่วไป',
            aspectRatio: prev.cinemaPoster?.aspectRatio || '2:3',
          },
        }));
        showToast('คิดพล็อตเรื่องย่อสำเร็จ! ส่งชื่อเรื่องและคำโปรยไปยังเมนูสร้างปกหนังแล้ว');
      }
    } catch (err: any) {
      console.error('Synopsis generate error:', err);
      showToast(err.message || 'เกิดข้อผิดพลาดในการคิดพล็อตเรื่อง');
    } finally {
      setIsGeneratingSynopsis(false);
    }
  };

  // Generate Characters from Synopsis (Requested workflow step)
  const handleGenerateCharactersFromSynopsis = async () => {
    if (!project.synopsis.trim()) {
      showToast('กรุณาระบุเรื่องย่อก่อนให้ AI วิเคราะห์ตัวละคร');
      return;
    }

    setIsGeneratingCharacters(true);
    showToast('กำลังส่งเรื่องย่อเพื่อวิเคราะห์และสร้าง 3 ตัวละครหลัก...');
    try {
      const response = await fetch('/api/generate-characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          synopsis: project.synopsis,
          title: project.title,
        }),
      });

      if (!response.ok) {
        throw await handleApiError(response, 'ไม่สามารถสร้างตัวละครได้ในขณะนี้');
      }

      const data = await response.json();
      if (data.characters && data.characters.length > 0) {
        setProject((prev) => ({
          ...prev,
          characters: data.characters,
        }));
        setSidebarTab('characters');
        showToast('สร้าง 3 ตัวละครหลักจากเรื่องย่อสำเร็จแล้ว! สามารถระบุลักษณะเด่นเพิ่มได้');
      }
    } catch (err: any) {
      console.error('Characters generate error:', err);
      showToast(err.message || 'เกิดข้อผิดพลาดในการสร้างตัวละคร');
    } finally {
      setIsGeneratingCharacters(false);
    }
  };

  // Generate Story with AI (Gemini 3.8 Flash)
  const handleGenerateStory = async () => {
    if (!project.synopsis.trim()) {
      showToast('กรุณาระบุเรื่องย่อก่อนสร้างบทละคร');
      return;
    }

    setIsGeneratingStory(true);
    showToast('กำลังเชื่อมต่อ AI เพื่อเขียนบทละครและฉากใหม่ทั้งหมด...');
    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          synopsis: project.synopsis,
          sceneCount: project.sceneCount,
          characters: project.characters,
          narratorVoiceId: project.narratorVoiceId,
          narrationMode: project.narrationMode || 'mixed',
        }),
      });

      if (!response.ok) {
        throw await handleApiError(response, 'ไม่สามารถสร้างบทละครได้ในขณะนี้');
      }

      const data = await response.json();
      if (data.scenes && data.scenes.length > 0) {
        setProject((prev) => ({
          ...prev,
          title: data.title || prev.title,
          englishTitle: data.englishTitle || prev.englishTitle,
          subtitle: data.subtitle || prev.subtitle,
          synopsis: data.expandedSynopsis || prev.synopsis,
          scenes: data.scenes,
          cinemaPoster: {
            tagline: data.subtitle || prev.cinemaPoster?.tagline || `มหากาพย์แห่งโชคชะตาใน ${data.title || prev.title}`,
            director: prev.cinemaPoster?.director || 'AI STUDIO PRODUCTIONS',
            releaseDate: prev.cinemaPoster?.releaseDate || 'เร็วๆ นี้ ในโรงภาพยนตร์ทั่วประเทศ',
            rating: prev.cinemaPoster?.rating || 'ทั่วไป',
            aspectRatio: prev.cinemaPoster?.aspectRatio || '2:3',
          },
        }));
        showToast(`สร้างเรื่องและฉากใหม่เรียบร้อยแล้ว (${data.scenes.length} ฉาก) พร้อมส่งข้อมูลชื่อเรื่องไปยังปกหนัง`);
      }
    } catch (err: any) {
      console.error('Story generate error:', err);
      showToast(err.message || 'เกิดข้อผิดพลาดในการสร้างบทละคร');
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // Regenerate Image for a specific scene
  const handleRegenerateSceneImage = async (sceneId: string) => {
    const sc = project.scenes.find((s) => s.id === sceneId);
    if (!sc) return;

    setGeneratingImages((prev) => ({ ...prev, [sceneId]: true }));
    showToast(`กำลังสร้างภาพฉากที่ ${sc.sceneNumber} ใหม่ด้วย AI...`);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: sc.visualPrompt || sc.title,
          aspectRatio: '9:16',
        }),
      });

      const data = await response.json();
      if (data.imageUrl) {
        setProject((prev) => ({
          ...prev,
          scenes: prev.scenes.map((s) =>
            s.id === sceneId ? { ...s, imageUrl: data.imageUrl } : s
          ),
        }));
        showToast(`อัปเดตภาพฉากที่ ${sc.sceneNumber} สำเร็จ`);
      }
    } catch (err) {
      console.error('Image regen error:', err);
      showToast('ไม่สามารถสร้างภาพใหม่ได้');
    } finally {
      setGeneratingImages((prev) => ({ ...prev, [sceneId]: false }));
    }
  };

  // Enhance Dialogue with AI
  const handleEnhanceDialogue = async (sceneId: string, style: string) => {
    const sc = project.scenes.find((s) => s.id === sceneId);
    if (!sc) return;

    showToast('กำลังปรับสำนวนบทพูดด้วย AI...');
    try {
      const response = await fetch('/api/enhance-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentText: sc.dialogueText,
          style,
          characterRole: sc.dialogueSpeakerName,
        }),
      });

      const data = await response.json();
      if (data.enhancedText) {
        setProject((prev) => ({
          ...prev,
          scenes: prev.scenes.map((s) =>
            s.id === sceneId ? { ...s, dialogueText: data.enhancedText } : s
          ),
        }));
        showToast('ปรับบทพูดสำเร็จแล้ว');
      }
    } catch (err) {
      console.error('Dialogue enhance error:', err);
      showToast('ไม่สามารถปรับบทพูดได้');
    }
  };

  // Quick Poster Generator
  const handleRegeneratePosterImage = async () => {
    showToast('กำลังสร้างรูปปกละครใหม่...');
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${project.title}, ${project.characters.map((c) => c.name).join(', ')}`,
          aspectRatio: '9:16',
          isPoster: true,
        }),
      });

      const data = await response.json();
      if (data.imageUrl) {
        setProject((prev) => ({ ...prev, posterUrl: data.imageUrl }));
        showToast('อัปเดตรูปปกละครสำเร็จ');
      }
    } catch (err) {
      console.error('Poster regen error:', err);
    }
  };

  // Toggle Ambient BGM
  const toggleAmbientBgm = () => {
    if (isAmbientBgmPlaying) {
      dramaAudio.stopCinematicAmbientBGM();
      setIsAmbientBgmPlaying(false);
    } else {
      dramaAudio.startCinematicAmbientBGM();
      setIsAmbientBgmPlaying(true);
    }
  };

  // Add new scene
  const handleAddNewScene = () => {
    const newSceneNumber = project.scenes.length + 1;
    const newScene: SceneItem = {
      id: `scene_${Date.now()}`,
      sceneNumber: newSceneNumber,
      title: `ฉากที่ ${newSceneNumber}`,
      visualPrompt: 'Cinematic drama scene, vertical 9:16 portrait, masterpiece lighting, high detail',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
      dialogueSpeaker: 'narrator',
      dialogueSpeakerName: 'ผู้บรรยาย',
      dialogueText: 'เรื่องราวดำเนินมาถึงช่วงเวลาสำคัญ...',
      voiceId: project.narratorVoiceId,
      durationSec: 5,
      mediaType: 'image',
      settingTag: 'บรรยากาศละคร'
    };
    setProject((prev) => ({
      ...prev,
      sceneCount: prev.scenes.length + 1,
      scenes: [...prev.scenes, newScene],
    }));
    showToast(`เพิ่มฉากที่ ${newSceneNumber} เรียบร้อยแล้ว`);
  };

  // Delete scene
  const handleDeleteScene = (sceneId: string) => {
    if (project.scenes.length <= 1) {
      showToast('ต้องมีอย่างน้อย 1 ฉากในละคร');
      return;
    }
    const updated = project.scenes
      .filter((s) => s.id !== sceneId)
      .map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    setProject((prev) => ({
      ...prev,
      sceneCount: updated.length,
      scenes: updated,
    }));
    showToast('ลบฉากออกเรียบร้อยแล้ว');
  };

  // Play dialogue in script view
  const handlePlayScriptAudio = (scene: SceneItem) => {
    if (playingSceneAudioId === scene.id) {
      dramaAudio.stopSpeaking();
      setPlayingSceneAudioId(null);
    } else {
      setPlayingSceneAudioId(scene.id);
      dramaAudio.speakText(scene.dialogueText, scene.voiceId, () => {
        setPlayingSceneAudioId(null);
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-[#e2e8f0] flex flex-col font-['Prompt',sans-serif]">
      {/* Top Navigation Header */}
      <Header
        sceneCount={project.scenes.length}
        onOpenCinemaPoster={() => setIsCinemaPosterOpen(true)}
        onOpenVideoExport={() => setIsVideoExportOpen(true)}
        onOpenQuickPoster={handleRegeneratePosterImage}
        onOpenManual={() => setIsManualOpen(true)}
        onOpenDeployHelp={() => setIsDeployHelpOpen(true)}
        backendStatus={backendStatus}
        isGenerating={isGeneratingStory}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isAmbientBgmPlaying={isAmbientBgmPlaying}
        onToggleAmbientBgm={toggleAmbientBgm}
      />

      {/* Host Diagnostic Banner (Shown on Vercel or external host when Backend or API Key is missing) */}
      {backendStatus !== 'checking' && backendStatus !== 'connected' && (
        <div className="bg-amber-950/70 border-b border-amber-500/40 px-4 py-2 text-xs flex items-center justify-between text-amber-200 z-30">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>
              {backendStatus === 'missing_key'
                ? '⚠️ ตรวจพบว่ายังไม่ได้ใส่ GEMINI_API_KEY ใน Vercel Environment Variables: AI จึงยังสร้างเนื้อหาไม่ได้'
                : '⚠️ ตรวจพบว่าใช้งานบนโฮสติ้งภายนอก (Vercel) โดยไม่มี Backend: ระบบเตรียมไฟล์ vercel.json ให้แล้ว คลิกดูวิธีตั้งค่า'}
            </span>
          </div>
          <button
            onClick={() => setIsDeployHelpOpen(true)}
            className="underline font-bold text-amber-300 hover:text-white ml-3 cursor-pointer whitespace-nowrap"
          >
            ดูวิธีตั้งค่า Vercel (3 ขั้นตอน) →
          </button>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Configuration Form */}
        {isSidebarOpen && (
          <Sidebar
            project={project}
            onUpdateProject={handleUpdateProject}
            onGenerateStory={handleGenerateStory}
            isGenerating={isGeneratingStory}
            onOpenCharacterModal={(idx) => setEditingCharacterIndex(idx)}
            onGenerateTitle={handleGenerateTitle}
            isGeneratingTitle={isGeneratingTitle}
            onGenerateSynopsisFromTitle={handleGenerateSynopsisFromTitle}
            isGeneratingSynopsis={isGeneratingSynopsis}
            onGenerateCharactersFromSynopsis={handleGenerateCharactersFromSynopsis}
            isGeneratingCharacters={isGeneratingCharacters}
            onOpenCinemaPoster={() => setIsCinemaPosterOpen(true)}
            activeTab={sidebarTab}
            onTabChange={setSidebarTab}
          />
        )}

        {/* Right Gallery Stage */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-[#08080a] custom-scrollbar">
          {/* Drama Title Banner & View Mode Controls */}
          <div className="px-5 sm:px-6 pt-3.5 pb-3 border-b border-[#1c202e] flex items-center justify-between flex-wrap gap-3 bg-[#0c0e15] sticky top-0 z-20">
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => handleUpdateProject({ title: e.target.value })}
                  className="text-lg sm:text-xl font-bold text-slate-100 bg-transparent border-b border-transparent hover:border-[#2f374e] focus:border-amber-500 focus:outline-none transition-colors max-w-[320px] sm:max-w-md truncate"
                  title="คลิกเพื่อแก้ไขชื่อเรื่อง"
                />
              </div>
              <p className="text-[11px] text-amber-400 font-mono tracking-wider uppercase">
                {project.englishTitle || 'THAI CINEMATIC DRAMA'}
              </p>
            </div>

            {/* View Mode Switcher & Scene Count & Add Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* View Mode Segmented Switcher */}
              <div className="flex items-center bg-[#121520] border border-[#222738] rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode('carousel')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'carousel'
                      ? 'bg-[#1e2333] text-amber-300 border border-amber-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="มุมมองแบบการ์ดแนวนอน"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">แนวนอน</span>
                </button>

                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-[#1e2333] text-amber-300 border border-amber-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="มุมมองแบบตารางรวม"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ตาราง</span>
                </button>

                <button
                  onClick={() => setViewMode('script')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'script'
                      ? 'bg-[#1e2333] text-amber-300 border border-amber-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="มุมมองบทละคร / สคริปต์"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">สคริปต์</span>
                </button>
              </div>

              {/* Add Scene Button */}
              <button
                onClick={handleAddNewScene}
                className="px-3 py-1.5 rounded-xl bg-[#121520] hover:bg-[#1a1f2e] border border-[#232838] hover:border-amber-500/40 text-slate-200 hover:text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="เพิ่มฉากใหม่"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>เพิ่มฉาก</span>
              </button>

              <div className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-xl font-mono">
                {project.scenes.length} ฉาก
              </div>
            </div>
          </div>

          {/* ================= VIEW MODE 1: CAROUSEL (HORIZONTAL STRIP) ================= */}
          {viewMode === 'carousel' && (
            <div className="flex-1 p-6 overflow-x-auto custom-scrollbar flex items-start gap-5 pb-12">
              {/* Card 0: The Poster / Cover Card */}
              <PosterCard
                title={project.title}
                subtitle={project.subtitle}
                posterUrl={project.posterUrl}
                onOpenCinemaPoster={() => setIsCinemaPosterOpen(true)}
                onRegeneratePoster={handleRegeneratePosterImage}
              />

              {/* Cards 1..N: Scenes */}
              {project.scenes.map((scene) => (
                <SceneCard
                  key={scene.id}
                  scene={scene}
                  characters={project.characters}
                  onUpdateScene={(updated) => {
                    setProject((prev) => ({
                      ...prev,
                      scenes: prev.scenes.map((s) => (s.id === scene.id ? { ...s, ...updated } : s)),
                    }));
                  }}
                  onRegenerateImage={handleRegenerateSceneImage}
                  onEnhanceDialogue={handleEnhanceDialogue}
                  onDeleteScene={handleDeleteScene}
                  isGeneratingImage={Boolean(generatingImages[scene.id])}
                />
              ))}
            </div>
          )}

          {/* ================= VIEW MODE 2: GRID VIEW (RESPONSIVE) ================= */}
          {viewMode === 'grid' && (
            <div className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-16">
              {/* Card 0: Poster */}
              <div className="flex justify-center">
                <PosterCard
                  title={project.title}
                  subtitle={project.subtitle}
                  posterUrl={project.posterUrl}
                  onOpenCinemaPoster={() => setIsCinemaPosterOpen(true)}
                  onRegeneratePoster={handleRegeneratePosterImage}
                />
              </div>

              {/* Cards 1..N: Scenes */}
              {project.scenes.map((scene) => (
                <div key={scene.id} className="flex justify-center">
                  <SceneCard
                    scene={scene}
                    characters={project.characters}
                    onUpdateScene={(updated) => {
                      setProject((prev) => ({
                        ...prev,
                        scenes: prev.scenes.map((s) => (s.id === scene.id ? { ...s, ...updated } : s)),
                      }));
                    }}
                    onRegenerateImage={handleRegenerateSceneImage}
                    onEnhanceDialogue={handleEnhanceDialogue}
                    onDeleteScene={handleDeleteScene}
                    isGeneratingImage={Boolean(generatingImages[scene.id])}
                  />
                </div>
              ))}
            </div>
          )}

          {/* ================= VIEW MODE 3: SCRIPT / STORYBOARD LIST ================= */}
          {viewMode === 'script' && (
            <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-4 pb-16">
              <div className="text-xs text-slate-400 bg-[#11141e] border border-[#202536] p-3 rounded-xl flex items-center justify-between">
                <span>📝 มุมมองบทละคร: ตรวจสอบและแก้ไขบทพูดทั้งหมดพร้อมฟังเสียงพากย์</span>
                <span className="text-amber-400 font-mono">{project.scenes.length} ฉาก</span>
              </div>

              {project.scenes.map((scene) => (
                <div
                  key={scene.id}
                  className="bg-[#10131d] border border-[#1e2333] hover:border-[#2d364d] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all shadow-md"
                >
                  {/* Thumbnail & Scene Number */}
                  <div className="relative w-20 h-28 rounded-xl overflow-hidden border border-[#262d40] bg-[#141724] flex-shrink-0">
                    <img
                      src={scene.imageUrl}
                      alt={scene.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 bg-black/70 backdrop-blur-xs text-[10px] font-bold text-amber-400 px-1.5 py-0.5 rounded font-mono">
                      #{scene.sceneNumber}
                    </div>
                  </div>

                  {/* Scene Title & Dialogue Textarea */}
                  <div className="flex-1 min-w-0 space-y-2 w-full">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">
                          {scene.title}
                        </span>
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                          {scene.dialogueSpeakerName}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {scene.durationSec} วินาที
                      </span>
                    </div>

                    <textarea
                      rows={2}
                      value={scene.dialogueText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProject((prev) => ({
                          ...prev,
                          scenes: prev.scenes.map((s) => (s.id === scene.id ? { ...s, dialogueText: val } : s)),
                        }));
                      }}
                      className="w-full bg-[#0a0c12] border border-[#1d2232] rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed resize-none font-['Sarabun','Prompt',sans-serif]"
                    />
                  </div>

                  {/* Action Controls */}
                  <div className="flex sm:flex-col items-center gap-2 flex-shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handlePlayScriptAudio(scene)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        playingSceneAudioId === scene.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                          : 'bg-[#141724] border-[#252c40] text-slate-300 hover:text-white hover:border-amber-500/40'
                      }`}
                      title={playingSceneAudioId === scene.id ? 'หยุดเล่น' : 'ฟังเสียงพากย์ฉากนี้'}
                    >
                      {playingSceneAudioId === scene.id ? (
                        <Volume2 className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                    </button>

                    <button
                      onClick={() => handleRegenerateSceneImage(scene.id)}
                      className="p-2.5 rounded-xl bg-[#141724] border border-[#252c40] text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                      title="สร้างภาพฉากนี้ใหม่ด้วย AI"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteScene(scene.id)}
                      className="p-2.5 rounded-xl bg-[#141724] border border-[#252c40] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="ลบฉากนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Cinema Poster Creator Modal */}
      <CinemaPosterModal
        isOpen={isCinemaPosterOpen}
        onClose={() => setIsCinemaPosterOpen(false)}
        project={project}
        onSavePoster={(posterUrl, meta) => {
          setProject((prev) => ({
            ...prev,
            posterUrl,
            title: meta?.title || prev.title,
            englishTitle: meta?.englishTitle || prev.englishTitle,
            cinemaPoster: meta?.cinemaPoster ? { ...prev.cinemaPoster, ...meta.cinemaPoster } : prev.cinemaPoster,
          }));
          showToast('บันทึกรูปโปสเตอร์โรงภาพยนตร์เป็นรูปปกหลักแล้ว');
        }}
      />

      {/* Video Merge & Auto-Export Modal */}
      <VideoExportModal
        isOpen={isVideoExportOpen}
        onClose={() => setIsVideoExportOpen(false)}
        project={project}
      />

      {/* User Manual Modal */}
      <ManualModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
      />

      {/* Deployment & Vercel Hosting Guide Modal */}
      <DeploymentHelpModal
        isOpen={isDeployHelpOpen}
        onClose={() => setIsDeployHelpOpen(false)}
        status={backendStatus}
      />

      {/* Character Customizer Modal */}
      {editingCharacterIndex !== null && (
        <CharacterModal
          isOpen={editingCharacterIndex !== null}
          onClose={() => setEditingCharacterIndex(null)}
          characterIndex={editingCharacterIndex}
          character={project.characters[editingCharacterIndex]}
          onSaveCharacter={(idx, updated) => {
            const updatedChars = [...project.characters];
            updatedChars[idx] = updated;
            setProject((prev) => ({ ...prev, characters: updatedChars }));
            showToast(`บันทึกข้อมูลตัวละครที่ ${idx + 1} แล้ว`);
          }}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121520] border border-amber-500/40 text-amber-200 px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-slideUp backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

