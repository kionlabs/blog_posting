import React, { useState, useMemo } from 'react';
import { BlogPost, SeoScoreDetails } from '../types';
import { calculateSeoScore } from '../utils/seo';
import { 
  Copy, Check, Eye, Code, FileCode, CheckCircle2, 
  XCircle, AlertTriangle, Image as ImageIcon, Sparkles, Clock, FileText, BadgeCheck 
} from 'lucide-react';
import { motion } from 'motion/react';

interface PostDraftViewerProps {
  post: BlogPost;
  topic: string;
  keywords: string;
}

export const PostDraftViewer: React.FC<PostDraftViewerProps> = ({ post, topic, keywords }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'markdown'>('preview');
  const [copied, setCopied] = useState(false);

  // Compute SEO analysis on state updates
  const seoDetails = useMemo(() => {
    return calculateSeoScore(post, keywords, topic);
  }, [post, keywords, topic]);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render score gradient coloring
  const getScoreColorClass = (score: number) => {
    if (score >= 90) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (score >= 70) return 'text-amber-500 bg-amber-50 border-amber-100';
    return 'text-rose-500 bg-rose-50 border-rose-100';
  };

  const getGaugeColorClass = (score: number) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  // Helper to inject beautiful visual image widgets into the HTML preview block
  const formattedHtmlForPreview = useMemo(() => {
    let lines = post.htmlContent.split('</p>');
    
    // Sort image placeholders descending to avoid index shifting on manipulation
    const sortedPlaceholders = [...(post.imagePlaceholders || [])].sort((a, b) => b.afterParagraphIndex - a.afterParagraphIndex);
    
    sortedPlaceholders.forEach(img => {
      const idx = Math.min(img.afterParagraphIndex, lines.length - 1);
      
      const imageWidgetHtml = `
        <div class="my-5 p-5 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center select-none cursor-default font-sans" id="injected-img-slot-${img.id}">
          <div class="inline-flex p-2.5 bg-blue-50 text-blue-600 rounded-lg mb-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
          </div>
          <span class="block text-xs font-bold text-slate-800">추천 이미지 배치 지점 (No. ${img.id})</span>
          <p class="text-[11px] text-slate-500 max-w-md mx-auto mt-1 leading-normal italic">"${img.recommendedImagePrompt}"</p>
          <span class="block text-[10px] text-blue-600 mt-2 font-bold">${img.caption}</span>
        </div>
      `;
      
      if (lines[idx]) {
        lines[idx] = lines[idx] + '</p>' + imageWidgetHtml;
      }
    });

    return lines.join('</p>');
  }, [post]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="post-draft-viewer-container">
      {/* LEFT 2 COLS: INTERACTIVE EDITOR VIEW */}
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6">
          
          {/* Header toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 px-2.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase">Draft Preview</span>
                <span className="text-xs text-slate-400 font-sans">작성된 원고 및 복사 기능</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">최종 포스팅 원고 검토</h3>
            </div>

            {/* View Switch tabs */}
            <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 self-start sm:self-center">
              <button
                onClick={() => { setActiveTab('preview'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  activeTab === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
                id="tab-view-preview"
              >
                <Eye className="w-3.5 h-3.5" />
                에디터 뷰
              </button>
              <button
                onClick={() => { setActiveTab('html'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  activeTab === 'html' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
                id="tab-view-html"
              >
                <Code className="w-3.5 h-3.5" />
                HTML 태그
              </button>
              <button
                onClick={() => { setActiveTab('markdown'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  activeTab === 'markdown' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
                id="tab-view-markdown"
              >
                <FileCode className="w-3.5 h-3.5" />
                마크다운
              </button>
            </div>
          </div>

          {/* Quick Info & Copy Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs text-slate-500">
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                정독 소요 <b>{post.estReadTime}분</b>
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                공백 포함 <b>{post.wordCount}자</b>
              </span>
            </div>

            {/* Universal Copy Trigger */}
            <button
              onClick={() => {
                const textToCopy = 
                  activeTab === 'preview' ? post.htmlContent.replace(/<[^>]+>/g, '') :
                  activeTab === 'html' ? post.htmlContent : 
                  post.markdownContent;
                handleCopy(textToCopy);
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
              id="btn-copy-draft"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>복사되었습니다!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>
                    {activeTab === 'preview' ? '본문 순수 텍스트 복사' :
                     activeTab === 'html' ? 'HTML 태그 전체 복사' :
                     '마크다운 본문 복사'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* REAL PREVIEW & WRITING CANVAS */}
          <div className="border border-slate-200 rounded-xl p-5 md:p-8 bg-slate-50/20 overflow-hidden" id="draft-content-display">
            {/* Title section in classic Naver Blog cover layout */}
            <div className="border-b-2 border-slate-900 pb-5 mb-6">
              <span className="text-xs text-emerald-600 font-bold tracking-wide uppercase block mb-1 font-mono">
                [SEO OPTIMIZED TITLE]
              </span>
              <h1 className="text-2xl md:text-3xl font-bold font-sans tracking-tight text-slate-900 leading-tight">
                {post.title}
              </h1>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {post.seoTags.map((tag, i) => (
                  <span key={i} className="text-xs text-slate-500 bg-slate-100 p-1 px-2 rounded-full font-sans">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Inner text boxes depending on tab */}
            {activeTab === 'preview' && (
              <div 
                className="prose prose-slate max-w-none text-slate-800 text-sm md:text-base leading-relaxed space-y-5 font-sans"
                dangerouslySetInnerHTML={{ __html: formattedHtmlForPreview }}
                id="html-preview-body"
              />
            )}

            {activeTab === 'html' && (
              <textarea
                readOnly
                rows={18}
                value={post.htmlContent}
                className="w-full p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 border border-slate-800"
                id="html-source-textarea"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            )}

            {activeTab === 'markdown' && (
              <textarea
                readOnly
                rows={18}
                value={post.markdownContent}
                className="w-full p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400 border border-slate-800"
                id="markdown-source-textarea"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            )}
          </div>
        </div>
      </div>

      {/* RIGHT 1 COL: SEO AUDITOR SCOREBOARD */}
      <div className="space-y-6">
        {/* SEO score indicator block */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6" id="seo-score-auditor-card">
          <div className="flex items-center gap-2 border-b border-slate-150 pb-4">
            <span className="p-1 px-2.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold">SEO 검증</span>
            <h4 className="font-bold text-slate-900 text-xs">네이버 상위 노출 건강 진단</h4>
          </div>

          {/* Big gauge circle or meter */}
          <div className="text-center py-2 space-y-3">
            <div className="relative inline-flex items-center justify-center">
              {/* Simple Ring shape */}
              <div className="w-28 h-28 rounded-full border-[8px] border-slate-100 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-2xl font-black text-slate-900 block tracking-tight">
                    {seoDetails.score}점
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                    SEO SCORE
                  </span>
                </div>
              </div>
            </div>

            <div className={`p-2 border rounded-lg text-xs font-semibold ${getScoreColorClass(seoDetails.score)}`}>
              {seoDetails.score >= 90 ? '⭐⭐⭐ 상위 노출 최상위 문서 포맷' :
               seoDetails.score >= 70 ? '⭐⭐ 포맷 양호 (일부 보강 권장)' :
               '⚠️ 긴급 점검 필요 (수정 권장)'}
            </div>
          </div>

          {/* Density indicators */}
          <div className="grid grid-cols-2 gap-3 border-y border-slate-150 py-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-200/60">
              <span className="text-[10px] text-slate-400 block">검색 키워드 등장 빈도</span>
              <span className="text-xs font-bold text-slate-800 mt-0.5 block">{seoDetails.keywordCount}회 검출</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-200/60">
              <span className="text-[10px] text-slate-400 block">키워드 포화 밀도</span>
              <span className="text-xs font-bold text-slate-800 mt-0.5 block">{seoDetails.keywordDensity}% (안전지대)</span>
            </div>
          </div>

          {/* Individual checklist items */}
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-0.5 scrollbar-thin">
            <span className="text-[10px] font-bold text-slate-400 block">상향 노출 세부 검증표</span>
            {seoDetails.checks.map((check, index) => (
              <div key={index} className="flex gap-2.5 text-xs items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                {check.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : check.impact === 'high' ? (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-850">{check.label}</span>
                    <span className={`px-1 rounded text-[8px] font-bold uppercase ${
                      check.impact === 'high' ? 'bg-rose-50 text-rose-600' :
                      check.impact === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {check.impact}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {check.feedback}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Image Assist Guidelines */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-3.5" id="image-prompts-helper">
          <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
            <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />
            <h4 className="font-bold text-slate-900 text-xs">권장 삽입 이미지 정보</h4>
          </div>
          <p className="text-xs text-slate-500 leading-normal">
            네이버 검색엔진은 글 사이사이에 사진을 2~3회 삽입하는 형태를 최고 등급으로 평가합니다. 
            아래의 상세 디스크립션 문구를 생성형 AI(Imagen)에 전달해 보세요.
          </p>

          <div className="space-y-3">
            {post.imagePlaceholders?.map((img) => (
              <div key={img.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-600">추천 이미지 #{img.id}</span>
                  <span className="text-[10px] text-slate-400">{img.afterParagraphIndex}번째 내용 뒤 배치</span>
                </div>
                
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">AI 생성 프롬프트 가이드:</span>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                    <p className="text-[10px] text-slate-600 italic select-all leading-normal">"${img.recommendedImagePrompt}"</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 font-bold rounded">설명 캡션</span>
                  <span className="text-[10px] text-slate-500 font-medium">{img.caption}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
