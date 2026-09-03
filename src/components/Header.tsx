import React from 'react';
import { Sparkles, Film, Video, Clapperboard, PanelLeftClose, PanelLeft, Music, BookOpen, Globe, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  sceneCount: number;
  onOpenCinemaPoster: () => void;
  onOpenVideoExport: () => void;
  onOpenQuickPoster: () => void;
  onOpenManual?: () => void;
  onOpenDeployHelp?: () => void;
  backendStatus?: 'checking' | 'connected' | 'missing_key' | 'unreachable';
  isGenerating?: boolean;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  isAmbientBgmPlaying?: boolean;
  onToggleAmbientBgm?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sceneCount,
  onOpenCinemaPoster,
  onOpenVideoExport,
  onOpenQuickPoster,
  onOpenManual,
  onOpenDeployHelp,
  backendStatus = 'connected',
  isGenerating = false,
  isSidebarOpen = true,
  onToggleSidebar,
  isAmbientBgmPlaying = false,
  onToggleAmbientBgm,
}) => {
  return (
    <header className="h-16 bg-[#090b10] border-b border-[#1c202e] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 select-none backdrop-blur-md">
      {/* Left section: App Brand & Sidebar Toggle */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            id="btn-toggle-sidebar"
            onClick={onToggleSidebar}
            className={`p-2 rounded-xl text-slate-400 hover:text-white transition-all border ${
              isSidebarOpen
                ? 'bg-[#121520] border-[#222738] text-amber-400'
                : 'bg-transparent border-transparent hover:bg-[#121520] hover:border-[#222738]'
            } cursor-pointer`}
            title={isSidebarOpen ? 'ซ่อนแถบควบคุม (เพื่อขยายพื้นที่)' : 'เปิดแถบควบคุม'}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            ) : (
              <PanelLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
            )}
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 shadow-md shadow-amber-500/20 flex-shrink-0">
            <img
              src="/khunchang_logo.jpg"
              alt="ขุนช้างสร้างเรื่อง"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-100 text-sm sm:text-base tracking-wide flex items-center gap-1.5">
                ขุนช้างสร้างเรื่อง <span className="text-amber-400 font-normal text-xs sm:text-sm hidden sm:inline">- สตูดิโอละครไทย AI</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Right section: Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Host / Vercel Help Badge */}
        {onOpenDeployHelp && backendStatus !== 'checking' && (
          <button
            onClick={onOpenDeployHelp}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
              backendStatus === 'connected'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-amber-500/20 border-amber-500/60 text-amber-300 animate-pulse hover:bg-amber-500/30'
            }`}
            title={
              backendStatus === 'connected'
                ? 'Backend AI เชื่อมต่อเรียบร้อย คลิกเพื่อดูรายละเอียดการโฮสต์'
                : 'คลิกเพื่อดูวิธีตั้งค่า Backend หรือ GEMINI_API_KEY บน Vercel'
            }
          >
            {backendStatus === 'connected' ? (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="hidden lg:inline">AI พร้อมใช้งาน</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>ตั้งค่าเวป Vercel</span>
              </span>
            )}
          </button>
        )}

        {/* Theatre BGM Toggle in header for quick access */}

        {onToggleAmbientBgm && (
          <button
            onClick={onToggleAmbientBgm}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              isAmbientBgmPlaying
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-xs'
                : 'bg-[#10131d] border-[#1f2434] text-slate-400 hover:text-slate-200 hover:border-[#2d344b]'
            }`}
            title="เปิด/ปิด เสียงดนตรีบรรยากาศโรงละคร"
          >
            <Music className={`w-3.5 h-3.5 ${isAmbientBgmPlaying ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <span>{isAmbientBgmPlaying ? 'ดนตรี: เปิด' : 'ดนตรี: ปิด'}</span>
          </button>
        )}

        {/* User Manual Button */}
        {onOpenManual && (
          <button
            id="btn-open-manual"
            onClick={onOpenManual}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-[#121520] hover:bg-[#1a1f2e] border border-[#232838] hover:border-amber-500/40 text-slate-300 hover:text-amber-300 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-xs"
            title="คู่มือการใช้งานแอพภาษาไทย"
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" />
            <span className="hidden md:inline">คู่มือใช้งาน</span>
          </button>
        )}

        {/* Cinema Poster Creator Button */}
        <button
          id="btn-cinema-poster-modal"
          onClick={onOpenCinemaPoster}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#121520] hover:bg-[#1a1f2e] border border-[#232838] hover:border-amber-500/40 text-amber-300 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-xs"
        >
          <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" />
          <span className="hidden sm:inline">สร้างปกหนัง</span> 4K
        </button>

        {/* Merge and Export Video (Primary CTA) */}
        <button
          id="btn-export-video"
          onClick={onOpenVideoExport}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 text-xs sm:text-sm font-bold transition-all shadow-md shadow-amber-500/20 active:scale-98 disabled:opacity-50 cursor-pointer"
        >
          <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 flex-shrink-0" />
          <span>รวมส่งออกวิดีโอ ({sceneCount} ฉาก)</span>
        </button>
      </div>
    </header>
  );
};

