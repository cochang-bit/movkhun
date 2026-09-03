import { SceneItem, DramaProject } from '../types';
import { dramaAudio } from './audioTTS';

export interface StitchProgress {
  currentScene: number;
  totalScenes: number;
  percent: number;
  statusText: string;
}

export async function mergeAndExportDramaVideo(
  project: DramaProject,
  onProgress?: (progress: StitchProgress) => void
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const scenes = project.scenes;
      if (!scenes || scenes.length === 0) {
        throw new Error('ไม่พบฉากสำหรับส่งออกวิดีโอ');
      }

      // 1080p vertical video resolution 1080x1920 (matching portrait drama 9:16)
      const width = 1080;
      const height = 1920;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Cannot get canvas 2d context');

      // Preload all scene images
      if (onProgress) {
        onProgress({
          currentScene: 0,
          totalScenes: scenes.length,
          percent: 5,
          statusText: 'กำลังโหลดภาพและองค์ประกอบทุกฉาก...',
        });
      }

      const loadedImages: HTMLImageElement[] = [];
      for (let i = 0; i < scenes.length; i++) {
        const sc = scenes[i];
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((res) => {
          img.onload = () => res(true);
          img.onerror = () => {
            // Draw gradient fallback
            res(false);
          };
          img.src = sc.imageUrl || project.posterUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1080&auto=format&fit=crop&q=80';
        });
        loadedImages.push(img);
      }

      // Audio setup for recording
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      const dest = audioCtx.createMediaStreamDestination();

      // Create gentle background music pad
      const bgmGain = audioCtx.createGain();
      bgmGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      bgmGain.connect(dest);

      const osc1 = audioCtx.createOscillator();
      osc1.frequency.setValueAtTime(146.83, audioCtx.currentTime);
      osc1.type = 'sine';
      osc1.connect(bgmGain);
      osc1.start();

      const osc2 = audioCtx.createOscillator();
      osc2.frequency.setValueAtTime(220.0, audioCtx.currentTime);
      osc2.type = 'triangle';
      osc2.connect(bgmGain);
      osc2.start();

      // Combine canvas stream and audio stream
      const canvasStream = canvas.captureStream(30); // 30 FPS
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ]);

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 4500000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        try {
          osc1.stop();
          osc2.stop();
          audioCtx.close();
        } catch (_) {}

        const finalBlob = new Blob(chunks, { type: mimeType });

        // Trigger Auto Download
        const downloadUrl = URL.createObjectURL(finalBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${project.title || 'Drama_Thai'}_Full_Episodes_${scenes.length}_Scenes.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        resolve(finalBlob);
      };

      recorder.start(100);

      // Render Title Intro Card (2 seconds)
      if (onProgress) {
        onProgress({
          currentScene: 0,
          totalScenes: scenes.length,
          percent: 10,
          statusText: 'กำลังเรนเดอร์ไตเติลเปิดเรื่อง...',
        });
      }

      await renderTitleCard(ctx, width, height, project, 1800);

      // Render Each Scene
      const fps = 30;
      for (let i = 0; i < scenes.length; i++) {
        const sc = scenes[i];
        const img = loadedImages[i];
        const durationMs = (sc.durationSec || 4) * 1000;
        const totalFrames = Math.floor((durationMs / 1000) * fps);

        if (onProgress) {
          const pct = Math.floor(10 + ((i + 1) / scenes.length) * 85);
          onProgress({
            currentScene: i + 1,
            totalScenes: scenes.length,
            percent: pct,
            statusText: `กำลังต่อฉากที่ ${i + 1}/${scenes.length}: ${sc.title}`,
          });
        }

        // Play voice in background during rendering if supported
        dramaAudio.speakText(sc.dialogueText, sc.voiceId);

        for (let frame = 0; frame < totalFrames; frame++) {
          const progress = frame / totalFrames;
          renderSceneFrame(
            ctx,
            width,
            height,
            sc,
            img,
            progress,
            i + 1,
            scenes.length,
            project.title,
            project.subtitleEnabled !== false
          );
          await new Promise((r) => setTimeout(r, 1000 / fps));
        }
      }

      // Render Outro Ending Card (1.5 seconds)
      if (onProgress) {
        onProgress({
          currentScene: scenes.length,
          totalScenes: scenes.length,
          percent: 98,
          statusText: 'กำลังสร้างไฟล์วิดีโอรวมฉบับสมบูรณ์...',
        });
      }
      await renderOutroCard(ctx, width, height, project, 1500);

      recorder.stop();
    } catch (err) {
      console.error('Video stitch error:', err);
      reject(err);
    }
  });
}

