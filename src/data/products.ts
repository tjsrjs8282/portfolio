// Products I build and run. Every line here is taken from the product's live
// site, its repo README or the 거니웍스 HQ Notion page (2026-10-31) — no
// invented users, revenue or metrics. Status words match Notion's 상태 column.
import type { ImageMetadata } from "astro";

import malangOg from "../assets/og/malang.jpg";
import malangMobile from "../assets/shots/malang-mobile.jpg";
import dearmioDesktop from "../assets/shots/dearmio-desktop.jpg";
import dearmioMobile from "../assets/shots/dearmio-mobile.jpg";
import dearmioOg from "../assets/og/dearmio.jpg";
import doiiOg from "../assets/og/doii.jpg";
import doiiMobile from "../assets/shots/doii-mobile.jpg";
import ailterDesktop from "../assets/shots/ailter-desktop.jpg";
import ailterMobile from "../assets/shots/ailter-mobile.jpg";
import ailterOg from "../assets/og/ailter.jpg";
import geonyworksDesktop from "../assets/shots/geonyworks-desktop.jpg";
import geonyworksMobile from "../assets/shots/geonyworks-mobile.jpg";
import geonyworksOg from "../assets/og/geonyworks.jpg";
import geonywonyDesktop from "../assets/shots/geonywony-desktop.jpg";
import geonywonyMobile from "../assets/shots/geonywony-mobile.jpg";
import geonywonyOg from "../assets/og/geonywony.jpg";

export type Status = "운영 중" | "개발 중";

export interface Product {
  id: string;
  name: string;
  /** Romanised / English name, shown small next to the Korean one. */
  alt: string;
  kind: string;
  status: Status;
  /** Short proof points, shown as badges. */
  badges: string[];
  line: string;
  body: string;
  stack: string[];
  links: { label: string; href: string }[];
  accent: string;
  /** Wide visual: a desktop screenshot, or the product's own OG card for mobile-first apps. */
  wide?: { src: ImageMetadata; alt: string; isScreen: boolean };
  phone?: { src: ImageMetadata; alt: string };
  /** Hover preview in the index list. */
  preview?: ImageMetadata;
}

