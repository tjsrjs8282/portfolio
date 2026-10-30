// Copy for the page. Wording follows the GitHub profile README (bfcf6ed) and
// the 거니웍스 HQ Notion page; facts come from the repos (2026-10-31).

export const SITE = {
  title: "유선건 · GEONY WORKS — Full-stack Harness Engineering",
  description:
    "거니웍스(GEONY WORKS) 대표 유선건의 포트폴리오. 아이디어 한 줄을 기획 → 디자인 → 개발 → 배포 → 실사용자 → 수익화까지 끝까지 만듭니다. 말랑 모험 · 디어미오 · Doii · AI 일터 · 거니웍스 · 거니워니를 직접 운영합니다.",
  name: "유선건",
  nameEn: "Yu Seongeon",
  company: "거니웍스",
  companyEn: "GEONY WORKS",
  email: "dbtjsrjs8282@naver.com",
  links: {
    company: "https://geonyworks.com",
    contact: "https://geonyworks.com/#contact",
    kakao: "https://pf.kakao.com/_DxgvmX/chat",
    github: "https://github.com/tjsrjs8282",
    blog: "https://sg-coding.tistory.com/",
    play: "https://play.google.com/store/apps/details?id=com.geonyworks.mallangadventure",
  },
};

export const PIPELINE = [
  {
    ko: "기획",
    en: "PLAN",
    title: "아이디어 한 줄을 스펙으로",
    body: "누가, 왜, 어디서 돈을 내는지부터 정합니다. 화면 흐름과 데이터 모델, 작업 목록까지 문서로 쪼개 두면 에이전트도 사람도 같은 그림을 봅니다.",
    proof: ["idea → spec → tasks", "HANDOFF.md 인수인계"],
  },
  {
    ko: "디자인",
    en: "DESIGN",
    title: "브랜드 · UI/UX · 모션 · 사운드",
    body: "로고와 캐릭터, 화면, 움직임, 소리까지 한 손에서 나옵니다. 한국어와 베트남어 두 언어를 처음부터 레이아웃 규칙에 넣어 둡니다.",
    proof: ["three.js 도형 캐릭터 「거니」", "베트남어 평균 2.9배 길이 규칙"],
  },
  {
    ko: "개발",
    en: "BUILD",
    title: "에이전트 × 격리된 worktree",
    body: "저장소마다 규칙(CLAUDE.md · AGENTS.md)을 깔고, 서브에이전트 · 스킬 · MCP · 워크플로로 일을 나눠 맡깁니다. 사람은 한 명, 팀은 하네스로.",
    proof: ["Build → Review(3관점) → Fix", "서비스마다 DB · 배포 분리"],
  },
  {
    ko: "배포",
    en: "SHIP",
    title: "끝은 검증이 정한다",
    body: "typecheck · lint · Vitest · Playwright e2e가 통과해야 끝. 웹은 main → Vercel 자동 배포, 앱은 GitHub Actions가 AAB를 굽고 Google Play로 나갑니다.",
    proof: ["npm run verify", "Vercel · Google Play"],
  },
  {
    ko: "실사용자",
    en: "OPERATE",
    title: "출시 다음 날부터가 진짜",
    body: "공지 · 이벤트 · 밸런스 · 고객 응대까지 직접 합니다. 웹 푸시와 알림톡으로 다시 부르고, 분석으로 어디서 이탈하는지 봅니다.",
    proof: ["말랑 모험 Google Play 출시", "Web Push · 알림톡 · GA4"],
  },
  {
    ko: "수익화",
    en: "REVENUE",
    title: "데모가 아니라, 결제가 일어나는 제품",
    body: "인앱 결제는 서버에서 검증하고, 결제 확정과 보상 정산은 서버 RPC로만 처리합니다. 비밀값은 커밋 · 로그 · 대화 어디에도 남기지 않습니다.",
    proof: ["Google Play Billing", "Toss Payments 실결제"],
  },
] as const;

export const PRINCIPLES = [
  {
    icon: "rules",
    title: "규칙은 사고에서 나온다",
    body: "버그 하나가 규칙 한 줄이 됩니다. Doii · 말랑 모험 저장소의 AGENTS.md는 어떤 버그에서 어떤 규칙이 나왔는지 적어 둔 설계 사례집입니다.",
  },
  {
    icon: "night",
    title: "자리를 비운 밤에도",
    body: "워크플로가 Build → Review(3관점) → Fix → 공지 · 인계까지 한 라운드를 끝까지 돌립니다. 아침엔 결과와 인계 문서가 기다립니다.",
  },
  {
    icon: "verify",
    title: "끝은 검증이 정한다",
    body: "“다 했어요”가 아니라 검증이 통과해야 끝. DB는 PGlite로 마이그레이션과 RLS까지 로컬에서 먼저 확인합니다.",
  },
  {
    icon: "lock",
    title: "경계는 서버에",
    body: "숨길 값은 화면이 아니라 RLS가 막습니다. 결제 확정 · 보상 정산은 서버 RPC로만, 서비스마다 Supabase · Vercel 프로젝트를 나눕니다.",
  },
] as const;

