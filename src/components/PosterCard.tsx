import React from 'react';
import { Download, Sparkles, Image as ImageIcon, Film } from 'lucide-react';

interface PosterCardProps {
  title: string;
  subtitle: string;
  posterUrl: string;
  onOpenCinemaPoster: () => void;
  onRegeneratePoster: () => void;
  isGenerating?: boolean;
}

export const PosterCard: React.FC<PosterCardProps> = ({
  title,
  subtitle,
  posterUrl,
  onOpenCinemaPoster,
  onRegeneratePoster,
  isGenerating = false,
}) => {
  const handleDownloadImage = () => {
    const a = document.createElement('a');
    a.href = posterUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800';
    a.download = `${title || 'Drama'}_Poster.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-[300px] sm:w-[320px] flex-shrink-0 flex flex-col gap-3 group">
      {/* Top Tag */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-slate-300 bg-[#121520] px-2.5 py-1 rounded-md border border-[#202536]">
          ละครแนวตั้ง
        </span>
        <button
          onClick={onOpenCinemaPoster}
          className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium"
        >
          <Film className="w-3.5 h-3.5" />
          <span>โปสเตอร์โรงหนัง</span>
        </button>
      </div>

      {/* Main Poster Image Box (9:16 portrait style) */}
      <div className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-[#202536] bg-[#10121a] shadow-xl group-hover:border-amber-500/40 transition-all">
        <img
          src={posterUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Ambient Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-transparent to-black/40" />

        {/* Floating Title & Studio Tag on poster */}
        <div className="absolute top-4 left-4 right-4">
          <div className="text-[10px] uppercase font-bold tracking-widest text-amber-400 drop-shadow">
            ✦ DRAMA AI CINEMATIC
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          {/* Download Button */}
          <button
            onClick={handleDownloadImage}
            className="w-full py-2.5 px-3 rounded-xl bg-[#0f121a]/90 hover:bg-[#181c28] backdrop-blur-md border border-white/10 hover:border-amber-500/30 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>ดาวน์โหลดรูปปก</span>
          </button>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="bg-[#11131c] border border-[#1e2333] rounded-xl p-3 space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <span>หน้าปกละคร (แบบรูปภาพ)</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          เนื้องานภาพ Cinematic จากตัวละครที่คุณเลือก
        </p>
      </div>
    </div>
  );
};
