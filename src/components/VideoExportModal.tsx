import React, { useState, useEffect } from 'react';
import { X, Film, CheckCircle2, Download, Video, Play, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DramaProject } from '../types';
import { mergeAndExportDramaVideo, StitchProgress } from '../utils/videoStitcher';

interface VideoExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: DramaProject;
}

export const VideoExportModal: React.FC<VideoExportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<StitchProgress>({
    currentScene: 0,
    totalScenes: project.scenes.length,
    percent: 0,
    statusText: 'พร้อมเริ่มการรวมวิดีโอ',
  });
  const [completedVideoUrl, setCompletedVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto start export when opened
  useEffect(() => {
    if (isOpen && !isProcessing && !completedVideoUrl) {
      startExport();
    }
  }, [isOpen]);

  const startExport = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    setCompletedVideoUrl(null);

    try {
      const videoBlob = await mergeAndExportDramaVideo(project, (prog) => {
        setProgress(prog);
      });

      const url = URL.createObjectURL(videoBlob);
      setCompletedVideoUrl(url);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (_) {}
    } catch (err: any) {
      console.error('Video merge error:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการรวมวิดีโอ');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-[#0e1018] border border-[#202536] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1c202e] flex items-center justify-between bg-[#121520]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                รวมและส่งออกละคร ({project.scenes.length} ฉาก)
              </h3>
              <p className="text-xs text-slate-400">
                ระบบเชื่อมต่อภาพเคลื่อนไหว ซับไตเติล และเสียงพากย์ทุกฉากเป็นไฟล์เดียวอัตโนมัติ
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

        {/* Content Body */}
        <div className="p-6 space-y-6 bg-[#0c0e15]">
          {isProcessing ? (
            <div className="space-y-5 text-center py-4">
              <div className="w-20 h-20 mx-auto relative flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                <Video className="w-8 h-8 text-amber-400" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base font-semibold text-slate-100">
                  {progress.statusText}
                </h4>
                <p className="text-xs text-slate-400">
                  กำลังเรนเดอร์ภาพยนตร์ความละเอียดสูง 1080x1920 (9:16) พร้อมระบบเสียงรอบทิศทาง
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 max-w-md mx-auto">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>ความคืบหน้า</span>
                  <span className="text-amber-400 font-mono">{progress.percent}%</span>
                </div>
                <div className="w-full h-3 bg-[#131622] rounded-full overflow-hidden p-0.5 border border-[#222738]">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>ฉากที่ {progress.currentScene}</span>
                  <span>จากทั้งหมด {progress.totalScenes} ฉาก</span>
                </div>
              </div>
            </div>
          ) : completedVideoUrl ? (
            <div className="space-y-5 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-100">
                  รวมละครทุกฉากเสร็จสมบูรณ์แล้ว!
                </h4>
                <p className="text-xs text-emerald-400 mt-1">
                  ระบบได้เริ่มดาวน์โหลดไฟล์วิดีโอลงเครื่องของคุณเรียบร้อยแล้ว
                </p>
              </div>

              {/* Video Player */}
              <div className="max-w-xs mx-auto aspect-[9/16] bg-black rounded-xl overflow-hidden border border-white/20 shadow-xl">
                <video
                  src={completedVideoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={startExport}
                  className="px-4 py-2 rounded-xl bg-[#181c28] hover:bg-[#222738] border border-[#293046] text-slate-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>เรนเดอร์ใหม่อีกครั้ง</span>
                </button>
                <a
                  href={completedVideoUrl}
                  download={`${project.title || 'Drama'}_Full_Episodes.webm`}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลดไฟล์อีกครั้ง</span>
                </a>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="text-center py-6 space-y-3">
              <div className="text-red-400 text-sm font-semibold">{errorMsg}</div>
              <button
                onClick={startExport}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#1c202e] flex items-center justify-between bg-[#121520] text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>วิดีโอพร้อมแชร์ลง TikTok, Reels, Shorts หรือนำไปฉายต่อได้ทันที</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#181c28] hover:bg-[#222738] border border-[#293046] text-slate-200 text-xs font-medium cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
