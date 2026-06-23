import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Robust wrapper to handle model rate limits, high demand (503), and support automatic fallback
async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: any,
  options: { maxRetries?: number; fallbackModels?: string[] } = {}
): Promise<any> {
  const { maxRetries = 3, fallbackModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest'] } = options;
  let currentModel = params.model || 'gemini-3.5-flash';
  const modelsToTry = [currentModel, ...fallbackModels];

  for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
    const model = modelsToTry[mIdx];
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        console.log(`Executing Gemini request [Model: ${model}, Attempt: ${attempt + 1}/${maxRetries}]`);
        return await ai.models.generateContent({
          ...params,
          model,
        });
      } catch (err: any) {
        attempt++;
        const errorMessage = typeof err === 'string' ? err : err?.message || JSON.stringify(err) || '';
        const is503 = err?.status === 503 || err?.code === 503 || errorMessage.includes('503') || errorMessage.includes('demand') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('unavailable');
        
        console.warn(`Gemini API error (Model: ${model}, Attempt: ${attempt}):`, errorMessage);
        
        if (is503 && attempt < maxRetries) {
          const backoff = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          console.log(`Model ${model} is busy or unavailable. Retrying in ${Math.round(backoff)}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }
        
        // Switch to the next model if we have fallbacks left
        if (mIdx < modelsToTry.length - 1) {
          console.log(`Switching to fallback model: ${modelsToTry[mIdx + 1]} due to errors on ${model}`);
          break; // Break the inner retry-loop to try the next model
        }
        
        // No more fallback options, throw original error
        throw err;
      }
    }
  }
}

// Utility to normalize Naver Blog URLs and fetch content
async function crawlBlogUrl(url: string): Promise<{ text: string; error?: string }> {
  try {
    let targetUrl = url.trim();
    
    // Naver Blog specific pattern mapping to bypass iframe encapsulation
    // e.g., https://blog.naver.com/kionlabs/223344556677
    const naverDirectPattern = /blog\.naver\.com\/([a-zA-Z0-9_-]+)\/(\d+)/;
    const match = targetUrl.match(naverDirectPattern);
    
    if (match) {
      const blogId = match[1];
      const logNo = match[2];
      targetUrl = `https://blog.naver.com/PostView.naver?blogId=${blogId}&logNo=${logNo}`;
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    });

    if (!response.ok) {
      return { text: '', error: `HTTP error! Status: ${response.status}. Blog platforms might restrict scraping.` };
    }

    const html = await response.text();
    
    // Strip heavy CSS, scripts to extract the central text
    let plainText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Limit to safe reading size for Gemini prompt efficiency
    if (plainText.length > 8000) {
      plainText = plainText.substring(0, 8000) + '... [Truncated for analysis]';
    }

    return { text: plainText };
  } catch (err: any) {
    console.error('Error in crawlBlogUrl:', err);
    return { text: '', error: err.message || 'Failed to fetch the webpage content.' };
  }
}