/** Commit and migration counts are the profile README's (capdoii repo, 2026-10). */
export const STATS = [
  { value: 1800, suffix: "+", label: "커밋", note: "Doii · 말랑 모험 저장소 하나" },
  { value: 2100, suffix: "+", label: "Supabase 마이그레이션", note: "같은 저장소 · 2026-10 기준" },
  { value: 6, suffix: "", label: "운영 중인 서비스", note: "거니웍스 HQ · 2026-10-31" },
] as const;

export const HARNESS_CODE = `// 거니웍스 = 사람 1 + 하네스
const geonyworks = {
  plan:    "idea → spec → tasks",
  build:   "AI agents × isolated git worktrees",
  rules:   ["CLAUDE.md", "AGENTS.md", "HANDOFF.md"],
  skills:  ["superpowers", "higgsfield", "typecast"],
  mcp:     ["supabase", "vercel", "playwright", "chrome", "fal"],
  verify:  "npm run verify", // tsc · lint · vitest · playwright
  ship:    ["vercel", "google-play", "github-actions"],
  operate: ["notices", "events", "balance", "support"],
  revenue: ["google-play-billing", "toss-payments"],
};`;

export const TOOLBOX = [
  ["Next.js", "React", "TypeScript", "Supabase", "PostgreSQL", "Tailwind", "three.js", "GSAP", "Capacitor", "Expo", "Node.js", "Vite"],
  ["Claude", "Sub-agents", "Agent Skills", "MCP", "Workflows", "Git worktrees", "Playwright", "Vitest", "PGlite", "GitHub Actions", "Vercel"],
  ["Toss Payments", "Google Play Billing", "Web Push", "Kakao", "Solapi", "Resend", "GA4", "PostHog", "ElevenLabs", "fal.ai", "Typecast", "Remotion"],
] as const;

export const OLD_WORKS = [
  { id: "knives", title: "Knives Out", year: 2020, note: "영화 소개 원페이지 · 플러그인 없이", href: "https://tjsrjs8282.github.io/Knives/index.html" },
  { id: "oculus", title: "Oculus VR", year: 2020, note: "제품 소개 · 판매 사이트", href: "https://tjsrjs8282.github.io/oculus/index.html" },
  { id: "musa", title: "MUSA", year: 2020, note: "여성 의류 쇼핑몰 메인", href: "https://tjsrjs8282.github.io/musa/" },
  { id: "hankuk", title: "한국대학교", year: 2020, note: "대학 메인 · 반응형", href: "https://tjsrjs8282.github.io/hankuk/index.html" },
] as const;

export const PATH = [
  {
    when: "2017 — 2019",
    title: "사진 · 인테리어 · 시공",
    body: "렛츠런파크 홍보팀에서 사진을 찍고, 한샘에서 가구를 시공했습니다. 보기 좋게, 그리고 단단하게 — 만드는 일을 손으로 먼저 배웠습니다.",
  },
  {
    when: "2019 — 2020",
    title: "웹디자인 & 퍼블리싱",
    body: "UI/UX 웹디자인 · 퍼블리셔 과정. 첫 포트폴리오로 Hollow Knight 랜딩 페이지, Knives Out, 그리고 이 사이트의 2020년 버전을 만들었습니다.",
  },
  {
    when: "웹 에이전시",
    title: "실무 사이트 39곳",
    body: "소속 회사에서 성심당몰을 비롯한 커머스 · 라이브커머스 22곳 구축에 참여했고, 케어필라테스 등 웹 작업 17곳을 맡았습니다.",
  },
  {
    when: "2023",
    title: "프런트엔드 엔지니어",
    body: "엘리스 SW 엔지니어 트랙. React로 팀 프로젝트 「오늘의식단」을 만들며 퍼블리셔에서 엔지니어로 넘어왔습니다.",
  },
  {
    when: "2026 . 04 — 08",
    title: "AI 하네스로 혼자 팀이 되다",
    body: "Stock Scanner, AI 일터를 거쳐 디어미오 · Doii · 말랑 모험까지. 에이전트에게 일을 맡기는 방식을 저장소마다 규칙과 검증으로 굳혔습니다.",
  },
  {
    when: "2026 . 09",
    title: "거니웍스 개업",
    body: "웹 · 앱 · 게임 개발 스튜디오 GEONY WORKS. 자사 서비스를 운영하면서 클라이언트 프로젝트를 함께 맡습니다.",
  },
  {
    when: "2026 . 10",
    title: "출시, 그리고 실결제",
    body: "말랑 모험이 Google Play에 출시되고, 디어미오는 토스페이먼츠 라이브 결제로 실제 고객 주문을 받기 시작했습니다. 기획에서 수익화까지, 한 바퀴.",
  },
] as const;
