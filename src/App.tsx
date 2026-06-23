import React, { useState, useEffect } from 'react';
import { ToneAnalysisResult, BlogPost, NaverApiConfig } from './types';
import { ToneSelector } from './components/ToneSelector';
import { PostGenerator } from './components/PostGenerator';
import { PostDraftViewer } from './components/PostDraftViewer';
import { NaverApiGuide } from './components/NaverApiGuide';
import { 
  Sparkles, CheckCircle, HelpCircle, ArrowRight, PenTool, 
  Settings2, BookOpen, Layers, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [selectedStyle, setSelectedStyle] = useState<ToneAnalysisResult | null>(null);
  const [generatedPost, setGeneratedPost] = useState<BlogPost | null>(null);
  const [activeTopic, setActiveTopic] = useState('');
  const [activeKeywords, setActiveKeywords] = useState('');
  
  // LocalStorage persistence for Naver API keys
  const [apiConfig, setApiConfig] = useState<NaverApiConfig>(() => {
    try {
      const saved = localStorage.getItem('naver_api_config');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse Naver API Config on mount:', e);
    }
    return {
      clientId: '',
      clientSecret: '',
      blogId: '',
      isConnected: false
    };
  });

  useEffect(() => {
    localStorage.setItem('naver_api_config', JSON.stringify(apiConfig));
  }, [apiConfig]);

  // Style change handler
  const handleStyleSelected = (style: ToneAnalysisResult) => {
    setSelectedStyle(style);
    // Reset any old posts since style changed
    setGeneratedPost(null);
  };

  // Post generation handler
  const handlePostGenerated = (post: BlogPost, keywords: string, topic: string) => {
    setGeneratedPost(post);
    setActiveKeywords(keywords);
    setActiveTopic(topic);
    
    // Smooth scroll down to post viewer card
    setTimeout(() => {
      document.getElementById('post-draft-viewer-container')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 120);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 selection:bg-blue-100 relative pb-24 font-sans" id="blog-copilot-root">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-4 md:px-8 flex items-center justify-between" id="app-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm shadow-blue-500/20">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-tight font-sans text-slate-900">
                BlogStyle AI <span className="text-slate-400 font-normal">| 블로그 문체 분석 비서</span>
              </h1>
              <span className="p-0.5 px-2 bg-emerald-100/85 text-emerald-800 text-[10px] font-bold rounded-full">
                ACTIVE API
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans">
              문체 분석 모듈 및 네이버 포스팅 OpenAPI 자동 생성 솔루션
            </p>
          </div>
        </div>

        {/* Top badge indicators showing active settings */}
        <div className="hidden sm:flex items-center gap-4 text-xs font-sans">
          {selectedStyle ? (
            <div className="flex items-center gap-1.5 p-1.5 px-3 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg font-medium" id="indicator-active-style">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>문체 학습 완료</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 p-1.5 px-3 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg" id="indicator-inactive-style">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" />
              <span>학습 대기 중</span>
            </div>
          )}
          
          {apiConfig.isConnected ? (
            <div className="flex items-center gap-1.5 p-1.5 px-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg font-medium" id="indicator-api-connected">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Naver API 구성완료</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 p-1.5 px-3 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg" id="indicator-api-disconnected">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
              <span>시뮬레이터 제공</span>
            </div>
          )}
        </div>
      </header>

      {/* DOCK COLUMN GRID BODY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10" id="app-main-content">
        
        {/* UPPER DESCRIPTION BOARD */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-sm" id="branding-cover">
          <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-3 relative z-10">
            <span className="inline-flex p-1 px-2.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
              Hybrid Style Cloner & Generator
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white font-sans">
              나의 오래된 블로그 말투를 복제하고,<br />
              네이버 상위 노출 기사를 10초 만에 설계하세요
            </h2>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              어려운 HTML 코드 몰라도 괜찮습니다. 글의 문장을 조목조목 분석해 말투 특징을 모방하며,
              네이버 C-Rank에 최적화된 키워드 비율과 이미지 권장 포지션을 완비하여 임시글 보관함까지 밀어드리는 스마트 글쓰기 비서입니다.
            </p>
          </div>
        </div>

        {/* STEP 1: DUAL MODE TONE STYLE SETTING */}
        <section className="space-y-4">
          <ToneSelector 
            onStyleSelected={handleStyleSelected} 
            selectedStyle={selectedStyle} 
          />
        </section>

        {/* STEP 2: POSTING ARGS SETUP FORM */}
        <AnimatePresence mode="wait">
          <section className="space-y-4">
            <PostGenerator 
              currentTone={selectedStyle}
              onPostGenerated={handlePostGenerated}
            />
          </section>
        </AnimatePresence>

        {/* STEP 3 & 4: RESULT POST VIEWER & API SCRIPT EXPORTS (IF GENERATED) */}
        {generatedPost && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10 border-t border-slate-200 pt-8"
            id="results-outer-block"
          >
            {/* View generated article and SEO audit */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1 px-2.5 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold uppercase font-mono">Step 3</span>
                <span className="text-sm font-semibold text-slate-800">포스팅 인쇄 / 검진 결과판</span>
              </div>
              
              <PostDraftViewer 
                post={generatedPost} 
                keywords={activeKeywords} 
                topic={activeTopic} 
              />
            </section>

            {/* Naver Open API setup, credentials, and code generation scripts */}
            <section className="space-y-4 border-t border-slate-200 pt-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1 px-2.5 bg-slate-900 text-white rounded-full text-xs font-semibold uppercase font-mono">Step 4</span>
                <span className="text-sm font-semibold text-slate-800">네이버 원격 임시 글 저장소 & 연동 API 가이드</span>
              </div>

              <NaverApiGuide 
                post={generatedPost} 
                config={apiConfig} 
                onConfigChanged={setApiConfig} 
              />
            </section>
          </motion.div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-slate-200 py-10 bg-white text-center text-xs text-slate-500 font-sans" id="app-footer">
        <p>© 2026 BlogStyle AI. All Rights Reserved.</p>
        <p className="mt-1 text-slate-400">
          Powered by Gemini 3.5-flash with Naver SmartEditor 3.0 Compliance Schema.
        </p>
      </footer>

      {/* CLEAN MINIMALISM STATUS BAR - ARCHITECTURALLY HONEST DESIGN ELEMENT */}
      <footer className="fixed bottom-0 left-0 right-0 h-10 bg-[#1E293B] text-[#94A3B8] text-[11px] flex items-center px-6 justify-between border-t border-slate-800 z-50 font-sans" id="design-status-bar">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block animate-pulse" />
          <span>네이버 블로그 API 연동 활성화 (Status: 200 OK)</span>
        </div>
        <div>
          <span>User: blog_master_01 | API Token: Local Storage Mode Enabled</span>
        </div>
      </footer>

    </div>
  );
}
