export type HonorificStyle = '해요체' | '하십시오체' | '해라체/평어' | '기타';
export type EmojiIntensity = 'none' | 'low' | 'moderate' | 'high';
export type SentenceLength = 'short' | 'medium' | 'long';

export interface BrandingPersona {
  id: string;
  name: string;
  tagline: string;
  description: string;
  tones: string[];
  example: string;
  emojiIntensity: EmojiIntensity;
  sentenceLength: SentenceLength;
  honorificStyle: HonorificStyle;
}

export interface ToneAnalysisResult {
  mode: 'url' | 'persona';
  source: string; // URL input or Persona name/ID
  styleOverview: string;
  sentenceLength: SentenceLength;
  honorificStyle: HonorificStyle;
  emojiIntensity: EmojiIntensity;
  formattingPatterns: string[];
  keyAdjectives: string[];
}

export interface NaverApiConfig {
  clientId: string;
  clientSecret: string;
  blogId: string;
  isConnected: boolean;
}

export interface BlogPost {
  title: string;
  htmlContent: string;
  markdownContent: string;
  seoTags: string[];
  metaDescription: string;
  wordCount: number;
  estReadTime: number;
  imagePlaceholders: {
    id: number;
    afterParagraphIndex: number;
    recommendedImagePrompt: string;
    caption: string;
  }[];
}

export interface SeoScoreDetails {
  score: number;
  checks: {
    label: string;
    passed: boolean;
    feedback: string;
    impact: 'high' | 'medium' | 'low';
  }[];
  keywordCount: number;
  keywordDensity: number; // percentage
}
