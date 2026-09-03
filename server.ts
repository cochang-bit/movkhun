import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware to normalize URL in case Vercel serverless rewrites strip or alter /api prefix
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && !req.url.startsWith('/assets') && req.url !== '/' && !req.url.includes('.')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  next();
});

// Lazy GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Generate Creative Drama Title & Movie Poster Concept
app.post('/api/generate-title', async (req, res) => {
  try {
    const { idea = '', genre = 'ละครไทยฟอร์มยักษ์' } = req.body;
    const ai = getGenAI();

    const prompt = `คุณคือนักคิดชื่อเรื่องละคร ภาพยนตร์ และซีรีส์ไทยมือทอง
ให้ช่วยคิดชื่อเรื่องละครไทยที่น่าดึงดูดใจ ทรงพลัง น่าติดตาม สำหรับสร้างละครสั้นและโปสเตอร์ภาพยนตร์โรงหนัง 4K
${idea ? `แนวคิดหรือคีย์เวิร์ดที่ผู้ใช้ต้องการ: "${idea}"` : `แนวเรื่องหรือธีม: ${genre}`}

ช่วยสร้างข้อมูลดังนี้:
1. title: ชื่อเรื่องภาษาไทยที่โดดเด่น ติดหู มีพลังดราม่า เช่น "เพลิงบุญเพลิงมาร", "รอยสลักรักข้ามภพ", "อสูรซ่อนเงา", "มนตราสิเน่หาอโยธยา", "บ่วงวิมานทราย"
2. englishTitle: ชื่อภาษาอังกฤษ Cinematic แบบตัวพิมพ์ใหญ่ เช่น "SHADOW OF DESTINY", "THE BOUND SOUL: RETURN OF LOVE"
3. subtitle: แนวละครสั้นๆ เช่น "ละครพีเรียดโรแมนติกดราม่าเข้มข้น"
4. tagline: คำโปรยสำหรับโปสเตอร์ภาพยนตร์โรงหนัง (Cinema Tagline) 1 ประโยคทองคมคาย เช่น "เมื่อดวงใจถูกจองจำในไฟแค้น มีเพียงรักแท้ที่จะดับเพลิงสวาท"
5. synopsis: เรื่องย่อสั้นๆ 2-3 บรรทัดสำหรับตั้งต้น`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'ชื่อเรื่องภาษาไทย' },
            englishTitle: { type: Type.STRING, description: 'Cinematic English Title' },
            subtitle: { type: Type.STRING, description: 'แนวละคร' },
            tagline: { type: Type.STRING, description: 'คำโปรยโปสเตอร์ภาพยนตร์โรงหนัง' },
            synopsis: { type: Type.STRING, description: 'เรื่องย่อสั้นๆ' }
          },
          required: ['title', 'englishTitle', 'subtitle', 'tagline', 'synopsis']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      title: parsed.title || 'รอยรักรอยอสูร',
      englishTitle: parsed.englishTitle || 'THE BEAST OF DESTINY',
      subtitle: parsed.subtitle || 'ละครพีเรียดดราม่าแฟนตาซี',
      tagline: parsed.tagline || 'เมื่อหัวใจผูกพันด้วยชะตากรรม รักแท้จะเปลี่ยนทุกสิ่ง',
      synopsis: parsed.synopsis || ''
    });
  } catch (error: any) {
    console.error('Error generating title:', error);
    const fallbacks = [
      {
        title: 'เงารักอสูรพันปี',
        englishTitle: 'SHADOW OF THE IMMORTAL',
        subtitle: 'ละครพีเรียดแฟนตาซีอภินิหาร',
        tagline: 'เมื่อคำสาปพันปีถูกปลุกขึ้น มีเพียงหัวใจรักแท้ที่จะปลดปล่อย',
        synopsis: 'เรื่องราวของอสูรโบราณผู้เฝ้ารอคอยคนรักที่กลับชาติมาเกิด ท่ามกลางศึกสงครามระหว่างสองภพภูมิ'
      },
      {
        title: 'เพลิงสิเน่หาอโยธยา',
        englishTitle: 'FLAMES OF AYODHYA',
        subtitle: 'ละครพีเรียดรักชาติและดราม่าเข้มข้น',
        tagline: 'แผ่นดินต้องกู้ ศัตรูต้องสู้ แต่หัวใจไม่อาจทรยศความรัก',
        synopsis: 'ท่ามกลางศึกสงครามกรุงศรีอยุธยา แม่ทัพหนุ่มและหญิงสาวตระกูลขุนนางต้องเลือกระหว่างหน้าที่ต่อแผ่นดินและหัวใจของตนเอง'
      },
      {
        title: 'บ่วงแค้นข้ามภพ',
        englishTitle: 'BOUND BY VENGEANCE',
        subtitle: 'ละครดราม่าระทึกขวัญข้ามภพชาติ',
        tagline: 'ความแค้นในอดีต จะตามทวงหนี้ชีวิตในชาติต่อไป',
        synopsis: 'คำสาบานก่อนสิ้นลมหายใจที่ส่งผลข้ามชาติ เมื่อทายาทสองตระกูลต้องเผชิญหน้ากับความลับดำมืดที่ถูกเก็บซ่อน'
      }
    ];
    const picked = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    res.json(picked);
  }
});