// Render Intro Title Card
async function renderTitleCard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  project: DramaProject,
  durationMs: number
) {
  const startTime = Date.now();
  while (Date.now() - startTime < durationMs) {
    const elapsed = (Date.now() - startTime) / durationMs;

    // Dark cinematic gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0a0a0f');
    grad.addColorStop(0.5, '#12131c');
    grad.addColorStop(1, '#050608');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Decorative golden borders
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, w - 120, h - 120);

    // Corner accents
    ctx.fillStyle = '#eab308';
    ctx.fillRect(52, 52, 20, 20);
    ctx.fillRect(w - 72, 52, 20, 20);
    ctx.fillRect(52, h - 72, 20, 20);
    ctx.fillRect(w - 72, h - 72, 20, 20);

    // Studio Eyebrow
    ctx.fillStyle = 'rgba(234, 179, 8, 0.9)';
    ctx.font = '500 32px "Prompt", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ ขุนช้างสร้างเรื่อง PRESENTS ✦', w / 2, h / 2 - 220);

    // Main Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 68px "Kanit", "Prompt", sans-serif';
    ctx.shadowColor = 'rgba(234, 179, 8, 0.8)';
    ctx.shadowBlur = 24;
    
    // Wrap title if long
    wrapText(ctx, project.title || 'มหากาพย์ละครไทย', w / 2, h / 2 - 80, w - 240, 80);
    ctx.shadowBlur = 0;

    // English / Subtitle
    ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
    ctx.font = '400 36px "Cinzel", "Prompt", sans-serif';
    ctx.fillText(project.englishTitle || 'AN EPIC ORIGINAL DRAMA', w / 2, h / 2 + 120);

    // Scene count badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    roundRect(ctx, w / 2 - 180, h / 2 + 220, 360, 60, 30);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.font = '500 28px "Prompt", sans-serif';
    ctx.fillText(`ฉบับรวมสมบูรณ์ ${project.scenes.length} ฉาก`, w / 2, h / 2 + 262);

    await new Promise((r) => setTimeout(r, 33));
  }
}

