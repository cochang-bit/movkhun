export interface PosterRenderOptions {
  titleThai: string;
  titleEng: string;
  tagline: string;
  director: string;
  cast: string[];
  rating: string;
  releaseDate: string;
  backgroundImageUrl: string;
  aspectRatio: '2:3' | '9:16' | '16:9';
  themeColor: 'gold' | 'silver' | 'crimson' | 'emerald' | 'cyan';
}

export async function renderCinemaPoster(options: PosterRenderOptions): Promise<string> {
  const {
    titleThai,
    titleEng,
    tagline,
    director,
    cast,
    rating,
    releaseDate,
    backgroundImageUrl,
    aspectRatio,
    themeColor,
  } = options;

  let width = 1600;
  let height = 2400; // 2:3 vertical theatrical poster

  if (aspectRatio === '9:16') {
    width = 1080;
    height = 1920;
  } else if (aspectRatio === '16:9') {
    width = 1920;
    height = 1080;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  // 1. Draw Background
  if (backgroundImageUrl) {
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    await new Promise((resolve) => {
      bgImg.onload = () => resolve(true);
      bgImg.onerror = () => resolve(false);
      bgImg.src = backgroundImageUrl;
    });

    if (bgImg.complete && bgImg.naturalWidth > 0) {
      // Draw background covering full canvas
      const scale = Math.max(width / bgImg.naturalWidth, height / bgImg.naturalHeight);
      const dw = bgImg.naturalWidth * scale;
      const dh = bgImg.naturalHeight * scale;
      const dx = (width - dw) / 2;
      const dy = (height - dh) / 2;
      ctx.drawImage(bgImg, dx, dy, dw, dh);
    } else {
      drawFallbackPosterBg(ctx, width, height);
    }
  } else {
    drawFallbackPosterBg(ctx, width, height);
  }

  // 2. Cinematic Shadows & Atmospheric Overlays
  // Top Header Gradient
  const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.25);
  topGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, width, height * 0.25);

  // Bottom Shadow Gradient for Title & Billing Block
  const bottomGrad = ctx.createLinearGradient(0, height * 0.45, 0, height);
  bottomGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  bottomGrad.addColorStop(0.35, 'rgba(0, 0, 0, 0.7)');
  bottomGrad.addColorStop(0.7, 'rgba(5, 6, 10, 0.95)');
  bottomGrad.addColorStop(1, 'rgba(3, 4, 7, 1)');
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, height * 0.45, width, height * 0.55);

  // Decorative Border line
  ctx.strokeStyle = themeColor === 'gold' ? 'rgba(234, 179, 8, 0.35)' : 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // 3. Top Section: Production Studio & Cast Names
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '600 24px "Cinzel", "Prompt", sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('DRAMA AI STUDIOS & THAI CINEMA PRESENTS', width / 2, 90);

  // Top Cast Billing
  if (cast && cast.length > 0) {
    ctx.fillStyle = themeColor === 'gold' ? '#fef08a' : '#e2e8f0';
    ctx.font = '500 28px "Prompt", "Kanit", sans-serif';
    ctx.letterSpacing = '2px';
    const castString = cast.slice(0, 3).map(c => c.toUpperCase()).join('    ✦    ');
    ctx.fillText(castString, width / 2, 140);
  }

  // 4. Tagline
  if (tagline) {
    ctx.fillStyle = 'rgba(254, 240, 138, 0.95)';
    ctx.font = 'italic 500 32px "Prompt", sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 12;
    ctx.fillText(`"${tagline}"`, width / 2, height - 520);
    ctx.shadowBlur = 0;
  }

  // 5. Grand Cinema Title (Thai)
  const titleY = height - 410;
  ctx.font = '800 84px "Kanit", "Prompt", sans-serif';
  ctx.textAlign = 'center';
  
  // Shadow layers
  ctx.shadowColor = 'rgba(0, 0, 0, 1)';
  ctx.shadowBlur = 30;
  ctx.fillStyle = '#000000';
  ctx.fillText(titleThai, width / 2, titleY);
  ctx.fillText(titleThai, width / 2, titleY);
  ctx.shadowBlur = 0;

  // Gold or Metallic Gradient Fill
  const titleGrad = ctx.createLinearGradient(0, titleY - 80, 0, titleY + 10);
  if (themeColor === 'gold') {
    titleGrad.addColorStop(0, '#ffffff');
    titleGrad.addColorStop(0.3, '#fef08a');
    titleGrad.addColorStop(0.7, '#eab308');
    titleGrad.addColorStop(1, '#ca8a04');
  } else if (themeColor === 'crimson') {
    titleGrad.addColorStop(0, '#ffffff');
    titleGrad.addColorStop(0.5, '#f87171');
    titleGrad.addColorStop(1, '#dc2626');
  } else {
    titleGrad.addColorStop(0, '#ffffff');
    titleGrad.addColorStop(0.5, '#cbd5e1');
    titleGrad.addColorStop(1, '#94a3b8');
  }

  ctx.fillStyle = titleGrad;
  ctx.fillText(titleThai, width / 2, titleY);

  // English Subtitle
  if (titleEng) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '700 32px "Cinzel", sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillText(titleEng.toUpperCase(), width / 2, height - 340);
  }

  // 6. Cinema Billing Block (Credits Grid)
  ctx.fillStyle = 'rgba(203, 213, 225, 0.7)';
  ctx.font = '400 16px "Cinzel", "Prompt", sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText(
    `DIRECTED BY ${director ? director.toUpperCase() : 'DRAMA AI'}   •   WRITTEN BY GEMINI PRODUCER   •   ORIGINAL SCORE BY LYRIA MUSIC`,
    width / 2,
    height - 270
  );
  ctx.fillText(
    'PRODUCED IN ASSOCIATION WITH ULTRA THAI CINEMA PRODUCTIONS   •   DISTRIBUTED WORLDWIDE',
    width / 2,
    height - 240
  );

  // 7. Badges (Dolby Atmos, IMAX, Rating Badge)
  const badgeY = height - 170;
  
  // Rating Box
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(width / 2 - 280, badgeY - 24, 70, 36);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 18px "Prompt", sans-serif';
  ctx.fillText(rating || 'ทั่วไป', width / 2 - 245, badgeY);

  // IMAX / Dolby Text Badges
  ctx.font = '700 22px "Cinzel", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillText('IMAX', width / 2 - 140, badgeY);
  ctx.fillText('DOLBY ATMOS', width / 2, badgeY);
  ctx.fillText('4DX', width / 2 + 140, badgeY);
  ctx.fillText('REAL D 3D', width / 2 + 230, badgeY);

  // 8. Release Date / Call to Action
  ctx.fillStyle = themeColor === 'gold' ? '#fef08a' : '#ffffff';
  ctx.font = '700 34px "Kanit", "Prompt", sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText(releaseDate || 'เร็วๆ นี้ ในโรงภาพยนตร์ทั่วประเทศ', width / 2, height - 90);

  return canvas.toDataURL('image/png');
}

function drawFallbackPosterBg(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#1e1b4b');
  grad.addColorStop(0.4, '#0f172a');
  grad.addColorStop(0.8, '#1e293b');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}