// Generate Synopsis & Plot from Title
app.post('/api/generate-synopsis', async (req, res) => {
  try {
    const { title, genre = 'ละครไทย' } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'กรุณาระบุชื่อเรื่องเพื่อคิดพล็อต' });
    }

    const ai = getGenAI();

    const prompt = `คุณคือนักเขียนบทละครโทรทัศน์และภาพยนตร์มือทองสัญชาติไทย ผู้เชี่ยวชาญการคิดพล็อตเรื่องที่สนุก น่าติดตาม มีปมดราม่า ครบรส เข้มข้น และประทับใจผู้ชม
จากชื่อเรื่องละครที่ผู้ใช้ตั้งมาคือ: "${title.trim()}"

กรุณาแต่งและคิด "เรื่องย่อ (Synopsis)" สำหรับละครเรื่องนี้ความยาวประมาณ 3-5 บรรทัด (150-300 คำ)
- มีจุดเริ่มต้นความขัดแย้ง ตัวละครสำคัญ และปมเรื่องที่น่าติดตาม
- ระบุแนวเรื่อง (subtitle) และชื่อภาษาอังกฤษแบบ Cinematic Tagline ที่เข้ากัน
- คำโปรยโปสเตอร์หนัง (tagline) สำหรับใช้พิมพ์บนปกภาพยนตร์ 1 ประโยคทอง
- ภาษาไทยไพเราะ ได้อารมณ์ละครไทยแท้ๆ หรือแนวแฟนตาซี/พีเรียด/โมเดิร์นตามความเหมาะสมของชื่อเรื่อง`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            synopsis: { 
              type: Type.STRING, 
              description: 'เรื่องย่อความยาว 3-5 บรรทัดที่น่าติดตาม' 
            },
            subtitle: { 
              type: Type.STRING, 
              description: 'แนวละครหรือคำโปรยสั้นๆ เช่น ละครพีเรียดโรแมนติกดราม่า, แฟนตาซีอภินิหาร' 
            },
            englishTitle: { 
              type: Type.STRING, 
              description: 'Cinematic English Title/Tagline in UPPERCASE' 
            },
            tagline: {
              type: Type.STRING,
              description: 'คำโปรยทองบนโปสเตอร์ภาพยนตร์'
            }
          },
          required: ['synopsis', 'subtitle', 'englishTitle', 'tagline']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      synopsis: parsed.synopsis || '',
      subtitle: parsed.subtitle || '',
      englishTitle: parsed.englishTitle || '',
      tagline: parsed.tagline || parsed.subtitle || `มหากาพย์แห่งโชคชะตาและความรักใน ${title}`
    });
  } catch (error: any) {
    console.error('Error generating synopsis:', error);
    // Graceful fallback synopsis if API unavailable
    const titleVal = req.body.title || 'ละครไทยฟอร์มยักษ์';
    res.json({
      synopsis: `เรื่องราวแห่งโชคชะตาและความขัดแย้งใน "${titleVal}" เมื่อความรัก เกียรติยศ และความจริงที่ถูกซ่อนไว้ในอดีตได้หวนกลับมาทวงถาม นำพาทุกชีวิตเข้าสู่มหากาพย์การต่อสู้ที่ไม่มีวันหวนกลับ`,
      subtitle: 'ละครดราม่าเข้มข้นฟอร์มยักษ์',
      englishTitle: `${titleVal.toUpperCase()} : DESTINY OF FIRE`,
      tagline: `มหากาพย์แห่งโชคชะตาและเพลิงแค้นใน ${titleVal}`
    });
  }
});

// Helper image pool for diverse cinematic Thai drama scenes
const CINEMATIC_SCENE_IMAGES = [
  'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1080&auto=format&fit=crop&q=80', // Ancient Thai Temple
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1080&auto=format&fit=crop&q=80', // Mystical Ocean/River
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1080&auto=format&fit=crop&q=80', // Golden Palace Hall
  'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=1080&auto=format&fit=crop&q=80', // Golden Lotus & Water
  'https://images.unsplash.com/photo-1511497584788-87676104235f?w=1080&auto=format&fit=crop&q=80', // Deep Mystic Forest
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1080&auto=format&fit=crop&q=80', // Dramatic Fire/War
  'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=1080&auto=format&fit=crop&q=80', // Ancient Pagoda Sunset
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1080&auto=format&fit=crop&q=80', // Starlit Mountain Night
  'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?w=1080&auto=format&fit=crop&q=80', // Royal Courtyard
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1080&auto=format&fit=crop&q=80', // Dramatic Candlelit Interior
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&auto=format&fit=crop&q=80', // Ancient Valley River
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1080&auto=format&fit=crop&q=80', // Heroic Warrior Stance
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80', // Sacred Shoreline
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1080&auto=format&fit=crop&q=80', // Heroine Close-up
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080&auto=format&fit=crop&q=80', // Hero Close-up
];

