import { VoiceOption } from '../types';

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'elderly_male_calm',
    name: 'ผู้สูงอายุชาย',
    label: 'ผู้สูงอายุชาย — เสียงทุ้มต่ำ สุขุม พูดช้า (แนะนำสำหรับคำบรรยาย)',
    gender: 'elderly_male',
    description: 'เสียงทุ้มต่ำ สุขุม พูดช้า หนักแน่นเปี่ยมบารมี',
    pitch: 0.75,
    rate: 0.85,
    geminiVoice: 'Fenrir',
    tone: 'calm_deep',
  },
  {
    id: 'adult_female_gentle',
    name: 'ผู้ใหญ่หญิง',
    label: 'ผู้ใหญ่หญิง — เสียงกลาง อ่อนโยน นุ่มนวล',
    gender: 'female',
    description: 'เสียงกลาง อ่อนโยน นุ่มนวล สง่างาม เหมาะกับนางเอก/เทวี',
    pitch: 1.15,
    rate: 0.95,
    geminiVoice: 'Kore',
    tone: 'gentle_sweet',
  },
  {
    id: 'adult_male_confident',
    name: 'ผู้ใหญ่ชาย',
    label: 'ผู้ใหญ่ชาย — เสียงทุ้ม น่าเชื่อถือ หนักแน่น',
    gender: 'male',
    description: 'เสียงทุ้ม น่าเชื่อถือ หนักแน่น เหมาะกับพระเอก/แม่ทัพ/ผู้นำ',
    pitch: 0.9,
    rate: 0.95,
    geminiVoice: 'Zephyr',
    tone: 'confident_strong',
  },
  {
    id: 'young_female_bright',
    name: 'วัยรุ่นหญิง',
    label: 'วัยรุ่นหญิง — สดใส ร่าเริง น่ารัก',
    gender: 'young_female',
    description: 'เสียงสดใส มีชีวิตชีวา ร่าเริง อารมณ์แจ่มใส',
    pitch: 1.3,
    rate: 1.05,
    geminiVoice: 'Puck',
    tone: 'bright_cheerful',
  },
  {
    id: 'young_male_energetic',
    name: 'วัยรุ่นชาย',
    label: 'วัยรุ่นชาย — ไฟแรง มั่นใจ คล่องแคล่ว',
    gender: 'young_male',
    description: 'เสียงหนุ่มคล่องแคล่ว พลังบวก ทันสมัย',
    pitch: 1.05,
    rate: 1.0,
    geminiVoice: 'Charon',
    tone: 'energetic',
  },
  {
    id: 'queen_majestic',
    name: 'นางพญา / เทพีชั้นสูง',
    label: 'นางพญา / เทพีชั้นสูง — ทรงพลัง อำนาจ ก้องกังวาน',
    gender: 'female',
    description: 'เสียงทรงพลัง ก้องกังวาน ดุดันแต่สง่างาม',
    pitch: 0.95,
    rate: 0.9,
    geminiVoice: 'Kore',
    tone: 'majestic_powerful',
  },
  {
    id: 'villain_sinister',
    name: 'จอมมาร / ฝ่ายตรงข้าม',
    label: 'จอมมาร / ฝ่ายตรงข้าม — แหบต่ำ เยือกเย็น ลึกลับ',
    gender: 'male',
    description: 'เสียงแหบต่ำ เยือกเย็น น่าเกรงขาม',
    pitch: 0.65,
    rate: 0.8,
    geminiVoice: 'Fenrir',
    tone: 'sinister',
  }
];

export const DEFAULT_NARRATOR_VOICE = 'elderly_male_calm';
export const DEFAULT_CHAR1_VOICE = 'adult_female_gentle';
export const DEFAULT_CHAR2_VOICE = 'adult_male_confident';
export const DEFAULT_CHAR3_VOICE = 'elderly_male_calm';
