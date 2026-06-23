import React, { useState } from 'react';
import { BrandingPersona, ToneAnalysisResult, EmojiIntensity, SentenceLength, HonorificStyle } from '../types';
import { Globe, UserPlus, Sparkles, Wand2, FileText, CheckCircle2, ChevronRight, HelpCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

// Preset personas for New Blogger Mode
const BRANDING_PERSONAS: BrandingPersona[] = [
  {
    id: 'expert',
    name: '다정다감 정보 전문가 (Friendly Expert)',
    tagline: '신뢰감 있는 지식을 부드럽고 꼼꼼하게 정석으로 전달',
    description: '어려운 IT 제품군, 리빙, 금융, 건강 정보를 알기 쉽게 조목조목 설명하여 친절하고 믿음직한 신뢰형 이웃으로 각인시키는 문체.',
    tones: ['꼼꼼한 구조화', '존중하는 어휘 사용', '구어체와 전문성 결합', '부작용이나 주의사항 명시'],
    honorificStyle: '해요체',
    sentenceLength: 'medium',
    emojiIntensity: 'moderate',
    example: '오늘 알아볼 테크 상식은 바로 이 기능인데요! 초보자분들도 이해하기 쉽도록 총 3개의 단계로 설명해 드릴 테니 하나씩 천천히 따라와 보시기 바래요. 안전성 정보 먼저 체크할게요! 😊'
  },
  {
    id: 'friend',
    name: '유머러스 일상 소통메이트 (Humorous Companion)',
    tagline: '친구와 수다 떠는 듯한 재기발랄 찐후기 스타일',
    description: '맛집, 여행, 패션, 인테리어 카테고리에 적합하며 재미있고 생동감 넘치는 어조와 풍부한 리액션을 가미하여 이웃의 소통을 극대화하는 적극 소통형 문체.',
    tones: ['의성어/의태어 사용', '위트 있는 반전 위트', '하트/눈물 이모지 빈번', '내돈내산 분위기'],
    honorificStyle: '해요체',
    sentenceLength: 'short',
    emojiIntensity: 'high',
    example: '와... 진짜 여기 파스타 한 입 먹자마자 제 눈이 0.5초 동안 뒤집힐 뻔했잖아요?! 🤣 내돈내산 영수증 첨부하고 갑니다. 여긴 무조건 남친 데리고 가세요! 약속~ 💖'
  },
  {
    id: 'instructor',
    name: '카리스마 단호한 가이드 (Firm Specialist)',
    tagline: '동기를 확실히 부여해 주는 명확하고 군더더기 없는 스타일',
    description: '자기개발, 커리어, 교육, 자산 관리(재테크) 분야에 탁월하며, 격식을 갖추고 사변적인 사설을 배제하여 지름길을 명쾌히 정의해 주는 지침서 스타일.',
    tones: ['명사형 종결어조 빈도', '사설 제어', '단도직입적 설명', '핵심 요약 목록화'],
    honorificStyle: '하십시오체',
    sentenceLength: 'short',
    emojiIntensity: 'none',
    example: '성공하는 블로그 포스팅의 기본 원칙은 정확한 단어 선택입니다. 지금 당장 불필요한 서술어를 삭제하십시오. 독자는 긴 문장을 읽을 시간이 없습니다. 핵심만 빠르게 강조하시기 바랍니다.'
  },
  {
    id: 'essayist',
    name: '감성 책방 시그니처 (Warm Essayist)',
    tagline: '차분하게 마음에 스미는 감성 에세이 및 도서 리뷰형',
    description: '도서 리뷰, 산책, 레시피, 영화 감상, 일기장에 적재적소이며 서정적으로 깊이 있게 사조하여 고요한 마니아층을 형성하는 힐링 중심 문체.',
    tones: ['비유적 수사법', '여운 있는 문장 끝맺음', '담백하고 깊이 있는 문단', '따스한 조언'],
    honorificStyle: '해라체/평어',
    sentenceLength: 'long',
    emojiIntensity: 'low',
    example: '창가에 스미는 오후의 노란 햇살을 바라보며 마시는 커피 한 잔. 문득 오래전 읽었던 구절이 떠올랐다. 인생은 결국 우리가 보낸 시간들의 차분한 합이 아닐까 싶어진다. 그렇게 나만의 긴 쉼표를 찍어본다. ☕'
  },
  {
    id: 'reviewer',
    name: '칼날 분석 테크 리뷰어 (Critical Inspector)',
    tagline: '중요 사양 비교 장단점과 수치 중심의 솔직 리뷰형',
    description: '전자기기, 가전제품, 자동차, 복잡한 소프트웨어를 장단점 및 상세 성능 지수표를 들어서 객관적이고 예리하게 정량 비교 분석하는 스마트 블로그 문체.',
    tones: ['정량적 수치 표시', '장점과 치명적 단점 명시', '스펙 대비 체감가 중심성', '표/구조 활용'],
    honorificStyle: '해라체/평어',
    sentenceLength: 'medium',
    emojiIntensity: 'low',
    example: '직접 구매하여 2주일간 하드하게 벤치마크 테스트해 본 소감이다. 가벼운 무게(1.1kg)로 휴대성은 92점이 주어지나, 고온 로드 시 소음이 45dB까지 치솟는 극명한 장단점을 지닌다. 상세히 들여다보자.'
  }
];

interface ToneSelectorProps {
  onStyleSelected: (style: ToneAnalysisResult) => void;
  selectedStyle: ToneAnalysisResult | null;
}

export const ToneSelector: React.FC<ToneSelectorProps> = ({ onStyleSelected, selectedStyle }) => {
  const [activeTab, setActiveTab] = useState<'url' | 'persona'>('url');
  
  // URL Mode state
  const [blogUrl, setBlogUrl] = useState('');
  const [pasteSample, setPasteSample] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persona Mode state
  const [activePersonaId, setActivePersonaId] = useState<string>('expert');

  // Submit URL Analysis handler
  const handleAnalyzeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogUrl.trim() && !pasteSample.trim()) {
      setError('네이버 블로그 URL을 입력하거나 하단 텍스트 붙여넣기 영역에 샘플 글을 채워주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: blogUrl.trim() || undefined,
          pasteSample: pasteSample.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '문체 분석 서버 응답 오류가 발생했습니다.');
      }

      onStyleSelected(data.analysis);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '문체 분석 중 서버 통신 에러가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Persona manual select handler
  const handleSelectPersona = (persona: BrandingPersona) => {
    setActivePersonaId(persona.id);
    const parsedResult: ToneAnalysisResult = {
      mode: 'persona',
      source: `브랜드 페르소나: ${persona.name}`,
      styleOverview: persona.description,
      sentenceLength: persona.sentenceLength,
      honorificStyle: persona.honorificStyle,
      emojiIntensity: persona.emojiIntensity,
      formattingPatterns: persona.tones,
      keyAdjectives: [
        persona.id === 'expert' ? '신뢰감있는' : persona.id === 'friend' ? '활발한' : persona.id === 'instructor' ? '단호하고논리적인' : persona.id === 'essayist' ? '서정적이고따뜻한' : '객관적이고예리한',
        '맞춤형', '트렌디한'
      ]
    };
    onStyleSelected(parsedResult);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6" id="tone-selector-card">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 px-2.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold uppercase">Step 1</span>
            <span className="inline-flex items-center gap-1 text-slate-500 text-xs font-medium">문체 복제 및 페르소나 설정</span>
          </div>
          <h2 className="text-lg font-bold text-slate-950 tracking-tight font-sans">
            어떤 말투(문체)로 글을 작성할까요?
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            기존 블로그 URL을 분석하여 말투 특징을 분석하거나, 세련된 브랜딩 페르소나를 즉시 매칭시킬 수 있습니다.
          </p>
        </div>
        
        {/* Toggle Mode */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 self-start md:self-center">
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            id="tab-existing-blogger"
          >
            <Globe className="w-3.5 h-3.5" />
            기존 블로거 URL 분석
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('persona');
              // Auto-select expert persona as default
              handleSelectPersona(BRANDING_PERSONAS[0]);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'persona'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            id="tab-new-blogger"
          >
            <UserPlus className="w-3.5 h-3.5" />
            신규 블로거 페르소나
          </button>
        </div>
      </div>

      {/* ERROR FEEDBACK */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl flex gap-3 text-xs items-start" id="analysis-error-alert">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">분석 진단 실패</span>
            <p className="text-rose-700/90">{error}</p>
          </div>
        </div>
      )}

      {/* TAB SUB-PAGES */}
      {activeTab === 'url' ? (
        <form onSubmit={handleAnalyzeUrl} className="space-y-5" id="url-mode-form">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block select-none">
              네이버 대표 블로그 포스팅 URL 주소
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="url"
                  placeholder="https://blog.naver.com/id  (또는 다른 발행글 URL)"
                  value={blogUrl}
                  onChange={(e) => setBlogUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-100 outline-none text-xs transition-all text-slate-800 placeholder:text-slate-400"
                  id="blog-url-input"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                id="btn-analyze-style"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>블로그 구조 분석 중...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>문체 복제하기 (분석)</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 px-0.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              네이버 아이디 또는 포스트 주소를 입력하시면 AI가 문단의 어미 특징과 이모지 패턴을 수집해 복제합니다.
            </p>
          </div>

          {/* FALLBACK MANUAL SAMPLE PORT */}
          <div className="border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setShowPasteBox(!showPasteBox)}
              className="text-slate-500 hover:text-blue-600 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              id="toggle-pasted-samples"
            >
              <span>{showPasteBox ? '▼ 붙여넣기 기능 접기' : '▶ 네이버 분석 우회: 샘플 글 수동 붙여넣기'}</span>
              <span className="p-0.5 px-1.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold">CORS 제한 대체 수단</span>
            </button>
            
            {showPasteBox && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 mt-2"
              >
                <textarea
                  rows={4}
                  placeholder="분석하고 싶은 기존 작성 글이나, 모방하고 싶은 다른 사람의 소수 문장이나 글 본문을 이곳에 붙여넣어 주세요. 즉각 말투 수집이 정석대로 시작됩니다."
                  value={pasteSample}
                  onChange={(e) => setPasteSample(e.target.value)}
                  className="w-full p-4 bg-slate-50 font-sans border border-slate-200 focus:bg-white rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 text-xs text-slate-700 placeholder:text-slate-400"
                  id="pasted-sample-textarea"
                />
              </motion.div>
            )}
          </div>
        </form>
      ) : (
        /* PERSONA MODE GRID */
        <div className="space-y-6" id="persona-mode-grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BRANDING_PERSONAS.map((persona) => {
              const isActive = activePersonaId === persona.id;
              return (
                <div
                  key={persona.id}
                  onClick={() => handleSelectPersona(persona)}
                  className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'border-blue-500 bg-blue-50/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50/70 hover:border-slate-300'
                  }`}
                  id={`persona-card-${persona.id}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {persona.honorificStyle} | 이모지 ({persona.emojiIntensity})
                      </span>
                      {isActive && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{persona.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{persona.tagline}</p>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-normal font-sans line-clamp-3">
                      {persona.description}
                    </p>
                  </div>

                  {/* MINI PREVIEW BOX */}
                  <div className="border-t border-dashed border-slate-100 mt-4 pt-3">
                    <span className="text-[10px] font-semibold text-slate-400 block mb-1">말투 예안:</span>
                    <p className="text-[10px] text-slate-600 bg-slate-50 border border-slate-200/50 p-2 rounded-lg line-clamp-2 italic">
                      "{persona.example}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RENDER DYNAMIC ACTIVE STYLE profile CARD */}
      {selectedStyle && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden"
          id="active-style-profile-card"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-bl-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row gap-6 justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-700 tracking-wide">
                  현재 매칭 중인 활성 문체 프로필
                </span>
                <span className={`p-0.5 px-2 rounded-full text-[9px] font-bold ${
                  selectedStyle.mode === 'url' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {selectedStyle.mode === 'url' ? 'URL 분석형 복제' : '브랜드 페르소나형'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-tight">
                  {selectedStyle.source}
                </h3>
                <p className="text-xs text-slate-500 leading-normal mt-1">
                  {selectedStyle.styleOverview}
                </p>
              </div>

              {/* Tones Highlighting lists */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedStyle.formattingPatterns.map((pattern, idx) => (
                  <span
                    key={idx}
                    className="p-1 px-2.5 bg-white text-slate-600 border border-slate-200 rounded-lg text-[10px] font-semibold flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    {pattern}
                  </span>
                ))}
              </div>
            </div>

            {/* Core parameters metrics viz */}
            <div className="grid grid-cols-3 md:flex md:flex-col gap-3 min-w-[170px] border-t md:border-t-0 md:border-l border-slate-250 pt-4 md:pt-0 md:pl-6 justify-center">
              <div>
                <span className="text-[10px] text-slate-400 block">문장 호흡 길이</span>
                <span className="text-[10px] font-bold text-slate-700 uppercase">
                  {selectedStyle.sentenceLength === 'short' ? '단문 (Short)' : selectedStyle.sentenceLength === 'medium' ? '중문 (Medium)' : '장문 (Long)'}
                </span>
              </div>
              
              <div>
                <span className="text-[10px] text-slate-400 block">기본 어미</span>
                <span className="text-[10px] font-bold text-slate-700">
                  {selectedStyle.honorificStyle}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">이모지 빈도</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="h-1.5 w-12 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        selectedStyle.emojiIntensity === 'none' ? 'w-0 bg-slate-300' :
                        selectedStyle.emojiIntensity === 'low' ? 'w-1/3 bg-blue-400' :
                        selectedStyle.emojiIntensity === 'moderate' ? 'w-2/3 bg-blue-500' : 'w-full bg-blue-600'
                      }`}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 font-mono uppercase">
                    {selectedStyle.emojiIntensity}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
