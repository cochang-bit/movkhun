import React, { useState, useEffect } from 'react';
import { X, Download, Sparkles, RefreshCw, Film, Sliders, Check, Palette } from 'lucide-react';
import { DramaProject } from '../types';
import { renderCinemaPoster, PosterRenderOptions } from '../utils/posterRenderer';

interface CinemaPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: DramaProject;
  onSavePoster: (posterDataUrl: string, meta?: Partial<DramaProject>) => void;
}

export const CinemaPosterModal: React.FC<CinemaPosterModalProps> = ({
  isOpen,
  onClose,
  project,
  onSavePoster,
}) => {
  const [titleThai, setTitleThai] = useState(project.title || 'กำเนิดพระแม่ลักษมี: เทวีแห่งความมั่งคั่ง');
  const [titleEng, setTitleEng] = useState(project.englishTitle || 'EPIC, DIVINE, AUSPICIOUS, AND SERENE');
  const [tagline, setTagline] = useState(project.cinemaPoster?.tagline || project.subtitle || 'มหากาพย์แห่งสรวงสวรรค์ และศรัทธาอันเป็นนิรันดร์');
  const [director, setDirector] = useState(project.cinemaPoster?.director || 'AI STUDIO PRODUCTIONS');
  const [rating, setRating] = useState(project.cinemaPoster?.rating || 'ทั่วไป');
  const [releaseDate, setReleaseDate] = useState(project.cinemaPoster?.releaseDate || 'เร็วๆ นี้ ในโรงภาพยนตร์ทั่วประเทศ');
  const [aspectRatio, setAspectRatio] = useState<'2:3' | '9:16' | '16:9'>('2:3');
  const [themeColor, setThemeColor] = useState<'gold' | 'silver' | 'crimson' | 'emerald' | 'cyan'>('gold');

  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);

  // Synchronize with latest project state whenever modal opens or drama title/meta changes
  useEffect(() => {
    if (!isOpen) return;
    if (project.title) {
      setTitleThai(project.title);
    }
    if (project.englishTitle) {
      setTitleEng(project.englishTitle);
    }
    if (project.cinemaPoster?.tagline) {
      setTagline(project.cinemaPoster.tagline);
    } else if (project.subtitle) {
      setTagline(project.subtitle);
    }
    if (project.cinemaPoster?.director) {
      setDirector(project.cinemaPoster.director);
    }
    if (project.cinemaPoster?.releaseDate) {
      setReleaseDate(project.cinemaPoster.releaseDate);
    }
    if (project.cinemaPoster?.rating) {
      setRating(project.cinemaPoster.rating);
    }
    if (project.cinemaPoster?.aspectRatio) {
      setAspectRatio(project.cinemaPoster.aspectRatio);
    }
  }, [
    isOpen,
    project.title,
    project.englishTitle,
    project.subtitle,
    project.cinemaPoster?.tagline,
    project.cinemaPoster?.director,
    project.cinemaPoster?.releaseDate,
    project.cinemaPoster?.rating,
    project.cinemaPoster?.aspectRatio,
  ]);

  // Re-render poster whenever options change
  useEffect(() => {
    if (!isOpen) return;

    const render = async () => {
      setIsRendering(true);
      try {
        const castNames = project.characters.map((c) => c.name).filter(Boolean);
        const url = await renderCinemaPoster({
          titleThai,
          titleEng,
          tagline,
          director,
          cast: castNames.length > 0 ? castNames : ['พระแม่ลักษมี', 'พระนารายณ์', 'จอมเทพ'],
          rating,
          releaseDate,
          backgroundImageUrl: project.posterUrl || project.scenes[0]?.imageUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200',
          aspectRatio,
          themeColor,
        });
        setPreviewUrl(url);
      } catch (err) {
        console.error('Poster render error:', err);
      } finally {
        setIsRendering(false);
      }
    };

    render();
  }, [isOpen, titleThai, titleEng, tagline, director, rating, releaseDate, aspectRatio, themeColor, project.posterUrl, project.scenes, project.characters]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `${titleThai || 'Cinema_Movie'}_Theatrical_Poster_4K.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleApplyToDrama = () => {
    if (previewUrl) {
      onSavePoster(previewUrl, {
        title: titleThai,
        englishTitle: titleEng,
        cinemaPoster: {
          tagline,
          director,
          releaseDate,
          rating,
          aspectRatio,
        },
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-fadeIn">
      <div className="bg-[#0e1018] border border-[#202536] rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1c202e] flex items-center justify-between bg-[#121520]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                สตูดิโอสร้างปกหนังโรงภาพยนตร์ (Cinema Theatrical Poster)
              </h3>
              <p className="text-xs text-slate-400">
                แก้ปัญหา AI พิมพ์ภาษาไทยไม่เก่ง ด้วยระบบ Typography คมชัดระดับ 4K ฟอนต์แท้มาตรฐานภาพยนตร์
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

        {/* Modal Body: Left controls & Right live preview */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Controls Form (Left 5 cols) */}
          <div className="lg:col-span-5 p-5 overflow-y-auto space-y-4 border-r border-[#1c202e] bg-[#0c0e15] custom-scrollbar">
            {/* Title Sync Status Banner */}
            <div className="bg-gradient-to-r from-[#141828] via-[#101322] to-[#0c0e18] border border-amber-500/35 rounded-xl p-3 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>นำส่งข้อมูลชื่อเรื่องจากละครแล้ว</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTitleThai(project.title);
                    if (project.englishTitle) setTitleEng(project.englishTitle);
                    if (project.cinemaPoster?.tagline) setTagline(project.cinemaPoster.tagline);
                    else if (project.subtitle) setTagline(project.subtitle);
                  }}
                  className="text-[10px] text-amber-400 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                  title="คลิกเพื่อดึงชื่อเรื่องและคำโปรยล่าสุดจากบทละครทันที"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>รีเฟรชข้อมูล</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-300">
                ชื่อเรื่อง: <span className="font-semibold text-white">"{project.title || 'ยังไม่ระบุ'}"</span>
              </p>
              {project.englishTitle && (
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  EN: {project.englishTitle}
                </p>
              )}
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                ขนาดสัดส่วนโปสเตอร์ (Aspect Ratio)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '2:3', label: '2:3 โรงหนัง (One-Sheet)' },
                  { id: '9:16', label: '9:16 แนวตั้ง (Story)' },
                  { id: '16:9', label: '16:9 แนวนอน (Banner)' },
                ].map((ar) => (
                  <button
                    key={ar.id}
                    onClick={() => setAspectRatio(ar.id as any)}
                    className={`py-2 px-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      aspectRatio === ar.id
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                        : 'bg-[#121520] border-[#202536] text-slate-300 hover:border-[#333b52]'
                    }`}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Color */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                โทนสีตัวอักษรภาพยนตร์ (Title Metallic Theme)
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'gold', name: 'ทองอร่าม (Royal Gold)', color: 'bg-amber-500' },
                  { id: 'silver', name: 'เงินพรีเมียม (Platinum)', color: 'bg-slate-300' },
                  { id: 'crimson', name: 'แดงเพลิง (Crimson War)', color: 'bg-red-500' },
                ].map((tc) => (
                  <button
                    key={tc.id}
                    onClick={() => setThemeColor(tc.id as any)}
                    className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs cursor-pointer ${
                      themeColor === tc.id
                        ? 'bg-[#1c202e] border-amber-400 text-white'
                        : 'bg-[#121520] border-[#202536] text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${tc.color}`} />
                    <span>{tc.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Thai Title */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                ชื่อเรื่องภาษาไทย (Thai Cinema Title)
              </label>
              <input
                type="text"
                value={titleThai}
                onChange={(e) => setTitleThai(e.target.value)}
                className="w-full bg-[#121520] border border-[#202536] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* English Title */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                ชื่อภาษาอังกฤษ / สโลแกนหลัก (Cinematic Tagline)
              </label>
              <input
                type="text"
                value={titleEng}
                onChange={(e) => setTitleEng(e.target.value)}
                className="w-full bg-[#121520] border border-[#202536] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 uppercase font-mono"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                คำโปรยบนโปสเตอร์ (Movie Tagline)
              </label>
              <textarea
                rows={2}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[#121520] border border-[#202536] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none font-['Sarabun','Prompt',sans-serif]"
              />
            </div>

            {/* Rating & Release Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  เรตภาพยนตร์ (Rating)
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full bg-[#121520] border border-[#202536] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="ทั่วไป">ทั่วไป (G - ทุกวัย)</option>
                  <option value="13+">น 13+ (13 ปีขึ้นไป)</option>
                  <option value="18+">น 18+ (18 ปีขึ้นไป)</option>
                  <option value="PG-13">PG-13 (สากล)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  กำหนดฉาย (Release Date)
                </label>
                <input
                  type="text"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="w-full bg-[#121520] border border-[#202536] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Director Credit */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                ผู้กำกับ / สตูดิโอ (Director & Studio)
              </label>
              <input
                type="text"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                className="w-full bg-[#121520] border border-[#202536] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Live 4K Preview (Right 7 cols) */}
          <div className="lg:col-span-7 bg-[#08090f] p-6 flex flex-col items-center justify-center overflow-hidden relative">
            <div className="relative max-h-full max-w-full flex items-center justify-center">
              {isRendering && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center rounded-xl z-20">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                </div>
              )}

              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Cinema Poster Preview"
                  className="max-h-[68vh] object-contain rounded-xl shadow-2xl border border-white/10"
                />
              ) : (
                <div className="w-80 h-[480px] bg-[#121520] rounded-xl flex items-center justify-center text-slate-500 text-xs">
                  กำลังเรนเดอร์ภาพตัวอย่าง...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-3.5 border-t border-[#1c202e] flex items-center justify-between bg-[#121520]">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>ฟอนต์ภาษาไทยจัดเรียงสระและวรรณยุกต์ถูกต้อง 100% พร้อมใช้งานโฆษณา</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleApplyToDrama}
              className="px-4 py-2 rounded-xl bg-[#1a1e2c] hover:bg-[#252b3e] border border-[#2d344b] text-slate-200 text-xs sm:text-sm font-medium transition-all cursor-pointer"
            >
              ใช้เป็นปกละครหลัก
            </button>
            <button
              id="btn-download-cinema-poster"
              onClick={handleDownload}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดโปสเตอร์ 4K (PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