// Render Single Scene Frame with Ken-Burns Motion & Subtitles
function renderSceneFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scene: SceneItem,
  img: HTMLImageElement,
  progress: number,
  currentNum: number,
  totalNum: number,
  dramaTitle: string,
  showSubtitle: boolean = true
) {
  // Clear canvas
  ctx.fillStyle = '#0b0c10';
  ctx.fillRect(0, 0, w, h);

  // Draw Background Image with Ken-Burns Motion (Smooth Zoom / Pan)
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.save();
    
    let scale = 1.05 + progress * 0.12; // 1.05 -> 1.17 slow zoom
    let panX = 0;
    let panY = 0;

    if (scene.cameraMotion === 'pan_right') {
      panX = -progress * 80;
    } else if (scene.cameraMotion === 'zoom_out') {
      scale = 1.18 - progress * 0.12;
    } else if (scene.cameraMotion === 'tilt_up') {
      panY = progress * 70;
    } else if (scene.cameraMotion === 'dramatic_push') {
      scale = 1.0 + progress * 0.22;
    }

    const dw = w * scale;
    const dh = h * scale;
    const dx = (w - dw) / 2 + panX;
    const dy = (h - dh) / 2 + panY;

    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  } else {
    // Fallback atmospheric backdrop
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // Cinematic Vignette Overlay (Top and Bottom Shadow)
  const topVignette = ctx.createLinearGradient(0, 0, 0, 420);
  topVignette.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  topVignette.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topVignette;
  ctx.fillRect(0, 0, w, 420);

  const bottomVignette = ctx.createLinearGradient(0, h - 680, 0, h);
  bottomVignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  bottomVignette.addColorStop(0.4, 'rgba(0, 0, 0, 0.85)');
  bottomVignette.addColorStop(1, 'rgba(0, 0, 0, 0.98)');
  ctx.fillStyle = bottomVignette;
  ctx.fillRect(0, h - 680, w, 680);

  // TOP BAR: Drama Title & Scene Badge
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = '600 32px "Prompt", sans-serif';
  ctx.fillText(dramaTitle, 60, 110);

  // Scene Tag Pill
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 2;
  roundRect(ctx, w - 320, 70, 260, 56, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  ctx.font = '700 28px "Prompt", sans-serif';
  ctx.fillText(`SCENE ${currentNum} / ${totalNum}`, w - 80, 108);

  // Setting Tag
  if (scene.settingTag) {
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    roundRect(ctx, 60, 140, 220, 44, 10);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 24px "Prompt", sans-serif';
    ctx.fillText(`📍 ${scene.settingTag}`, 75, 172);
  }

  // BOTTOM SECTION: Scene Title & Dialogue Subtitle Box
  if (showSubtitle) {
    // Speaker Pill
    const speakerName = scene.dialogueSpeakerName || (scene.dialogueSpeaker === 'narrator' ? 'ผู้บรรยาย' : 'ตัวละคร');
    const isNarrator = scene.dialogueSpeaker === 'narrator';
    
    const pillColor = isNarrator ? '#eab308' : '#38bdf8';
    ctx.fillStyle = pillColor;
    roundRect(ctx, 60, h - 480, 280, 52, 12);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.font = '700 26px "Prompt", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🎙️ ${speakerName}`, 200, h - 444);

    // Scene Subtitle Text Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    roundRect(ctx, 60, h - 410, w - 120, 280, 20);
    ctx.fill();
    ctx.stroke();

    // Subtitle Thai Dialogue
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '500 38px "Prompt", "Sarabun", sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 8;
    
    const cleanDialogue = scene.dialogueText.replace(/^\[[^\]]+\]:\s*/, '');
    wrapText(ctx, cleanDialogue, 100, h - 330, w - 200, 56);
    ctx.shadowBlur = 0;
  }

  // Progress Bar at very bottom
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(0, h - 16, w, 16);

  const sceneProgressWidth = ((currentNum - 1 + progress) / totalNum) * w;
  ctx.fillStyle = '#eab308';
  ctx.fillRect(0, h - 16, sceneProgressWidth, 16);
}

// Render Outro Ending Card
async function renderOutroCard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  project: DramaProject,
  durationMs: number
) {
  const startTime = Date.now();
  while (Date.now() - startTime < durationMs) {
    // Dark fade out
    ctx.fillStyle = '#07080c';
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#eab308';
    ctx.font = '700 52px "Cinzel", "Prompt", sans-serif';
    ctx.fillText('✦ THE END ✦', w / 2, h / 2 - 50);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '400 32px "Prompt", sans-serif';
    ctx.fillText('อำนวยการสร้างโดย Drama AI - โปรดิวเซอร์ละครไทย', w / 2, h / 2 + 30);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '400 24px "Prompt", sans-serif';
    ctx.fillText('สร้างสรรค์ด้วย Google Gemini AI & Ultra Studio Engine', w / 2, h / 2 + 90);

    await new Promise((r) => setTimeout(r, 33));
  }
}

// Helper: Wrap text on Canvas with Thai support
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

// Helper: Rounded Rectangle
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