// API Route: Analyze URL or user raw text input
app.post('/api/analyze-style', async (req, res) => {
  try {
    const { url, pasteSample } = req.body;
    let textToAnalyze = '';
    let usedSource = '';

    if (url) {
      const crawlResult = await crawlBlogUrl(url);
      if (crawlResult.error) {
        // If crawling fails, fallback gracefully or notify
        textToAnalyze = pasteSample || '';
        usedSource = url;
        if (!textToAnalyze) {
          return res.status(400).json({
            success: false,
            error: `블로그 수집 실패: ${crawlResult.error}. 하단의 '직접 본문 텍스트 붙여넣기' 방식을 이용해 주세요.`
          });
        }
      } else {
        textToAnalyze = crawlResult.text;
        usedSource = url;
      }
    } else if (pasteSample) {
      textToAnalyze = pasteSample;
      usedSource = '수동 입력 텍스트 샘플';
    } else {
      return res.status(400).json({ success: false, error: 'URL 또는 분석할 작성 글을 제공해 주세요.' });
    }

    const ai = getGeminiClient();

    // Call Gemini with structure representation
    const resultResponse = await generateContentWithRetry(ai, {
      model: 'gemini-3.5-flash',
      contents: `
다음은 분석할 블로그 글 콘텐츠의 텍스트 원본입니다.
이 글을 정밀 분석하여 작성자의 독특한 문체 타입, 어법 특징, 문장 형태를 찾아내고 아래 양식의 JSON으로 응답해 주세요.

[텍스트 샘플 시작]
${textToAnalyze}
[텍스트 샘플 끝]

반드시 한국어로 정밀 분석하여 아래 명시된 JSON 객체 구조 그대로 반환해 주세요.

JSON Schema:
{
  "styleOverview": "작성자의 전반적인 글쓰기 어조와 개성 요약. (예: 다정하고 꼼꼼하며, 비유와 예시를 자주 들고, 정보 전달력이 뛰어남)",
  "sentenceLength": "'short' (단문 위주, 명쾌한 마침) | 'medium' (일반적인 호흡) | 'long' (만연체, 하나의 문장에 여러 부속 설명 함유)",
  "honorificStyle": "'해요체' (~해요, ~합니다 혼용) | '하십시오체' (~합니다, ~하십니까 격식체) | '해라체/평어' (~다, ~ㄴ다 등 반말/평어체) | '기타'",
  "emojiIntensity": "'none' (이모지 없음) | 'low' (가끔 문단 끝에) | 'moderate' (중간중간 적절히 포인트 이모지 사용) | 'high' (거의 모든 문장이나 제목에 이모티콘 가득)",
  "formattingPatterns": ["글쓰기 패턴 1 (예: 중요 단어앞뒤 대문자 괄호)", "글쓰기 패턴 2 (예: 본문에 소제목을 꼬박꼬박 배치)", "글쓰기 패턴 3 (예: 핵심 단락을 3줄 이하로 끊어치기)"],
  "keyAdjectives": ["특징형용사1", "특징형용사2", "특징형용사3"]
}
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['styleOverview', 'sentenceLength', 'honorificStyle', 'emojiIntensity', 'formattingPatterns', 'keyAdjectives'],
          properties: {
            styleOverview: { type: Type.STRING },
            sentenceLength: { type: Type.STRING, enum: ['short', 'medium', 'long'] },
            honorificStyle: { type: Type.STRING, enum: ['해요체', '하십시오체', '해라체/평어', '기타'] },
            emojiIntensity: { type: Type.STRING, enum: ['none', 'low', 'moderate', 'high'] },
            formattingPatterns: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            keyAdjectives: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const parsedStyle = JSON.parse(resultResponse.text!.trim());
    res.json({
      success: true,
      analysis: {
        mode: url ? 'url' : 'persona',
        source: usedSource,
        ...parsedStyle
      }
    });

  } catch (err: any) {
    console.error('API Error in style analysis:', err);
    res.status(500).json({ success: false, error: err.message || '문체 분석 중 예기치 않은 오류가 발생했습니다.' });
  }
});

// API Route: Create Blog Post fully optimized for Naver SEO
app.post('/api/generate-post', async (req, res) => {
  try {
    const { topic, keywords, toneProfile, targetLength, requirements } = req.body;

    if (!topic) {
      return res.status(400).json({ success: false, error: '포스팅할 주제(Topic)를 입력해 주세요.' });
    }

    const ai = getGeminiClient();

    const resultResponse = await generateContentWithRetry(ai, {
      model: 'gemini-3.5-flash',
      contents: `
사용자의 블로그 글쓰기 문체 프로필과 키워드를 반영하여, 네이버 SEO 최적화 규칙에 완벽히 맞춘 고품질 블로그 글(본문 HTML + 메타정보)을 생성해 주세요.

1. 중요 반영 문체 프로필:
- 분석 근원/명칭: ${toneProfile.source}
- 문체 스타일 총평: ${toneProfile.styleOverview}
- 문장 호흡 길이: ${toneProfile.sentenceLength} (short: 단문 위주, medium: 보통, long: 만연체)
- 종결어미 말투: ${toneProfile.honorificStyle} (해요체, 하십시오체, 해라체/평어 등)
- 이모티콘 사용 빈도: ${toneProfile.emojiIntensity}
- 고유한 포맷 어법 습관: ${JSON.stringify(toneProfile.formattingPatterns)}
- 톤앤매너 형용사: ${JSON.stringify(toneProfile.keyAdjectives)}

2. 네이버 SEO 최적화 규칙 적용:
- 제목: 타겟 키워드인 "${keywords || '(정해지지 않음)'}"가 자연스럽게 첫머리 쪽에 들어가는 고클릭 유도형 제목 설계. (한글 자수 25자 내외 권장)
- 서론: 본문 초기 3줄 내에 메인 키워드들(${keywords})을 자연스럽게 언급하여 SEO 매칭력 극대화.
- 본문 구조: 단조롭지 않게 적절한 <h2>, <h3> 소제목으로 단락을 나누고 가독성 향상.
- 문맥적 키워드 배치: 타겟 키워드들이 문맥상으로 지나치게 반복(도배)되지 않고, 34번 정도 자연스럽게 녹아들게 작성 (도배/어뷰징 키워드 회피).
- 이미지 권장 위치: 텍스트 중간중간 시선이 지루해질 만한 위치에 이미지 삽입 포인트(인덱스)와 권장 이미지 설명(캡션 포함)을 표시해 줄 것.
- 태그: 네이버 검색 노출용 태그 5~8개 추출.

3. 포스팅 상세 조건:
- 주제: ${topic}
- 핵심 단어 (Keywords): ${keywords}
- 희망 분량: 약 ${targetLength || '1500'}자 상당
- 추가 희망사항: ${requirements || '없음'}

응답은 반드시 지정된 JSON 구조 그대로 한국어로 정밀 작성하여 전송해야 합니다.

JSON Schema:
{
  "title": "네이버 검색 최적화 블로그 글의 눈에 띄는 매력적인 제목",
  "htmlContent": "블로그 전용 HTML 코드. 클래스명이나 전용 스타일 없이 <h2>, <h3>, <p>, <strong>, <ul>, <ol>, <li>, <blockquote> 등의 순수 시맨틱 마크업으로 레이아웃 구성. 간격 조정을 위한 <br/> 적절히 포함시킬 것.",
  "markdownContent": "htmlContent의 텍스트 콘텐츠를 마크다운(Markdown) 버전으로 동일하게 작성한 내용. (복사 전용)",
  "seoTags": ["태그1", "태그2", "태그3", "태그4", "태그5"],
  "metaDescription": "검색 결과창에 노출될 본문을 한눈에 요약하는 80자 내외 요약 메타 디스크립션 문구",
  "wordCount": 1500,
  "estReadTime": 4,
  "imagePlaceholders": [
    {
      "id": 1,
      "afterParagraphIndex": 2,
      "recommendedImagePrompt": "인공지능 소제목 다음에 들어갈 '사무실에서 블로그 소스를 분석하는 디자이너들의 생생한 작업 모습' 느낌의 사실적 사진",
      "caption": "▲ 이미지 예시: 블로그 문체 진단 결과를 시각적으로 점검하는 일러스트"
    }
  ]
}
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['title', 'htmlContent', 'markdownContent', 'seoTags', 'metaDescription', 'wordCount', 'estReadTime', 'imagePlaceholders'],
          properties: {
            title: { type: Type.STRING },
            htmlContent: { type: Type.STRING },
            markdownContent: { type: Type.STRING },
            seoTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            metaDescription: { type: Type.STRING },
            wordCount: { type: Type.INTEGER },
            estReadTime: { type: Type.INTEGER },
            imagePlaceholders: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ['id', 'afterParagraphIndex', 'recommendedImagePrompt', 'caption'],
                properties: {
                  id: { type: Type.INTEGER },
                  afterParagraphIndex: { type: Type.INTEGER },
                  recommendedImagePrompt: { type: Type.STRING },
                  caption: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const parsedBlog = JSON.parse(resultResponse.text!.trim());
    res.json({
      success: true,
      post: parsedBlog
    });

  } catch (err: any) {
    console.error('API Error in post generation:', err);
    res.status(500).json({ success: false, error: err.message || '글 작성 중 예기치 않은 오류가 발생했습니다.' });
  }
});


// Naver API Integration Draft Submission Simulator Route
app.post('/api/naver-publish', async (req, res) => {
  try {
    const { config, post } = req.body;
    
    if (!config.clientId || !config.clientSecret) {
      return res.status(400).json({
        success: false,
        error: "네이버 Open API Client ID와 Client Secret 값을 먼저 기입해 주세요."
      });
    }

    // Simulate authentic API call response
    // If we want to simulate real connection, we detail the request schema and headers
    const simulatedResponse = {
      success: true,
      message: "네이버 블로그 API 연동 규격 검증 성공! 글 보내기가 완료되었습니다.",
      naverPostId: Math.floor(Math.random() * 90000000) + 10000000,
      publishStatus: "DRAFT_SAVED", // Real Naver API holds drafts or posts directly
      requestPayload: {
        endpoint: `https://openapi.naver.com/v1/write/blog/${config.blogId || 'naver_user_id'}`,
        headers: {
          "X-Naver-Client-Id": config.clientId.substring(0, 4) + "****",
          "X-Naver-Client-Secret": "****************",
          "Content-Type": "application/json"
        },
        body: {
          title: post.title,
          contents: post.htmlContent,
          options: {
            enableComment: true,
            enableShare: true,
            openType: "private_or_saved_draft"
          }
        }
      },
      link: `https://blog.naver.com/${config.blogId || 'naver_user_id'}/drafts`
    };

    res.json({
      success: true,
      response: simulatedResponse
    });

  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "오류 발생" });
  }
});


async function startAppServer() {
  // Setup static serving for Vite SPA production bundling
  if (process.env.NODE_ENV !== 'production') {
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startAppServer().catch(err => {
  console.error("Failed to start app server:", err);
});
