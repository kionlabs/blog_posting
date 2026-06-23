import { BlogPost, SeoScoreDetails } from '../types';

export function calculateSeoScore(post: BlogPost, keywordsStr: string, topic: string): SeoScoreDetails {
  const keywords = keywordsStr
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);

  const checks: { label: string; passed: boolean; feedback: string; impact: 'high' | 'medium' | 'low' }[] = [];
  let score = 100;

  // 1. Keyword in Title Check
  const title = post.title.toLowerCase();
  if (keywords.length > 0) {
    const primaryKeyword = keywords[0].toLowerCase();
    const keywordInTitleIndex = title.indexOf(primaryKeyword);
    
    if (keywordInTitleIndex === 0) {
      checks.push({
        label: '핵심 키워드 제목 배치',
        passed: true,
        feedback: '주요 키워드가 제목의 절대적인 첫머리에 배치되어 검색 노출 가중치가 최대로 적용되었습니다.',
        impact: 'high'
      });
    } else if (keywordInTitleIndex > 0) {
      checks.push({
        label: '핵심 키워드 제목 포함',
        passed: true,
        feedback: '주요 키워드가 제목 끝부분에 위치해 있습니다. 최대한 뒤보다 앞쪽에 배치하면 더 좋습니다.',
        impact: 'high'
      });
      score -= 5;
    } else {
      checks.push({
        label: '핵심 키워드 제목 누락',
        passed: false,
        feedback: `타겟 키워드 "${keywords[0]}"(이)가 제목에 누락되었습니다. 네이버 검색엔진이 매칭하기 힘듭니다.`,
        impact: 'high'
      });
      score -= 20;
    }
  } else {
    checks.push({
      label: '타겟 키워드 설정',
      passed: false,
      feedback: '지정된 타겟 키워드가 없습니다. 키워드가 없으면 SEO 적합성 진단이 불가능합니다.',
      impact: 'high'
    });
    score -= 15;
  }

  // 2. Word Count Check
  const charLength = post.wordCount || post.htmlContent.replace(/<[^>]+>/g, '').length;
  if (charLength >= 1500) {
    checks.push({
      label: '글자 수 충분성',
      passed: true,
      feedback: `현재 약 ${charLength}자로 네이버 뷰(VIEW)/블로그 영역 노출에 최적인 충분한 상세 정보량을 가집니다.`,
      impact: 'high'
    });
  } else if (charLength >= 800) {
    checks.push({
      label: '글자 수 보완 필요',
      passed: true,
      feedback: `현재 약 ${charLength}자로 양호하나 조금 더 살을 덧붙여 1500자 이상으로 만들면 랭킹 노출에 더 안정적입니다.`,
      impact: 'medium'
    });
    score -= 5;
  } else {
    checks.push({
      label: '글자 수 미달 (어뷰징 위험)',
      passed: false,
      feedback: `현재 약 ${charLength}자로 분량이 지나치게 짧아, 기계적인 홍보용 저품질 문서로 판별될 위험이 있습니다.`,
      impact: 'high'
    });
    score -= 15;
  }

  // 3. Keyword Stuffing / Frequency Checker
  const plainBody = post.htmlContent.replace(/<[^>]+>/g, ' ').toLowerCase();
  let keywordMatches = 0;
  
  if (keywords.length > 0) {
    keywords.forEach(keyword => {
      const regObj = new RegExp(keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
      const matches = plainBody.match(regObj);
      if (matches) {
        keywordMatches += matches.length;
      }
    });
  }

  const densityPercent = charLength > 0 ? (keywordMatches / (charLength / 3)) * 100 : 0; // estimate word count

  if (keywords.length > 0) {
    if (keywordMatches === 0) {
      checks.push({
        label: '본문 키워드 삽입 상태',
        passed: false,
        feedback: '타겟 키워드가 본문에 전혀 등장하지 않습니다. 검색 매칭에 악영향을 줍니다.',
        impact: 'high'
      });
      score -= 15;
    } else if (keywordMatches >= 3 && keywordMatches <= 12) {
      checks.push({
        label: '키워드 자연 밀도 (이상적)',
        passed: true,
        feedback: `타겟 키워드가 총 ${keywordMatches}회 자연스럽게 삽입되어 키워드 도배(어뷰징) 필터를 안전하게 통과합니다.`,
        impact: 'high'
      });
    } else if (keywordMatches > 12) {
      checks.push({
        label: '키워드 도배 (패널티 위험)',
        passed: false,
        feedback: `타겟 키워드가 총 ${keywordMatches}회 검출되어 네이버 리브라/C-Rank 필터에서 과도중복 키워드로 스팸 감지될 위험이 큽니다. 빈도를 줄이세요.`,
        impact: 'high'
      });
      score -= 20;
    } else {
      checks.push({
        label: '키워드 밀도 상향 필요',
        passed: true,
        feedback: `본문에 키워드가 ${keywordMatches}회 등장하여 다소 낮습니다. 중간 소제목이나 단락 끝에 1-2회 추가 언급하세요.`,
        impact: 'medium'
      });
      score -= 5;
    }
  }

  // 4. Image Placeholders Check
  const imageCount = post.imagePlaceholders?.length || 0;
  if (imageCount >= 3) {
    checks.push({
      label: '멀티미디어(이미지) 유기적 배치',
      passed: true,
      feedback: `본문 내에 이미지 영역 ${imageCount}개가 적시에 지정되어 체류시간 상승에 도움을 줍니다.`,
      impact: 'medium'
    });
  } else if (imageCount > 0) {
    checks.push({
      label: '이미지 개수 적정',
      passed: true,
      feedback: `이미지 포인터가 ${imageCount}개 배치되었습니다. 유용하지만, 캡션 이미지 2개 정도를 더 보강하면 상위권에 도움이 됩니다.`,
      impact: 'low'
    });
  } else {
    checks.push({
      label: '이미지/포토 누락',
      passed: false,
      feedback: '이미지 영역 가이드가 존재하지 않습니다. 텍스트만 빽빽히 존재하는 글은 네이버 통합 검색 탭에서 크게 불리합니다.',
      impact: 'medium'
    });
    score -= 10;
  }

  // 5. Headings / Formatting Check
  const hasHeadings = post.htmlContent.includes('<h2') || post.htmlContent.includes('<h3');
  if (hasHeadings) {
    checks.push({
      label: '소제목 가치 구조화',
      passed: true,
      feedback: '소제목(Heading) 태그가 적절히 사용되어 긴 정보를 일목요연하고 단정하게 제공하고 있습니다.',
      impact: 'medium'
    });
  } else {
    checks.push({
      label: '소제목 부재 (독자 피로)',
      passed: false,
      feedback: '소제목(Heading) 구분이 없어 모바일 독자가 스크롤을 내릴 시 빠른 정보 인식에 저해 요소가 됩니다.',
      impact: 'medium'
    });
    score -= 10;
  }

  // Ensure score doesn't dip below 10 for visuals
  score = Math.max(score, 12);

  return {
    score,
    checks,
    keywordCount: keywordMatches,
    keywordDensity: parseFloat(densityPercent.toFixed(1))
  };
}