function getContextualSceneImage(setting: string, prompt: string, index: number): string {
  const text = `${setting} ${prompt}`.toLowerCase();
  if (text.includes('palace') || text.includes('ปราสาท') || text.includes('วัง') || text.includes('ท้องพระโรง')) {
    return 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1080&auto=format&fit=crop&q=80';
  }
  if (text.includes('water') || text.includes('ocean') || text.includes('sea') || text.includes('สมุทร') || text.includes('แม่น้ำ')) {
    return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1080&auto=format&fit=crop&q=80';
  }
  if (text.includes('temple') || text.includes('วัด') || text.includes('โบราณ') || text.includes('ศาล')) {
    return 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1080&auto=format&fit=crop&q=80';
  }
  if (text.includes('forest') || text.includes('ป่า') || text.includes('ดง') || text.includes('ถ้ำ')) {
    return 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=1080&auto=format&fit=crop&q=80';
  }
  if (text.includes('war') || text.includes('battle') || text.includes('รบ') || text.includes('ไฟ') || text.includes('ศึก')) {
    return 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1080&auto=format&fit=crop&q=80';
  }
  if (text.includes('lotus') || text.includes('บัว') || text.includes('ทิพย์') || text.includes('สวรรค์')) {
    return 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=1080&auto=format&fit=crop&q=80';
  }
  return CINEMATIC_SCENE_IMAGES[index % CINEMATIC_SCENE_IMAGES.length];
}

