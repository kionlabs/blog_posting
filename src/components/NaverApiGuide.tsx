import React, { useState, useEffect } from 'react';
import { BlogPost, NaverApiConfig } from '../types';
import { 
  Key, Shield, Terminal, Send, CheckCircle2, Copy, 
  Check, FileCode, HelpCircle, ExternalLink, RefreshCw 
} from 'lucide-react';

interface NaverApiGuideProps {
  post: BlogPost | null;
  config: NaverApiConfig;
  onConfigChanged: (config: NaverApiConfig) => void;
}

export const NaverApiGuide: React.FC<NaverApiGuideProps> = ({ post, config, onConfigChanged }) => {
  const [copiedCode, setCopiedCode] = useState<'node' | 'python' | null>(null);
  const [clientIdInput, setClientIdInput] = useState(config.clientId || '');
  const [clientSecretInput, setClientSecretInput] = useState(config.clientSecret || '');
  const [blogIdInput, setBlogIdInput] = useState(config.blogId || '');
  
  // Simulation states
  const [testing, setTesting] = useState(false);
  const [apiResult, setApiResult] = useState<any | null>(null);

  // Synchronize internal inputs with external prop config on mount
  useEffect(() => {
    setClientIdInput(config.clientId);
    setClientSecretInput(config.clientSecret);
    setBlogIdInput(config.blogId);
  }, [config]);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedConfig: NaverApiConfig = {
      clientId: clientIdInput.trim(),
      clientSecret: clientSecretInput.trim(),
      blogId: blogIdInput.trim() || 'naver_username',
      isConnected: clientIdInput.trim().length > 0 && clientSecretInput.trim().length > 0
    };
    onConfigChanged(updatedConfig);
  };

  const handleTestSimulation = async () => {
    if (!post) return;
    setTesting(true);
    setApiResult(null);

    try {
      const response = await fetch('/api/naver-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            clientId: clientIdInput,
            clientSecret: clientSecretInput,
            blogId: blogIdInput || 'naver_user_id'
          },
          post
        })
      });

      const data = await response.json();
      setApiResult(data.response);
    } catch (err: any) {
      console.error(err);
      setApiResult({
        success: false,
        error: "연동 시뮬레이션 중 오류가 발생했습니다."
      });
    } finally {
      setTesting(false);
    }
  };

  const handleCopyCode = (text: string, type: 'node' | 'python') => {
    navigator.clipboard.writeText(text);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Node.js Code Snippet to copy
  const nodeCodeString = `/**
 * Naver Blog API Auto-Poster Module (Node.js version)
 * Install: npm install axios dotenv
 */
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const NAVER_CLIENT_ID = '${config.clientId || "YOUR_CLIENT_ID"}';
const NAVER_CLIENT_SECRET = '${config.clientSecret || "YOUR_CLIENT_SECRET"}';
const BLOG_ID = '${config.blogId || "YOUR_BLOG_ID"}';

async function publishBlogDraft(title, htmlContent, tagString) {
  const url = \`https://openapi.naver.com/v1/write/blog/\${BLOG_ID}\`;

  const headers = {
    'X-Naver-Client-Id': NAVER_CLIENT_ID,
    'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
    'Content-Type': 'application/json'
  };

  const body = {
    title: title,
    contents: htmlContent,
    options: {
      enableComment: true,
      enableShare: true,
      openType: "private" // "private" or "public" depending on preference
    }
  };

  try {
    console.log("네이버 블로그 API 호출 요청 중...");
    const response = await axios.post(url, body, { headers });
    
    if (response.data && response.data.result) {
      console.log("🎉 포스팅 임시저장 발행 성공!");
      console.log("링크:", response.data.result.link);
      return response.data;
    }
  } catch (error) {
    console.error("❌ 네이버 OpenAPI 전송 중 실패:", error.response ? error.response.data : error.message);
  }
}

// 실행 예제
publishBlogDraft(
  "${post?.title || 'SEO 분석으로 추천하는 요리 레시피 블로그 포스팅'}",
  \`${post?.htmlContent ? post.htmlContent.substring(0, 150) + '...' : '<p>생성된 블로그 본문 HTML 들어갈 곳</p>'}\`,
  "${post?.seoTags ? post.seoTags.join(',') : '맛집,요리,리뷰'}"
);`;

  // Python Code Snippet to copy
  const pythonCodeString = `'''
Naver Blog API Auto-Poster Module (Python version)
Install: pip install requests
'''
import requests
import json

CLIENT_ID = "${config.clientId || 'YOUR_CLIENT_ID'}"
CLIENT_SECRET = "${config.clientSecret || 'YOUR_CLIENT_SECRET'}"
BLOG_ID = "${config.blogId || 'YOUR_BLOG_ID'}"

def publish_to_naver(title, html_content, tags):
    url = f"https://openapi.naver.com/v1/write/blog/{BLOG_ID}"
    
    headers = {
        "X-Naver-Client-Id": CLIENT_ID,
        "X-Naver-Client-Secret": CLIENT_SECRET,
        "Content-Type": "application/json"
    }
    
    payload = {
        "title": title,
        "contents": html_content,
        "options": {
            "enableComment": True,
            "enableShare": True,
            "openType": "private"  # private: 임시저장/비공개
        }
    }
    
    try:
        print("네이버 API 전송을 시작합니다...")
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        
        if response.status_code == 200:
            result = response.json()
            print("🎉 네이버 오픈 API 임시글저장 완료!")
            print("포스트 주소 ID:", result.get("result", {}).get("logNo"))
            return True
        else:
            print(f"❌ 전송 실패! 상태 코드: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"오류 발생: {e}")
        return False

# 예시 실행
publish_to_naver(
    title="${post?.title || '성수역 3번출구 맛집 솔직 후기'}",
    html_content="""${post?.htmlContent ? post.htmlContent.substring(0, 100) + '...' : '<p>여기에 본문 HTML을 넣어주세요</p>'}""",
    tags="${post?.seoTags ? post.seoTags.join(',') : '맛집,성수동'}"
)
`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6" id="naver-api-guide-card">
      
      {/* Title & Banner */}
      <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-slate-150 pb-5 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 px-2.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase">Open API Integration</span>
            <span className="text-xs text-blue-600 font-bold font-sans">네이버 공식 포스팅 연동 가이드</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">네이버 블로그 OpenAPI 연동 가이드</h3>
          <p className="text-xs text-slate-500 mt-1">
            네이버 개발자 센터에서 Client Id키를 발급키 받아 기입하시면, 생성된 본문 글을 본인의 블로그 임시저장 글로 전송할 수 있습니다.
          </p>
        </div>
        <a 
          href="https://developers.naver.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-slate-500 hover:text-slate-900 border border-slate-200 p-2 py-2.5 rounded-lg inline-flex items-center gap-1.5 font-semibold transition-all hover:bg-slate-50 cursor-pointer"
        >
          네이버 개발자 센터 이동
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 1/3: CREDENTIAL INPUT FORM */}
        <div className="space-y-6">
          <form onSubmit={handleSaveCredentials} className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4" id="api-secrets-form">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Key className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-xs text-slate-800">연동 API 키 보관소</span>
              <span className="p-0.5 px-1.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold">로컬 저장</span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">
                네이버 Client ID
              </label>
              <input
                type="text"
                placeholder="비공개 발급 키 입력"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                className="w-full p-2.5 bg-white rounded-lg border border-slate-200 outline-none text-xs text-slate-700 font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                id="api-client-id-input"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block">
                네이버 Client Secret
              </label>
              <input
                type="password"
                placeholder="암호화 시크릿 키 입력"
                value={clientSecretInput}
                onChange={(e) => setClientSecretInput(e.target.value)}
                className="w-full p-2.5 bg-white rounded-lg border border-slate-200 outline-none text-xs text-slate-700 font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                id="api-client-secret-input"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block">
                대상 네이버 아이디 (URL ID)
              </label>
              <input
                type="text"
                placeholder="예: blog_username"
                value={blogIdInput}
                onChange={(e) => setBlogIdInput(e.target.value)}
                className="w-full p-2.5 bg-white rounded-lg border border-slate-200 outline-none text-xs text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                id="api-blog-id-input"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-3 rounded-lg transition-all cursor-pointer active:scale-95 text-center block"
              id="btn-save-secrets"
            >
              API 인증 데이터 저장
            </button>
          </form>

          {/* SIMULATION TEST BUTTON */}
          <div className="bg-slate-50 p-5 rounded-xl border border-dashed border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-slate-850 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-blue-500" />
              API 연동 페이로드 미리보기 및 시뮬레이터
            </h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              글 생성이 완료되면 아래 버튼을 통해 네이버가 요구하는 형식의 Request JSON 패키지를 만들어 전송을 시뮬레이션할 수 있습니다.
            </p>

            {!post ? (
              <div className="p-3 bg-amber-50 rounded-lg text-[10px] text-amber-800 border border-amber-200/60">
                ⚠️ [Step 2]에서 아직 완성글을 생성하지 않아 시뮬레이션 버튼이 비활성화 상태입니다.
              </div>
            ) : (
              <button
                type="button"
                onClick={handleTestSimulation}
                disabled={testing}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                id="btn-simulate-publish"
              >
                {testing ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-blue-700" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>인증 패키지 진단 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>네이버 전송 시뮬레이션 테스트</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT 2/3: SIMULATION RESULT BOARD & EXPORT SCRIPT */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SIMULATED RESPONSE VIEWER OR CODE EXPORT CHROME */}
          {apiResult ? (
            <div className="bg-slate-900 rounded-xl p-5 md:p-6 border border-slate-800 text-slate-200 font-mono text-xs space-y-4" id="api-sandbox-output">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Naver API Sandbox Inspector
                </span>
                <button
                  onClick={() => setApiResult(null)}
                  className="text-[10px] text-slate-400 hover:text-white border border-slate-800 p-1 px-2 rounded-lg cursor-pointer"
                  id="btn-close-sandbox"
                >
                  초기화
                </button>
              </div>

              {/* REQUEST VISUAL INSIGHTS */}
              <div className="space-y-3">
                <div>
                  <span className="text-slate-500 block">[API 호출 사양]</span>
                  <p className="text-indigo-400 mt-0.5">POST {apiResult.requestPayload?.endpoint}</p>
                </div>

                <div>
                  <span className="text-slate-500 block">[Headers]</span>
                  <pre className="text-amber-400 bg-slate-950 p-2.5 rounded-lg overflow-x-auto text-[10px] mt-0.5">
                    {JSON.stringify(apiResult.requestPayload?.headers, null, 2)}
                  </pre>
                </div>

                <div>
                  <span className="text-slate-500 block">[Request Body Payload (Naver OpenAPI Spec)]</span>
                  <pre className="text-slate-350 bg-slate-950 p-2.5 rounded-lg overflow-x-auto text-[10px] mt-0.5 max-h-[140px]">
                    {JSON.stringify({
                      title: apiResult.requestPayload?.body?.title,
                      contents: apiResult.requestPayload?.body?.contents?.substring(0, 180) + "...",
                      options: apiResult.requestPayload?.body?.options
                    }, null, 2)}
                  </pre>
                </div>

                {/* API RESPONSE */}
                <div className="border-t border-slate-800 pt-3">
                  <span className="text-slate-500 block">[네이버 가상 응답 코드 (Response JSON)]</span>
                  <pre className="text-emerald-400 bg-slate-950 p-2.5 rounded-lg overflow-x-auto text-[10px] mt-0.5">
{`{
  "result": {
    "status": "success",
    "postId": "${apiResult.naverPostId}",
    "mode": "${apiResult.publishStatus}",
    "message": "임시글 보관함(Saved Drafts)으로 본문이 안전하게 배송되었습니다.",
    "draftLink": "https://blog.naver.com/${config.blogId || 'naver_user_id'}/post/draft"
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            /* CODE EXPORTS TABS */
            <div className="space-y-4" id="code-exports-panel">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 block">자동 글쓰기 모듈 소스 코드 다운로드</span>
                <span className="text-[10px] text-slate-400 font-mono">Open-Source Ready</span>
              </div>

              {/* TWO SCRIPT COLUMNS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Node.js (with copy) */}
                <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between bg-slate-50">
                  <div className="p-3 bg-slate-100 flex items-center justify-between border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <FileCode className="w-3.5 h-3.5 text-blue-500" />
                      Node.js (Axios)
                    </span>
                    <button
                      onClick={() => handleCopyCode(nodeCodeString, 'node')}
                      className="p-1.5 hover:bg-white rounded border border-slate-200 text-slate-500 hover:text-slate-900 transition-all flex items-center gap-1 text-[10px] cursor-pointer"
                      id="btn-copy-node-script"
                    >
                      {copiedCode === 'node' ? (
                        <>
                          <Check className="w-3 text-emerald-500" />
                          <span>복사완료</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3" />
                          <span>코드복사</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 text-slate-300 font-mono text-[9px] overflow-auto max-h-[160px] leading-relaxed">
                    {nodeCodeString}
                  </pre>
                </div>

                {/* Python (with copy) */}
                <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between bg-slate-50">
                  <div className="p-3 bg-slate-100 flex items-center justify-between border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <FileCode className="w-3.5 h-3.5 text-emerald-500" />
                      Python (Requests)
                    </span>
                    <button
                      onClick={() => handleCopyCode(pythonCodeString, 'python')}
                      className="p-1.5 hover:bg-white rounded border border-slate-200 text-slate-500 hover:text-slate-900 transition-all flex items-center gap-1 text-[10px] cursor-pointer"
                      id="btn-copy-python-script"
                    >
                      {copiedCode === 'python' ? (
                        <>
                          <Check className="w-3 text-emerald-500" />
                          <span>복사완료</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3" />
                          <span>코드복사</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 text-slate-300 font-mono text-[9px] overflow-auto max-h-[160px] leading-relaxed">
                    {pythonCodeString}
                  </pre>
                </div>

              </div>

              {/* Interactive Help banner */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200/50 flex gap-3 text-xs text-blue-900 leading-normal">
                <Shield className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <span className="font-bold text-blue-950">보안 및 상용화 배포 시 참고사항</span>
                  <p className="text-blue-800">
                    생성된 Node.js/Python 자동화 코드를 로컬 스케줄러(Cron)나 AWS Lambda 등에 업로드 하시면, 매일 일정 시간에 이 도구가 문체를 복제하여 네이버 블로그에 자동으로 임시 글을 채워두는 블로그 자동 포스팅 서비스를 직접 운영하실 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
