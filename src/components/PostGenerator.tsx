import React, { useState } from 'react';
import { BlogPost, ToneAnalysisResult } from '../types';
import { Sparkles, Key, FileText, ChevronRight, Hash, Eye } from 'lucide-react';

interface PostGeneratorProps {
  currentTone: ToneAnalysisResult | null;
  onPostGenerated: (post: BlogPost, keywords: string, topic: string) => void;
}

export const PostGenerator: React.FC<PostGeneratorProps> = ({ currentTone, onPostGenerated }) => {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [targetLength, setTargetLength] = useState('1500');
  const [requirements, setRequirements] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trigger content generation
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('블로그 포스팅 주제를 기입해 주세요.');
      return;
    }
    if (!currentTone) {
      setError('블로그 문체를 분석하거나 페르소나를 먼저 선정하셔야 해당 말투로 글을 적을 수 있습니다.');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          keywords: keywords.trim(),
          toneProfile: currentTone,
          targetLength,
          requirements: requirements.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '글 생성 처리 중 에러가 발생했습니다.');
      }

      onPostGenerated(data.post, keywords.trim(), topic.trim());
    } catch (err: any) {
      console.error(err);
      setError(err.message || '글 생성 중 통신 오류가 발생했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  // Helper template topics
  const handleApplyTemplate = (sampleTopic: string, sampleKeywords: string) => {
    setTopic(sampleTopic);
    setKeywords(sampleKeywords);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6" id="post-generator-card">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
        <span className="p-1 px-2.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold uppercase">Step 2</span>
        <h3 className="text-base font-bold text-slate-900">네이버 SEO 최적화 포스팅 초안 생성</h3>
      </div>

      <form onSubmit={handleGenerate} className="space-y-5" id="post-generator-form">
        {/* Topic Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            본문 핵심 주제 (블로그 제목 기반)
          </label>
          <input
            type="text"
            placeholder="예시: 제주도 성산일출봉 현지인 맛집 BEST 5 추천"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-100 outline-none text-xs transition-all text-slate-800 placeholder:text-slate-400"
            id="generator-topic-input"
          />
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[10px] text-slate-400 self-center">추천 샘플 토픽:</span>
            <button
              type="button"
              onClick={() => handleApplyTemplate('성수동 분위기 있는 빈티지 파스타 맛집 내돈내산 솔직 리뷰', '성수동 파스타 맛집, 성수 맛집, 성수 빈티지 맛집')}
              className="text-[10px] bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg p-1.5 font-medium cursor-pointer"
            >
              🍽️ 소통형 맛집 리뷰
            </button>
            <button
              type="button"
              onClick={() => handleApplyTemplate('초보자 등산 필수 캠핑 용품 리스트 5가지 주의사항 포함', '등산용품, 등산초보, 등산필수템')}
              className="text-[10px] bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg p-1.5 font-medium cursor-pointer"
            >
              🏕️ 아웃도어 가이드
            </button>
          </div>
        </div>

        {/* SEO Target Keywords Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-blue-500" />
              네이버 상위 노출 검색 키워드 (쉼표로 구분)
            </label>
            <span className="text-[10px] font-bold text-blue-600">첫 번째 가이드가 메인 타겟입니다</span>
          </div>
          <input
            type="text"
            placeholder="예시: 제주도 맛집, 성산일출봉 맛집, 제주 가보고싶은곳"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-100 outline-none text-xs transition-all text-slate-800 placeholder:text-slate-400"
            id="generator-keywords-input"
          />
          <p className="text-[10px] text-slate-400 leading-normal">
            네이버 C-Rank & D.I.A 검색에 최적 반복 배치되는 중요 키워드입니다. AI가 과도한 도배가 아닌 최적 빈도를 계산해 문장에 내재화합니다.
          </p>
        </div>

        {/* Two Columns Grid (Length and Extra request) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 md:col-span-1">
            <label className="text-xs font-bold text-slate-700 block">
              목표 텍스트 글자 수
            </label>
            <select
              value={targetLength}
              onChange={(e) => setTargetLength(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs text-slate-700 focus:border-blue-500 cursor-pointer"
              id="generator-length-select"
            >
              <option value="800">800자 내외 (가벼운 일상글/정보)</option>
              <option value="1500">1500자 내외 (표준 블로그 포스팅 권장)</option>
              <option value="2500">2500자 내외 (깊이 있는 대형 전문 칼럼)</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-slate-700 block">
              추가 지시사항 및 특별 요구사항 (선택)
            </label>
            <input
              type="text"
              placeholder="예: 맛깔나는 어투 추가, 정량적인 순위를 확실히 구분해 주세요"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-100 outline-none text-xs transition-all text-slate-800 placeholder:text-slate-400"
              id="generator-requirements-input"
            />
          </div>
        </div>

        {/* Trigger Button */}
        <div>
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-700 mb-4" id="generator-error-banner">
              ⚠️ {error}
            </div>
          )}

          {!currentTone ? (
            <div className="p-4 bg-amber-50 border border-amber-150 text-amber-800 text-xs rounded-xl" id="no-tone-alert">
              상단 <strong>[Step 1] 문체 설정</strong> 단계에서 블로그 URL 수동 분석을 완료하거나, 브랜드 페르소나를 우선 선정해주셔야 글쓰기가 가능합니다.
            </div>
          ) : (
            <button
              type="submit"
              disabled={generating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-65"
              id="btn-generate-post"
            >
              {generating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>수집된 문체 양식에 맞춰 문장을 분석 및 조합 중... (최대 15초)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>맞춤형 블로그 포스팅 초안 생성하기</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
