export interface CharacterProfile {
  id: string;
  name: string;
  role: string;
  appearance?: string; // ลักษณะเด่น รูปร่าง หน้าตา การแต่งกาย เครื่องประดับ
  avatarUrl: string;
  visualPrompt: string;
  voiceId: string;
  isAiExtra?: boolean;
}

export interface VoiceOption {
  id: string;
  name: string;
  label: string;
  gender: 'female' | 'male' | 'elderly_male' | 'young_female' | 'young_male';
  description: string;
  pitch: number;
  rate: number;
  geminiVoice: string;
  tone: string;
}

export interface SceneItem {
  id: string;
  sceneNumber: number;
  title: string;
  settingTag: string;
  visualPrompt: string;
  dialogueSpeaker: 'narrator' | 'char1' | 'char2' | 'char3' | 'extra';
  dialogueSpeakerName: string;
  dialogueText: string;
  voiceId: string;
  durationSec: number;
  mediaType: 'image' | 'video';
  imageUrl: string;
  videoUrl?: string;
  isGenerating?: boolean;
  audioUrl?: string;
  cameraMotion?: 'pan_right' | 'zoom_in' | 'zoom_out' | 'tilt_up' | 'dramatic_push';
  narrationType?: 'narration' | 'dialogue' | 'mixed';
}

export interface DramaProject {
  title: string;
  englishTitle: string;
  subtitle: string;
  synopsis: string;
  sceneCount: number;
  narratorVoiceId: string;
  characters: CharacterProfile[];
  scenes: SceneItem[];
  posterUrl: string;
  videoModel: string;
  narrationMode?: 'mixed' | 'full_narrator' | 'dialogue_only';
  subtitleEnabled?: boolean;
  cinemaPoster?: {
    tagline: string;
    releaseDate: string;
    director: string;
    rating: string;
    aspectRatio: '2:3' | '16:9' | '9:16';
  };
}