// Generate Characters from Synopsis
app.post('/api/generate-characters', async (req, res) => {
  try {
    const { synopsis, title = '' } = req.body;

    if (!synopsis || synopsis.trim() === '') {
      return res.status(400).json({ error: 'กรุณาระบุเรื่องย่อเพื่อวิเคราะห์ตัวละคร' });
    }

    const ai = getGenAI();

    const prompt = `คุณคือนักเขียนบทและผู้กำกับละครมือทอง (Casting Director & Screenwriter)
จงวิเคราะห์ "เรื่องย่อละคร" ต่อไปนี้ แล้วสร้าง "ตัวละครหลัก 3 คน" ที่มีมิติ ขัดแย้ง น่าติดตาม และเข้ากับพล็อตเรื่องอย่างสมบูรณ์แบบที่สุด

[ชื่อเรื่อง]
${title || 'ละครไทย'}

[เรื่องย่อ (Synopsis)]
${synopsis}

ข้อกำหนดสำหรับตัวละครทั้ง 3 คน:
1. ตัวละครที่ 1: ตัวเอกฝ่ายหญิงหรือชาย (Hero / Heroine)
2. ตัวละครที่ 2: ตัวเอกฝ่ายตรงข้าม / ตัวร้าย / คู่ปรับ / คนรักที่มีปม (Antagonist / Rival / Counterpart)
3. ตัวละครที่ 3: ตัวละครสำคัญ / ผู้กุมความลับ / ผู้อาวุโส / สหายสนิท (Key Mentor / Elder / Secret Keeper)
4. ระบุ "appearance" (ลักษณะเด่น รูปร่าง หน้าตา ทรงผม เครื่องแต่งกาย ยุคสมัย เช่น นุ่งโจงกระเบน สไบทอง ชุดสูทสากล รอยแผลเป็น ดาบคู่) เพื่อให้ผู้ใช้สามารถระบุลักษณะเพิ่มได้
5. voiceId ให้เลือกจาก:
   - adult_female_gentle (หญิงสาวอ่อนหวาน นุ่มนวล)
   - adult_female_authoritative (หญิงสาวทรงอำนาจ สง่างาม คมคาย)
   - young_female_bright (หญิงสาวสดใส ร่าเริง ฉะฉาน)
   - adult_male_confident (ชายหนุ่มมาดมั่น สุภาพบุรุษ น่าเกรงขาม)
   - young_male_energetic (ชายหนุ่มพลังบวก ฮึกเหิม คึกคัก)
   - elderly_male_calm (ผู้อาวุโส สุขุม ลุ่มลึก อบอุ่น)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            characters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'ชื่อตัวละครภาษาไทย เช่น พระแม่ลักษมี, ออกหมื่นเดช, พิมพิลาไลย' },
                  role: { type: Type.STRING, description: 'บทบาท อุปนิสัย และความสำคัญในเรื่อง' },
                  appearance: { type: Type.STRING, description: 'ลักษณะภายนอก รูปร่าง หน้าตา เครื่องแต่งกาย สีเสื้อผ้า อาวุธ/เครื่องประดับ' },
                  gender: { type: Type.STRING, description: 'female หรือ male' },
                  voiceId: { type: Type.STRING, description: 'One of the voice IDs' },
                  visualPrompt: { type: Type.STRING, description: 'Cinematic portrait prompt in English for 8k visual generation' }
                },
                required: ['name', 'role', 'appearance', 'voiceId', 'visualPrompt']
              }
            },
            aiExtras: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'รายชื่อตัวประกอบเสริมที่เหมาะกับเรื่อง เช่น ทหารหลวง, เทพบริวาร, บ่าวไพร่'
            }
          },
          required: ['characters']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const avatarPoolFemale = [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80'
    ];
    const avatarPoolMale = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80'
    ];

    const characters = (parsed.characters || []).slice(0, 3).map((c: any, index: number) => {
      const isFemale = c.gender === 'female' || (c.voiceId && c.voiceId.includes('female'));
      const defaultAvatar = isFemale 
        ? avatarPoolFemale[index % avatarPoolFemale.length]
        : avatarPoolMale[index % avatarPoolMale.length];

      return {
        id: `char${index + 1}`,
        name: c.name || `ตัวละครที่ ${index + 1}`,
        role: c.role || 'ตัวละครสำคัญในเรื่อง',
        appearance: c.appearance || 'เครื่องแต่งกายและบุคลิกโดดเด่นตามยุคสมัยของเรื่อง',
        avatarUrl: defaultAvatar,
        visualPrompt: c.visualPrompt || `Cinematic Thai drama character portrait, ${c.name}, 8k, dramatic lighting`,
        voiceId: c.voiceId || (isFemale ? 'adult_female_gentle' : 'adult_male_confident')
      };
    });

    res.json({
      characters,
      aiExtras: parsed.aiExtras || ['ประชาชน', 'ทวยเทพ', 'ทหารหลวง']
    });
  } catch (error: any) {
    console.error('Error generating characters:', error);
    // Programmatic Fallback characters from synopsis keywords
    const text = (req.body.synopsis || '').toLowerCase();
    const isMyth = text.includes('เทพ') || text.includes('สวรรค์') || text.includes('มาร') || text.includes('อภินิหาร');
    
    const fallbackChars = isMyth ? [
      {
        id: 'char1',
        name: 'เทวานฤมิต (The Divine Sovereign)',
        role: 'เทพเอกผู้พิทักษ์ความยุติธรรมและแสงสว่างแห่งสรวงสวรรค์',
        appearance: 'บุรุษรูปงาม ผิวพรรณเปล่งประกาย สวมมงกุฎชฎาทองคำ นุ่งผ้าทิพย์สีครามเข้ม ถือคทาแสงสุริยัน',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        visualPrompt: 'Majestic celestial Thai god king in golden aura, ancient divine armor, 8k cinematic lighting',
        voiceId: 'adult_male_confident'
      },
      {
        id: 'char2',
        name: 'เทวีดาริกา (The Star Goddess)',
        role: 'เทวีผู้อ่อนโยนแต่เปี่ยมด้วยจิตวิญญาณเด็ดเดี่ยว ผู้กุมกุญแจแห่งคำทำนาย',
        appearance: 'สตรีผู้เลอโฉม สวมสไบสีเงินปักดิ้นทอง เครื่องประดับศิราภรณ์มรกตและมุก ดวงตาเปล่งประกายดั่งดาวประกายพรึก',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
        visualPrompt: 'Beautiful celestial Thai goddess in shimmering silver traditional dress, radiant aura, cinematic 8k',
        voiceId: 'adult_female_gentle'
      },
      {
        id: 'char3',
        name: 'จอมอสูรราหุล (The Shadow Overlord)',
        role: 'ผู้ท้าทายบัลลังก์สวรรค์ จอมวางแผนผู้ขับเคลื่อนความขัดแย้ง',
        appearance: 'บุรุษร่างกำยำ หน้าตาดุดันคมเข้ม สวมเกราะดำขลิบโลหิต นัยน์ตาสีชาด เปี่ยมพลังอำนาจน่าเกรงขาม',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        visualPrompt: 'Dark powerful shadow warrior overlord, intense gaze, cinematic dramatic red and gold shadows, 8k',
        voiceId: 'elderly_male_calm'
      }
    ] : [
      {
        id: 'char1',
        name: 'คุณหลวงเดชา (Luang Decha)',
        role: 'พระเอกข้าราชการหนุ่มตงฉิน ผู้ยึดมั่นในความถูกต้องและความรัก',
        appearance: 'ชายหนุ่มวัย 28 ปี รูปร่างสูงโปร่ง คมเข้ม นุ่งโจงกระเบนผ้าไหม เสื้อราชปะแตนขาวสง่า พกนาฬิกาพกสีทอง',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        visualPrompt: 'Handsome noble Thai gentleman in traditional white Ratchapataen uniform, elegant posture, 8k',
        voiceId: 'adult_male_confident'
      },
      {
        id: 'char2',
        name: 'แม่หญิงดาวเรือง (Mae Ying Daoreuang)',
        role: 'นางเอกผู้ฉลาดเฉลียว เด็ดเดี่ยว ไม่ยอมจำนนต่อโชคชะตา',
        appearance: 'หญิงสาวใบหน้าหวานคม ผิวสีน้ำผึ้ง นวลเนียน นุ่งผ้าซิ่นตีนจก ห่มสไบสีชมพูกลีบบัว ผมมวยเกล้าประดับดอกจำปา',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
        visualPrompt: 'Graceful young Thai lady in traditional silk sabai, lotus garden background, warm cinematic light',
        voiceId: 'adult_female_gentle'
      },
      {
        id: 'char3',
        name: 'เจ้าสัวไพศาล (Chao Sua Phaisan)',
        role: 'คหบดีผู้มั่งคั่ง ผู้กุมความลับของตระกูลและเบื้องหลังปมปริศนา',
        appearance: 'ชายสูงวัยภูมิฐาน สายตาเฉียบแหลม สวมเสื้อผ้าไหมแพรจีนสีน้ำเงินเข้ม สวมแหวนหยกมรกต',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        visualPrompt: 'Wealthy Thai merchant elder in deep blue silk robes, commanding presence, cinematic indoor hall',
        voiceId: 'elderly_male_calm'
      }
    ];

    res.json({
      characters: fallbackChars,
      aiExtras: ['ทนายประจำตระกูล', 'บ่าวคนสนิท', 'ประชาชน']
    });
  }
});

// Generate Drama Story & Episodic Scenes
app.post('/api/generate-story', async (req, res) => {
  try {
    const { 
      synopsis, 
      sceneCount = 10, 
      characters = [], 
      narratorVoiceId = 'elderly_male_calm',
      narrationMode = 'mixed' // 'mixed', 'full_narrator', 'dialogue_only'
    } = req.body;

    if (!synopsis || synopsis.trim() === '') {
      return res.status(400).json({ error: 'กรุณาระบุเรื่องย่อ (Synopsis)' });
    }

    const clampedCount = Math.max(1, Math.min(20, Number(sceneCount) || 10));
    const ai = getGenAI();

    const charDescriptions = characters.map((c: any, index: number) => 
      `- ตัวละครหลักที่ ${index + 1} (${c.id || `char${index + 1}`}): ชื่อ "${c.name || `ตัวละคร ${index + 1}`}", บทบาท: "${c.role || 'ไม่มีข้อมูล'}", ลักษณะเด่น/การแต่งกาย: "${c.appearance || 'เครื่องแต่งกายตามยุคสมัย'}"`
    ).join('\n');

    let modeInstruction = 'บทสนทนาและคำบรรยายผสมผสานกันอย่างลงตัว (Mixed Mode)';
    if (narrationMode === 'full_narrator') {
      modeInstruction = 'โหมดเสียงบรรยายเต็มรูปแบบ (Full Narration Mode): ทุกฉากให้ dialogueSpeaker เป็น "narrator" โดยเน้นการเล่าเรื่อง บรรยายอารมณ์ เหตุการณ์ และฉากหลังอย่างลึกซึ้ง ไพเราะ ราวกับสารคดีหรือนิทานปรัมปรา';
    } else if (narrationMode === 'dialogue_only') {
      modeInstruction = 'โหมดบทสนทนาตัวละครล้วน (Dialogue Only Mode): เน้นการสนทนาโต้ตอบระหว่างตัวละคร (char1, char2, char3, extra) อย่างเข้มข้น ดราม่า มีบทบรรยายให้น้อยที่สุด';
    }

    const prompt = `คุณคือสุดยอดผู้กำกับและโปรดิวเซอร์ละครไทยและภาพยนตร์ระดับบล็อกบัสเตอร์ (Drama Producer & Screenwriter)
จงสร้างโครงเรื่อง บทพูด และฉากละครไทยที่ต่อเนื่อง ไม่หลุดธีม จากเรื่องย่อด้านล่างนี้ โดยแบ่งออกเป็น ${clampedCount} ฉากอย่างลงตัว มีจุดเริ่มต้น ความขัดแย้ง จุดไคลแม็กซ์ และบทสรุปที่ตราตรึงใจ

[รูปแบบคำบรรยาย/บทพูดที่เลือก]
${modeInstruction}

[เรื่องย่อ (Synopsis)]
${synopsis}

[ตัวละครหลัก 3 ตัว พร้อมลักษณะเด่น/การแต่งกาย]
${charDescriptions || '- ตัวละคร 1: ตัวเอกหญิง\n- ตัวละคร 2: ตัวเอกชาย\n- ตัวละคร 3: ตัวละครสำคัญ/ผู้อาวุโส'}

[ข้อกำหนดสำคัญ]:
1. ต้องสร้างฉากให้ครบ ${clampedCount} ฉากพอดี (Scene 1 ถึง Scene ${clampedCount})
2. AI คิดตัวละครประกอบ (AI Extras / ตัวประกอบ) เพิ่มเติมตามความเหมาะสมของเรื่อง เช่น ทหาร, เทพยดา, บ่าวไพร่, ประชาชน, นางกำนัล
3. โครงเรื่องต้องเป็นเรื่องเดียวกัน มีความต่อเนื่อง (Story Continuity) อารมณ์ไม่ขาดตอน
4. แต่ละฉากให้มี:
   - title (ชื่อฉากสั้นๆ ภาษาไทย)
   - settingTag (สถานที่ เช่น 'เกษียรสมุทร', 'ท้องพระโรง', 'ริมแม่น้ำเจ้าพระยา')
   - visualPrompt (Prompt ภาษาอังกฤษสำหรับสร้างภาพ/วิดีโอระดับ Cinematic 8k เน้นความสวยงาม อารมณ์ แสง แบล็คกราวด์ และตัวละครที่ปรากฏ)
   - dialogueSpeaker ('narrator', 'char1', 'char2', 'char3', หรือ 'extra' ตามโหมด ${narrationMode})
   - dialogueSpeakerName (ชื่อผู้พูด เช่น 'ผู้บรรยาย', 'พระแม่ลักษมี', 'ตัวประกอบ (เทพยดา)')
   - dialogueText (บทพูดหรือบทบรรยายภาษาไทยที่ไพเราะ คมคาย ได้อารมณ์ มีแท็กนำหน้าเช่น '[คำบรรยาย]: ...' หรือ '[ตัวละครที่ 1]: ...')
   - cameraMotion ('zoom_in', 'zoom_out', 'pan_right', 'tilt_up', 'dramatic_push')
   - durationSec (ความยาวฉาก 4-7 วินาที)
5. คิดชื่อเรื่องภาษาไทยที่ทรงพลัง, ชื่อภาษาอังกฤษแบบ Cinematic Tagline, และเรื่องย่อแบบขยายความ`;

    let parsedData: any = null;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'ชื่อเรื่องละครไทย เช่น กำเนิดพระแม่ลักษมี: เทวีแห่งความมั่งคั่ง' },
              englishTitle: { type: Type.STRING, description: 'Cinematic English Title/Tagline in UPPERCASE' },
              subtitle: { type: Type.STRING, description: 'คำโปรยหรือประเภทละคร' },
              expandedSynopsis: { type: Type.STRING, description: 'เรื่องย่อแบบเรียบเรียงสมบูรณ์' },
              aiExtras: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'รายชื่อตัวประกอบที่ AI คิดเพิ่มสำหรับเรื่องนี้'
              },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sceneNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    settingTag: { type: Type.STRING },
                    visualPrompt: { type: Type.STRING },
                    dialogueSpeaker: { 
                      type: Type.STRING,
                      description: 'One of: narrator, char1, char2, char3, extra'
                    },
                    dialogueSpeakerName: { type: Type.STRING },
                    dialogueText: { type: Type.STRING },
                    cameraMotion: { 
                      type: Type.STRING,
                      description: 'One of: zoom_in, zoom_out, pan_right, tilt_up, dramatic_push'
                    },
                    durationSec: { type: Type.INTEGER }
                  },
                  required: ['sceneNumber', 'title', 'settingTag', 'visualPrompt', 'dialogueSpeaker', 'dialogueSpeakerName', 'dialogueText']
                }
              }
            },
            required: ['title', 'englishTitle', 'subtitle', 'scenes']
          }
        }
      });

      parsedData = JSON.parse(response.text || '{}');
    } catch (genError) {
      console.warn('Gemini generate-story failed, generating robust dynamic scenes fallback:', genError);
    }

    // Assign voice IDs based on speaker
    const charVoiceMap: Record<string, string> = {
      narrator: narratorVoiceId || 'elderly_male_calm',
      char1: characters[0]?.voiceId || 'adult_female_gentle',
      char2: characters[1]?.voiceId || 'adult_male_confident',
      char3: characters[2]?.voiceId || 'elderly_male_calm',
      extra: 'young_male_energetic'
    };

    const char1Name = characters[0]?.name || 'ตัวละครเอก 1';
    const char2Name = characters[1]?.name || 'ตัวละครเอก 2';
    const char3Name = characters[2]?.name || 'ตัวละคร 3';

    // If parsedData is missing or has no scenes, construct programmatic dynamic scenes matching synopsis
    if (!parsedData || !parsedData.scenes || parsedData.scenes.length === 0) {
      const storyTitle = synopsis.slice(0, 30).trim();
      const fallbackScenesList = [];
      
      const sceneTemplates = [
        { title: 'จุดเริ่มต้นแห่งโชคชะตา', setting: 'ท้องเรื่องหลัก', speaker: 'narrator', text: `[คำบรรยาย]: ณ จุดเริ่มต้นของเรื่องราวแห่ง ${synopsis.slice(0, 50)}... สายลมแห่งชะตากรรมเริ่มพัดพา` },
        { title: 'การปรากฏตัวของตัวเอก', setting: 'เรือนเอก', speaker: 'char1', text: `[${char1Name}]: หากนี่คือเส้นทางที่ข้าต้องก้าวเดิน ข้าจะไม่ยอมถอยหลังแม้แต่ก้าวเดียว` },
        { title: 'การเผชิญหน้าและปมปริศนา', setting: 'ลานกว้างหน้าเรือน', speaker: 'char2', text: `[${char2Name}]: เรื่องราวไม่ได้เรียบง่ายอย่างที่เจ้าคิด ความจริงยังรอวันเปิดเผย` },
        { title: 'คำเตือนจากผู้อาวุโส', setting: 'ห้องลับหอคัมภีร์', speaker: 'char3', text: `[${char3Name}]: จงระวังเงื้อมเงาแห่งอดีต สิ่งที่มองไม่เห็นย่อมอันตรายที่สุด` },
        { title: 'ความจริงที่เริ่มกระจ่าง', setting: 'ริมแม่น้ำสายหลัก', speaker: 'narrator', text: `[คำบรรยาย]: ความขัดแย้งเริ่มทวีความรุนแรงขึ้นเมื่อหลักฐานชิ้นสำคัญปรากฏต่อหน้าทุกคน` },
        { title: 'จุดแตกหักและการตัดสินใจ', setting: 'ท้องพระโรงใหญ่', speaker: 'char1', text: `[${char1Name}]: ข้าขอเอาเกียรติและหัวใจเป็นเดิมพัน เพื่อปกป้องสิ่งที่ข้ารัก!` },
        { title: 'การปะทะครั้งสำคัญ', setting: 'สมรภูมิหน้าลานเมือง', speaker: 'char2', text: `[${char2Name}]: ถ้าเช่นนั้น ก็จงพิสูจน์ให้ประจักษ์ด้วยตัวของเจ้าเองเถิด!` },
        { title: 'ความโกลาหลของเหตุการณ์', setting: 'ลานเมืองหลวง', speaker: 'extra', text: `[ประชาชน/ผู้ร่วมเหตุการณ์]: ดูนั่นสิ! ฟ้าดินกำลังเป็นพยานในการตัดสินครั้งประวัติศาสตร์!` },
        { title: 'บทเรียนและหยาดน้ำตา', setting: 'ศาลาใกล้อาสนวิหาร', speaker: 'char3', text: `[${char3Name}]: ชัยชนะที่แลกมาด้วยความสูญเสีย ย่อมเป็นบทเรียนล้ำค่าของมนุษย์` },
        { title: 'บทสรุปและแสงทองวันใหม่', setting: 'ยอดเขาตระหง่านรับอรุณ', speaker: 'narrator', text: `[คำบรรยาย]: และนี่คือบทสรุปของมหากาพย์ เมื่อความจริง ชัยชนะ และความรักได้สถิตอยู่ในความทรงจำตลอดกาล` }
      ];

      for (let i = 0; i < clampedCount; i++) {
        const tmpl = sceneTemplates[i % sceneTemplates.length];
        const speakerKey = tmpl.speaker as 'narrator' | 'char1' | 'char2' | 'char3' | 'extra';
        const speakerName = speakerKey === 'narrator' ? 'ผู้บรรยาย' : (speakerKey === 'char1' ? char1Name : (speakerKey === 'char2' ? char2Name : (speakerKey === 'char3' ? char3Name : 'ตัวประกอบ')));
        
        fallbackScenesList.push({
          sceneNumber: i + 1,
          title: `${tmpl.title} (ฉากที่ ${i + 1})`,
          settingTag: tmpl.setting,
          visualPrompt: `Cinematic dramatic Thai drama scene ${i + 1}, ${tmpl.setting}, 8k resolution, cinematic lighting, movie still, masterpieces`,
          dialogueSpeaker: speakerKey,
          dialogueSpeakerName: speakerName,
          dialogueText: tmpl.text,
          cameraMotion: i % 2 === 0 ? 'zoom_in' : 'pan_right',
          durationSec: 5
        });
      }

      parsedData = {
        title: `มหากาพย์ ${storyTitle}...`,
        englishTitle: 'THE LEGENDARY DESTINY',
        subtitle: 'ละครซีรีส์ดราม่าฟอร์มยักษ์',
        expandedSynopsis: synopsis,
        aiExtras: ['ชาวเมือง', 'ทหารอารักขา', 'บ่าวคนสนิท'],
        scenes: fallbackScenesList
      };
    }

    // Enrich scenes with unique IDs and contextual vivid backdrop visuals
    const processedScenes = (parsedData.scenes || []).slice(0, clampedCount).map((sc: any, index: number) => {
      const speakerKey = sc.dialogueSpeaker || (narrationMode === 'full_narrator' ? 'narrator' : 'char1');
      const voiceId = charVoiceMap[speakerKey] || 'adult_male_confident';
      const setting = sc.settingTag || 'สถานที่สำคัญ';
      const prompt = sc.visualPrompt || 'Cinematic dramatic Thai drama scene';
      
      let speakerDisplayName = sc.dialogueSpeakerName;
      if (!speakerDisplayName) {
        if (speakerKey === 'narrator') speakerDisplayName = 'ผู้บรรยาย';
        else if (speakerKey === 'char1') speakerDisplayName = char1Name;
        else if (speakerKey === 'char2') speakerDisplayName = char2Name;
        else if (speakerKey === 'char3') speakerDisplayName = char3Name;
        else speakerDisplayName = 'ตัวประกอบ';
      }

      const sceneBg = getContextualSceneImage(setting, prompt, index);

      return {
        id: `sc-${Date.now()}-${index + 1}`,
        sceneNumber: sc.sceneNumber || index + 1,
        title: sc.title || `ฉากที่ ${index + 1}`,
        settingTag: setting,
        visualPrompt: prompt,
        dialogueSpeaker: speakerKey,
        dialogueSpeakerName: speakerDisplayName,
        dialogueText: sc.dialogueText || `[${speakerDisplayName}]: บทสนทนาในฉากนี้`,
        voiceId: voiceId,
        durationSec: sc.durationSec || 5,
        mediaType: 'image',
        imageUrl: sceneBg,
        cameraMotion: sc.cameraMotion || (index % 2 === 0 ? 'zoom_in' : 'pan_right')
      };
    });

    res.json({
      title: parsedData.title,
      englishTitle: parsedData.englishTitle,
      subtitle: parsedData.subtitle,
      expandedSynopsis: parsedData.expandedSynopsis || synopsis,
      aiExtras: parsedData.aiExtras || ['ทวยเทพบริวาร', 'ประชาชน', 'บ่าวคนสนิท'],
      scenes: processedScenes
    });
  } catch (error: any) {
    console.error('Error generating story:', error);
    res.status(500).json({ 
      error: 'เกิดข้อผิดพลาดในการสร้างบทละครด้วย AI',
      details: error.message 
    });
  }
});

// Generate Image for a scene or poster
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio = '9:16', style = 'cinematic', isPoster = false } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'กรุณาระบุ Prompt สำหรับสร้างภาพ' });
    }

    const ai = getGenAI();

    // If using image generation model
    try {
      const fullPrompt = isPoster 
        ? `Cinematic movie theatrical poster, ${prompt}, blockbuster movie poster style, dramatic key visual lighting, 8k resolution, epic composition, masterpieces`
        : `Cinematic drama still from film, ${prompt}, highly detailed, cinematic atmosphere, 8k, film grain, dramatic lighting, anamorphic lens`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          }
        }
      });

      let foundImageUrl = '';
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            foundImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (foundImageUrl) {
        return res.json({ imageUrl: foundImageUrl });
      }
    } catch (imgError) {
      console.warn('Direct image model fallback:', imgError);
    }

    // High quality themed fallback image URL based on prompt keywords
    const keywords = prompt.toLowerCase();
    let fallbackImage = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1080&auto=format&fit=crop&q=80';

    if (keywords.includes('ocean') || keywords.includes('sea') || keywords.includes('water') || keywords.includes('นม') || keywords.includes('สมุทร')) {
      fallbackImage = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1080&auto=format&fit=crop&q=80';
    } else if (keywords.includes('goddess') || keywords.includes('lakshmi') || keywords.includes('woman') || keywords.includes('เทวี') || keywords.includes('หญิง')) {
      fallbackImage = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1080&auto=format&fit=crop&q=80';
    } else if (keywords.includes('god') || keywords.includes('vishnu') || keywords.includes('palace') || keywords.includes('สวรรค์') || keywords.includes('กษัตริย์')) {
      fallbackImage = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1080&auto=format&fit=crop&q=80';
    } else if (keywords.includes('mountain') || keywords.includes('battle') || keywords.includes('war') || keywords.includes('ศึก') || keywords.includes('ยุทธ')) {
      fallbackImage = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1080&auto=format&fit=crop&q=80';
    } else if (keywords.includes('lotus') || keywords.includes('flower') || keywords.includes('บัว')) {
      fallbackImage = 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=1080&auto=format&fit=crop&q=80';
    }

    res.json({ imageUrl: fallbackImage });
  } catch (error: any) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enhance / Polish Thai Dialogue
app.post('/api/enhance-dialogue', async (req, res) => {
  try {
    const { currentText, style = 'period_thai', characterRole = '' } = req.body;
    const ai = getGenAI();

    const styleInstructions: Record<string, string> = {
      period_thai: 'ปรับสำนวนให้เป็นภาษาไทยย้อนยุค/โบราณ (เช่น ละครพีเรียด อยุธยา รัตนโกสินทร์) ใช้คำว่า ออเจ้า ข้าพเจ้า ท่านพี่ มิได้ เพลานี้',
      royal_mythology: 'ปรับสำนวนให้เป็นภาษาวรรณคดี/เทพปกรณัม ทวยเทพ ศักดิ์สิทธิ์ สง่างาม ไพเราะดุจบทกวี',
      modern_dramatic: 'ปรับสำนวนให้เป็นละครไทยโมเดิร์น เชือดเฉือน อารมณ์เข้มข้น จัดจ้าน น่าติดตาม',
      action_epic: 'ปรับสำนวนให้ฮึกเหิม ดุดัน หนักแน่น เปี่ยมด้วยพลังแห่งการต่อสู้และเกียรติยศ',
      sweet_romance: 'ปรับสำนวนให้อ่อนหวาน โรแมนติก ละมุนละไม ฟังแล้วอบอุ่นหัวใจ'
    };

    const prompt = `คุณคือผู้เขียนบทละครชั้นครู
จงปรับปรุงบทพูดภาษาไทยต่อไปนี้ ให้เข้ากับบทบาท "${characterRole}" และสไตล์: ${styleInstructions[style] || 'ภาษาละครไทยที่น่าดึงดูด'}

[บทพูดเดิม]
${currentText}

ตอบกลับมาเฉพาะข้อความบทพูดใหม่ที่ปรับปรุงแล้วเท่านั้น (รักษาแท็ก [คำบรรยาย] หรือ [ชื่อตัวละคร] ไว้ด้วยหากมี)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({
      enhancedText: response.text?.trim() || currentText
    });
  } catch (error: any) {
    console.error('Error enhancing dialogue:', error);
    res.status(500).json({ error: error.message });
  }
});

// Gemini TTS Audio Generation
app.post('/api/generate-speech', async (req, res) => {
  try {
    const { text, voiceName = 'Fenrir' } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Clean brackets like [คำบรรยาย]: from the spoken text for TTS
    const cleanText = text.replace(/^\[[^\]]+\]:\s*/, '').trim();

    const ai = getGenAI();

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: cleanText }] }],
        config: {
          responseModalities: ['AUDIO' as any],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName || 'Fenrir' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({
          audioData: `data:audio/wav;base64,${base64Audio}`,
          format: 'base64'
        });
      }
    } catch (ttsErr) {
      console.warn('Gemini TTS direct call skipped, client Web Speech fallback enabled:', ttsErr);
    }

    res.json({
      useClientSpeech: true,
      cleanText
    });
  } catch (error: any) {
    console.error('Error generating speech:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export app for serverless platforms like Vercel
export default app;

// Setup Vite development middleware or static production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Drama AI Studio Server running on http://localhost:${PORT}`);
  });
}

// Only start standalone listener when not in serverless runtime (e.g. Vercel)
if (!process.env.VERCEL) {
  startServer();
}