export const PRODUCTS: Product[] = [
  {
    id: "malang",
    name: "말랑 모험",
    alt: "Malang Adventure",
    kind: "게임 · Web + Android",
    status: "운영 중",
    badges: ["Google Play 출시", "인앱 결제 · 서버 검증", "한국어 · Tiếng Việt"],
    line: "말랑이와 함께 떠나는 검과 마법의 귀여운 성장 RPG",
    body: "두 영웅과 펫을 키우고, 강화·재련으로 장비를 다듬으며 층층이 보스를 넘는 턴제 RPG. 세계관·전투 연출·경제 밸런스·사운드부터 Google Play 출시와 인앱 결제까지 직접 하고, 출시 뒤에도 이벤트·공지·밸런스를 운영합니다. 콘텐츠는 전부 DB 표라 월드가 늘어도 코드에 분기가 없습니다.",
    stack: ["Next.js", "Supabase", "Capacitor Android", "Google Play Billing", "Toss Payments", "Web Push"],
    links: [
      { label: "capdoii.com/play", href: "https://capdoii.com/play" },
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.geonyworks.mallangadventure" },
    ],
    accent: "#FFC53D",
    wide: { src: malangOg, alt: "말랑 모험 대표 이미지 — 검과 지팡이를 든 두 영웅과 펫들", isScreen: false },
    phone: { src: malangMobile, alt: "말랑 모험 웹 시작 화면 — 로그인과 모험 시작 버튼" },
    preview: malangOg,
  },
  {
    id: "dearmio",
    name: "디어미오",
    alt: "Dearmio",
    kind: "서비스 · Web",
    status: "운영 중",
    badges: ["실결제 운영", "1인 운영", "한 저장소 · 한 배포"],
    line: "먼저 만들어 보고, 마음에 들면 결제하는 모바일 청첩장 · 초대장",
    body: "감성 모바일 청첩장부터 돌잔치·생일·환갑·집들이 초대장까지. 한 커플의 청첩장에서 시작해, 고객이 늘어도 코드를 고치지 않는 서비스로 키웠습니다. 주문·결제(토스페이먼츠)·알림톡·식전영상·관리자 분석까지 한 저장소에서 돌아갑니다.",
    stack: ["Next.js", "Supabase", "Toss Payments", "Remotion", "Claude API", "Solapi", "Resend"],
    links: [{ label: "dearmio.com", href: "https://dearmio.com" }],
    accent: "#E3B58C",
    wide: { src: dearmioDesktop, alt: "디어미오 홈 화면 — ‘열리는 순간부터, 이미 특별한 하루’와 초대장 봉투", isScreen: true },
    phone: { src: dearmioMobile, alt: "디어미오 모바일 홈 화면" },
    preview: dearmioOg,
  },
  {
    id: "doii",
    name: "Doii",
    alt: "도이",
    kind: "커플 앱 · PWA",
    status: "운영 중",
    badges: ["한·베 커플", "실시간 동기화", "번역 버튼"],
    line: "한국·베트남 커플이 각자의 언어·시간대로 같은 하루를 쓰는 커플 앱",
    body: "일정·두 통화 생활비·추억·예약 편지·놀이터를 두 사람이 함께 씁니다. 다른 언어로 쓴 글에는 번역 버튼(Gemini). 숨겨야 하는 값은 화면이 가리는 게 아니라 RLS가 SELECT를 막습니다 — 보안 경계는 전부 서버에.",
    stack: ["Next.js", "Supabase Realtime", "RLS · RPC", "Gemini", "Web Push", "PWA"],
    links: [{ label: "capdoii.com", href: "https://capdoii.com" }],
    accent: "#F472B6",
    wide: { src: doiiOg, alt: "Doii 대표 이미지 — ‘우리 둘의 시간을, 여기에 담아요’", isScreen: false },
    phone: { src: doiiMobile, alt: "Doii 모바일 홈 — 함께 보는 캘린더, 생활비, 추억 타임라인, 예약 편지" },
    preview: doiiOg,
  },
  {
    id: "ailter",
    name: "AI 일터",
    alt: "AILTER",
    kind: "AI 오피스 · Web",
    status: "운영 중",
    badges: ["멀티 에이전트", "원격 MCP", "지식 그래프"],
    line: "여러 AI 직원이 협업해서 일을 끝까지 처리하는 나만의 AI 사무실",
    body: "대표(CEO) 에이전트가 일을 DAG로 쪼개 리서처·작가·디자이너·개발자·비서에게 넘기고, 직원은 도구를 직접 써서 결과를 확인한 뒤 답합니다. 회의실에서 지시하고, 사무실에서 진행을 보고, 산출물은 폴더와 Obsidian 보관소로 정리됩니다.",
    stack: ["React", "Express", "Claude API · tool use", "OpenAI", "Gemini", "Supabase pgvector", "MCP"],
    links: [{ label: "ailter.ai", href: "https://ailter.ai" }],
    accent: "#6D7BFF",
    wide: { src: ailterDesktop, alt: "AI 일터 첫 화면 — 픽셀 캐릭터 AI 직원들과 로그인 버튼", isScreen: true },
    phone: { src: ailterMobile, alt: "AI 일터 모바일 첫 화면" },
    preview: ailterOg,
  },
  {
    id: "geonyworks",
    name: "거니웍스",
    alt: "GEONY WORKS",
    kind: "회사 사이트 · Web",
    status: "운영 중",
    badges: ["3D 캐릭터 「거니」", "관리자 · 고객 포털", "제안서 → 청구서"],
    line: "웹 · 앱 · 게임 개발 스튜디오 — 기획부터 배포까지, 한 팀으로",
    body: "15초 쇼릴 인트로, 외부 모델 없이 three.js 도형으로만 만든 3D 캐릭터 「거니」, 스크롤 스토리. 문의·제안서·청구서·고객 포털·관리자까지 — 수주부터 청구까지 한 저장소에서 돌아가는 회사 사이트입니다.",
    stack: ["Next.js 16", "React Three Fiber", "GSAP", "Lenis", "Supabase", "Typecast", "ElevenLabs"],
    links: [{ label: "geonyworks.com", href: "https://geonyworks.com" }],
    accent: "#FF5B1F",
    wide: { src: geonyworksDesktop, alt: "거니웍스 홈 화면 — GEONY WORKS 로고와 3D 캐릭터 거니", isScreen: true },
    phone: { src: geonyworksMobile, alt: "거니웍스 모바일 홈 화면" },
    preview: geonyworksOg,
  },
  {
    id: "geonywony",
    name: "거니워니",
    alt: "GeonyWony",
    kind: "브랜드 홈 · Web",
    status: "운영 중",
    badges: ["소셜 로그인 3종", "3D 무대 · AR", "한국어 · Tiếng Việt"],
    line: "한국 거니와 베트남 워니, 한베커플 거니워니의 공식 홈페이지",
    body: "국제결혼과 베트남 여행, 커플 브이로그를 담는 크리에이터 브랜드 홈. 카카오·Google·Facebook 로그인, 유튜브 영상·Shorts 허브, 앨범 플레이어, 따라오는 3D 무대와 AR 「내 방에 놓기」까지.",
    stack: ["Next.js", "Supabase Auth", "three.js", "YouTube Data API", "PostHog", "Playwright"],
    links: [{ label: "geonywony.com", href: "https://geonywony.com" }],
    accent: "#FF7AA2",
    wide: { src: geonywonyDesktop, alt: "거니워니 홈 화면 — ‘두 나라에서 시작된 거니워니 이야기’", isScreen: true },
    phone: { src: geonywonyMobile, alt: "거니워니 모바일 홈 화면" },
    preview: geonywonyOg,
  },
  {
    id: "creakor",
    name: "크리에이커",
    alt: "CREAKOR",
    kind: "클라이언트 · Web",
    status: "개발 중",
    badges: ["리뉴얼", "3D 까치 랜딩", "관리자 CMS"],
    line: "의료 · 뷰티 브랜드 글로벌 마케팅 에이전시 공식 사이트 리뉴얼",
    body: "해외 진출과 외국인 환자 유치를 돕는 마케팅 에이전시의 새 공식 사이트. 3D 까치 랜딩과 소개·서비스·사례·소식·문의, 그리고 직접 글을 쓰는 관리자까지 — 거니웍스가 리뉴얼하고 있습니다.",
    stack: ["Next.js 16", "React Three Fiber", "GSAP", "Tiptap", "Supabase"],
    links: [{ label: "creakor.net", href: "https://creakor.net" }],
    accent: "#5EEAD4",
  },
];

export const LIVE_COUNT = PRODUCTS.filter((p) => p.status === "운영 중").length;
export const DEV_COUNT = PRODUCTS.filter((p) => p.status === "개발 중").length;
