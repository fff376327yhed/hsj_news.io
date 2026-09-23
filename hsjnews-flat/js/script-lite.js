const SITE_LOADING_TIPS = [ "그거 아세요? 정아영은 외계인이래요!", "버그가 있다면 버그제보탭에 제보해주세요.", "알림 설정에서 원하는 알림만 받을 수 있어요.", "검색으로 원하는 기사를 빠르게 찾아보세요.", "프로필을 설정해서 나를 표현해보세요!", "관리자가 고정한 기사를 놓치지 마세요.", "많이 읽힌 기사는 핫 기사로 표시돼요.", "개선할 점이 있다면 개선제보함에 제보해주세요.", "설정에서 다크모드 등 테마를 바꿀 수 있어요.", "설정에서 프로필 사진을 바꿔보세요!", "그거 아세요? 명석이는 명석이에요.", "그거 아세요? 밥에서는 밥맛이 나요.", "그거 아세요? 밥에서는 쌀맛이 나요.", "항상 버그 수정 항목 기사를 놓치지 마세요.", "관리자는 신입니다.", "관리자는 해정이입니다.", "관리자는 착하고 잘생겼습니다.", "버그 수정을 할 때 짜증납니다.", "현재 24번째에 있는 해당 메세지를 보고 있습니다.", "관리자는 항상 최선을 다 해 노력하고 있습니다.", "더보기에 활동중 탭을 가보세요!", "마크 탭에는 행동팩 등과 같은 유용한 기사들이 있어요!", "예전 해정뉴스 버전에서는 카지노와, 주식을 제작하려 했다네요.", "관리자는 Claude AI를 사용합니다.", "작성할 때 기사 설정을 해보세요!", "이것은 31번째에 있는 마지막 메세지입니다.", "전투기 조종사들이 제일 무서워하는 것은? 대공포", "세발낙지가 탈모가 오면? 한발낙지(두발이 없어져서)", "토끼가 강한 이유는? 깡과 총이 있어서", "개가 재채기를 하면? 개추", "흡혈귀들이 식탁에서 웃음이 끊이질 않는 이유는? 피 식(食) 하기 때문", "스님이 택시를 타고 한 말은? 절로가", "마블보다 4배 큰 국내 기업은? 넷마블", "어떤 혈액형의 경찰관이 제일 많을까? B형~ B형~", "사자가 항상 숙제를 안 하는 이유는? 밀림의 제왕이라서", "다리미가 좋아하는 음식은? 피자", "자동차를 톡하고 치면? 카톡", "뽑으면 우는 식물은? 우엉", "광부가 가장 많은 나라는? 케냐", "정아영 ㅄ", "그거 아세요? 해정뉴스 첫 제작은 2025년 1월입니다.", "떡볶이에서 떡볶이 맛이 납니다.", "차명석은 게넥도 리더라는 설이..?", "해당 메세지는 2026년 3월 29일에 편집중입니다.", "AI 기능을 이용해보세요!", "해정이는 롤토체스를 즐겨합니다.", "A는 영어입니다.", "1+1 = 2 입니다.", "1+1 = 창문 입니다.", "1+1 = 귀요미 입니다.", "왕이 양쪽에 있으면? 우왕좌왕", "비오는 날 먹는 햄은? 습햄", "부엉이가 물에 빠지면? 첨부엉 첨부엉", "가장 폭력적인 동물은? 팬다", "감기에 또 걸리면? 되감기", "거북이가 소화제를 먹은 이유는? 속이 거북해서", "고등학생들이 싫어하는 나무는? 야자나무", "고추장보다 높은 사람은? 초고추장", "기름을 수출하는데 걸리는 시간은? 오일", "깨가 죽으면? 주근깨", "달에서 쓰는 언어는? 문어", "김밥이 죽으면 어디로? 김밥천국", "꽃게를 냉장고에 넣으면? 게으름", "독수리가 타오르면? 이글이글", "마늘이 싸움에서 모두 지면? 다진마늘", "왕과 작별할 때 하는 말은? 바이킹", "할아버지가 좋아하는 돈은? 할머니", "소가 죽으면? 다이소", "왼쪽으로 절하면? 좌절", "미소의 반댓말은? 당기소", "왕이 담배를 피면? 스모킹", "공이 웃으면? 풋볼", "혀가 거짓말 할 때 하는 말은? 전 혀 아닙니다", "신사가 자기소개 할 때 하는말은? 신사임당", "오리가 얼면? 언덕", "무가 눈물을 흘리면? 무뚝뚝", "세상에서 가장 똑똑한 새 이름은? 하버드", "세상에서 제일 이쁜 풀은? 뷰티풀", "화장실에서 막 나온 사람은? 일본 사람", "소가 머리 깎으면? 이발소", "맥주가 죽기전에 한 말은? 유언비어", "전화로 세운 건물은? 콜로세움", "왕이 궁에 가기 싫을 때 하는 말은? 궁시렁 궁시렁", "세상에서 가장 뜨거운 바다는? 열받아", "세상에서 가장 뜨거운 전화는? 화상전화", "영어가 감기에 걸리면? 에이치", "할아버지가 등산을 하면? 산타 할아버지", "호주에서 쓰는 돈은? 호주머니", "차를 발로 차면? 카놀라유", "엄마가 길을 잃으면? 맘마미아", "아재개그는 총 40개입니다.", "현재 메세지는 83번째 메세지입니다.", "A 다음은 B입니다.", "해당 메세지는 40% 확률로 등장합니다. 구라입니다.", "해당 메세지는 약 1% 확률로 등장합니다.", "해정뉴스는 약 400번 수정되었습니다.", "초창기 해정뉴스는 해정이만 기사를 작성할 수 있었습니다.", "초창기 해정뉴스는 기사 읽어주기 기능이 있었습니다.", "현재는 2026년입니다.", "5 x 8 = 40입니다.", "안녕하세요.", "저는 거짓말을 한다는 거짓말을 하고 있습니다.", "현재 script.js의 코드 길이는 약 11000자가 넘습니다.", "해정뉴스 모든 코드 파일의 길이는 약 50000자가 넘습니다.", "기사 끝 부분에 AI 기사 요약을 이용해보세요.", "안녕하세요는 영어로 HI입니다.", "누구세요? 사랑해요~", "", "관리자가 작성할 메세지가 없어 아무거나 적은 메세지.", "정아영 ㅄ", "이 메세지는 오후 2시 19분에 작성되었습니다.", "이것은 메세지 중 마지막 메세지였습니다.", "설정에서 해정뉴스 앱을 설치해보세요.", "해정이가 정아영 논란 작성중..", "해정이가 당신의 프로필을 정리중..", "해정이가 당신의 개인정보를 보호하는중..", "해정이가 마법을 부리는중..", "데이터가 열심히 달려오는중.. 🏃‍♂️", "해정이가 당신의 데이터를 가져가는중..", "게시물을 가져오기 위해 해정이가 일 하는중..", "해정이가 로딩메세지를 억지로 만드는중..", "소나무가 삐지면? 칫솔", "우유가 아프면? 앙팡", "우유가 아프면?", "앙팡", "아버지가 두 명이면? 두부", "인천 앞바다의 반대말은? 인천 엄마다", "사람의 몸무게가 가장 많이 나갈 때는? 철들 때", "세상에서 가장 큰 코는? 멕시코", "가수 비가 자신을 소개할 때 하는 말은? 나비야", "비가 LA에 가면? LA갈비", "창문이 피를 흘리면? 윈도우창", "돌이 떨어지면? 차돌박이", "고양이가 지옥에 가면? 헬로키티", "쥐가 네 마리 모이면? 쥐포", "개가 사람을 가르치면? 개인지도", "새가 불에 타면? 타조", "불이 4곳에 나면? 사파이어", "뼈가 있는 방은? 골룸", "무가 눈물을 흘리면? 무뚝뚝", "참기름이 법원에 가면? 고소해", "깨가 죽으면? 주근깨", "식용유가 안 오면? 카놀라유", "세상에서 가장 야한 채소는? 버섯", "펭귄이 다니는 중학교는? 냉중", "펭귄이 다니는 고등학교는? 냉고", "아이스크림이 죽으면? 다이하드", "노루가 다니는 길은? 노르웨이", "다리미가 좋아하는 음식은? 피자", "형과 아우가 싸우면? 형편없는 세상", "수학책을 난로에 넣으면? 수학 익힘책", "국사책을 불태우면? 불국사", "물고기의 반대말은? 불고기", "곰이 목욕을 하면? 곰탕", "새우가 주인공인 드라마는? 대하드라마", "김밥이 죽으면 가는 곳은? 김밥천국", "세상에서 가장 비싼 새는? 백조", "침대를 밀고 돌리면? 배드민턴", "빵이 시골로 가면? 소보로", "신데렐라가 못 자면? 모짜렐라", "사과가 웃으면? 풋사과", "나무가 4그루 있으면? 포트리", "세종대왕이 만든 우유는? 아야어여오요우유", "서울이 추우면? 서울시립대", "피자가 웃으면? 피자헛", "맥주가 죽기 전에 남긴 말은? 유언비어", "송해 할아버지가 씻고 나오면? 뽀송해", "호주에서 쓰는 돈은? 호주머니", "자동차를 톡하고 치면? 카톡", "덜 뚱뚱한 사람들이 모여 사는 동네는? 반포동", "해가 울면? 해운대", "콩 한 알이 영어로? 원빈", "비가 한 시간 동안 내리면? 추적60분", "닭이 스키니진을 입으면? 꼬끼오", "소가 웃으면? 우하하", "소가 한 마리 있으면? 소원", "소가 네 마리 있으면? 소포", "개가 땀을 흘리면? 핫도그", "뱀이 불에 타면? 뱀파이어", "모자가 뭉치면? 밀짚모자", "공이 웃으면? 풋볼", "흑인이 우울하면? 까마귀", "산토끼의 반대말은? 판토끼", "글씨를 쓰는 펜이 죽으면? 펜다", "어부들이 가장 싫어하는 가수는? 배철수", "가수 설운도가 옷을 벗는 순서는? 상하의", "문을 두드리는 여자는? 똑순이", "할머니가 좋아하는 폭포는? 나이아가라 폭포", "치과의사가 좋아하는 아파트는? 이편한세상", "세상에서 가장 추운 바다는? 썰렁해", "세상에서 가장 착한 사자는? 자원봉사자", "세상에서 가장 아름다운 개는? 무지개", "세상에서 가장 빨리 자는 사람은? 이미자", "세상에서 가장 긍정적인 동물은? 돼지", "스님이 길을 가다 멈추면? 스탑", "모래가 우는 소리는? 흙흙", "구명보트에는 9명, 그럼 십장생은? 10명", "중학생과 고등학생이 타는 차는? 중고차", "할아버지 발이 크면? 노발대발", "아침에 절대 먹을 수 없는 것은? 점심과 저녁", "사과가 파이면? 파인애플", "미소가 예쁜 여자는? 미소녀", "병아리가 먹는 약은? 삐약", "쥐가 쥐를 잡으면? 쥐라기", "거미가 화를 내면? 거미줄", "코알라가 칭찬하면? 코알라잇", "독수리가 칭찬하면? 독수리오형제", "세상에서 가장 긴 음식은? 참기름", "세상에서 가장 무서운 전화기는? 무선전화기", "세상에서 가장 무서운 상사는? 불상사", "세상에서 가장 야한 닭은? 홀딱", "세상에서 가장 아름다운 돌은? 샤론스톤", "경찰서의 반대말은? 경찰앉아", "전주비빔밥의 반대말은? 이번주비빔밥", "발이 두 개 달린 소는? 이발소", "책이 책을 읽으면? 북북", "파란색 천을 뭐라고 할까? 블루투스", "매일 미안하다고 하는 동물은? 오소리", "화장실에서 사는 두 마리의 용은? 신사용, 숙녀용", "세상에서 가장 빠른 닭은? 후다닥", "산타할아버지가 싫어하는 차는? 산타페", "세 사람만 탈 수 있는 차는? 인삼차", "세상에서 가장 큰 컵은? 월드컵", "신이 길을 걷다가 돌부리에 걸려 넘어지면? 신발", "신이 아이를 낳으면? 신생아", "화장실에서 방금 나온 사람은? 일본사람", "꽃이 제일 좋아하는 벌은? 재벌", "아이 추워의 반대말은? 어른 더워", "하늘에 콩이 2개 있으면? 스카이콩콩", "신부가 방에 들어가면? 신부대기실", "사자가 항상 국을 먹을 때 하는 말은? 동물의 왕국", "지진 날 때 부르는 노래는? 동요", "세상에서 가장 장사를 잘 하는 동물은? 판다", "새가 피곤하면? 새근새근", "돈을 낭비하는 동물은? 사자", "아버지가 4명이면? 포빠", "모든 사람을 일어나게 하는 숫자는? 다섯", "세상에서 제일 뜨거운 전화는? 화상전화", "세상에서 제일 이쁜 식물은? 뷰티풀", "호박이 굴러가면? 펌프킨", "새 옷만 입는 동물은? 신사", "식인종이 밥투정 할 때 하는 말은? 에이 살맛 안 나", "딸기가 회사에서 잘리면? 딸기시럽", "달에서 쓰는 돈은? 달러", "총을 대충 쏘면? 탕수육", "바다와 육지 사이에 있는 것은? 와", "나무가 욕을 하면? 식빵", "인도가 4시면? 인도네시아", "세상에서 제일 쉬운 숫자는? 190000", "오리가 한 마리면? 오리원", "🕵️ 은밀한 뒷골목으로 오시겠습니까?" ];

let _loadingTipTimer = null;

function showPageLoadingScreen() {
  if (document.getElementById("_pageLoadingScreen")) return;
  const overlay = document.createElement("div");
  function _rotateTip() {
    if (window._alleyScreenBlocking) return;
    const el = document.getElementById("_loadingTip");
    if (!el || !SITE_LOADING_TIPS.length) return;
    const tip = SITE_LOADING_TIPS[Math.floor(Math.random() * SITE_LOADING_TIPS.length)];
    !tip.includes("은밀한 뒷골목") || window._alleyShownThisSession ? (el.style.opacity = "0", 
    setTimeout(() => {
      el.textContent = tip.includes("은밀한 뒷골목") ? SITE_LOADING_TIPS[0] : tip, el.style.opacity = "1";
    }, 300)) : function() {
      const el = document.getElementById("_loadingTip");
      el && (window._alleyScreenBlocking = !0, window._alleyShownThisSession = !0, clearInterval(_loadingTipTimer), 
      el.style.opacity = "0", setTimeout(() => {
        el.innerHTML = '\n                <div style="display:flex;flex-direction:column;align-items:center;gap:12px;">\n                    <div style="font-size:15px;font-weight:800;color:#4c1d95;animation:_alleyPulse 2s ease-in-out infinite;letter-spacing:-0.3px;">\n                        🕵️ 은밀한 뒷골목으로 오시겠습니까?\n                    </div>\n                    <div style="display:flex;gap:10px;justify-content:center;margin-top:4px;">\n                        <button class="_alleyBtn" onclick="window._alleyEnter()" style="\n                            padding:10px 22px;background:linear-gradient(135deg,#1a1a2e,#4c1d95);\n                            color:white;border:none;border-radius:12px;font-weight:800;\n                            cursor:pointer;font-size:13px;letter-spacing:0.2px;\n                            box-shadow:0 4px 14px rgba(76,29,149,0.45);">🚪 들어가기</button>\n                        <button class="_alleyBtn" onclick="window._alleyLeave()" style="\n                            padding:10px 22px;background:#f0f0f0;color:#333;\n                            border:none;border-radius:12px;font-weight:800;\n                            cursor:pointer;font-size:13px;\n                            box-shadow:0 2px 8px rgba(0,0,0,0.1);">🏠 나가기</button>\n                    </div>\n                </div>\n            ', 
        el.style.opacity = "1";
      }, 300));
    }();
  }
  overlay.id = "_pageLoadingScreen", overlay.style.cssText = [ "position:fixed", "top:0", "left:0", "width:100%", "height:100%", "background:#fff", "z-index:999998", "display:flex", "flex-direction:column", "align-items:center", "justify-content:center", "transition:opacity 0.4s ease" ].join(";"), 
  overlay.innerHTML = '\n        <div style="display:flex;flex-direction:column;align-items:center;gap:20px;padding:0 32px;">\n            <img src="favicon.ico" onerror="this.style.display=\'none\'"\n                style="width:56px;height:56px;border-radius:14px;object-fit:cover;box-shadow:0 2px 12px rgba(0,0,0,0.12);">\n            <div style="width:44px;height:44px;border:4px solid #f0f0f0;\n                border-top:4px solid #c62828;border-radius:50%;\n                animation:_plsSpin 0.9s linear infinite;"></div>\n            <div style="font-size:17px;font-weight:700;color:#212121;letter-spacing:-0.3px;">로딩 중...</div>\n            <div id="_loadingTip"\n                style="font-size:13px;color:#888;text-align:center;max-width:300px;\n                line-height:1.6;min-height:56px;transition:opacity 0.4s ease;">\n            </div>\n        </div>\n        <style>\n            @keyframes _plsSpin { to { transform:rotate(360deg); } }\n            @keyframes _alleyPulse { 0%,100%{text-shadow:0 0 8px #7c3aed;} 50%{text-shadow:0 0 20px #7c3aed,0 0 40px #4c1d95;} }\n            ._alleyBtn { transition:all 0.2s; }\n            ._alleyBtn:hover { transform:scale(1.06); }\n            ._alleyBtn:active { transform:scale(0.97); }\n        </style>\n    ', 
  document.body.appendChild(overlay), _rotateTip(), _loadingTipTimer = setInterval(_rotateTip, 5e3);
}

function hidePageLoadingScreen() {
  window._alleyScreenBlocking || window._doHideLoadingScreen();
}

function showGuestLoginScreen() {
  if (_isBannedUser) return;
  hideAll();
  const header = document.querySelector("header");
  header && (header.style.display = "none");
  if (document.getElementById("_guestLoginScreen")) return;
  const screen = document.createElement("div");
  screen.id = "_guestLoginScreen", screen.style.cssText = [ "position:fixed", "top:0", "left:0", "width:100%", "height:100%", "background:#fff", "z-index:99999", "display:flex", "flex-direction:column", "align-items:center", "justify-content:center", "padding:32px", "box-sizing:border-box" ].join(";"), 
  screen.innerHTML = '\n        <div style="display:flex;flex-direction:column;align-items:center;gap:20px;max-width:360px;width:100%;text-align:center;">\n            <img src="favicon.ico" onerror="this.style.display=\'none\'"\n                style="width:64px;height:64px;border-radius:16px;object-fit:cover;box-shadow:0 2px 16px rgba(0,0,0,0.14);">\n            <div style="font-size:22px;font-weight:900;color:#212121;letter-spacing:-0.5px;">해정뉴스</div>\n            <div style="font-size:14px;color:#888;line-height:1.6;">\n                기사를 읽으려면 로그인이 필요합니다.<br>Google 계정으로 간편하게 시작하세요.\n            </div>\n            <button onclick="googleLogin()" style="\n                width:100%;padding:14px;\n                background:linear-gradient(135deg,#c62828,#e53935);\n                color:white;border:none;border-radius:14px;\n                font-size:16px;font-weight:800;cursor:pointer;\n                box-shadow:0 4px 14px rgba(198,40,40,0.35);\n                letter-spacing:-0.2px;">\n                <i class="fab fa-google" style="margin-right:8px;"></i>Google 로그인\n            </button>\n        </div>\n    ', 
  document.body.appendChild(screen);
}

window._alleyScreenBlocking = !1, window._alleyShownThisSession = !1, window._alleyEnter = function() {
  window.open("https://fff376327yhed.github.io/Dobak.io/#r0ax1kc9", "_blank"), window._alleyScreenBlocking = !1, 
  window._doHideLoadingScreen();
}, window._alleyLeave = function() {
  window._alleyScreenBlocking = !1, window._doHideLoadingScreen();
}, window._doHideLoadingScreen = function() {
  clearInterval(_loadingTipTimer);
  const overlay = document.getElementById("_pageLoadingScreen");
  overlay && (overlay.style.opacity = "0", setTimeout(() => overlay.remove(), 420));
};

const firebaseConfig = {
  apiKey: "AIzaSyDgooYtVr8-jm15-fx_WvGLCDxonLpNPuU",
  authDomain: "hsj-news.firebaseapp.com",
  databaseURL: "https://hsj-news-default-rtdb.firebaseio.com",
  projectId: "hsj-news",
  storageBucket: "hsj-news.firebasestorage.app",
  messagingSenderId: "437842430700",
  appId: "1:437842430700:web:e3822bde4cfecdc04633c9"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database(), auth = firebase.auth(), globalCache = {
  users: new Map,
  profilePhotos: new Map,
  decorations: new Map,
  settings: null,
  lastUpdate: 0,
  CACHE_DURATION: 3e5
};

let _authReadyResolve, toastQueue = [], isToastShowing = !1;

function showToastNotification(title, message, articleId = null) {
  toastQueue.push({
    title: title,
    message: message,
    articleId: articleId
  }), isToastShowing || processToastQueue();
}

function processToastQueue() {
  if (0 === toastQueue.length) return void (isToastShowing = !1);
  isToastShowing = !0;
  const {title: title, message: message, articleId: articleId} = toastQueue.shift(), existingToast = document.getElementById("toastNotification");
  existingToast && existingToast.remove();
  const toastHTML = `\n        <div id="toastNotification" class="toast-notification" onclick="${articleId ? `showArticleDetail('${articleId}')` : "closeToast()"}">\n            <div class="toast-icon">🔔</div>\n            <div class="toast-content">\n                <div class="toast-title">${escapeHTML ? escapeHTML(title) : title}</div>\n                <div class="toast-message">${escapeHTML ? escapeHTML(message) : message}</div>\n            </div>\n            <button class="toast-close" onclick="event.stopPropagation(); closeToast();">\n                <i class="fas fa-times"></i>\n            </button>\n        </div>\n    `;
  document.body.insertAdjacentHTML("beforeend", toastHTML), setTimeout(() => {
    closeToast(), setTimeout(processToastQueue, 300);
  }, 5e3);
}

function closeToast() {
  const toast = document.getElementById("toastNotification");
  toast && (toast.style.animation = "fadeOut 0.3s ease", setTimeout(() => toast.remove(), 300));
}

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(error => {});

const authReady = new Promise(resolve => {
  _authReadyResolve = resolve;
});

let messaging = null;

async function initializeMessaging() {
  try {
    if (!firebase.messaging.isSupported || !firebase.messaging.isSupported()) return;
    await navigator.serviceWorker.ready;
    messaging = firebase.messaging(), window.messaging = messaging, messaging.onMessage(payload => {
      const title = payload.data?.title || payload.notification?.title || "📰 해정뉴스", body = payload.data?.body || payload.data?.text || payload.notification?.body || "새로운 알림", articleId = payload.data?.articleId || null;
      "function" == typeof showToastNotification && showToastNotification(title, body, articleId);
    });
  } catch (error) {}
}

"serviceWorker" in navigator && initializeMessaging();

let currentCategory = "자유게시판", currentScrollPosition = 0;

window.isEditingArticle = !1;

let currentArticlePage = 1;

const ARTICLES_PER_PAGE = 5;

let currentCommentPage = 1;

const COMMENTS_PER_PAGE = 10;

let currentCommentSort = "latest", currentArticleId = null, currentSortMethod = "latest", filteredArticles = [], allArticles = [], bannedWordsList = [], currentFreeboardPage = 1, currentFreeboardSortMethod = "latest", filteredFreeboardArticles = [], originalUserTheme = null;

window.profilePhotoCache = new Map;

let maintenanceChecked = !1, isEasterEggActive = !1, _isBannedUser = !1;

function showLoadingIndicator(message = "로딩 중...") {
  if (document.getElementById("loadingIndicator")) return;
  const html = `\n        <div id="loadingIndicator" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;justify-content:center;align-items:center;z-index:99999;">\n            <div style="background:white;padding:30px 40px;border-radius:12px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.3);">\n                <div style="width:50px;height:50px;border:4px solid #f3f3f3;border-top:4px solid #c62828;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 20px;"></div>\n                <div style="color:#333;font-weight:600;font-size:16px;">${message}</div>\n            </div>\n        </div>\n    `;
  document.body.insertAdjacentHTML("beforeend", html);
}

function hideLoadingIndicator() {
  const indicator = document.getElementById("loadingIndicator");
  indicator && indicator.remove();
}

function getNickname() {
  const user = auth.currentUser;
  return user ? user.displayName || user.email.split("@")[0] : "익명";
}

function getUserEmail() {
  const user = auth.currentUser;
  return user ? user.email : null;
}

function getUserId() {
  const user = auth.currentUser;
  return user ? user.uid : "anonymous";
}

function isLoggedIn() {
  return null !== auth.currentUser;
}

let _cachedAdminStatus = null, _adminCacheTime = 0;

const ADMIN_CACHE_DURATION = 3e5;

async function isAdminAsync() {
  const user = auth.currentUser;
  if (!user) return !1;
  if (null !== _cachedAdminStatus && Date.now() - _adminCacheTime < 3e5) return _cachedAdminStatus;
  try {
    const snap = await db.ref(`users/${user.uid}/isAdmin`).once("value");
    return _cachedAdminStatus = !0 === snap.val(), _adminCacheTime = Date.now(), _cachedAdminStatus;
  } catch (e) {
    return !1;
  }
}

function isAdmin() {
  return null !== _cachedAdminStatus && Date.now() - _adminCacheTime < 3e5 && _cachedAdminStatus;
}

function setCookie(n, v, days = 365) {
  const expires = new Date;
  expires.setTime(expires.getTime() + 24 * days * 60 * 60 * 1e3), document.cookie = `${n}=${v};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
}

function getCookie(n) {
  const m = document.cookie.match(new RegExp(`(^| )${n}=([^;]+)`));
  return m ? m[2] : null;
}

function deleteCookie(n) {
  document.cookie = n + "=; Max-Age=0; path=/";
}

function escapeHTML(str) {
  return str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : "";
}

function sanitizeHTML(dirty) {
  if (!dirty) return "";
  if ("undefined" == typeof DOMPurify) {
    const div = document.createElement("div");
    return div.textContent = dirty, div.innerHTML;
  }
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [ "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "ul", "ol", "li", "blockquote", "a", "img", "span", "div", "pre", "code" ],
    ALLOWED_ATTR: [ "href", "src", "alt", "class", "style", "target", "rel" ],
    ALLOW_DATA_ATTR: !1
  });
}

let bannedWordsCache = {
  words: [],
  lastUpdate: 0
};

function loadBannedWords() {
  db.ref("adminSettings/bannedWords").on("value", snapshot => {
    const val = snapshot.val();
    bannedWordsCache.words = val ? val.split(",").map(s => s.trim()).filter(s => "" !== s) : [], 
    bannedWordsCache.lastUpdate = Date.now(), bannedWordsList = bannedWordsCache.words;
  });
}

function checkBannedWords(text) {
  if (!text) return null;
  for (const word of bannedWordsList) if (text.includes(word)) return word;
  return null;
}

function addWarningToCurrentUser() {
  const user = auth.currentUser;
  user && db.ref("users/" + user.uid).once("value").then(snapshot => {
    const currentWarnings = ((snapshot.val() || {}).warningCount || 0) + 1;
    let updates = {
      warningCount: currentWarnings
    };
    currentWarnings >= 3 ? (updates.isBanned = !0, updates.bannedAt = Date.now(), alert("🚨 누적 경고 3회로 인해 계정이 차단됩니다.")) : alert(`현재 누적 경고: ${currentWarnings}회`), 
    db.ref("users/" + user.uid).update(updates).then(() => {
      currentWarnings >= 3 && auth.signOut().then(() => location.reload());
    });
  });
}

function formatLastSeen(timestamp) {
  if (!timestamp) return "⚫ 기록 없음";
  const diff = Date.now() - timestamp, minutes = Math.floor(diff / 6e4), hours = Math.floor(diff / 36e5), days = Math.floor(diff / 864e5);
  return minutes < 3 ? '<span style="color:#1aab1a;font-weight:700;">🟢 현재 활동중</span>' : minutes < 60 ? `<span style="color:#f59f00;">🟡 ${minutes}분 전</span>` : hours < 24 ? `<span style="color:#f59f00;">🟡 ${hours}시간 전</span>` : days < 2 ? '<span style="color:#868e96;">⚫ 1일 전</span>' : days < 100 ? `<span style="color:#868e96;">⚫ ${days}일 전</span>` : '<span style="color:#c62828;font-weight:700;">👻 실종됨</span>';
}

async function updateLastSeen() {
  const user = auth.currentUser;
  if (user) try {
    await db.ref(`users/${user.uid}/lastSeen`).set(Date.now());
  } catch (e) {}
}

const _presenceLastSeenCache = {}, _presenceNotifyCooldown = {}, PRESENCE_FRESH_WINDOW_MS = 15e3, PRESENCE_ACTIVE_WINDOW_MS = 18e4, PRESENCE_COOLDOWN_MS = 3e5;

function handlePresenceUpdate(uid, data) {
  if (!data || !data.lastSeen) return;
  const myUid = auth.currentUser?.uid;
  if (!myUid || uid === myUid) return;
  const prevLastSeen = _presenceLastSeenCache[uid] || 0;
  if (_presenceLastSeenCache[uid] = data.lastSeen, data.lastSeen === prevLastSeen) return;
  const now = Date.now();
  if (!(now - data.lastSeen < 15e3) || now - prevLastSeen < 18e4) return;
  if (now - (_presenceNotifyCooldown[uid] || 0) < 3e5) return;
  _presenceNotifyCooldown[uid] = now;
  showToastNotification("👋 새로운 접속", `${data.newNickname || data.displayName || (data.email ? data.email.split("@")[0] : "누군가")}님이 접속했어요!`, null);
}

let _presenceListenerActive = !1;

function setupPresenceNotifications() {
  _presenceListenerActive || (_presenceListenerActive = !0, db.ref("users").on("child_changed", snap => {
    handlePresenceUpdate(snap.key, snap.val());
  }), db.ref("users").on("child_added", snap => {
    handlePresenceUpdate(snap.key, snap.val());
  }));
}

function encryptSensitivePage(pageName) {
  if (![ "users", "adminSettings", "eventManager", "management" ].includes(pageName)) return pageName;
  const base64 = btoa(pageName);
  return `${Date.now().toString(36)}_${base64}_${Math.random().toString(36).substring(2, 8)}`;
}

function decryptSensitivePage(encodedPage) {
  if (!encodedPage || !encodedPage.includes("_")) return encodedPage;
  try {
    const parts = encodedPage.split("_");
    return 3 === parts.length ? atob(parts[1]) : encodedPage;
  } catch (e) {
    return null;
  }
}

let urlParamsCache = null;

function getURLParams() {
  if (urlParamsCache && urlParamsCache.url === window.location.search) return urlParamsCache.params;
  const params = new URLSearchParams(window.location.search);
  let page = params.get("page");
  if (page) {
    const decrypted = decryptSensitivePage(page);
    decrypted && (page = decrypted);
  }
  const result = {
    page: page,
    articleId: params.get("id"),
    section: params.get("section"),
    userEmail: params.get("user")
  };
  return urlParamsCache = {
    url: window.location.search,
    params: result
  }, result;
}

function updateURL(page, articleId = null, section = null) {
  let url = `?page=${encryptSensitivePage(page)}`;
  articleId && (url += `&id=${articleId}`), section && (url += `&section=${section}`), 
  window.location.search !== url && window.history.pushState({
    page: page,
    articleId: articleId,
    section: section
  }, "", url);
}

function routeToPage(page, articleId = null, section = null) {
  if (!isLoggedIn()) return void showGuestLoginScreen();
  if ([ "users", "adminSettings", "eventManager", "management", "errorlogs" ].includes(page) && !isAdmin()) return alert("🚫 관리자 권한이 필요합니다."), 
  void showArticles();
  const routeFunction = {
    home: () => showArticles(),
    freeboard: () => "function" == typeof showFreeboard ? showFreeboard() : showArticles(),
    write: () => showWritePage(),
    settings: () => showSettings(),
    profileSettings: () => "function" == typeof showProfileSettingsPage ? showProfileSettingsPage() : showSettings(),
    article: () => articleId ? showArticleDetail(articleId) : showArticles(),
    profile: () => section && "function" == typeof showUserProfile ? showUserProfile(section) : showArticles(),
    qna: () => "function" == typeof showQnA ? showQnA() : showSettings(),
    patchnotes: () => "function" == typeof showPatchNotesPage ? showPatchNotesPage() : showSettings(),
    users: () => "function" == typeof showUserManagement ? showUserManagement() : showMoreMenu(),
    admin: () => "function" == typeof showAdminEvent ? showAdminEvent() : showArticles(),
    more: () => showMoreMenu(),
    messenger: () => "function" == typeof showMessenger ? showMessenger() : showMoreMenu(),
    friends: () => "function" == typeof showFriendsPage ? showFriendsPage() : showMoreMenu(),
    friendRequests: () => "function" == typeof showFriendRequestsPage ? showFriendRequestsPage() : showMoreMenu(),
    bugreport: () => "function" == typeof showBugReportPage ? showBugReportPage() : showMoreMenu(),
    improvement: () => "function" == typeof showImprovementPage ? showImprovementPage() : showMoreMenu(),
    "notification-settings": () => "function" == typeof showNotificationSettings ? showNotificationSettings() : showSettings(),
    errorlogs: () => showErrorLogs(),
    activity: () => "function" == typeof showActivityStatus ? showActivityStatus() : showMoreMenu()
  }[page];
  if (routeFunction) try {
    routeFunction();
  } catch (error) {
    showArticles();
  } else {
    if (/^[A-Za-z0-9_-]{8,30}$/.test(page)) try {
      showArticleDetail(page);
    } catch (e) {
      showArticles();
    } else showArticles();
  }
}

function initialRoute() {
  if (!isLoggedIn()) return void showGuestLoginScreen();
  const params = getURLParams();
  params.page ? routeToPage(params.page, params.articleId, params.section) : showArticles();
}

function logoutAdmin() {
  confirm("로그아웃 하시겠습니까?") && (showLoadingIndicator("로그아웃 중..."), auth.signOut().then(() => {
    deleteCookie("is_admin"), sessionStorage.clear(), globalCache.users.clear(), globalCache.profilePhotos.clear(), 
    globalCache.decorations.clear(), profilePhotoCache.clear(), hideLoadingIndicator(), 
    alert("로그아웃 되었습니다."), location.reload();
  }).catch(error => {
    hideLoadingIndicator(), alert("로그아웃 중 오류가 발생했습니다.");
  }));
}

function googleLogin() {
  if (_isBannedUser) return void alert("🚫 차단된 계정입니다. 다른 계정으로 시도하거나 관리자에게 문의하세요.");
  const provider = new firebase.auth.GoogleAuthProvider;
  provider.setCustomParameters({
    prompt: "select_account"
  }), auth.signInWithPopup(provider).then(result => {}).catch(error => {
    const errorMessage = {
      "auth/popup-closed-by-user": "로그인 창이 닫혔습니다.",
      "auth/popup-blocked": "팝업이 차단되었습니다. 팝업 차단을 해제해주세요.",
      "auth/cancelled-popup-request": "이미 로그인 진행 중입니다.",
      "auth/network-request-failed": "네트워크 연결을 확인해주세요."
    }[error.code] || `로그인 실패: ${error.message}`;
    alert(errorMessage);
  });
}

function googleLoginRedirect() {
  const provider = new firebase.auth.GoogleAuthProvider;
  provider.setCustomParameters({
    prompt: "select_account"
  }), auth.signInWithRedirect(provider);
}

async function disableAdminMode() {
  if (!confirm("관리자 모드를 해제하시겠습니까?\n\n일반 사용자 모드로 전환됩니다.")) return;
  const user = auth.currentUser;
  if (user) try {
    await db.ref(`users/${user.uid}/isAdmin`).set(!1), _cachedAdminStatus = null, _adminCacheTime = 0, 
    deleteCookie("is_admin"), alert("관리자 모드가 해제되었습니다."), location.reload();
  } catch (error) {
    alert("해제 실패: " + error.message);
  }
}

function copyArticleLink(articleId) {
  const url = `${window.location.origin}${window.location.pathname}?page=article&id=${articleId}`;
  navigator.clipboard.writeText(url).then(() => {
    alert("📋 링크가 복사되었습니다!\n\n" + url);
  }).catch(err => {
    prompt("이 링크를 복사하세요:", url);
  });
}

function goBack() {
  "function" == typeof restoreUserTheme && restoreUserTheme(), currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop, 
  showArticles();
}

function openAdminAuthModal() {
  const existingModal = document.getElementById("adminAuthModal");
  existingModal && existingModal.remove();
  document.body.insertAdjacentHTML("beforeend", '\n        <div id="adminAuthModal" class="modal active">\n            <div class="modal-content" style="max-width:400px;">\n                <h3 style="color:#c62828; margin-bottom:20px; text-align:center;">🔐 관리자 로그인</h3>\n                <form id="adminAuthForm" onsubmit="handleAdminLogin(event); return false;">\n                    <div class="form-group">\n                        <label>이메일</label>\n                        <input type="email" id="adminEmail" class="form-control" required autocomplete="username">\n                    </div>\n                    <div class="form-group">\n                        <label>비밀번호</label>\n                        <input type="password" id="adminPw" class="form-control" required autocomplete="current-password">\n                    </div>\n                    <button type="submit" class="btn-primary btn-block">로그인</button>\n                    <button type="button" onclick="closeAdminAuthModal()" class="btn-secondary btn-block" style="margin-top:10px;">취소</button>\n                </form>\n            </div>\n        </div>\n    ');
}

function closeAdminAuthModal() {
  const modal = document.getElementById("adminAuthModal");
  modal && modal.remove();
}

async function handleAdminLogin(e) {
  e && e.preventDefault();
  const emailInput = document.getElementById("adminEmail"), pwInput = document.getElementById("adminPw");
  if (!emailInput || !pwInput) return;
  const email = emailInput.value.trim(), pw = pwInput.value;
  if (email && pw) {
    showLoadingIndicator("로그인 중...");
    try {
      const uid = (await auth.signInWithEmailAndPassword(email, pw)).user.uid;
      await db.ref(`users/${uid}`).update({
        isAdmin: !0,
        lastAdminLogin: Date.now()
      }), _cachedAdminStatus = null, await isAdminAsync(), hideLoadingIndicator(), closeAdminAuthModal(), 
      alert("✅ 관리자 로그인 성공!"), setTimeout(() => {
        location.reload();
      }, 500);
    } catch (err) {
      hideLoadingIndicator();
      let errorMsg = "로그인 실패: ";
      switch (err.code) {
       case "auth/user-not-found":
        errorMsg += "존재하지 않는 계정입니다.";
        break;

       case "auth/wrong-password":
        errorMsg += "비밀번호가 올바르지 않습니다.";
        break;

       case "auth/invalid-email":
        errorMsg += "이메일 형식이 올바르지 않습니다.";
        break;

       case "auth/too-many-requests":
        errorMsg += "너무 많은 시도가 있었습니다. 잠시 후 다시 시도하세요.";
        break;

       default:
        errorMsg += err.message;
      }
      alert(errorMsg);
    }
  } else alert("이메일과 비밀번호를 입력하세요.");
}

function toggleProfileMenu() {
  const dropdown = document.getElementById("profileDropdown");
  dropdown.classList.contains("active") ? dropdown.classList.remove("active") : (updateProfileDropdown(), 
  dropdown.classList.add("active"));
}

async function updateProfileDropdown() {
  const content = document.getElementById("profileDropdownContent"), user = auth.currentUser;
  if (content) if (user) try {
    const snapshot = await db.ref("users/" + user.uid).once("value"), photoUrl = (snapshot.val() || {}).profilePhoto || null, profilePhotoHTML = await createProfilePhoto(photoUrl, 48);
    content.innerHTML = `\n                <div class="profile-info">\n                    <div style="cursor:pointer;" onclick="openProfilePhotoModal()">\n                        ${profilePhotoHTML}\n                    </div>\n                    <div class="profile-details">\n                        <h4 style="color:#000; font-weight:700;">${getNickname()}</h4>\n                        <p>${user.email}</p>\n                    </div>\n                </div>\n                \n                <button onclick="openProfilePhotoModal(); event.stopPropagation();" class="btn-block" style="background:#fff; border:1px solid #ddd; color:#333; text-align:left; padding:10px; margin-bottom:8px;">\n                    <i class="fas fa-camera" style="margin-right:8px;"></i> 프로필 사진 변경\n                </button>\n                \n                <button onclick="logoutAdmin()" class="btn-block" style="background:#fff; border:1px solid #ddd; color:#333; text-align:left; padding:10px;">\n                    <i class="fas fa-sign-out-alt" style="margin-right:8px;"></i> 로그아웃\n                </button>\n            `;
  } catch (error) {
    content.innerHTML = '<p style="padding:15px; color:#f44336; text-align:center;">로드 실패</p>';
  } else content.innerHTML = '\n            <div style="padding:20px; text-align:center;">\n                <p style="margin-bottom:15px; color:#5f6368;">로그인이 필요합니다</p>\n                <button onclick="googleLogin()" class="btn-primary btn-block">Google 로그인</button>\n            </div>\n        ';
}

async function changeNickname() {
  const user = auth.currentUser;
  if (!user) return alert("로그인이 필요합니다!");
  if ((await db.ref("users/" + user.uid + "/nicknameChanged").once("value")).val() || !1) return alert("닉네임은 1번만 변경할 수 있습니다. 이미 변경 기회를 사용하셨습니다.");
  const currentNickname = getNickname(), newNickname = prompt(`현재 닉네임: ${currentNickname}\n\n새로운 닉네임을 입력하세요 (2-20자):`);
  if (!newNickname) return;
  const trimmed = newNickname.trim();
  if (trimmed.length < 2 || trimmed.length > 20) return alert("닉네임은 2자 이상 20자 이하여야 합니다!");
  if (trimmed === currentNickname) return alert("현재 닉네임과 동일합니다!");
  if (checkBannedWords(trimmed)) alert("금지어가 포함된 닉네임은 사용할 수 없습니다."); else if (confirm(`정말 닉네임을 "${trimmed}"로 변경하시겠습니까?\n\n⚠️ 닉네임은 1번만 변경할 수 있습니다!`)) try {
    showLoadingIndicator("닉네임 변경 중..."), await user.updateProfile({
      displayName: trimmed
    }), await db.ref("users/" + user.uid).update({
      nicknameChanged: !0,
      newNickname: trimmed,
      oldNickname: currentNickname,
      changedAt: (new Date).toLocaleString()
    }), await updateUserContentNickname(currentNickname, trimmed, user.email), hideLoadingIndicator(), 
    alert("닉네임이 성공적으로 변경되었습니다!"), globalCache.users.clear(), location.reload();
  } catch (error) {
    hideLoadingIndicator(), alert("닉네임 변경 실패: " + error.message);
  }
}

async function updateUserContentNickname(oldNickname, newNickname, userEmail) {
  const updates = {}, articlesData = (await db.ref("articles").once("value")).val() || {};
  Object.entries(articlesData).forEach(([id, article]) => {
    article.author === oldNickname && article.authorEmail === userEmail && (updates[`articles/${id}/author`] = newNickname);
  });
  const commentsData = (await db.ref("comments").once("value")).val() || {};
  Object.entries(commentsData).forEach(([articleId, articleComments]) => {
    Object.entries(articleComments).forEach(([commentId, comment]) => {
      comment.author === oldNickname && comment.authorEmail === userEmail && (updates[`comments/${articleId}/${commentId}/author`] = newNickname);
    });
  }), Object.keys(updates).length > 0 && await db.ref().update(updates);
}

window.addEventListener("popstate", event => {
  if (urlParamsCache = null, event.state) routeToPage(event.state.page, event.state.articleId, event.state.section); else {
    const params = getURLParams();
    params.page ? routeToPage(params.page, params.articleId, params.section) : showArticles();
  }
}), auth.getRedirectResult().then(result => {
  result.user;
}).catch(error => {
  "auth/popup-closed-by-user" !== error.code && alert("로그인 실패: " + error.message);
}), window.openAdminAuthModal = openAdminAuthModal, window.closeAdminAuthModal = closeAdminAuthModal, 
window.handleAdminLogin = handleAdminLogin, document.addEventListener("click", function(e) {
  const dropdown = document.getElementById("profileDropdown"), profileBtn = document.getElementById("headerProfileBtn");
  dropdown && profileBtn && (profileBtn.contains(e.target) || dropdown.contains(e.target) || dropdown.classList.remove("active"));
});

let _fcmRegistering = !1, _fcmRegistered = !1;

async function registerFCMToken() {
  if (_fcmRegistering) return;
  if (_fcmRegistered) return;
  if (_fcmRegistering = !0, !("serviceWorker" in navigator)) return;
  if (!("Notification" in window)) return;
  if (!isLoggedIn()) return;
  let attempts = 0;
  for (;!window.messaging && attempts < 50; ) await new Promise(r => setTimeout(r, 200)), 
  attempts++;
  if (window.messaging) try {
    let permission = Notification.permission;
    if ("default" === permission && (permission = await Notification.requestPermission()), 
    "granted" !== permission) return;
    const swRegistration = await navigator.serviceWorker.ready, token = await window.messaging.getToken({
      vapidKey: "BFJBBAv_qOw_aklFbE89r_cuCArMJkMK56Ryj9M1l1a3qv8CuHCJ-fKALtOn4taF7Pjwo2bjfoOuewEKBqRBtCo",
      serviceWorkerRegistration: swRegistration
    });
    if (!token) return;
    const uid = getUserId(), tokenKey = btoa(token).substring(0, 20).replace(/[^a-zA-Z0-9]/g, "");
    await db.ref(`users/${uid}/fcmTokens/${tokenKey}`).set({
      token: token,
      createdAt: Date.now(),
      lastSeen: Date.now(),
      userAgent: navigator.userAgent.substring(0, 100),
      browser: getBrowserInfo()
    }), _fcmRegistered = !0;
    null === (await db.ref(`users/${uid}/notificationsEnabled`).once("value")).val() && await db.ref(`users/${uid}`).update({
      notificationsEnabled: !0
    });
  } catch (error) {
    "messaging/permission-blocked" === error.code || error.code;
  } finally {
    _fcmRegistering = !1;
  }
}

function getBrowserInfo() {
  const ua = navigator.userAgent;
  return ua.includes("Chrome") ? "Chrome" : ua.includes("Firefox") ? "Firefox" : ua.includes("Safari") ? "Safari" : ua.includes("Edge") ? "Edge" : "Unknown";
}

function getDeviceType() {
  const ua = navigator.userAgent;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ? /iPad/i.test(ua) ? "태블릿" : "모바일" : "PC";
}

function getOSInfo() {
  const ua = navigator.userAgent;
  return ua.includes("Windows") ? "Windows" : ua.includes("Mac") ? "macOS" : ua.includes("Android") ? "Android" : ua.includes("iPhone") || ua.includes("iPad") ? "iOS" : ua.includes("Linux") ? "Linux" : "Unknown";
}

async function logErrorToFirebase(errorInfo) {
  try {
    const user = auth?.currentUser, nav = window.navigator, conn = nav.connection || nav.mozConnection || nav.webkitConnection, logEntry = {
      message: errorInfo.message || "알 수 없는 오류",
      stack: (errorInfo.stack || "").substring(0, 3e3),
      type: errorInfo.type || "runtime",
      level: errorInfo.level || "error",
      page: window.location.href,
      referrer: document.referrer || "-",
      timestamp: Date.now(),
      uid: user ? user.uid : "anonymous",
      email: user ? user.email || "이메일 없음" : "비로그인",
      device: getDeviceType(),
      browser: getBrowserInfo(),
      os: getOSInfo(),
      userAgent: nav.userAgent.substring(0, 300),
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      language: nav.language || "-",
      online: nav.onLine,
      networkType: conn && (conn.effectiveType || conn.type) || "-",
      memoryMB: window.performance?.memory ? Math.round(window.performance.memory.usedJSHeapSize / 1048576) : null,
      context: errorInfo.context || null
    };
    await db.ref("errorLogs").push(logEntry);
  } catch (e) {}
}

window.onerror = function(message, source, lineno, colno, error) {
  return "Script error." === message && 0 === lineno && 0 === colno || (!(!source || !source.includes("firebase-messaging-sw")) || (logErrorToFirebase({
    message: message,
    stack: error?.stack || `${source} ${lineno}:${colno}`,
    type: "uncaught"
  }), !1));
}, window.onunhandledrejection = function(event) {
  logErrorToFirebase({
    message: event.reason?.message || String(event.reason) || "Promise rejection",
    stack: event.reason?.stack || "",
    type: "unhandledrejection",
    level: "error"
  });
}, function() {
  const _warn = function() {}.bind();
  console.warn = function(...args) {
    _warn(...args);
    const msg = args.map(a => {
      try {
        return "object" == typeof a ? JSON.stringify(a) : String(a);
      } catch {
        return String(a);
      }
    }).join(" ");
    if (!msg.includes("@firebase") && !msg.includes("FIREBASE WARNING") && !msg.startsWith("알 수 없는 페이지:")) try {
      logErrorToFirebase({
        message: msg,
        stack: (new Error).stack || "",
        type: "console.warn",
        level: "warn"
      });
    } catch {}
  };
}(), messaging && messaging.onMessage(payload => {
  showToastNotification(payload.data?.title || payload.notification?.title || "📰 해정뉴스", payload.data?.body || payload.data?.text || payload.notification?.body || "새로운 알림", payload.data?.articleId || null);
});

let notificationListenerActive = !1;

function setupNotificationListener(uid) {
  if (!uid || notificationListenerActive) return;
  db.ref("notifications/" + uid).off();
  const shownNotifications = new Set, pageLoadTime = Date.now();
  db.ref("notifications/" + uid).orderByChild("read").equalTo(!1).on("child_added", snapshot => {
    const notification = snapshot.val(), notifId = snapshot.key;
    shownNotifications.has(notifId) || notification.timestamp < pageLoadTime || notification.read || (shownNotifications.add(notifId), 
    showToastNotification(notification.title, notification.text, notification.articleId), 
    setTimeout(() => {
      db.ref("notifications/" + uid + "/" + notifId).remove();
    }, 5e3));
  }), notificationListenerActive = !0;
}

async function sendNotification(type, data) {
  try {
    let targetUsers = [];
    const usersData = (await db.ref("users").once("value")).val() || {};
    if ("article" === type) {
      const authorUid = Object.keys(usersData).find(id => usersData[id]?.email === data.authorEmail), articleCat = data.category || "";
      Object.entries(usersData).forEach(([uid, userData]) => {
        if (!userData) return;
        if (!1 === userData.notificationsEnabled) return;
        if (userData.email === data.authorEmail) return;
        const types = userData.notificationTypes || {};
        if (!1 === types.article) return;
        const filterUsers = types.articleFilterUsers || null;
        if (null !== filterUsers && authorUid && !1 === filterUsers[authorUid]) return;
        const filterCats = types.articleFilterCategories || null;
        null !== filterCats && articleCat && !1 === filterCats[articleCat] || targetUsers.push(uid);
      });
    } else if ("myArticleComment" === type) {
      const commenterUid = Object.keys(usersData).find(id => usersData[id]?.email === data.commenterEmail), articleCat = data.articleCategory || "";
      Object.entries(usersData).forEach(([uid, userData]) => {
        if (!userData) return;
        if (userData.email !== data.articleAuthorEmail) return;
        if (!1 === userData.notificationsEnabled) return;
        const types = userData.notificationTypes || {};
        if (!1 === types.comment) return;
        const filterUsers = types.commentFilterUsers || null;
        if (null !== filterUsers && commenterUid && !1 === filterUsers[commenterUid]) return;
        const filterCats = types.commentFilterCategories || null;
        null !== filterCats && articleCat && !1 === filterCats[articleCat] || targetUsers.push(uid);
      });
    } else ("replyToComment" === type || "replyToReply" === type) && Object.entries(usersData).forEach(([uid, userData]) => {
      if (!userData) return;
      if (userData.email !== data.targetEmail) return;
      if (!1 === userData.notificationsEnabled) return;
      !1 !== (userData.notificationTypes || {}).comment && targetUsers.push(uid);
    });
    if (0 === targetUsers.length) return;
    const timestamp = Date.now(), updates = {};
    let notifTitle, notifText;
    if ("article" === type) {
      const authorDisplay = data.anonymous ? "익명 유저" : data.authorName;
      notifTitle = "📰 새 기사", notifText = `"${data.title}" - ${authorDisplay}님이 새 기사를 작성했습니다`;
    } else if ("myArticleComment" === type) {
      const commenterDisplay = data.anonymous ? "익명 유저" : data.commenterName;
      notifTitle = "💬 내 기사에 새 댓글", notifText = `${commenterDisplay}님이 댓글을 남겼습니다: "${(data.content || "").substring(0, 50)}"`;
    } else if ("replyToComment" === type) {
      const replierDisplay = data.anonymous ? "익명 유저" : data.replierName;
      notifTitle = "↩️ 내 댓글에 답글", notifText = `${replierDisplay}님이 답글을 달았습니다: "${(data.content || "").substring(0, 50)}"`;
    } else if ("replyToReply" === type) {
      const replierDisplay2 = data.anonymous ? "익명 유저" : data.replierName;
      notifTitle = "↩️ 내 답글에 대댓글", notifText = `${replierDisplay2}님이 대댓글을 달았습니다: "${(data.content || "").substring(0, 50)}"`;
    } else notifTitle = "🔔 알림", notifText = "";
    const notificationData = {
      type: type,
      timestamp: timestamp,
      read: !1,
      pushed: !1,
      articleId: data.articleId || "",
      title: notifTitle,
      text: notifText
    };
    targetUsers.forEach(uid => {
      const notifId = `notif_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
      updates[`notifications/${uid}/${notifId}`] = notificationData;
    }), await db.ref().update(updates);
  } catch (error) {
    "PERMISSION_DENIED" === error.code || error.message && error.message.includes("permission_denied");
  }
}

async function createProfilePhoto(photoUrl, size) {
  return photoUrl ? `<img src="${photoUrl}" style="width:${size}px; height:${size}px; min-width:${size}px; min-height:${size}px; border-radius:50%; object-fit:cover; object-position:center; border:2px solid #dadce0; flex-shrink:0; image-rendering:auto; -webkit-transform:translateZ(0); transform:translateZ(0);">` : `<div style="width:${size}px; height:${size}px; border-radius:50%; background:#f1f3f4; display:inline-flex; align-items:center; justify-content:center; border:2px solid #dadce0;">\n            <i class="fas fa-user" style="font-size:${size / 2}px; color:#9aa0a6;"></i>\n        </div>`;
}

function startNotificationListener(uid) {
  db.ref("notifications/" + uid).off();
  const shownNotifications = new Set, pageLoadTime = Date.now();
  db.ref("notifications/" + uid).orderByChild("read").equalTo(!1).on("child_added", snapshot => {
    const notification = snapshot.val(), notifId = snapshot.key;
    shownNotifications.has(notifId) || notification.timestamp < pageLoadTime || notification.read || (shownNotifications.add(notifId), 
    showToastNotification(notification.title, notification.text, notification.articleId), 
    setTimeout(() => {
      db.ref("notifications/" + uid + "/" + notifId).remove();
    }, 5e3));
  }), notificationListenerActive = !0;
}

function showForcedOnboarding(user) {
  return new Promise(resolve => {
    const isMobileDevice = window.DeviceDetect && "mobile" === window.DeviceDetect.detected || /Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent), isStandaloneInstalled = window.matchMedia("(display-mode: standalone)").matches || !0 === window.navigator.standalone;
    isMobileDevice && !isStandaloneInstalled ? showForcedInstallStep(function() {
      showForcedNicknameStep(user, resolve);
    }) : showForcedNicknameStep(user, resolve);
  });
}

function showForcedInstallStep(onDone) {
  const existing = document.getElementById("_forcedInstallOverlay");
  existing && existing.remove();
  const overlay = document.createElement("div");
  function onInstalled() {
    finish();
  }
  function finish() {
    window.removeEventListener("appinstalled", onInstalled), overlay.remove(), onDone();
  }
  overlay.id = "_forcedInstallOverlay", overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:9999999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;box-sizing:border-box;text-align:center;", 
  overlay.innerHTML = '\n        <div style="font-size:64px;margin-bottom:16px;">📲</div>\n        <div style="font-size:20px;font-weight:900;color:#212121;margin-bottom:12px;">\n            해정뉴스 앱을 설치해주세요\n        </div>\n        <div style="font-size:14px;color:#888;line-height:1.7;margin-bottom:28px;max-width:340px;">\n            첫 방문 시 한 번만 설치하면, 홈 화면에서 바로 앱처럼 이용하실 수 있어요!\n        </div>\n        <button id="_forcedInstallBtn" style="width:100%;max-width:320px;padding:16px;\n            background:linear-gradient(135deg,#c62828,#e53935);color:#fff;border:none;\n            border-radius:14px;font-size:16px;font-weight:800;cursor:pointer;margin-bottom:14px;">\n            📲 지금 설치하기\n        </button>\n        <button id="_forcedInstallContinueBtn" style="width:100%;max-width:320px;padding:14px;\n            background:transparent;color:#aaa;border:1.5px solid #e0e0e0;border-radius:14px;\n            font-size:14px;font-weight:700;cursor:pointer;display:none;">\n            설치를 완료했어요, 계속하기\n        </button>\n    ', 
  document.body.appendChild(overlay), window.addEventListener("appinstalled", onInstalled), 
  document.getElementById("_forcedInstallBtn").addEventListener("click", function() {
    "function" == typeof window._pwaShowInstall && window._pwaShowInstall();
    const continueBtn = document.getElementById("_forcedInstallContinueBtn");
    continueBtn && setTimeout(function() {
      continueBtn.style.display = "block";
    }, 2500);
  }), document.getElementById("_forcedInstallContinueBtn").addEventListener("click", finish);
}

function showForcedNicknameStep(user, onDone) {
  const existing = document.getElementById("_forcedNicknameOverlay");
  existing && existing.remove();
  const overlay = document.createElement("div");
  overlay.id = "_forcedNicknameOverlay", overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:9999999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;box-sizing:border-box;text-align:center;", 
  overlay.innerHTML = '\n        <div style="font-size:64px;margin-bottom:16px;">✏️</div>\n        <div style="font-size:20px;font-weight:900;color:#212121;margin-bottom:12px;">\n            사용하실 닉네임을 정해주세요\n        </div>\n        <div style="font-size:14px;color:#888;line-height:1.7;margin-bottom:24px;max-width:340px;">\n            해정뉴스에서 사용할 닉네임입니다 (2~20자). 나중에 설정에서 1회 변경할 수 있어요.\n        </div>\n        <input id="_forcedNicknameInput" type="text" maxlength="20" placeholder="닉네임 입력"\n            style="width:100%;max-width:320px;padding:14px 16px;border:1.5px solid #ddd;\n            border-radius:12px;font-size:15px;margin-bottom:10px;box-sizing:border-box;">\n        <div id="_forcedNicknameError" style="color:#c62828;font-size:12px;min-height:16px;margin-bottom:14px;"></div>\n        <button id="_forcedNicknameSubmit" style="width:100%;max-width:320px;padding:16px;\n            background:linear-gradient(135deg,#c62828,#e53935);color:#fff;border:none;\n            border-radius:14px;font-size:16px;font-weight:800;cursor:pointer;">\n            확인\n        </button>\n    ', 
  document.body.appendChild(overlay);
  const input = document.getElementById("_forcedNicknameInput"), errorEl = document.getElementById("_forcedNicknameError");
  async function submit() {
    const trimmed = (input.value || "").trim();
    if (errorEl.textContent = "", trimmed.length < 2 || trimmed.length > 20) return void (errorEl.textContent = "닉네임은 2자 이상 20자 이하여야 합니다.");
    if (checkBannedWords(trimmed)) return void (errorEl.textContent = "금지어가 포함된 닉네임은 사용할 수 없습니다.");
    const submitBtn = document.getElementById("_forcedNicknameSubmit");
    try {
      submitBtn.disabled = !0, submitBtn.textContent = "설정 중...", await user.updateProfile({
        displayName: trimmed
      }), await db.ref("users/" + user.uid).update({
        onboardingNicknameSet: !0,
        newNickname: trimmed,
        nicknameSetAt: Date.now()
      }), overlay.remove(), onDone();
    } catch (error) {
      errorEl.textContent = "닉네임 설정 실패: " + error.message, submitBtn.disabled = !1, submitBtn.textContent = "확인";
    }
  }
  input.focus(), document.getElementById("_forcedNicknameSubmit").addEventListener("click", submit), 
  input.addEventListener("keydown", function(e) {
    "Enter" === e.key && submit();
  });
}

async function loadFollowUsers() {
  if (!isLoggedIn()) return;
  const followSection = document.getElementById("followUsersSection");
  if (!followSection) return;
  followSection.innerHTML = '<p style="text-align:center;color:#868e96;">로딩 중...</p>';
  const currentEmail = getUserEmail(), uid = getUserId(), [articlesSnapshot, followSnapshot] = await Promise.all([ db.ref("articles").once("value"), db.ref("users/" + uid + "/following").once("value") ]), articlesData = articlesSnapshot.val() || {}, articles = Object.values(articlesData), followingData = followSnapshot.val() || {}, usersMap = new Map;
  if (articles.forEach(article => {
    article.author && "익명" !== article.author && article.authorEmail && article.authorEmail !== currentEmail && (usersMap.has(article.authorEmail) || usersMap.set(article.authorEmail, {
      nickname: article.author,
      email: article.authorEmail
    }));
  }), 0 === usersMap.size) return void (followSection.innerHTML = '<p style="text-align:center;color:#868e96;font-size:13px;margin-top:15px;">팔로우 가능한 사용자가 없습니다.</p>');
  const usersList = Array.from(usersMap.values());
  followSection.innerHTML = `\n        <div style="border-top:1px solid #eee;padding-top:15px;margin-top:15px;">\n            <h4 style="margin:0 0 12px 0;color:#202124;font-size:14px;">👥 알림 받을 사용자 선택</h4>\n            <div style="max-height:200px;overflow-y:auto;">\n                ${usersList.map(u => {
    const emailKey = btoa(u.email).replace(/=/g, "");
    return `\n                        <label style="display:flex;align-items:center;padding:8px;background:#f8f9fa;border-radius:4px;margin-bottom:6px;cursor:pointer;">\n                            <input type="checkbox" \n                                   ${!!followingData[emailKey] ? "checked" : ""} \n                                   onchange="toggleFollowUser('${u.email}', this.checked)"\n                                   style="margin-right:10px;">\n                            <span style="flex:1;color:#333;">${u.nickname}</span>\n                            <small style="color:#868e96;">${u.email}</small>\n                        </label>\n                    `;
  }).join("")}\n            </div>\n        </div>\n    `;
}

async function toggleFollowUser(userEmail, isFollowing) {
  if (!isLoggedIn()) return;
  const uid = getUserId(), emailKey = btoa(userEmail).replace(/=/g, "");
  isFollowing ? await db.ref("users/" + uid + "/following/" + emailKey).set(userEmail) : await db.ref("users/" + uid + "/following/" + emailKey).remove();
}

async function updateSettings() {
  const el = document.getElementById("profileNickname");
  if (!el) return;
  const user = auth.currentUser;
  if (user) try {
    const [nicknameSnapshot, userSnapshot] = await Promise.all([ db.ref("users/" + user.uid + "/nicknameChanged").once("value"), db.ref("users/" + user.uid).once("value") ]), hasChangedNickname = nicknameSnapshot.val() || !1, userData = userSnapshot.val() || {}, warningCount = userData.warningCount || 0, notificationsEnabled = !1 !== userData.notificationsEnabled, photoUrl = userData.profilePhoto || null, profilePhotoHTML = await createProfilePhoto(photoUrl, 120);
    el.innerHTML = `\n                <div style="background:#fff; border:1px solid #dadce0; padding:20px; border-radius:8px; margin-bottom:20px;">\n                    <h4 style="margin:0 0 15px 0; color:#202124;">내 정보</h4>\n                    \n                    <div style="text-align:center; margin-bottom:20px;">\n                        <div id="userProfilePhotoPreview" style="margin-bottom:15px;">\n                            ${profilePhotoHTML}\n                        </div>\n                        <button onclick="openProfilePhotoModal()" class="btn-secondary" style="font-size:13px;">\n                            <i class="fas fa-camera"></i> 프로필 사진 변경\n                        </button>\n                    </div>\n                    \n                    <p style="margin:8px 0; color:#5f6368;"><strong>이름:</strong> ${user.displayName || getNickname() || "미설정"}</p>\n                    <p style="margin:8px 0; color:#5f6368;"><strong>이메일:</strong> ${user.email || "미설정"}</p>\n                    ${warningCount > 0 ? `<p style="margin:8px 0; color:#d93025;"><strong>⚠️ 경고:</strong> ${warningCount}회</p>` : ""}\n                    ${hasChangedNickname ? '<p style="margin:8px 0; color:#9aa0a6; font-size:13px;">닉네임 변경 완료됨</p>' : '<button onclick="changeNickname()" class="btn-block" style="margin-top:15px; background:#fff; border:1px solid #dadce0;">닉네임 변경 (1회)</button>'}\n                </div>\n            `;
    const notificationToggle = document.getElementById("notificationToggle");
    notificationToggle && (notificationToggle.checked = notificationsEnabled, notificationsEnabled && (document.getElementById("notificationStatus").innerHTML = '<p style="color:var(--success-color);margin-top:10px;">✅ 알림이 활성화되었습니다.</p>'), 
    await loadNotificationTypeSettings());
  } catch (error) {} else el.innerHTML = '<div style="background:#fff; border:1px solid #dadce0; padding:20px; border-radius:8px; text-align:center;">\n            <p style="color:#5f6368;">로그인이 필요합니다.</p>\n            <button onclick="googleLogin()" class="btn-primary" style="width:100%; margin-top:15px;">Google 로그인</button>\n        </div>';
  const adminIndicator = document.getElementById("adminModeIndicator");
  adminIndicator && (isAdmin() ? adminIndicator.innerHTML = '\n            <div style="background:#e8f0fe; border:1px solid #1967d2; padding:15px; border-radius:8px; margin:20px 0;">\n                <h4 style="margin:0 0 10px 0; color:#1967d2;">🛡️ 관리자 모드 ON</h4>\n                <button onclick="disableAdminMode()" class="btn-block" style="background:#fff; color:#1967d2; border:1px solid #1967d2;">모드 해제</button>\n            </div>\n        ' : adminIndicator.innerHTML = "");
  const viewsSection = document.getElementById("viewsManagementSection");
  viewsSection && (isAdmin() ? viewsSection.style.display = "block" : viewsSection.style.display = "none");
}

async function toggleNotifications() {
  if (!isLoggedIn()) return void alert("로그인이 필요합니다!");
  const isEnabled = document.getElementById("notificationToggle").checked, statusDiv = document.getElementById("notificationStatus"), uid = getUserId();
  if (await db.ref("users/" + uid).update({
    notificationsEnabled: isEnabled
  }), isEnabled) statusDiv.innerHTML = '<p style="color:var(--success-color);margin-top:10px;">✅ 알림이 활성화되었습니다.</p>', 
  setupNotificationListener(uid), await loadNotificationTypeSettings(); else {
    statusDiv.innerHTML = '<p style="color:var(--text-secondary);margin-top:10px;">알림이 비활성화되었습니다.</p>';
    const typeSection = document.getElementById("notificationTypeSection");
    typeSection && (typeSection.innerHTML = ""), db.ref("notifications/" + uid).off(), 
    notificationListenerActive = !1;
  }
}

async function loadNotificationTypeSettings() {
  if (!isLoggedIn()) return;
  const uid = getUserId(), section = document.getElementById("notificationTypeSection");
  if (!section) return;
  const types = (await db.ref("users/" + uid + "/notificationTypes").once("value")).val() || {}, articleEnabled = !1 !== types.article, commentEnabled = !1 !== types.comment;
  section.innerHTML = `\n        <div style="background:#fff; border:1px solid #dadce0; padding:20px; border-radius:8px; margin-top:16px;">\n            <h4 style="margin:0 0 14px 0; color:#202124; font-size:15px;">📋 알림 받을 항목</h4>\n            \n            \x3c!-- 새 기사 알림 --\x3e\n            <div style="margin-bottom:10px;">\n                <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:#f8f9fa; border-radius:6px;">\n                    <label style="display:flex; align-items:center; gap:12px; cursor:pointer; flex:1;">\n                        <input type="checkbox" id="notifType_article"\n                            ${articleEnabled ? "checked" : ""}\n                            onchange="saveNotificationTypes()"\n                            style="width:18px; height:18px; cursor:pointer; accent-color:#c62828;">\n                        <div>\n                            <div style="font-weight:600; color:#202124;">📰 새 기사 알림</div>\n                            <div style="font-size:12px; color:#5f6368; margin-top:2px;">누군가 새 기사를 올렸을 때</div>\n                        </div>\n                    </label>\n                    <button onclick="toggleNotifDetail('article')" id="notifDetailBtn_article"\n                        style="padding:5px 12px; font-size:12px; font-weight:600; border:1.5px solid #c62828;\n                               background:white; color:#c62828; border-radius:5px; cursor:pointer; white-space:nowrap; margin-left:10px;"\n                        onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background='white'">\n                        자세히 ▾\n                    </button>\n                </div>\n                \x3c!-- 기사 알림 사용자 필터 패널 --\x3e\n                <div id="notifDetail_article" style="display:none; border:1.5px solid #e9ecef; border-top:none; border-radius:0 0 6px 6px; background:#fff; padding:12px;">\n                    \n                    \x3c!-- ① 카테고리 필터 --\x3e\n                    <div style="margin-bottom:14px;">\n                        <div style="font-size:12px; font-weight:700; color:#495057; margin-bottom:6px;">📂 카테고리 필터</div>\n                        <div style="font-size:11px; color:#868e96; margin-bottom:8px;">체크한 카테고리의 새 기사만 알림을 받습니다. (기본: 전체 선택)</div>\n                        <div style="display:flex; gap:6px; margin-bottom:8px;">\n                            <button onclick="selectAllNotifCategoryFilter('article', true)" style="padding:3px 10px; font-size:11px; font-weight:600; border:1.5px solid #c62828; background:white; color:#c62828; border-radius:5px; cursor:pointer;" onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background='white'">전체선택</button>\n                            <button onclick="selectAllNotifCategoryFilter('article', false)" style="padding:3px 10px; font-size:11px; font-weight:600; border:1.5px solid #dee2e6; background:white; color:#868e96; border-radius:5px; cursor:pointer;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">전체해제</button>\n                        </div>\n                        <div id="notifCategoryFilterList_article" style="display:flex; flex-wrap:wrap; gap:6px; padding:8px; border:1px solid #e9ecef; border-radius:6px; background:#fafafa;">\n                            <div style="font-size:12px; color:#adb5bd;">불러오는 중...</div>\n                        </div>\n                    </div>\n\n                    <hr style="border:none; border-top:1px solid #e9ecef; margin:0 0 12px 0;">\n\n                    \x3c!-- ② 사용자 필터 --\x3e\n                    <div>\n                        <div style="font-size:12px; font-weight:700; color:#495057; margin-bottom:6px;">👤 사용자 필터</div>\n                        <div style="font-size:11px; color:#868e96; margin-bottom:8px;">체크한 사용자가 <b>새 기사를 올릴 때만</b> 알림을 받습니다. (기본: 전체 선택)</div>\n                        <div style="display:flex; gap:6px; margin-bottom:8px;">\n                            <button onclick="selectAllNotifFilter('article', true)" style="padding:3px 10px; font-size:11px; font-weight:600; border:1.5px solid #c62828; background:white; color:#c62828; border-radius:5px; cursor:pointer;" onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background='white'">전체선택</button>\n                            <button onclick="selectAllNotifFilter('article', false)" style="padding:3px 10px; font-size:11px; font-weight:600; border:1.5px solid #dee2e6; background:white; color:#868e96; border-radius:5px; cursor:pointer;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">전체해제</button>\n                            <span style="margin-left:auto; font-size:11px; color:#adb5bd; align-self:center;">선택: <span id="notifFilterCount_article" style="font-weight:700; color:#adb5bd;">0</span>명</span>\n                        </div>\n                        <div id="notifFilterList_article" style="max-height:200px; overflow-y:auto; border:1px solid #e9ecef; border-radius:6px; padding:4px; background:#fafafa;">\n                            <div style="padding:20px; text-align:center; color:#adb5bd; font-size:13px;">불러오는 중...</div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            \n            \x3c!-- 새 댓글 알림 --\x3e\n            <div>\n                <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:#f8f9fa; border-radius:6px;">\n                    <label style="display:flex; align-items:center; gap:12px; cursor:pointer; flex:1;">\n                        <input type="checkbox" id="notifType_comment"\n                            ${commentEnabled ? "checked" : ""}\n                            onchange="saveNotificationTypes()"\n                            style="width:18px; height:18px; cursor:pointer; accent-color:#c62828;">\n                        <div>\n                            <div style="font-weight:600; color:#202124;">💬 댓글 알림</div>\n                            <div style="font-size:12px; color:#5f6368; margin-top:2px;">내 기사에 댓글이 달렸을 때</div>\n                        </div>\n                    </label>\n                    <button onclick="toggleNotifDetail('comment')" id="notifDetailBtn_comment"\n                        style="padding:5px 12px; font-size:12px; font-weight:600; border:1.5px solid #c62828;\n                               background:white; color:#c62828; border-radius:5px; cursor:pointer; white-space:nowrap; margin-left:10px;"\n                        onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background='white'">\n                        자세히 ▾\n                    </button>\n                </div>\n                \x3c!-- 댓글 알림 사용자 필터 패널 --\x3e\n                <div id="notifDetail_comment" style="display:none; border:1.5px solid #e9ecef; border-top:none; border-radius:0 0 6px 6px; background:#fff; padding:12px;">\n\n                    \x3c!-- ① 카테고리 필터 --\x3e\n                    <div style="margin-bottom:14px;">\n                        <div style="font-size:12px; font-weight:700; color:#495057; margin-bottom:6px;">📂 카테고리 필터</div>\n                        <div style="font-size:11px; color:#868e96; margin-bottom:8px;">체크한 카테고리의 기사에 달린 댓글만 알림을 받습니다. (기본: 전체 선택)</div>\n                        <div style="display:flex; gap:6px; margin-bottom:8px;">\n                            <button onclick="selectAllNotifCategoryFilter('comment', true)" style="padding:3px 10px; font-size:11px; font-weight:600; border:1.5px solid #c62828; background:white; color:#c62828; border-radius:5px; cursor:pointer;" onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background='white'">전체선택</button>\n                            <button onclick="selectAllNotifCategoryFilter('comment', false)" style="padding:3px 10px; font-size:11px; font-weight:600; border:1.5px solid #dee2e6; background:white; color:#868e96; border-radius:5px; cursor:pointer;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">전체해제</button>\n                        </div>\n                        <div id="notifCategoryFilterList_comment" style="display:flex; flex-wrap:wrap; gap:6px; padding:8px; border:1px solid #e9ecef; border-radius:6px; background:#fafafa;">\n                            <div style="font-size:12px; color:#adb5bd;">불러오는 중...</div>\n                        </div>\n                    </div>\n\n                    <hr style="border:none; border-top:1px solid #e9ecef; margin:0 0 12px 0;">\n\n                    \x3c!-- ② 사용자 필터 --\x3e\n                    <div>\n                        <div style="font-size:12px; font-weight:700; color:#495057; margin-bottom:6px;">👤 사용자 필터</div>\n                        <div style="font-size:11px; color:#868e96; margin-bottom:8px;">체크한 사용자가 <b>내 기사에 댓글을 달 때만</b> 알림을 받습니다. (기본: 전체 선택)</div>\n                        <div style="display:flex; gap:6px; margin-bottom:8px;">\n                            <button onclick="selectAllNotifFilter('comment', true)" style="padding:3px 10px; font-size:11px; font-weight:600; border:1.5px solid #c62828; background:white; color:#c62828; border-radius:5px; cursor:pointer;" onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background='white'">전체선택</button>\n                            <button onclick="selectAllNotifFilter('comment', false)" style="padding:3px 10px; font-size:11px; font-weight:600; border:1.5px solid #dee2e6; background:white; color:#868e96; border-radius:5px; cursor:pointer;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">전체해제</button>\n                            <span style="margin-left:auto; font-size:11px; color:#adb5bd; align-self:center;">선택: <span id="notifFilterCount_comment" style="font-weight:700; color:#adb5bd;">0</span>명</span>\n                        </div>\n                        <div id="notifFilterList_comment" style="max-height:200px; overflow-y:auto; border:1px solid #e9ecef; border-radius:6px; padding:4px; background:#fafafa;">\n                            <div style="padding:20px; text-align:center; color:#adb5bd; font-size:13px;">불러오는 중...</div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n    `;
}

function updateNotifFilterCount(type) {
  const countEl = document.getElementById(`notifFilterCount_${type}`);
  if (!countEl) return;
  document.querySelectorAll(`.notifFilter_${type}_cb`).length;
  const checked = document.querySelectorAll(`.notifFilter_${type}_cb:checked`).length;
  countEl.textContent = checked, countEl.style.color = checked > 0 ? "#c62828" : "#adb5bd";
}

auth.onAuthStateChanged(async user => {
  if (_authReadyResolve(), _cachedAdminStatus = null, _adminCacheTime = 0, !user) {
    notificationListenerActive = !1, hidePageLoadingScreen(), hideAll();
    const header = document.querySelector("header");
    header && (header.style.display = "none");
    const headerBtn = document.getElementById("headerProfileBtn");
    if (headerBtn && (headerBtn.innerHTML = '<i class="fas fa-user-circle"></i>'), _isBannedUser) return;
    return void showGuestLoginScreen();
  }
  {
    window.profilePhotoCache && window.profilePhotoCache.clear(), showLoadingIndicator("로그인 확인 중..."), 
    await isAdminAsync();
    const userRef = db.ref("users/" + user.uid);
    let data = (await userRef.once("value")).val() || {};
    const isFirstTimeUser = !data.email;
    isFirstTimeUser && await userRef.update({
      email: user.email,
      createdAt: Date.now()
    });
    const googleProviderInfo = (user.providerData || []).find(p => "google.com" === p.providerId), googleRealName = googleProviderInfo && googleProviderInfo.displayName;
    if (googleRealName && data.googleDisplayName !== googleRealName && (await userRef.update({
      googleDisplayName: googleRealName
    }), data.googleDisplayName = googleRealName), data.isBanned) {
      _isBannedUser = !0, hideLoadingIndicator();
      if (!document.getElementById("_bannedScreen")) {
        const banScreen = document.createElement("div");
        banScreen.id = "_bannedScreen", banScreen.style.cssText = [ "position:fixed", "top:0", "left:0", "width:100%", "height:100%", "background:#fff", "z-index:999999", "display:flex", "flex-direction:column", "align-items:center", "justify-content:center", "padding:32px", "box-sizing:border-box" ].join(";"), 
        banScreen.innerHTML = '\n                    <div style="display:flex;flex-direction:column;align-items:center;gap:16px;max-width:360px;width:100%;text-align:center;">\n                        <div style="font-size:64px;">🚫</div>\n                        <div style="font-size:22px;font-weight:900;color:#c62828;letter-spacing:-0.5px;">\n                            계정이 차단되었습니다\n                        </div>\n                        <div style="font-size:14px;color:#888;line-height:1.7;">\n                            누적 경고 3회로 인해 이 계정은 사이트 이용이 영구 차단되었습니다.<br>\n                            <small style="color:#aaa;">관리자에게 문의하세요.</small>\n                        </div>\n                    </div>\n                ', 
        document.body.appendChild(banScreen);
      }
      return void await auth.signOut();
    }
    const guestScreen = document.getElementById("_guestLoginScreen");
    guestScreen && guestScreen.remove();
    const header = document.querySelector("header");
    header && (header.style.display = ""), setupNotificationListener(user.uid), setupPresenceNotifications(), 
    _fcmRegistered = !1, registerFCMToken(), window._fcmVisibilityListenerAdded || (window._fcmVisibilityListenerAdded = !0, 
    document.addEventListener("visibilitychange", function() {
      "visible" === document.visibilityState && !_fcmRegistered && isLoggedIn() && registerFCMToken();
    })), updateHeaderProfileButton(user), updateLastSeen(), hideLoadingIndicator(), 
    sessionStorage.getItem("login_shown") || (showToastNotification("✅ 로그인 완료", `환영합니다, ${getNickname()}님!`, null), 
    sessionStorage.setItem("login_shown", "true")), isFirstTimeUser && await showForcedOnboarding(user), 
    initialRoute();
  }
  updateSettings(), document.getElementById("articlesSection")?.classList.contains("active") && searchArticles(!1);
}), window.saveNotificationTypes = async function() {
  if (!isLoggedIn()) return;
  const uid = getUserId(), articleEl = document.getElementById("notifType_article"), commentEl = document.getElementById("notifType_comment"), types = {
    article: !articleEl || articleEl.checked,
    comment: !commentEl || commentEl.checked
  };
  await db.ref("users/" + uid + "/notificationTypes").set(types);
  const statusDiv = document.getElementById("notificationStatus");
  statusDiv && (statusDiv.innerHTML = '<p style="color:var(--success-color);margin-top:10px;">✅ 알림 설정이 저장되었습니다.</p>', 
  setTimeout(() => {
    statusDiv.innerHTML = '<p style="color:var(--success-color);margin-top:10px;">✅ 알림이 활성화되었습니다.</p>';
  }, 2e3));
}, window.toggleNotifDetail = async function(type) {
  const panel = document.getElementById(`notifDetail_${type}`), btn = document.getElementById(`notifDetailBtn_${type}`);
  if (!panel) return;
  "none" !== panel.style.display ? (panel.style.display = "none", btn.textContent = "자세히 ▾") : (panel.style.display = "block", 
  btn.textContent = "닫기 ▴", await Promise.all([ loadNotifFilterUsers(type), loadNotifCategoryFilter(type) ]));
}, window.loadNotifFilterUsers = async function(type) {
  if (!isLoggedIn()) return;
  const uid = getUserId(), myEmail = getUserEmail(), listEl = document.getElementById(`notifFilterList_${type}`);
  if (!listEl) return;
  listEl.innerHTML = '<div style="padding:20px; text-align:center; color:#adb5bd; font-size:13px;">불러오는 중...</div>';
  const [usersSnap, filterSnap] = await Promise.all([ db.ref("users").once("value"), db.ref(`users/${uid}/notificationTypes/${type}FilterUsers`).once("value") ]), usersData = usersSnap.val() || {}, savedFilter = filterSnap.val() || null, emailMap = new Map;
  Object.entries(usersData).filter(([, d]) => d.email && d.email !== myEmail).forEach(([id, d]) => {
    const existing = emailMap.get(d.email);
    (!existing || (d.lastSeen || 0) > (existing.lastSeen || 0)) && emailMap.set(d.email, {
      uid: id,
      email: d.email,
      nickname: d.newNickname || d.displayName || d.email.split("@")[0]
    });
  });
  const users = Array.from(emailMap.values()).sort((a, b) => a.email.localeCompare(b.email));
  0 !== users.length ? (listEl.innerHTML = users.map(u => {
    const isChecked = null === savedFilter || !1 !== savedFilter[u.uid];
    return `\n            <label style="display:flex; align-items:center; gap:10px; padding:7px 10px; border-radius:5px; cursor:pointer;"\n                   onmouseover="this.style.background='#f1f3f5'" onmouseout="this.style.background=''">\n                <input type="checkbox"\n                    class="notifFilter_${type}_cb"\n                    value="${u.uid}"\n                    ${isChecked ? "checked" : ""}\n                    onchange="saveNotifFilterUsers('${type}')"\n                    style="width:15px; height:15px; cursor:pointer; accent-color:#c62828; flex-shrink:0;">\n                <span style="font-size:13px; color:#333;">\n                    <b>${u.nickname}</b>\n                    <span style="color:#868e96; font-size:11px; margin-left:4px;">${u.email}</span>\n                </span>\n            </label>\n        `;
  }).join(""), updateNotifFilterCount(type)) : listEl.innerHTML = '<div style="padding:20px; text-align:center; color:#adb5bd; font-size:13px;">표시할 사용자가 없습니다.</div>';
}, window.saveNotifFilterUsers = async function(type) {
  if (!isLoggedIn()) return;
  const uid = getUserId(), checkboxes = document.querySelectorAll(`.notifFilter_${type}_cb`), filterMap = {};
  checkboxes.forEach(cb => {
    filterMap[cb.value] = cb.checked;
  }), await db.ref(`users/${uid}/notificationTypes/${type}FilterUsers`).set(filterMap), 
  updateNotifFilterCount(type);
}, window.selectAllNotifFilter = async function(type, checked) {
  document.querySelectorAll(`.notifFilter_${type}_cb`).forEach(cb => {
    cb.checked = checked;
  }), await saveNotifFilterUsers(type);
};

const ALL_CATEGORIES = [ "자유게시판", "논란", "연애", "정아영", "게넥도", "게임", "마크", "과제방" ];

async function updateHeaderProfileButton(user) {
  const headerBtn = document.getElementById("headerProfileBtn");
  if (headerBtn) if (user) {
    const photoUrl = (await db.ref("users/" + user.uid + "/profilePhoto").once("value")).val();
    headerBtn.innerHTML = photoUrl ? `<img src="${photoUrl}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">` : '<i class="fas fa-user-circle"></i>';
  } else headerBtn.innerHTML = '<i class="fas fa-user-circle"></i>';
}

function hideAll() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  }), document.querySelectorAll(".page-section").forEach(sec => sec.classList.remove("active")), 
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
  const dropdown = document.getElementById("profileDropdown");
  dropdown && dropdown.classList.remove("active"), "function" == typeof detachArticleVoteListeners && detachArticleVoteListeners(), 
  "function" == typeof detachCommentsListener && detachCommentsListener(), "function" == typeof detachActivityStatusListener && detachActivityStatusListener();
}

function showArticles() {
  if (!isLoggedIn()) return void showGuestLoginScreen();
  hideAll(), document.getElementById("articlesSection").classList.add("active");
  const header = document.querySelector("header");
  header && (header.style.display = "block"), document.getElementById("searchCategory").value = currentCategory, 
  document.getElementById("searchKeyword").value = "";
  const category = currentCategory;
  filteredArticles = allArticles.filter(a => a.category === category), renderArticles(), 
  updateURL("home"), setTimeout(() => {
    currentScrollPosition > 0 && window.scrollTo(0, currentScrollPosition), setupCategoryChangeListener();
  }, 100);
}

function calcHotScore(article) {
  const views = article.views || 0, likes = article.likes || article.likeCount || 0, dislikes = article.dislikes || article.dislikeCount || 0;
  return 1 * views + 3 * likes + 2 * (article.commentCount || 0) - 2 * dislikes;
}

function renderHotArticle(articles, containerId, category, commentCounts) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const pinnedIds = window._pinnedArticleIds || new Set, candidates = (Array.isArray(articles) ? articles : Object.values(articles)).filter(a => !(!a || a.deleted) && (!pinnedIds.has(a.id) && (!category || a.category === category)));
  if (0 === candidates.length) return el.innerHTML = "", void (window._currentHotArticleId = null);
  commentCounts && candidates.forEach(a => {
    a.commentCount || (a.commentCount = commentCounts[a.id] || 0);
  }), candidates.sort((a, b) => calcHotScore(b) - calcHotScore(a));
  const hot = candidates[0];
  window._currentHotArticleId = hot.id, el.innerHTML = buildArticleCardHTML(hot, commentCounts, "hot");
}

window.loadNotifCategoryFilter = async function(type) {
  if (!isLoggedIn()) return;
  const uid = getUserId(), listEl = document.getElementById(`notifCategoryFilterList_${type}`);
  if (!listEl) return;
  const savedFilter = (await db.ref(`users/${uid}/notificationTypes/${type}FilterCategories`).once("value")).val() || null;
  listEl.innerHTML = ALL_CATEGORIES.map(cat => {
    const isChecked = null === savedFilter || !1 !== savedFilter[cat];
    return `\n            <label style="display:inline-flex; align-items:center; gap:5px; padding:5px 10px;\n                           background:${isChecked ? "#fff0f0" : "#f8f9fa"}; border:1.5px solid ${isChecked ? "#c62828" : "#dee2e6"};\n                           border-radius:20px; cursor:pointer; font-size:12px; font-weight:600;\n                           color:${isChecked ? "#c62828" : "#adb5bd"}; transition:all 0.15s;"\n                   id="notifCatLabel_${type}_${cat.replace(/\s/g, "_")}">\n                <input type="checkbox"\n                    class="notifCatFilter_${type}_cb"\n                    value="${cat}"\n                    ${isChecked ? "checked" : ""}\n                    onchange="onNotifCategoryChange('${type}', '${cat}', this)"\n                    style="display:none;">\n                ${cat}\n            </label>\n        `;
  }).join("");
}, window.onNotifCategoryChange = async function(type, cat, cb) {
  const labelId = `notifCatLabel_${type}_${cat.replace(/\s/g, "_")}`, label = document.getElementById(labelId);
  label && (label.style.background = cb.checked ? "#fff0f0" : "#f8f9fa", label.style.border = "1.5px solid " + (cb.checked ? "#c62828" : "#dee2e6"), 
  label.style.color = cb.checked ? "#c62828" : "#adb5bd"), await saveNotifFilterCategories(type);
}, window.saveNotifFilterCategories = async function(type) {
  if (!isLoggedIn()) return;
  const uid = getUserId(), checkboxes = document.querySelectorAll(`.notifCatFilter_${type}_cb`), filterMap = {};
  checkboxes.forEach(cb => {
    filterMap[cb.value] = cb.checked;
  }), await db.ref(`users/${uid}/notificationTypes/${type}FilterCategories`).set(filterMap);
}, window.selectAllNotifCategoryFilter = async function(type, checked) {
  document.querySelectorAll(`.notifCatFilter_${type}_cb`).forEach(cb => {
    cb.checked = checked;
    const cat = cb.value, labelId = `notifCatLabel_${type}_${cat.replace(/\s/g, "_")}`, label = document.getElementById(labelId);
    label && (label.style.background = checked ? "#fff0f0" : "#f8f9fa", label.style.border = "1.5px solid " + (checked ? "#c62828" : "#dee2e6"), 
    label.style.color = checked ? "#c62828" : "#adb5bd");
  }), await saveNotifFilterCategories(type);
}, window.loadAndRenderHotArticle = async function(category) {
  try {
    let articles = window._allArticles;
    if (!articles) {
      articles = (await db.ref("articles").orderByChild("deleted").equalTo(null).limitToLast(200).once("value")).val() || {}, 
      window._allArticles = articles;
    }
    renderHotArticle(articles, "featuredArticle", category || null);
  } catch (e) {}
};

const CAT_NEW_KEY = "_catLastSeen", NON_FREE_CATS = [ "논란", "연애", "정아영", "게넥도", "게임", "마크", "과제방" ];

function setupCategoryChangeListener() {
  const categorySelect = document.getElementById("searchCategory");
  categorySelect && "true" !== categorySelect.dataset.listenerAdded && (categorySelect.addEventListener("change", function() {
    currentCategory = this.value, currentScrollPosition = 0, searchArticles(!0);
  }), categorySelect.dataset.listenerAdded = "true");
}

async function showWritePage() {
  if (await authReady, !isLoggedIn()) return alert("기사 작성은 로그인 후 가능합니다!"), void googleLogin();
  window.isEditingArticle = !1, window.editingArticleId = null, hideAll(), window.scrollTo(0, 0), 
  document.getElementById("writeSection").classList.add("active");
  const impBox = document.getElementById("adminImpersonateBox");
  impBox && (impBox.style.display = isAdmin() ? "block" : "none", window._adminClearImpersonate()), 
  setTimeout(() => {
    setupArticleForm();
    const categoryEl = document.getElementById("category"), titleEl = document.getElementById("title"), summaryEl = document.getElementById("summary");
    categoryEl && (categoryEl.value = "자유게시판"), titleEl && (titleEl.value = ""), summaryEl && (summaryEl.value = ""), 
    window.quillEditor && window.quillEditor.setText && window.quillEditor.setText("");
    const preview = document.getElementById("thumbnailPreview"), uploadText = document.getElementById("uploadText");
    preview && (preview.src = "", preview.style.display = "none"), uploadText && (uploadText.innerHTML = '<i class="fas fa-camera"></i><p>클릭하여 이미지 업로드</p>');
  }, 100), updateURL("write");
}

function showSettings() {
  hideAll(), window.scrollTo(0, 0);
  document.getElementById("settingsSection").classList.add("active"), updateSettings(), 
  updateURL("settings");
}

function showMoreMenu() {
  hideAll(), window.scrollTo(0, 0);
  const section = document.getElementById("moreMenuSection");
  section && (section.classList.add("active"), section.innerHTML = `\n        <div class="more-menu-container" style="max-width:600px; margin:0 auto; padding:20px;">\n            <h2 style="color:#00376b; text-align:center; margin-bottom:30px; font-size:24px; font-weight:800;">\n                <i class="fas fa-bars"></i> 더보기 메뉴\n            </h2>\n            \n            <div class="menu-section" style="background:white; border-radius:12px; padding:20px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">\n                <h3 style="color:#495057; margin:0 0 15px 0; font-size:16px; font-weight:700;">\n                    <i class="fas fa-comments"></i> 커뮤니티\n                </h3>\n                <div style="display:grid; gap:10px;">\n                    <button onclick="showCategoryArticles('자유게시판')" class="more-menu-btn">\n                        <i class="fas fa-list"></i> 자유게시판\n                    </button>\n                    <button onclick="showCategoryArticles('마크')" class="more-menu-btn">\n                        <i class="fas fa-cube"></i> 마크\n                    </button>\n                    <button onclick="showMessenger()" class="more-menu-btn">\n                        <i class="fas fa-envelope"></i> 알림함\n                        <span class="notification-badge" id="messengerBadgeMore" style="display:none; position:absolute; right:12px; top:12px; background:#dc3545; color:white; border-radius:12px; padding:2px 6px; font-size:10px; font-weight:700; min-width:18px; text-align:center;"></span>\n                    </button>\n                </div>\n            </div>\n            \n            <div class="menu-section" style="background:white; border-radius:12px; padding:20px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">\n                <h3 style="color:#495057; margin:0 0 15px 0; font-size:16px; font-weight:700;">\n                    <i class="fas fa-info-circle"></i> 정보\n                </h3>\n                <div style="display:grid; gap:10px;">\n                    <button onclick="showQnA()" class="more-menu-btn">\n                        <i class="fas fa-question-circle"></i> QnA\n                    </button>\n                    <button onclick="showPatchNotesPage()" class="more-menu-btn">\n                        <i class="fas fa-file-alt"></i> 패치노트\n                    </button>\n                    <button onclick="showActivityStatus()" class="more-menu-btn">\n                        <i class="fas fa-users"></i> 활동중\n                    </button>\n                    <button onclick="showBugReportPage()" class="more-menu-btn">\n                        <i class="fas fa-bug"></i> 버그 제보\n                    </button>\n                    <button onclick="showImprovementPage()" class="more-menu-btn">\n                        <i class="fas fa-lightbulb"></i> 개선 제보\n                    </button>\n                </div>\n            </div>\n\n            ${isLoggedIn() ? '\n            <div class="menu-section" style="background:white; border-radius:12px; padding:20px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">\n                <h3 style="color:#495057; margin:0 0 15px 0; font-size:16px; font-weight:700;">\n                    <i class="fas fa-bell"></i> 알림\n                </h3>\n                <div style="display:grid; gap:10px;">\n                    <button onclick="manualTriggerPush(this)" class="more-menu-btn">\n                        <i class="fas fa-paper-plane"></i> 푸쉬 알림 즉시 전송\n                        <span style="font-size:11px; color:#999; margin-left:auto;">읽지 않은 알림을 지금 전송</span>\n                    </button>\n                </div>\n            </div>' : ""}\n\n            ${isAdmin() ? '\n            <div class="menu-section" style="background:#fff8f8; border:1px solid #ffcdd2; border-radius:12px; padding:20px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">\n                <h3 style="color:#c62828; margin:0 0 15px 0; font-size:16px; font-weight:700;">\n                    <i class="fas fa-shield-alt"></i> 관리자\n                </h3>\n                <div style="display:grid; gap:10px;">\n                    <button onclick="showUserManagement()" class="more-menu-btn" style="border-color:#ffcdd2;">\n                        <i class="fas fa-users-cog" style="color:#c62828;"></i> 유저 관리\n                    </button>\n                    <button onclick="showPinnedArticleManager()" class="more-menu-btn" style="border-color:#ffcdd2;">\n                        <i class="fas fa-thumbtack" style="color:#c62828;"></i> 기사 고정 관리\n                    </button>\n                    <button onclick="showMaintenanceModeManager()" class="more-menu-btn" style="border-color:#ffcdd2;">\n                        <i class="fas fa-tools" style="color:#c62828;"></i> 점검모드 관리\n                    </button>\n                    <button onclick="showBannedWordManager()" class="more-menu-btn" style="border-color:#ffcdd2;">\n                        <i class="fas fa-ban" style="color:#c62828;"></i> 금지어 관리\n                    </button>\n                    <button onclick="showErrorLogs()" class="more-menu-btn" style="border-color:#ffcdd2;">\n                        <i class="fas fa-bug" style="color:#c62828;"></i> 오류 로그\n                    </button>\n                    <button onclick="resetAllViews()" class="more-menu-btn" style="border-color:#ffcdd2;">\n                        <i class="fas fa-redo" style="color:#c62828;"></i> 전체 조회수 초기화\n                    </button>\n                    <button onclick="clearMyViewHistory()" class="more-menu-btn" style="border-color:#ffcdd2;">\n                        <i class="fas fa-trash-alt" style="color:#c62828;"></i> 내 조회 기록 삭제\n                    </button>\n                    <button onclick="showManualNotificationSender()" class="more-menu-btn" style="border-color:#ffcdd2;">\n                        <i class="fas fa-paper-plane" style="color:#c62828;"></i> 수동 알림 전송\n                    </button>\n                    <button onclick="showAdminBugReports()" class="more-menu-btn" style="border-color:#ffcdd2;">\n                        <i class="fas fa-bug" style="color:#c62828;"></i> 버그 제보 관리\n                    </button>\n                    <button onclick="showAdminImprovements()" class="more-menu-btn" style="border-color:#ffcdd2;">\n                        <i class="fas fa-lightbulb" style="color:#c62828;"></i> 개선 제보 관리\n                    </button>\n                    <button onclick="showAdminMemo()" class="more-menu-btn" style="border-color:#ffcdd2;">\n                        <i class="fas fa-sticky-note" style="color:#c62828;"></i> 관리자 메모장\n                    </button>\n                    <button onclick="migrateCommentCounts()" class="more-menu-btn" style="border-color:#ffcdd2;">\n                        <i class="fas fa-sync-alt" style="color:#c62828;"></i> 댓글 수 일괄 복구\n                    </button>\n                </div>\n            </div>' : ""}\n            \n        </div>\n        \n        <style>\n            .more-menu-btn {\n                display: flex;\n                align-items: center;\n                gap: 12px;\n                background: #f8f9fa;\n                border: 1px solid #dee2e6;\n                padding: 15px;\n                border-radius: 8px;\n                font-size: 15px;\n                color: #495057;\n                cursor: pointer;\n                transition: all 0.3s;\n                font-weight: 500;\n                position: relative;\n            }\n            \n            .more-menu-btn:hover {\n                background: #e9ecef;\n                transform: translateX(5px);\n            }\n            \n            .more-menu-btn i {\n                font-size: 18px;\n                color: #00376b;\n                width: 24px;\n                text-align: center;\n            }\n        </style>\n    `, 
  updateURL("more"), updateMessengerBadge());
}

async function manualTriggerPush(btn) {
  if (!isLoggedIn()) return void alert("로그인이 필요합니다.");
  const original = btn.innerHTML;
  btn.disabled = !0, btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 전송 요청 중...';
  const ok = await triggerGithubNotification(!1);
  btn.innerHTML = ok ? '<i class="fas fa-check" style="color:#2e7d32;"></i> 전송 요청 완료!' : '<i class="fas fa-clock" style="color:#888;"></i> 잠시 후 자동 전송 예정', 
  setTimeout(() => {
    btn.innerHTML = original, btn.disabled = !1;
  }, 3e3);
}

function showCategoryArticles(category) {
  hideAll(), window.scrollTo(0, 0);
  document.getElementById("articlesSection").classList.add("active"), currentCategory = category, 
  currentScrollPosition = 0, document.getElementById("searchCategory").value = category, 
  document.getElementById("searchKeyword").value = "", searchArticles(!0), updateURL("home");
}

function loadQnAFromFile() {
  const qnaList = document.getElementById("qnaList");
  qnaList && (qnaList.innerHTML = '<p style="text-align:center; color:#868e96; padding:40px;">QnA 내용을 불러오는 중...</p>', 
  fetch("./html/qna.html").then(response => {
    if (!response.ok) throw new Error("QnA 파일을 찾을 수 없습니다.");
    return response.text();
  }).then(html => {
    qnaList.innerHTML = html;
  }).catch(error => {
    qnaList.innerHTML = '\n                <div style="text-align:center; padding:60px 20px;">\n                    <i class="fas fa-exclamation-triangle" style="font-size:48px; color:#f44336; margin-bottom:20px;"></i>\n                    <p style="color:#f44336; margin-bottom:20px;">QnA 파일을 불러올 수 없습니다.</p>\n                    <p style="color:#868e96; font-size:14px;">파일 경로: ./html/qna.html</p>\n                    <button onclick="loadQnAFromFile()" class="btn-primary" style="margin-top:20px;">\n                        다시 시도\n                    </button>\n                </div>\n            ';
  }));
}

function getProfilePlaceholder(photoUrl, size) {
  return photoUrl ? `<img src="${photoUrl}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;object-position:center;border:2px solid #dadce0;flex-shrink:0;image-rendering:auto;-webkit-transform:translateZ(0);transform:translateZ(0);">` : `<span style="width:${size}px;height:${size}px;border-radius:50%;background:#f1f3f4;display:inline-flex;align-items:center;justify-content:center;border:2px solid #dadce0;flex-shrink:0;">\n        <i class="fas fa-user" style="font-size:${size / 2}px;color:#9aa0a6;"></i>\n    </span>`;
}

async function getUserProfilePhoto(email) {
  if (!email) return null;
  if (window.profilePhotoCache.has(email)) return window.profilePhotoCache.get(email);
  if (await authReady, !isLoggedIn()) return window.profilePhotoCache.set(email, null), 
  null;
  try {
    const val = (await db.ref("users").orderByChild("email").equalTo(email).limitToFirst(1).once("value")).val();
    if (val) {
      const photoUrl = Object.values(val)[0].profilePhoto || null;
      return window.profilePhotoCache.set(email, photoUrl), photoUrl;
    }
    return window.profilePhotoCache.set(email, null), null;
  } catch (error) {
    return window.profilePhotoCache.set(email, null), null;
  }
}

function buildArticleCardHTML(a, commentCounts, badge) {
  const views = getArticleViews(a), votes = getArticleVoteCounts(a), commentCount = commentCounts && commentCounts[a.id] || a.commentCount || 0, authorPhoto = getProfilePlaceholder(a.anonymous ? null : window.profilePhotoCache?.get(a.authorEmail) || null, 48);
  let badgeHTML = "", borderStyle = "cursor:pointer;";
  return "pinned" === badge ? (badgeHTML = '<span class="pinned-badge">📌 고정</span>', 
  borderStyle = "border-left:4px solid #ffd700; cursor:pointer;") : "hot" === badge && (badgeHTML = '<span style="display:inline-flex;align-items:center;gap:4px;\n            background:linear-gradient(90deg,#ff5722,#ff9800);color:white;\n            font-size:11px;font-weight:800;padding:2px 9px;border-radius:20px;\n            margin-right:4px;">🔥 핫</span>', 
  borderStyle = "border-left:4px solid #ff5722; cursor:pointer;"), `<div class="article-card" data-card-pinned="${"pinned" === badge ? "1" : "0"}" onclick="showArticleDetail('${a.id}')" style="${borderStyle}">\n        ${a.thumbnail ? `<img src="${a.thumbnail}" class="article-thumbnail" alt="썸네일">` : ""}\n        <div class="article-content">\n            <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-bottom:4px;">\n                <span class="category-badge">${escapeHTML(a.category)}</span>\n                ${a.anonymous ? '<span style="display:inline-flex;align-items:center;gap:3px;\n                    background:#f5f5f5;color:#757575;\n                    font-size:11px;font-weight:800;padding:2px 8px;border-radius:20px;">🕵️ 익명</span>' : ""}\n                ${badgeHTML}\n            </div>\n            <h3 class="article-title">${escapeHTML(a.title)}</h3>\n            ${a.summary ? `<p class="article-summary">${escapeHTML(a.summary)}</p>` : ""}\n            <div class="article-meta" style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">\n                <div style="display:flex;align-items:center;gap:8px;">\n                    ${authorPhoto}\n                    <span>${a.anonymous ? "익명" : escapeHTML(a.author || "")}</span>\n                </div>\n                <div class="article-stats" style="display:flex;gap:12px;">\n                    <span class="stat-item">👁️ ${views}</span>\n                    <span class="stat-item" id="card-comment-${a.id}">💬 ${commentCount}</span>\n                    <span class="stat-item" id="card-like-${a.id}">👍 ${votes.likes}</span>\n                    <span class="stat-item" id="card-dislike-${a.id}" style="${votes.dislikes > 0 ? "" : "display:none;"}">👎 ${votes.dislikes}</span>\n                </div>\n            </div>\n        </div>\n    </div>`;
}

async function renderArticles() {
  const list = getSortedArticles(), grid = document.getElementById("articlesGrid"), featured = document.getElementById("featuredArticle"), pinnedSection = document.getElementById("pinnedSection"), loadMore = document.getElementById("loadMoreContainer");
  if (!(grid && featured && pinnedSection && loadMore)) return;
  window.profilePhotoCache || (window.profilePhotoCache = new Map);
  const currentCategory = document.getElementById("searchCategory")?.value || "자유게시판", pinnedData = await getPinnedArticles(), pinnedIds = Object.keys(pinnedData), pinnedArticles = [], unpinnedArticles = [];
  if (list.forEach(article => {
    article.category === currentCategory && (pinnedIds.includes(article.id) ? (article.pinnedAt = pinnedData[article.id].pinnedAt, 
    pinnedArticles.push(article)) : unpinnedArticles.push(article));
  }), pinnedArticles.sort((a, b) => b.pinnedAt - a.pinnedAt), 0 === list.length) return featured.innerHTML = '<div style="text-align:center;padding:60px 20px;background:#fff;border-radius:8px;">\n            <p style="color:#868e96;font-size:16px;">등록된 기사가 없습니다.</p>\n        </div>', 
  grid.innerHTML = "", loadMore.innerHTML = "", void (pinnedSection.innerHTML = "");
  const commentCounts = {};
  allArticles.forEach(a => {
    a.id && a.commentCount && (commentCounts[a.id] = a.commentCount);
  });
  const pinnedIdSet = new Set(pinnedIds), hotCandidate = allArticles.filter(a => a && !a.deleted && !pinnedIdSet.has(a.id) && a.category === currentCategory).sort((a, b) => calcHotScore(b) - calcHotScore(a))[0], hotId = hotCandidate ? hotCandidate.id : null;
  window._currentHotArticleId = hotId;
  const filteredUnpinned = hotId ? unpinnedArticles.filter(a => a.id !== hotId) : unpinnedArticles, endIdx = 5 * currentArticlePage, displayArticles = filteredUnpinned.slice(0, endIdx), allDisplayEmails = [ ...displayArticles, ...pinnedArticles ];
  hotCandidate && allDisplayEmails.push(hotCandidate);
  const uncachedEmails = [ ...new Set(allDisplayEmails.filter(a => !a.anonymous).map(a => a.authorEmail).filter(Boolean)) ].filter(email => !window.profilePhotoCache.has(email));
  if (uncachedEmails.length > 0 && (await authReady, isLoggedIn())) try {
    const emailToUid = {};
    allDisplayEmails.forEach(a => {
      a.authorUid && a.authorEmail && (emailToUid[a.authorEmail] = a.authorUid);
    });
    const withUid = uncachedEmails.filter(e => emailToUid[e]), withoutUid = uncachedEmails.filter(e => !emailToUid[e]), uidPromises = withUid.map(async email => {
      try {
        const snap = await db.ref("users/" + emailToUid[email] + "/profilePhoto").once("value");
        window.profilePhotoCache.set(email, snap.val() || null);
      } catch (e) {
        window.profilePhotoCache.set(email, null);
      }
    }), emailPromises = withoutUid.map(async email => {
      try {
        const v = (await db.ref("users").orderByChild("email").equalTo(email).limitToFirst(1).once("value")).val(), u = v ? Object.values(v)[0] : null;
        window.profilePhotoCache.set(email, u && u.profilePhoto || null);
      } catch (e) {
        window.profilePhotoCache.set(email, null);
      }
    });
    await Promise.all([ ...uidPromises, ...emailPromises ]);
  } catch (error) {}
  pinnedArticles.length > 0 ? pinnedSection.innerHTML = pinnedArticles.map(a => buildArticleCardHTML(a, commentCounts, "pinned")).join("") : pinnedSection.innerHTML = "", 
  renderHotArticle(allArticles, "featuredArticle", currentCategory, commentCounts), 
  hidePageLoadingScreen();
  const articlesHTML = displayArticles.map(a => buildArticleCardHTML(a, commentCounts, null));
  grid.innerHTML = articlesHTML.join(""), endIdx < filteredUnpinned.length ? loadMore.innerHTML = `<button onclick="loadMoreArticles()" class="btn-block" style="background:#fff; border:1px solid #ddd; color:#555;">\n            더 보기 (${filteredUnpinned.length - endIdx})</button>` : loadMore.innerHTML = "";
}

async function showArticleDetail(id) {
  hideAll();
  document.getElementById("articleDetailSection").classList.add("active");
  const root = document.getElementById("articleDetail");
  root.innerHTML = '\n        <div style="padding:60px 20px; text-align:center;">\n            <div style="width:40px; height:40px; border:4px solid #f3f3f3; border-top:4px solid #c62828; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 20px;"></div>\n            <p style="color:#666;">기사를 불러오는 중입니다...</p>\n        </div>\n    ', 
  document.getElementById("comments").innerHTML = "", document.getElementById("commentCount").textContent = "", 
  updateURL("article", id);
  try {
    const A = (await db.ref("articles/" + id).once("value")).val();
    if (!A) return alert("존재하지 않는 기사입니다!"), void showArticles();
    if (void 0 === A.content) {
      const contentSnap = await db.ref(`articleContents/${id}/content`).once("value");
      A.content = contentSnap.val() || "";
    }
    currentArticleId !== id && (incrementView(id), currentArticleId = id), currentCommentPage = 1;
    const currentUser = getNickname(), canEdit = isLoggedIn() && (A.author === currentUser || isAdmin()), views = (await db.ref(`articles/${id}/views`).once("value")).val() || 0, votes = getArticleVoteCounts(A), [userVote, authorPhoto] = await Promise.all([ checkUserVote(id), getUserProfilePhoto(A.authorEmail) ]), authorPhotoHTML = await createProfilePhoto(authorPhoto, 40), editedBadge = A.lastModified ? '<span class="edited-badge"><i class="fas fa-edit"></i> 수정됨</span>' : "";
    window._adminRevealAnonymous || (window._adminRevealAnonymous = {});
    const _isRevealedByAdmin = isAdmin() && !!window._adminRevealAnonymous[id], displayAuthor = A.anonymous ? _isRevealedByAdmin ? `${escapeHTML(A.author)} <span style="font-size:11px;background:#fff3e0;color:#e65100;padding:1px 7px;border-radius:8px;font-weight:600;">🔓 익명해제(관리자)</span>` : "익명" : escapeHTML(A.author), displayPhoto = A.anonymous && !_isRevealedByAdmin ? await createProfilePhoto(null, 40) : authorPhotoHTML, voteSection = A.hideVotes && !isAdmin() ? '<div style="text-align:center;color:#aaa;font-size:13px;padding:16px 0;">🙈 이 기사는 추천/비추천이 숨겨져 있습니다.</div>' : `<div style="display:flex;gap:10px;padding-top:20px;margin-top:20px;border-top:1px solid #eee;justify-content:center;">\n                <button id="like-btn-${A.id}" onclick="toggleVote('${A.id}', 'like')" class="vote-btn ${"like" === userVote ? "active" : ""}">\n                    👍 추천 ${votes.likes}\n                </button>\n                <button id="dislike-btn-${A.id}" onclick="toggleVote('${A.id}', 'dislike')" class="vote-btn dislike ${"dislike" === userVote ? "active" : ""}">\n                    👎 비추천 ${votes.dislikes}\n                </button>\n               </div>`;
    window._adminRevealAnonymous || (window._adminRevealAnonymous = {});
    const _adminRevealed = !!window._adminRevealAnonymous[A.id], adminArticlePanel = isAdmin() ? `\n            <div style="margin-top:20px; background:#fff8e1; border:1px solid #ffe082; border-radius:10px; padding:14px 16px;">\n                <div style="font-size:13px; font-weight:700; color:#795548; margin-bottom:10px;">🛠️ 관리자 기사 관리</div>\n                <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">\n                    <button onclick="adminResetArticleViews('${A.id}')" style="padding:6px 12px; background:#e3f2fd; color:#1565c0; border:1px solid #90caf9; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;">👁️ 조회수 초기화</button>\n                    <button onclick="adminResetArticleVotes('${A.id}')" style="padding:6px 12px; background:#fce4ec; color:#c62828; border:1px solid #f48fb1; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;">👍 추천/비추천 초기화</button>\n                    <button onclick="adminShowArticleReaders('${A.id}')" style="padding:6px 12px; background:#e8f5e9; color:#2e7d32; border:1px solid #a5d6a7; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;">📖 독자 목록</button>\n                    <button onclick="adminShowArticleVoters('${A.id}')" style="padding:6px 12px; background:#f3e5f5; color:#6a1b9a; border:1px solid #ce93d8; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;">🗳️ 투표 현황</button>\n                    ${A.anonymous ? `\n                    <button id="_adminAnonBtn_${A.id}"\n                        onclick="adminToggleAnonymousReveal('${A.id}')"\n                        style="padding:6px 12px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;\n                        border:1px solid ${_adminRevealed ? "#a5d6a7" : "#ffcc80"};\n                        background:${_adminRevealed ? "#e8f5e9" : "#fff3e0"};\n                        color:${_adminRevealed ? "#2e7d32" : "#e65100"};">\n                        ${_adminRevealed ? "🔓 익명 해제 중 (클릭 시 복원)" : "🔒 익명 해제 보기"}\n                    </button>` : ""}\n                </div>\n                <div id="_adminAnonInfo_${A.id}" style="font-size:11px; color:#888;">\n                    ${A.anonymous ? "🕵️ 익명 게시됨 | 실제 작성자: <strong>" + escapeHTML(A.author) + "</strong> (" + escapeHTML(A.authorEmail || "") + ")" : ""}\n                    ${A.hideVotes ? "&nbsp;&nbsp;🙈 추천/비추천 숨김 설정됨" : ""}\n                </div>\n\n                \x3c!-- ✅ 수치 직접 조작 --\x3e\n                <div style="margin-top:12px; border-top:1px solid #ffe082; padding-top:12px;">\n                    <div style="font-size:12px; font-weight:700; color:#795548; margin-bottom:8px;">📊 수치 직접 조작</div>\n                    <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:flex-end;">\n                        <div style="display:flex;flex-direction:column;gap:3px;">\n                            <label style="font-size:11px;color:#888;">👁️ 조회수</label>\n                            <input id="_adminViewsInput_${A.id}" type="number" min="0" value="${views}"\n                                style="width:90px;padding:5px 8px;border:1px solid #ffe082;border-radius:6px;font-size:13px;text-align:center;">\n                        </div>\n                        <div style="display:flex;flex-direction:column;gap:3px;">\n                            <label style="font-size:11px;color:#888;">👍 좋아요</label>\n                            <input id="_adminLikesInput_${A.id}" type="number" min="0" value="${votes.likes}"\n                                style="width:90px;padding:5px 8px;border:1px solid #ffe082;border-radius:6px;font-size:13px;text-align:center;">\n                        </div>\n                        <div style="display:flex;flex-direction:column;gap:3px;">\n                            <label style="font-size:11px;color:#888;">👎 싫어요</label>\n                            <input id="_adminDislikesInput_${A.id}" type="number" min="0" value="${votes.dislikes}"\n                                style="width:90px;padding:5px 8px;border:1px solid #ffe082;border-radius:6px;font-size:13px;text-align:center;">\n                        </div>\n                        <button onclick="adminSetArticleStats('${A.id}')"\n                            style="padding:6px 16px;background:#795548;color:white;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;height:30px;">\n                            ✅ 적용\n                        </button>\n                    </div>\n                </div>\n            </div>` : "";
    root.innerHTML = `<div style="background:#fff;padding:20px;border-radius:8px;">\n            <span class="category-badge">${A.category}</span>\n            <h1 style="font-size:22px;font-weight:700;margin:15px 0;line-height:1.4;">\n                ${escapeHTML(A.title)}\n                ${editedBadge}\n                ${A.anonymous ? '<span style="font-size:12px;background:#eee;color:#666;padding:2px 8px;border-radius:10px;font-weight:500;">🕵️ 익명</span>' : ""}\n            </h1>\n            ${isAdmin() ? `\n                <div style="display:inline-flex; align-items:center; gap:6px; background:#e8f0fe; border:1px solid #c5d4f5; padding:4px 10px; border-radius:6px; margin-bottom:10px; cursor:pointer;"\n                     onclick="copyArticleLink('${A.id}')" title="클릭하면 링크 복사">\n                    <span style="font-size:11px; color:#1967d2; font-weight:700;">🔑 기사 링크 ID</span>\n                    <code style="font-size:11px; color:#1967d2; font-family:monospace;">${A.id}</code>\n                    <span style="font-size:10px; color:#5f6368;">📋</span>\n                </div>\n            ` : ""}\n            \n            <div class="article-meta" style="border-bottom:1px solid #eee; padding-bottom:15px; margin-bottom:20px; display:flex; align-items:center; gap:12px;">\n                ${displayPhoto}\n                <div style="flex:1;">\n                    <div style="font-weight:600; color:#202124;">${displayAuthor}</div>\n                    <div style="color:#5f6368; font-size:13px;">${escapeHTML(A.date)}</div>\n                </div>\n                <span style="color:#5f6368;" id="viewCountDisplay">👁️ ${views}</span>\n            </div>\n            \n            ${A.thumbnail ? `<img src="${A.thumbnail}" style="width:100%;border-radius:8px;margin-bottom:20px;" alt="이미지">` : ""}\n            \n            <div data-detail-article-content style="font-size:16px;line-height:1.8;color:#333;">${sanitizeHTML(A.content)}</div>\n            \n            ${voteSection}\n            \n            ${adminArticlePanel}\n\n            ${canEdit ? `<div style="margin-top:20px;text-align:right;">\n                <button onclick="editArticle('${A.id}')" class="btn-secondary">수정</button>\n                <button onclick="deleteArticle('${A.id}')" class="btn-danger">삭제</button>\n            </div>` : ""}\n        </div>`, 
    window._currentArticleSettings = {
      anonymous: A.anonymous || !1,
      hideVotes: A.hideVotes || !1
    }, attachArticleVoteListeners(A.id), loadCommentsWithProfile(id), attachCommentsListener(id), 
    "function" == typeof addImageClickHandlersToArticle && setTimeout(() => addImageClickHandlersToArticle(), 300);
  } catch (error) {
    root.innerHTML = '<div style="padding:60px 20px; text-align:center;">\n            <p style="color:#f44336;">기사를 불러오는 중 오류가 발생했습니다.</p>\n            <button onclick="showArticles()" class="btn-primary" style="margin-top:20px;">목록으로</button>\n        </div>';
  }
}

function deleteArticle(id) {
  db.ref("articles/" + id).once("value").then(snapshot => {
    const A = snapshot.val();
    if (!A) return alert("없는 기사!");
    const currentUser = getNickname();
    if (!isLoggedIn() || A.author !== currentUser && !isAdmin()) return alert("삭제 권한이 없습니다!");
    confirm("정말 이 기사를 삭제하시겠습니까?") && deleteArticleFromDB(id, () => {
      alert("기사가 삭제되었습니다."), showArticles();
    });
  });
}

function editArticle(id) {
  db.ref("articles/" + id).once("value").then(async snapshot => {
    const article = snapshot.val();
    if (!article) return void alert("존재하지 않는 기사입니다!");
    if (void 0 === article.content) {
      const contentSnap = await db.ref(`articleContents/${id}/content`).once("value");
      article.content = contentSnap.val() || "";
    }
    const currentUser = getNickname();
    isLoggedIn() && (article.author === currentUser || isAdmin()) ? ("undefined" != typeof draftSaveEnabled && (window.draftSaveEnabled = !1), 
    localStorage.removeItem("draft_article"), hideAll(), document.getElementById("writeSection").classList.add("active"), 
    window.isEditingArticle = !0, window.editingArticleId = id, setTimeout(() => {
      window.quillEditor = null, void 0 !== editorInitialized && (window.editorInitialized = !1), 
      "function" == typeof initQuillEditor && initQuillEditor();
      const waitForEditor = (attempts = 0) => {
        if (window.quillEditor && window.quillEditor.root) {
          const categoryEl = document.getElementById("category"), titleEl = document.getElementById("title"), summaryEl = document.getElementById("summary");
          categoryEl && (categoryEl.value = article.category || "자유게시판"), titleEl && (titleEl.value = article.title || ""), 
          summaryEl && (summaryEl.value = article.summary || "");
          try {
            const contentToLoad = article.content || "";
            window.quillEditor.root.innerHTML = contentToLoad, setTimeout(() => {
              window.quillEditor.root.innerHTML !== contentToLoad && (window.quillEditor.root.innerHTML = contentToLoad);
            }, 100);
          } catch (error) {
            return void alert("내용을 불러오는데 실패했습니다: " + error.message);
          }
          if (article.thumbnail) {
            const preview = document.getElementById("thumbnailPreview"), uploadText = document.getElementById("uploadText");
            preview && uploadText && (preview.src = article.thumbnail, preview.style.display = "block", 
            uploadText.innerHTML = '<i class="fas fa-check"></i><p>기존 이미지 (클릭하여 변경)</p>');
          }
          setupEditForm(article, id);
        } else attempts < 50 ? setTimeout(() => waitForEditor(attempts + 1), 100) : alert("에디터 초기화에 실패했습니다. 페이지를 새로고침해주세요.");
      };
      waitForEditor();
    }, 200)) : alert("수정 권한이 없습니다!");
  }).catch(error => {
    alert("기사를 불러오는데 실패했습니다: " + error.message);
  });
}

async function previewThumbnail(event) {
  const file = event.target.files[0];
  if (!file) return;
  const errors = await validateImageFile(file);
  if (errors.length > 0) return alert("❌ 이미지 오류:\n" + errors.join("\n")), void (event.target.value = "");
  const reader = new FileReader;
  reader.onload = function(e) {
    const preview = document.getElementById("thumbnailPreview"), uploadText = document.getElementById("uploadText");
    preview && uploadText && (preview.src = e.target.result, preview.style.display = "block", 
    uploadText.innerHTML = '<i class="fas fa-check"></i><p>이미지 선택됨 (클릭하여 변경)</p>');
  }, reader.readAsDataURL(file);
}

function saveDraftContent() {
  if (window.quillEditor) try {
    const draftData = {
      category: document.getElementById("category")?.value || "",
      title: document.getElementById("title")?.value || "",
      summary: document.getElementById("summary")?.value || "",
      content: window.quillEditor.root.innerHTML || "",
      thumbnail: document.getElementById("thumbnailPreview")?.src || "",
      timestamp: Date.now()
    }, fingerprint = draftData.category + "|" + draftData.title + "|" + draftData.summary + "|" + draftData.content + "|" + draftData.thumbnail;
    if (fingerprint === window._lastArticleDraftFingerprint) return;
    window._lastArticleDraftFingerprint = fingerprint, localStorage.setItem("articleDraft", JSON.stringify(draftData));
  } catch (error) {}
}

function restoreDraftContent() {
  try {
    const savedDraft = localStorage.getItem("articleDraft");
    if (!savedDraft) return;
    const draftData = JSON.parse(savedDraft);
    if (Date.now() - draftData.timestamp > 3e5) return void localStorage.removeItem("articleDraft");
    let _waitAttempts = 0;
    const waitForEditor = () => {
      if (!window.quillEditor || !window.quillEditor.root) return void (_waitAttempts++ < 100 && setTimeout(waitForEditor, 100));
      const categoryEl = document.getElementById("category"), titleEl = document.getElementById("title"), summaryEl = document.getElementById("summary");
      if (categoryEl && draftData.category && (categoryEl.value = draftData.category), 
      titleEl && draftData.title && (titleEl.value = draftData.title), summaryEl && draftData.summary && (summaryEl.value = draftData.summary), 
      draftData.content && (window.quillEditor.root.innerHTML = draftData.content), draftData.thumbnail && draftData.thumbnail.startsWith("data:")) {
        const preview = document.getElementById("thumbnailPreview"), uploadText = document.getElementById("uploadText");
        preview && uploadText && (preview.src = draftData.thumbnail, preview.style.display = "block", 
        uploadText.innerHTML = '<i class="fas fa-check"></i><p>기존 이미지 (클릭하여 변경)</p>');
      }
    };
    waitForEditor();
  } catch (error) {}
}

function clearDraftContent() {
  localStorage.removeItem("articleDraft"), localStorage.removeItem("draft_article"), 
  window.autoSaveInterval && (clearInterval(window.autoSaveInterval), window.autoSaveInterval = null);
}

window.initCategoryNewDots = async function() {
  try {
    const articles = (await db.ref("articles").orderByChild("timestamp").limitToLast(50).once("value")).val() || {}, catLatest = {};
    Object.values(articles).forEach(a => {
      a && !a.deleted && NON_FREE_CATS.includes(a.category) && (!catLatest[a.category] || a.timestamp > catLatest[a.category]) && (catLatest[a.category] = a.timestamp);
    });
    let anyNew = !1;
    NON_FREE_CATS.forEach(cat => {
      const lastSeen = parseInt(localStorage.getItem("_catLastSeen_" + cat) || "0"), hasNew = (catLatest[cat] || 0) > lastSeen;
      hasNew && (anyNew = !0);
      const item = document.querySelector(`#catDropdownMenu [data-cat="${cat}"]`);
      if (item) {
        const dot = item.querySelector("._catDot");
        dot && (dot.style.display = hasNew ? "block" : "none");
      }
    });
    const btnDot = document.getElementById("catBtnDot");
    btnDot && (btnDot.style.display = anyNew ? "block" : "none");
  } catch (e) {}
}, window.selectCategory = function(cat) {
  const sel = document.getElementById("searchCategory");
  if (sel && (sel.value = cat, sel.dispatchEvent(new Event("change"))), document.getElementById("catDropdownLabel").textContent = cat, 
  document.getElementById("catDropdownMenu").style.display = "none", document.getElementById("catDropdownArrow").style.transform = "", 
  NON_FREE_CATS.includes(cat)) {
    localStorage.setItem("_catLastSeen_" + cat, Date.now());
    const item = document.querySelector(`#catDropdownMenu [data-cat="${cat}"]`);
    if (item) {
      const d = item.querySelector("._catDot");
      d && (d.style.display = "none");
    }
    const anyLeft = NON_FREE_CATS.some(c => {
      const it = document.querySelector(`#catDropdownMenu [data-cat="${c}"]`);
      return it && "none" !== it.querySelector("._catDot")?.style.display;
    }), btnDot = document.getElementById("catBtnDot");
    btnDot && (btnDot.style.display = anyLeft ? "block" : "none");
  }
  "function" == typeof showArticles && showArticles();
}, window.toggleCatDropdown = function() {
  const menu = document.getElementById("catDropdownMenu"), arrow = document.getElementById("catDropdownArrow"), isOpen = "none" !== menu.style.display;
  menu.style.display = isOpen ? "none" : "block", arrow.style.transform = isOpen ? "" : "rotate(180deg)", 
  isOpen || setTimeout(() => {
    document.addEventListener("click", function closeDrop(e) {
      document.getElementById("catDropdownWrapper")?.contains(e.target) || (menu.style.display = "none", 
      arrow.style.transform = "", document.removeEventListener("click", closeDrop));
    });
  }, 10);
}, window.handleReplyKey = function(e, articleId, commentId) {
  if ("Enter" === e.key) {
    /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? (e.preventDefault(), "function" == typeof submitReply && submitReply(articleId, commentId)) : e.shiftKey || (e.preventDefault(), 
    "function" == typeof submitReply && submitReply(articleId, commentId));
  }
}, window.showQnA = function() {
  hideAll(), window.scrollTo(0, 0);
  const section = document.getElementById("qnaSection");
  section && (section.classList.add("active"), loadQnAFromFile(), updateURL("qna"));
}, window.showPatchNotesPage = function() {
  hideAll(), window.scrollTo(0, 0);
  const section = document.getElementById("patchnotesSection");
  if (!section) return;
  section.classList.add("active");
  const listElement = document.getElementById("patchNotesList");
  listElement && loadPatchNotesToContainer(listElement), updateURL("patchnotes");
}, window.openPatchNoteModal = function(id = null) {
  const modal = document.getElementById("patchNoteModal");
  if (!modal) return;
  const form = document.getElementById("patchNoteForm");
  form && form.reset();
  const editIdInput = document.getElementById("editPatchId");
  if (editIdInput && (editIdInput.value = ""), id) db.ref("patchNotes/" + id).once("value").then(snap => {
    const data = snap.val();
    editIdInput && (editIdInput.value = id);
    const versionInput = document.getElementById("patchVersion"), dateInput = document.getElementById("patchDate"), contentInput = document.getElementById("patchContent");
    versionInput && (versionInput.value = data.version), dateInput && (dateInput.value = data.date), 
    contentInput && (contentInput.value = data.content), modal.classList.add("active");
  }); else {
    const dateInput = document.getElementById("patchDate");
    dateInput && (dateInput.value = (new Date).toISOString().split("T")[0]), modal.classList.add("active");
  }
}, window.closePatchNoteModal = function() {
  const modal = document.getElementById("patchNoteModal");
  modal && modal.classList.remove("active");
}, window.savePatchNote = function(e) {
  if (e.preventDefault(), !isAdmin()) return alert("관리자만 가능합니다.");
  const id = document.getElementById("editPatchId")?.value, data = {
    version: document.getElementById("patchVersion")?.value,
    date: document.getElementById("patchDate")?.value,
    content: document.getElementById("patchContent")?.value
  };
  id ? db.ref("patchNotes/" + id).update(data) : db.ref("patchNotes").push(data), 
  closePatchNoteModal(), document.getElementById("patchnotesSection")?.classList.contains("active") && showPatchNotesPage();
}, window.deletePatchNote = function(id) {
  isAdmin() && confirm("정말 삭제하시겠습니까?") && db.ref("patchNotes/" + id).remove().then(() => {
    document.getElementById("patchnotesSection")?.classList.contains("active") && showPatchNotesPage();
  });
}, window.quillEditor = null;

let editorInitialized = !1;

function initQuillEditor() {
  const container = document.getElementById("quillEditor");
  if (!container) return null;
  if (window.quillEditor && editorInitialized) return window.quillEditor;
  if (window.quillEditor) try {
    window.quillEditor.theme && window.quillEditor.theme.tooltip && window.quillEditor.theme.tooltip.hide(), 
    window.quillEditor.off("text-change"), window.quillEditor = null;
  } catch (e) {}
  const existingToolbar = document.querySelector(".ql-toolbar");
  existingToolbar && existingToolbar.remove(), container.innerHTML = "", editorInitialized = !1;
  try {
    const bindings = {
      header1: {
        key: "#",
        prefix: /^###\s$/,
        handler: function(range, context) {
          this.quill.formatLine(range.index, 1, "header", 1), this.quill.deleteText(range.index - 4, 4);
        }
      },
      header2: {
        key: "#",
        prefix: /^##\s$/,
        handler: function(range, context) {
          this.quill.formatLine(range.index, 1, "header", 2), this.quill.deleteText(range.index - 3, 3);
        }
      },
      header3: {
        key: "#",
        prefix: /^#\s$/,
        handler: function(range, context) {
          this.quill.formatLine(range.index, 1, "header", 3), this.quill.deleteText(range.index - 2, 2);
        }
      },
      list: {
        key: " ",
        prefix: /^-$/,
        handler: function(range, context) {
          this.quill.formatLine(range.index, 1, "list", "bullet"), this.quill.deleteText(range.index - 1, 1);
        }
      },
      bold: {
        key: "*",
        prefix: /\*\*(.+)\*\*$/,
        handler: function(range, context) {
          const match = context.prefix.match(/\*\*(.+)\*\*$/);
          if (match) {
            const text = match[1], startIndex = range.index - match[0].length;
            this.quill.deleteText(startIndex, match[0].length), this.quill.insertText(startIndex, text, {
              bold: !0
            }), this.quill.setSelection(startIndex + text.length);
          }
        }
      },
      italic: {
        key: "*",
        prefix: /\*(.+)\*$/,
        handler: function(range, context) {
          const match = context.prefix.match(/\*(.+)\*$/);
          if (match && !context.prefix.includes("**")) {
            const text = match[1], startIndex = range.index - match[0].length;
            this.quill.deleteText(startIndex, match[0].length), this.quill.insertText(startIndex, text, {
              italic: !0
            }), this.quill.setSelection(startIndex + text.length);
          }
        }
      },
      blockquote: {
        key: " ",
        prefix: /^>$/,
        handler: function(range, context) {
          this.quill.formatLine(range.index, 1, "blockquote", !0), this.quill.deleteText(range.index - 1, 1);
        }
      }
    };
    return window.quillEditor = new Quill("#quillEditor", {
      theme: "snow",
      modules: {
        toolbar: [ [ {
          header: [ 1, 2, 3, !1 ]
        } ], [ "bold", "italic", "underline", "strike" ], [ {
          color: []
        }, {
          background: []
        } ], [ {
          list: "ordered"
        }, {
          list: "bullet"
        } ], [ "blockquote" ], [ {
          align: []
        } ], [ "link", "image", "video" ], [ "clean" ] ],
        keyboard: {
          bindings: bindings
        }
      },
      placeholder: ""
    }), editorInitialized = !0, setTimeout(() => {
      try {
        addQuillTooltips(container);
      } catch (e) {}
    }, 200), window.dispatchEvent(new Event("quillEditorReady")), window.quillEditor;
  } catch (error) {
    return null;
  }
}

function addQuillTooltips(container, retryCount = 0) {
  setTimeout(() => {
    const toolbar = container.querySelector(".ql-toolbar");
    if (!toolbar) return retryCount < 2 ? void addQuillTooltips(container, retryCount + 1) : void 0;
    Object.entries({
      bold: "굵게",
      italic: "기울임꼴",
      underline: "밑줄",
      strike: "취소선",
      link: "링크 삽입",
      image: "이미지 삽입",
      video: "동영상 삽입",
      clean: "서식 지우기"
    }).forEach(([className, tooltip]) => {
      toolbar.querySelectorAll(".ql-" + className).forEach(btn => {
        btn.setAttribute("title", tooltip);
      });
    }), toolbar.querySelectorAll(".ql-header").forEach(btn => {
      const value = btn.getAttribute("value");
      "1" === value ? btn.setAttribute("title", "큰 제목") : "2" === value ? btn.setAttribute("title", "중간 제목") : "3" === value ? btn.setAttribute("title", "작은 제목") : value && "false" !== value || btn.setAttribute("title", "일반 텍스트");
    }), toolbar.querySelectorAll(".ql-list").forEach(btn => {
      const value = btn.getAttribute("value");
      "ordered" === value ? btn.setAttribute("title", "번호 목록") : "bullet" === value && btn.setAttribute("title", "글머리 기호 목록");
    }), toolbar.querySelectorAll(".ql-align").forEach(btn => {
      const value = btn.getAttribute("value");
      value ? "center" === value ? btn.setAttribute("title", "가운데 정렬") : "right" === value ? btn.setAttribute("title", "오른쪽 정렬") : "justify" === value && btn.setAttribute("title", "양쪽 정렬") : btn.setAttribute("title", "왼쪽 정렬");
    }), toolbar.querySelectorAll(".ql-color").forEach(btn => {
      btn.setAttribute("title", "글자 색상");
    }), toolbar.querySelectorAll(".ql-background").forEach(btn => {
      btn.setAttribute("title", "배경 색상");
    });
  }, 200);
}

function setupArticleForm() {
  window.isEditingArticle && (window.isEditingArticle = !1, window.editingArticleId = null);
  const form = document.getElementById("articleForm");
  if (!form) return;
  let editor = window.quillEditor;
  editor && editorInitialized || (editor = initQuillEditor()), form.reset(), setTimeout(() => {
    window.quillEditor && window.quillEditor.setText(""), clearDraftContent();
  }, 100);
  const preview = document.getElementById("thumbnailPreview"), uploadText = document.getElementById("uploadText");
  function checkInputs() {
    const titleInput = document.getElementById("title"), summaryInput = document.getElementById("summary"), warningEl = document.getElementById("bannedWordWarning");
    if (!window.quillEditor || !titleInput || !summaryInput) return;
    const editorContent = window.quillEditor.getText(), foundWord = checkBannedWords(titleInput.value + " " + summaryInput.value + " " + editorContent);
    foundWord ? (warningEl.textContent = `금지어가 포함되어 있습니다: "${foundWord}"`, warningEl.style.display = "block") : warningEl.style.display = "none";
  }
  preview && (preview.style.display = "none"), uploadText && (uploadText.innerHTML = '<i class="fas fa-camera"></i><p>클릭하여 이미지 업로드</p>'), 
  window.autoSaveInterval && clearInterval(window.autoSaveInterval), window.autoSaveInterval = setInterval(() => {
    window.isEditingArticle || saveDraftContent();
  }, 3e3);
  const titleInput = document.getElementById("title"), summaryInput = document.getElementById("summary");
  if (titleInput) {
    const newTitleInput = titleInput.cloneNode(!0);
    titleInput.parentNode.replaceChild(newTitleInput, titleInput), newTitleInput.addEventListener("input", checkInputs);
  }
  if (summaryInput) {
    const newSummaryInput = summaryInput.cloneNode(!0);
    summaryInput.parentNode.replaceChild(newSummaryInput, summaryInput), newSummaryInput.addEventListener("input", checkInputs);
  }
  window.quillEditor && (window.quillEditor.off("text-change"), window.quillEditor.on("text-change", checkInputs));
  const fileInput = document.getElementById("thumbnailInput");
  if (fileInput) {
    const newFileInput = fileInput.cloneNode(!0);
    fileInput.parentNode.replaceChild(newFileInput, fileInput), newFileInput.addEventListener("change", previewThumbnail);
  }
  function resetFormAfterSubmit() {
    const form = document.getElementById("articleForm");
    form && form.reset(), window.quillEditor && window.quillEditor.setText("");
    const preview = document.getElementById("thumbnailPreview"), uploadText = document.getElementById("uploadText");
    preview && (preview.style.display = "none"), uploadText && (uploadText.innerHTML = '<i class="fas fa-camera"></i><p>클릭하여 이미지 업로드</p>');
    const warningEl = document.getElementById("bannedWordWarning");
    warningEl && (warningEl.style.display = "none"), clearDraftContent(), alert("기사가 발행되었습니다!");
  }
  form.onsubmit = async function(e) {
    if (e.preventDefault(), window.isSubmitting) return;
    window.isSubmitting = !0, form.onsubmit = async function(e) {
      if (e.preventDefault(), !window.isSubmitting) return window.isSubmitting = !0, rateLimiter.check("article", 3, 6e5) ? void 0 : (alert("⚠️ 기사를 너무 빠르게 작성하고 있습니다. 잠시 후 다시 시도해주세요."), 
      void (window.isSubmitting = !1));
    };
    const titleInput = document.getElementById("title"), summaryInput = document.getElementById("summary"), categoryInput = document.getElementById("category");
    document.getElementById("bannedWordWarning");
    if (window.isEditingArticle && window.editingArticleId) return alert("⚠️ 현재 수정 모드입니다. 새 기사를 작성하려면 '작성' 메뉴를 다시 클릭해주세요."), 
    void (window.isSubmitting = !1);
    if (!isLoggedIn()) return alert("기사 작성은 로그인 후 가능합니다!"), void (window.isSubmitting = !1);
    if (!window.quillEditor) return alert("에디터가 초기화되지 않았습니다. 페이지를 새로고침해주세요."), void (window.isSubmitting = !1);
    const title = titleInput ? titleInput.value.trim() : "", content = window.quillEditor.root ? window.quillEditor.root.innerHTML : "", summary = summaryInput ? summaryInput.value.trim() : "", category = categoryInput ? categoryInput.value : "자유게시판";
    if (!title || !content || "<p><br></p>" === content || "<p></p>" === content) return alert("제목과 내용을 입력해주세요."), 
    void (window.isSubmitting = !1);
    const foundWord = checkBannedWords(title + " " + content + " " + summary);
    if (foundWord) return alert(`금지어("${foundWord}")가 포함되어 업로드가 차단되고 경고 1회가 누적됩니다.`), 
    addWarningToCurrentUser(), void (window.isSubmitting = !1);
    const _imp = isAdmin() && window._adminImpersonateUser, article = {
      id: Date.now().toString(),
      category: category,
      title: title,
      summary: summary,
      content: content,
      author: _imp ? _imp.nick : getNickname(),
      authorEmail: _imp ? _imp.email : getUserEmail(),
      authorUid: _imp ? _imp.uid : getUserId(),
      date: (new Date).toLocaleString(),
      createdAt: Date.now(),
      views: 0,
      likeCount: 0,
      dislikeCount: 0,
      thumbnail: null,
      anonymous: document.getElementById("articleAnonymous")?.checked || !1,
      hideVotes: document.getElementById("articleHideVotes")?.checked || !1,
      noNotify: document.getElementById("articleNoNotify")?.checked || !1
    }, fileInputSubmit = document.getElementById("thumbnailInput");
    if (fileInputSubmit && fileInputSubmit.files[0]) {
      const reader = new FileReader;
      reader.onload = async function(e) {
        article.thumbnail = e.target.result, saveArticle(article, async () => {
          resetFormAfterSubmit(), window.isSubmitting = !1, article.noNotify || (await sendNotification("article", {
            authorEmail: article.authorEmail,
            authorName: article.anonymous ? "익명 유저" : article.author,
            title: article.title,
            articleId: article.id,
            anonymous: article.anonymous || !1
          }), triggerGithubNotification(!0)), showArticles();
        });
      }, reader.readAsDataURL(fileInputSubmit.files[0]);
    } else saveArticle(article, async () => {
      resetFormAfterSubmit(), window.isSubmitting = !1, article.noNotify || (await sendNotification("article", {
        authorEmail: article.authorEmail,
        authorName: article.anonymous ? "익명 유저" : article.author,
        title: article.title,
        articleId: article.id,
        category: article.category,
        anonymous: article.anonymous || !1
      }), triggerGithubNotification(!0)), showArticles();
    });
  };
}

function setupEditForm(article, articleId) {
  const form = document.getElementById("articleForm"), titleInput = document.getElementById("title"), summaryInput = document.getElementById("summary"), warningEl = document.getElementById("bannedWordWarning");
  function checkInputs() {
    if (!window.quillEditor?.getText) return;
    const editorContent = window.quillEditor.getText(), foundWord = checkBannedWords(titleInput.value + " " + summaryInput.value + " " + editorContent);
    foundWord ? (warningEl.textContent = `🚫 금지어: "${foundWord}"`, warningEl.style.display = "block") : warningEl.style.display = "none";
  }
  titleInput.addEventListener("input", checkInputs), summaryInput.addEventListener("input", checkInputs);
  const fileInput = document.getElementById("thumbnailInput");
  fileInput.addEventListener("change", previewThumbnail), form.onsubmit = function(e) {
    e.preventDefault();
    const title = titleInput.value, summary = summaryInput.value, content = window.quillEditor?.root?.innerHTML || "", foundWord = checkBannedWords(title + " " + content + " " + summary);
    if (foundWord) return alert(`⚠️ 금지어("${foundWord}")가 포함되어 있습니다.`), void addWarningToCurrentUser();
    if (fileInput.files[0]) {
      const reader = new FileReader;
      reader.onload = function(e) {
        article.thumbnail = e.target.result, saveUpdatedArticle();
      }, reader.readAsDataURL(fileInput.files[0]);
    } else saveUpdatedArticle();
    function saveUpdatedArticle() {
      article.category = document.getElementById("category").value, article.title = title, 
      article.summary = summary, article.content = content, article.date = (new Date).toLocaleString() + " (수정됨)", 
      saveArticle(article, () => {
        form.reset(), window.quillEditor?.setText && window.quillEditor.setText("");
        const preview = document.getElementById("thumbnailPreview"), uploadText = document.getElementById("uploadText");
        preview && (preview.style.display = "none"), uploadText && (uploadText.innerHTML = '<i class="fas fa-camera"></i><p>이미지 업로드</p>'), 
        warningEl.style.display = "none", clearDraftContent(), alert("기사가 수정되었습니다!"), showArticleDetail(articleId);
      });
    }
  };
}

const rateLimiter = {
  _records: {},
  check(action, limit, windowMs) {
    const key = `${getUserId()}_${action}`, now = Date.now();
    return this._records[key] || (this._records[key] = []), this._records[key] = this._records[key].filter(t => now - t < windowMs), 
    !(this._records[key].length >= limit) && (this._records[key].push(now), !0);
  }
};

async function loadCommentsWithProfile(id) {
  await authReady;
  getNickname();
  const currentEmail = getUserEmail(), myUid = getUserId();
  try {
    const [commentsSnap, votesSnap] = await Promise.all([ db.ref("comments/" + id).once("value"), isLoggedIn() ? db.ref(`commentVotes/${id}`).once("value") : Promise.resolve(null) ]), val = commentsSnap.val() || {}, votesData = votesSnap && votesSnap.val() || {};
    let commentsList = Object.entries(val);
    "oldest" === currentCommentSort ? commentsList.sort((a, b) => Number(a[0]) - Number(b[0])) : "likes" === currentCommentSort ? commentsList.sort((a, b) => (b[1].likeCount || 0) - (a[1].likeCount || 0)) : commentsList.sort((a, b) => Number(b[0]) - Number(a[0]));
    const root = document.getElementById("comments"), countEl = document.getElementById("commentCount");
    if (countEl && (countEl.textContent = `(${commentsList.length})`), !commentsList.length) return root.innerHTML = "<p style='color:#868e96;text-align:center;padding:30px;'>첫 댓글을 남겨보세요!</p>", 
    void (document.getElementById("loadMoreComments").innerHTML = "");
    const endIdx = 10 * currentCommentPage, displayComments = commentsList.slice(0, endIdx), emails = [ ...new Set(displayComments.map(([_, c]) => c.authorEmail).filter(Boolean)) ];
    displayComments.forEach(([_, comment]) => {
      comment.replies && Object.values(comment.replies).forEach(r => {
        r.authorEmail && emails.push(r.authorEmail);
      });
    });
    const uncachedEmails = [ ...new Set(emails) ].filter(e => !window.profilePhotoCache.has(e));
    if (uncachedEmails.length > 0 && isLoggedIn()) {
      const emailToUid = {};
      displayComments.forEach(([_, comment]) => {
        comment.authorEmail && comment.authorUid && (emailToUid[comment.authorEmail] = comment.authorUid), 
        comment.replies && Object.values(comment.replies).forEach(r => {
          r.authorEmail && r.authorUid && (emailToUid[r.authorEmail] = r.authorUid);
        });
      });
      try {
        await Promise.all(uncachedEmails.map(async email => {
          try {
            const uid = emailToUid[email];
            if (uid) {
              const snap = await db.ref("users/" + uid + "/profilePhoto").once("value");
              window.profilePhotoCache.set(email, snap.val() || null);
            } else {
              const v = (await db.ref("users").orderByChild("email").equalTo(email).limitToFirst(1).once("value")).val(), u = v ? Object.values(v)[0] : null;
              window.profilePhotoCache.set(email, u && u.profilePhoto || null);
            }
          } catch (e) {
            window.profilePhotoCache.set(email, null);
          }
        }));
      } catch (e) {
        uncachedEmails.forEach(email => window.profilePhotoCache.set(email, null));
      }
    }
    const _settings = window._currentArticleSettings || {}, commentsHTML = displayComments.map(([commentId, comment]) => {
      const isMyComment = isLoggedIn() && (comment.authorEmail === currentEmail || isAdmin()), _cRevealedByAdmin = isAdmin() && !!(window._adminRevealAnonymous || {})[currentArticleId], displayCommentAuthor = _settings.anonymous ? _cRevealedByAdmin ? `${escapeHTML(comment.author)} <span style="font-size:10px;background:#fff3e0;color:#e65100;padding:1px 6px;border-radius:8px;font-weight:600;">🔓</span>` : "익명" : escapeHTML(comment.author), authorPhotoHTML = getProfilePlaceholder(_settings.anonymous && !_cRevealedByAdmin ? null : window.profilePhotoCache.get(comment.authorEmail) || null, 32), commentEditedBadge = comment.edited ? '<span class="edited-badge"><i class="fas fa-edit"></i> 수정됨</span>' : "", myCommentVote = votesData[commentId] && votesData[commentId][myUid] || null, likeCount = comment.likeCount || 0, dislikeCount = comment.dislikeCount || 0, likeActive = "like" === myCommentVote ? "background:#e3f2fd; color:#1565c0; border-color:#1565c0;" : "", dislikeActive = "dislike" === myCommentVote ? "background:#fce4ec; color:#c62828; border-color:#c62828;" : "", commentVoteHTML = _settings.hideVotes && !isAdmin() ? "" : `<button id="clike-${commentId}" onclick="toggleCommentVote('${id}','${commentId}','like')" style="border:1px solid #ddd; border-radius:20px; padding:3px 10px; font-size:12px; background:#fff; cursor:pointer; ${likeActive}">👍 ${likeCount}</button>\n                   <button id="cdislike-${commentId}" onclick="toggleCommentVote('${id}','${commentId}','dislike')" style="border:1px solid #ddd; border-radius:20px; padding:3px 10px; font-size:12px; background:#fff; cursor:pointer; ${dislikeActive}">👎 ${dislikeCount}</button>`, repliesHTML = function(repliesObj, commentId) {
        if (!repliesObj) return "";
        const all = Object.entries(repliesObj).sort((a, b) => new Date(a[1].timestamp) - new Date(b[1].timestamp)), replyAuthorMap = {};
        all.forEach(([rid, r]) => {
          replyAuthorMap[rid] = r.author;
        });
        const roots = all.filter(([_, r]) => !r.parentReplyId), childMap = {};
        all.forEach(([rid, r]) => {
          r.parentReplyId && (childMap[r.parentReplyId] || (childMap[r.parentReplyId] = []), 
          childMap[r.parentReplyId].push([ rid, r ]));
        });
        const ordered = [];
        return roots.forEach(function flatten([replyId, reply]) {
          ordered.push([ replyId, reply ]), (childMap[replyId] || []).forEach(flatten);
        }), ordered.map(([replyId, reply]) => {
          const isMyReply = isLoggedIn() && (reply.authorEmail === currentEmail || isAdmin()), _rRevealedByAdmin = isAdmin() && !!(window._adminRevealAnonymous || {})[id], _rIsAnon = !(!_settings || !_settings.anonymous), rPhotoHTML = getProfilePlaceholder(_rIsAnon && !_rRevealedByAdmin ? null : window.profilePhotoCache.get(reply.authorEmail) || null, 24), editedBadge = reply.edited ? '<span class="edited-badge"><i class="fas fa-edit"></i> 수정됨</span>' : "", isChild = !!reply.parentReplyId, indent = isChild ? 20 : 0, mentionName = isChild && replyAuthorMap[reply.parentReplyId] || null, mentionBadge = mentionName ? `<span style="color:#c62828;font-size:12px;font-weight:600;margin-right:4px;">@${escapeHTML(mentionName)}</span>` : "";
          return `\n                    <div class="reply-item" id="reply-${commentId}-${replyId}" style="margin-left:${indent}px;">\n                        <div class="reply-header">\n                            ${rPhotoHTML}\n                            <span class="reply-author">↳ ${_rIsAnon ? _rRevealedByAdmin ? `${escapeHTML(reply.author)} <span style="font-size:10px;background:#fff3e0;color:#e65100;padding:1px 6px;border-radius:8px;font-weight:600;">🔓</span>` : "익명" : escapeHTML(reply.author)}</span>\n                            <span class="reply-time">${escapeHTML(reply.timestamp)}</span>\n                            ${editedBadge}\n                        </div>\n                        <div class="reply-content" id="replyContent-${commentId}-${replyId}" style="white-space:pre-wrap;">${mentionBadge}${escapeHTML(reply.text)}</div>\n${reply.imageBase64 ? `\n    <div style="margin-top:6px;">\n        <img src="${reply.imageBase64}" onclick="openImageModal('${reply.imageBase64}')" style="max-width:100%; max-height:200px; border-radius:8px; cursor:pointer; object-fit:cover;">\n    </div>\n` : ""}\n                        <div class="reply-edit-form" id="replyEditForm-${commentId}-${replyId}" style="display:none;">\n                            <textarea id="replyEditInput-${commentId}-${replyId}" class="reply-input" style="resize:none; overflow:hidden; min-height:36px; max-height:100px; line-height:1.4; border-radius:16px; padding:8px 12px; width:100%; box-sizing:border-box;" onkeydown="if(event.key==='Enter' && !event.shiftKey){ event.preventDefault(); saveReplyEdit('${id}', '${commentId}', '${replyId}'); }" oninput="autoResizeTextarea(this)">${reply.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</textarea>\n                            <div style="display:flex; gap:5px; margin-top:5px;">\n                                <button onclick="saveReplyEdit('${id}', '${commentId}', '${replyId}')" class="btn-text" style="color:#1976d2;">저장</button>\n                                <button onclick="cancelReplyEdit('${commentId}', '${replyId}')" class="btn-text">취소</button>\n                            </div>\n                        </div>\n                        <div class="reply-actions">\n                            <button onclick="toggleNestedReplyForm('${commentId}', '${replyId}')" class="btn-text" style="font-size:11px;">💬 답글</button>\n                            ${isMyReply ? `\n                                <button onclick="editReply('${commentId}', '${replyId}')" class="btn-text" style="font-size:11px;">✏️ 수정</button>\n                                <button onclick="deleteReply('${id}', '${commentId}', '${replyId}')" class="btn-text-danger" style="font-size:11px;">삭제</button>\n                            ` : ""}\n                        </div>\n                        <div id="nestedReplyForm-${commentId}-${replyId}" class="reply-input-area" style="display:none; margin-left:8px; flex-direction:column; gap:6px;">\n    <div id="nestedReplyImagePreview-${commentId}-${replyId}" style="display:none; position:relative;">\n        <img id="nestedReplyImagePreviewImg-${commentId}-${replyId}" style="max-height:100px; max-width:100%; border-radius:8px; object-fit:contain; border:1px solid #dee2e6;">\n        <button onclick="clearNestedReplyImage('${commentId}','${replyId}')" style="position:absolute; top:3px; right:3px; background:rgba(0,0,0,0.55); color:white; border:none; border-radius:50%; width:20px; height:20px; font-size:11px; cursor:pointer; display:flex; align-items:center; justify-content:center;"><i class="fas fa-times"></i></button>\n    </div>\n    <div style="display:flex; align-items:flex-end; gap:6px;">\n        <textarea id="nestedReplyInput-${commentId}-${replyId}" class="reply-input" placeholder="답글 입력..." rows="1"\n            style="resize:none; overflow:hidden; min-height:36px; max-height:100px; line-height:1.4; flex:1; border-radius:16px; padding:8px 12px;"\n            onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();submitNestedReply('${id}','${commentId}','${replyId}')}"\n            oninput="autoResizeTextarea(this)"></textarea>\n        <input type="file" id="nestedReplyImageInput-${commentId}-${replyId}" accept="image/*" style="display:none;" onchange="previewNestedReplyImage(this,'${commentId}','${replyId}')">\n        <button onclick="document.getElementById('nestedReplyImageInput-${commentId}-${replyId}').click()" class="btn-reply-submit" style="background:#f0f4f8; color:#495057;"><i class="fas fa-camera"></i></button>\n        <button onclick="submitNestedReply('${id}', '${commentId}', '${replyId}')" class="btn-reply-submit"><i class="fas fa-paper-plane"></i></button>\n    </div>\n</div>\n                    </div>\n                `;
        }).join("");
      }(comment.replies, commentId);
      return `\n                <div class="comment-card" id="comment-${commentId}">\n                    <div class="comment-header">\n                        ${authorPhotoHTML}\n                        <span class="comment-author">${displayCommentAuthor}</span>\n                        <span class="comment-time">${escapeHTML(comment.timestamp)}</span>\n                        ${commentEditedBadge}\n                    </div>\n                   <div class="comment-body" id="commentBody-${commentId}" style="white-space: pre-wrap;">${escapeHTML(comment.text)}</div>\n${comment.imageBase64 ? `\n    <div class="comment-media" style="margin-top:8px;">\n        <img src="${comment.imageBase64}" onclick="openImageModal('${comment.imageBase64}')" style="max-width:100%; max-height:300px; border-radius:8px; cursor:pointer; object-fit:cover;">\n    </div>\n` : comment.mediaUrl ? `\n    <div class="comment-media" style="margin-top:8px;">\n        ${"video" === comment.mediaType ? `<video src="${comment.mediaUrl}" controls style="max-width:100%; max-height:300px; border-radius:8px;"></video>` : `<img src="${comment.mediaUrl}" onclick="openImageModal('${comment.mediaUrl}')" style="max-width:100%; max-height:300px; border-radius:8px; cursor:pointer; object-fit:cover;">`}\n    </div>\n` : ""}\n                    \n                    <div class="comment-edit-form" id="commentEditForm-${commentId}" style="display:none;">\n                        <textarea id="commentEditInput-${commentId}" class="comment-edit-textarea" onkeydown="if(event.key==='Enter' && !event.shiftKey) { event.preventDefault(); saveCommentEdit('${id}', '${commentId}'); }">${comment.text}</textarea>\n                        <div style="display:flex; gap:10px; margin-top:10px;">\n                            <button onclick="saveCommentEdit('${id}', '${commentId}')" class="btn-primary" style="padding:8px 16px; font-size:13px;">저장</button>\n                            <button onclick="cancelCommentEdit('${commentId}')" class="btn-secondary" style="padding:8px 16px; font-size:13px;">취소</button>\n                        </div>\n                    </div>\n                    \n                    <div class="comment-footer" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">\n                        ${commentVoteHTML}\n                        <button onclick="toggleReplyForm('${commentId}')" class="btn-text">💬 답글</button>\n                        ${isMyComment ? `\n                            <button onclick="editComment('${commentId}')" class="btn-text">✏️ 수정</button>\n                            <button onclick="deleteComment('${id}', '${commentId}', '${comment.author}')" class="btn-text text-danger">삭제</button>\n                        ` : ""}\n                    </div>\n\n                    <div class="replies-container">\n                        ${repliesHTML}\n                    </div>\n\n                    <div id="replyForm-${commentId}" class="reply-input-area" style="display:none; flex-direction:column; gap:6px;">\n    <div id="replyImagePreview-${commentId}" style="display:none; position:relative;">\n        <img id="replyImagePreviewImg-${commentId}" style="max-height:100px; max-width:100%; border-radius:8px; object-fit:contain; border:1px solid #dee2e6;">\n        <button onclick="clearReplyImage('${commentId}')" style="position:absolute; top:3px; right:3px; background:rgba(0,0,0,0.55); color:white; border:none; border-radius:50%; width:20px; height:20px; font-size:11px; cursor:pointer; display:flex; align-items:center; justify-content:center;"><i class="fas fa-times"></i></button>\n    </div>\n    <div style="display:flex; align-items:flex-end; gap:6px;">\n       <textarea id="replyInput-${commentId}" class="reply-input" placeholder="답글을 입력하세요" rows="1"\n            style="resize:none; overflow:hidden; min-height:36px; max-height:100px; line-height:1.4; flex:1; border-radius:16px; padding:8px 12px;"\n            onkeydown="(function(e){ if(e.key==='Enter'){ const mob=/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent); if(mob){e.preventDefault();submitReply('${id}','${commentId}');}else if(!e.shiftKey){e.preventDefault();submitReply('${id}','${commentId}');} } })(event)"\n            oninput="autoResizeTextarea(this)"></textarea>\n        <input type="file" id="replyImageInput-${commentId}" accept="image/*" style="display:none;" onchange="previewReplyImage(this,'${commentId}')">\n        <button onclick="document.getElementById('replyImageInput-${commentId}').click()" class="btn-reply-submit" style="background:#f0f4f8; color:#495057;"><i class="fas fa-camera"></i></button>\n        <button onclick="submitReply('${id}', '${commentId}')" class="btn-reply-submit"><i class="fas fa-paper-plane"></i></button>\n    </div>\n</div>\n                </div>\n            `;
    }).join("");
    root.innerHTML = commentsHTML;
    const loadMoreBtn = document.getElementById("loadMoreComments");
    endIdx < commentsList.length ? loadMoreBtn.innerHTML = `<button onclick="loadMoreComments()" class="btn-secondary btn-block">댓글 더보기 (${commentsList.length - endIdx}+)</button>` : loadMoreBtn.innerHTML = "";
  } catch (error) {
    document.getElementById("comments").innerHTML = "<p style='color:#f44336;text-align:center;padding:30px;'>댓글을 불러오는 중 오류가 발생했습니다.</p>";
  }
}

let _commentsListenerRef = null, _commentsListenerCb = null, _commentsRealtimeDebounce = null;

function detachCommentsListener() {
  _commentsListenerRef && (_commentsListenerRef.off("value", _commentsListenerCb), 
  _commentsListenerRef = null, _commentsListenerCb = null), _commentsRealtimeDebounce && (clearTimeout(_commentsRealtimeDebounce), 
  _commentsRealtimeDebounce = null);
}

function attachCommentsListener(articleId) {
  detachCommentsListener();
  const ref = db.ref("comments/" + articleId);
  let isFirstFire = !0;
  const cb = () => {
    if (isFirstFire) return void (isFirstFire = !1);
    const editingForms = document.querySelectorAll("#comments .comment-edit-form");
    for (const f of editingForms) if ("block" === f.style.display) return;
    clearTimeout(_commentsRealtimeDebounce), _commentsRealtimeDebounce = setTimeout(() => {
      currentArticleId === articleId && loadComments(articleId);
    }, 400);
  };
  ref.on("value", cb), _commentsListenerRef = ref, _commentsListenerCb = cb;
}

function loadComments(id) {
  window._currentArticleSettings ? loadCommentsWithProfile(id) : db.ref("articles/" + id).once("value").then(snap => {
    const article = snap.val() || {};
    window._currentArticleSettings = {
      anonymous: article.anonymous || !1,
      hideVotes: article.hideVotes || !1
    }, loadCommentsWithProfile(id);
  });
}

function loadMoreComments() {
  currentCommentPage++, loadComments(currentArticleId);
}

function submitCommentFromDetail() {
  submitComment(currentArticleId);
}

async function submitComment(id) {
  if (await authReady, !isLoggedIn()) return void alert("댓글 작성은 로그인 후 가능합니다!");
  if (!rateLimiter.check("comment", 5, 3e4)) return void alert("⚠️ 댓글을 너무 빠르게 작성하고 있습니다. 잠시 후 다시 시도해주세요.");
  const txt = document.getElementById("commentInput").value.trim(), imageInput = document.getElementById("commentImageInput");
  if (!(txt || imageInput && imageInput.files && imageInput.files[0])) return void alert("댓글 내용 또는 이미지를 입력해주세요.");
  if (txt.length > 1e3) return void alert("댓글은 1000자 이하로 입력해주세요.");
  if (txt) {
    const foundWord = checkBannedWords(txt);
    if (foundWord) return alert(`⚠️ 금지어("${foundWord}")가 포함되어 등록할 수 없으며, 경고 1회가 누적됩니다.`), 
    void addWarningToCurrentUser();
  }
  const submitBtns = document.querySelectorAll(".comment-submit-btn");
  submitBtns.forEach(b => b.disabled = !0);
  try {
    let imageBase64 = null;
    imageInput && imageInput.files && imageInput.files[0] && (imageBase64 = await compressImageToBase64(imageInput.files[0], 800, .72));
    const cid = Date.now().toString(), _cimp = isAdmin() && window._adminCommentImpersonateUser, C = {
      author: _cimp ? _cimp.nick : getNickname(),
      authorEmail: _cimp ? _cimp.email : getUserEmail(),
      authorUid: _cimp ? _cimp.uid : getUserId(),
      text: txt,
      timestamp: (new Date).toLocaleString()
    };
    imageBase64 && (C.imageBase64 = imageBase64), await db.ref("comments/" + id + "/" + cid).set(C), 
    await db.ref("articles/" + id + "/commentCount").transaction(n => (n || 0) + 1);
    const article = (await db.ref("articles/" + id).once("value")).val();
    article && article.authorEmail !== C.authorEmail && await sendNotification("myArticleComment", {
      articleAuthorEmail: article.authorEmail,
      commenterEmail: C.authorEmail,
      commenterName: article.anonymous ? "익명 유저" : C.author,
      content: txt || "[이미지]",
      articleId: id,
      articleCategory: article.category || "",
      anonymous: article.anonymous || !1
    }), document.getElementById("commentInput").value = "", autoResizeTextarea(document.getElementById("commentInput")), 
    imageInput && (imageInput.value = ""), clearCommentImage(), currentCommentPage = 1, 
    triggerGithubNotification(!0), loadComments(id);
  } catch (error) {
    alert("댓글 작성 중 오류가 발생했습니다: " + error.message);
  } finally {
    submitBtns.forEach(b => b.disabled = !1);
  }
}

function deleteComment(aid, cid, author) {
  const currentUser = getNickname();
  if (!isLoggedIn() || author !== currentUser && !isAdmin()) return alert("삭제 권한이 없습니다!");
  confirm("정말 이 댓글을 삭제하시겠습니까?") && db.ref("comments/" + aid + "/" + cid).remove().then(() => {
    db.ref("articles/" + aid + "/commentCount").transaction(n => Math.max((n || 0) - 1, 0)), 
    alert("댓글이 삭제되었습니다."), loadComments(aid);
  }).catch(error => {
    alert("삭제 실패: " + error.message);
  });
}

window.editComment = function(commentId) {
  const commentBody = document.getElementById(`commentBody-${commentId}`), editForm = document.getElementById(`commentEditForm-${commentId}`);
  if (!commentBody || !editForm) return;
  commentBody.style.display = "none", editForm.style.display = "block";
  const input = document.getElementById(`commentEditInput-${commentId}`);
  input && (input.focus(), input.setSelectionRange(input.value.length, input.value.length));
}, window.saveCommentEdit = async function(articleId, commentId) {
  if (!isLoggedIn()) return void alert("로그인이 필요합니다.");
  const input = document.getElementById(`commentEditInput-${commentId}`);
  if (!input) return;
  const newText = input.value.trim();
  if (newText) if (newText.length > 1e3) alert("댓글은 1000자 이하로 입력해주세요."); else try {
    const commentData = (await db.ref(`comments/${articleId}/${commentId}`).once("value")).val();
    if (!commentData) return void alert("댓글을 찾을 수 없습니다.");
    const currentEmail = getUserEmail(), isOwner = commentData.authorEmail === currentEmail, adminStatus = await isAdminAsync();
    if (!isOwner && !adminStatus) return void alert("🚫 수정 권한이 없습니다.");
    const foundWord = checkBannedWords(newText);
    if (foundWord) return alert(`⚠️ 금지어("${foundWord}")가 포함되어 있습니다.`), void addWarningToCurrentUser();
    await db.ref(`comments/${articleId}/${commentId}`).update({
      text: newText,
      edited: !0,
      editedAt: (new Date).toLocaleString()
    }), loadComments(articleId);
  } catch (error) {
    alert("댓글 수정 중 오류가 발생했습니다: " + error.message);
  } else alert("댓글 내용을 입력해주세요!");
}, window.cancelCommentEdit = function(commentId) {
  const commentBody = document.getElementById(`commentBody-${commentId}`), editForm = document.getElementById(`commentEditForm-${commentId}`);
  commentBody && editForm && (editForm.style.display = "none", commentBody.style.display = "block");
}, window.editReply = function(commentId, replyId) {
  const replyContent = document.getElementById(`replyContent-${commentId}-${replyId}`), editForm = document.getElementById(`replyEditForm-${commentId}-${replyId}`);
  if (!replyContent || !editForm) return;
  replyContent.style.display = "none", editForm.style.display = "block";
  const input = document.getElementById(`replyEditInput-${commentId}-${replyId}`);
  input && (input.focus(), input.setSelectionRange(input.value.length, input.value.length));
}, window.saveReplyEdit = async function(articleId, commentId, replyId) {
  const input = document.getElementById(`replyEditInput-${commentId}-${replyId}`);
  if (!input) return;
  const newText = input.value.trim();
  if (!newText) return void alert("답글 내용을 입력해주세요!");
  const foundWord = checkBannedWords(newText);
  if (foundWord) alert(`⚠️ 금지어("${foundWord}")가 포함되어 있습니다.`); else try {
    await db.ref(`comments/${articleId}/${commentId}/replies/${replyId}/text`).set(newText), 
    await db.ref(`comments/${articleId}/${commentId}/replies/${replyId}/edited`).set(!0), 
    await db.ref(`comments/${articleId}/${commentId}/replies/${replyId}/editedAt`).set((new Date).toLocaleString()), 
    loadComments(articleId);
  } catch (error) {
    alert("답글 수정 중 오류가 발생했습니다: " + error.message);
  }
}, window.cancelReplyEdit = function(commentId, replyId) {
  const replyContent = document.getElementById(`replyContent-${commentId}-${replyId}`), editForm = document.getElementById(`replyEditForm-${commentId}-${replyId}`);
  replyContent && editForm && (editForm.style.display = "none", replyContent.style.display = "block");
}, window.autoResizeTextarea = function(el) {
  el.style.height = "auto", el.style.height = Math.min(el.scrollHeight, 140) + "px";
}, window.handleCommentKey = function(e) {
  "Enter" !== e.key || e.shiftKey || (e.preventDefault(), submitCommentFromDetail());
}, window.toggleReplyForm = function(commentId) {
  if (!isLoggedIn()) return alert("로그인이 필요합니다.");
  const form = document.getElementById(`replyForm-${commentId}`);
  form && (form.style.display = "none" === form.style.display ? "flex" : "none", "flex" === form.style.display && document.getElementById(`replyInput-${commentId}`).focus());
}, window.submitReply = async function(articleId, commentId) {
  if (!isLoggedIn()) return alert("로그인이 필요합니다.");
  const input = document.getElementById(`replyInput-${commentId}`), text = input.value.trim(), imageInput = document.getElementById(`replyImageInput-${commentId}`);
  if (text || imageInput && imageInput.files && imageInput.files[0]) {
    if (text) {
      const foundWord = checkBannedWords(text);
      if (foundWord) return void alert(`금지어("${foundWord}")가 포함되어 있습니다.`);
    }
    try {
      let imageBase64 = null;
      imageInput && imageInput.files && imageInput.files[0] && (imageBase64 = await compressImageToBase64(imageInput.files[0], 800, .72));
      const _rimp = isAdmin() && window._adminCommentImpersonateUser, reply = {
        author: _rimp ? _rimp.nick : getNickname(),
        authorEmail: _rimp ? _rimp.email : getUserEmail(),
        authorUid: _rimp ? _rimp.uid : getUserId(),
        text: text,
        timestamp: (new Date).toLocaleString()
      };
      imageBase64 && (reply.imageBase64 = imageBase64), await db.ref(`comments/${articleId}/${commentId}/replies`).push(reply), 
      await db.ref(`articles/${articleId}/commentCount`).transaction(n => (n || 0) + 1);
      try {
        const commentData = (await db.ref(`comments/${articleId}/${commentId}`).once("value")).val();
        commentData && commentData.authorEmail && commentData.authorEmail !== reply.authorEmail && await sendNotification("replyToComment", {
          targetEmail: commentData.authorEmail,
          replierName: reply.author,
          content: text || "[이미지]",
          articleId: articleId
        });
      } catch (notifError) {}
      input.value = "", imageInput && (imageInput.value = ""), clearReplyImage(commentId), 
      document.getElementById(`replyForm-${commentId}`).style.display = "none", triggerGithubNotification(!0), 
      loadComments(articleId);
    } catch (error) {
      alert("답글 등록 중 오류가 발생했습니다.");
    }
  }
}, window.deleteReply = async function(articleId, commentId, replyId) {
  if (confirm("이 답글을 삭제하시겠습니까?")) try {
    await db.ref(`comments/${articleId}/${commentId}/replies/${replyId}`).remove(), 
    await db.ref(`articles/${articleId}/commentCount`).transaction(n => Math.max((n || 0) - 1, 0)), 
    loadComments(articleId);
  } catch (error) {
    alert("삭제 실패: " + error.message);
  }
}, window.setCommentSort = function(method) {
  currentCommentSort = method, currentCommentPage = 1, loadComments(currentArticleId);
};

const _commentVotingInProgress = new Set;

function loadPatchNotesToContainer(container) {
  container.innerHTML = '<div style="text-align:center; padding:20px;">로딩 중...</div>', 
  db.ref("patchNotes").orderByChild("date").once("value").then(snapshot => {
    if (container.innerHTML = "", isAdmin()) {
      const addBtn = document.createElement("div");
      addBtn.className = "admin-patch-controls", addBtn.style.marginBottom = "20px", addBtn.innerHTML = '<button onclick="openPatchNoteModal()" class="btn-primary btn-block"><i class="fas fa-plus"></i> 새 패치노트 작성</button>', 
      container.appendChild(addBtn);
    }
    const notes = [];
    snapshot.forEach(child => {
      notes.push({
        id: child.key,
        ...child.val()
      });
    }), 0 === notes.length && (container.innerHTML += '<p style="text-align:center; color:#888;">등록된 패치노트가 없습니다.</p>'), 
    notes.reverse().forEach(note => {
      const card = document.createElement("div");
      card.className = "qna-card";
      let adminBtns = "";
      isAdmin() && (adminBtns = `\n                    <div style="margin-top:10px; border-top:1px solid #eee; padding-top:10px; text-align:right;">\n                        <button onclick="openPatchNoteModal('${note.id}')" class="btn-secondary" style="padding:4px 8px; font-size:11px;">수정</button>\n                        <button onclick="deletePatchNote('${note.id}')" class="btn-danger" style="padding:4px 8px; font-size:11px;">삭제</button>\n                    </div>\n                `), 
      card.innerHTML = `\n                <div class="qna-header">\n                    <i class="fas fa-tag"></i> ${note.version} <span style="font-size:12px; margin-left:auto; opacity:0.8;">${note.date}</span>\n                </div>\n                <div class="qna-body">\n                    <div class="a-part" style="white-space: pre-wrap;">${note.content}</div>\n                    ${adminBtns}\n                </div>\n            `, 
      container.appendChild(card);
    });
  });
}

async function _adminLoadUserList() {
  const users = (await db.ref("users").once("value")).val() || {}, articles = (await db.ref("articles").limitToLast(200).once("value")).val() || {}, emailToNick = {};
  return Object.values(articles).forEach(a => {
    a.authorEmail && a.author && (emailToNick[a.authorEmail] = a.author);
  }), Object.entries(users).map(([uid, u]) => {
    const email = u.email || "";
    return {
      uid: uid,
      nick: u.newNickname || emailToNick[email] || u.nickname || email.split("@")[0] || "알 수 없음",
      email: email,
      photoURL: u.photoURL || ""
    };
  }).filter(u => u.email).sort((a, b) => a.nick.localeCompare(b.nick));
}

function _adminRenderUserRadios(users, listId, name, onSelect) {
  const list = document.getElementById(listId);
  list && (0 !== users.length ? list.innerHTML = users.map(u => `\n        <label style="display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;border-bottom:1px solid #fff8e1;"\n            onmouseover="this.style.background='#fffde7'" onmouseout="this.style.background='white'">\n            <input type="radio" name="${name}" value="${u.uid}"\n                data-nick="${u.nick.replace(/"/g, "&quot;")}"\n                data-email="${u.email.replace(/"/g, "&quot;")}"\n                data-photo="${(u.photoURL || "").replace(/"/g, "&quot;")}"\n                onchange="${onSelect}(this)"\n                style="width:15px;height:15px;accent-color:#795548;flex-shrink:0;">\n            <img src="${u.photoURL || ""}" onerror="this.style.display='none'"\n                style="width:26px;height:26px;border-radius:50%;object-fit:cover;flex-shrink:0;">\n            <div>\n                <div style="font-size:13px;font-weight:700;color:#333;">${escapeHTML(u.nick)}</div>\n                <div style="font-size:11px;color:#888;">${escapeHTML(u.email)}</div>\n            </div>\n        </label>`).join("") : list.innerHTML = '<div style="padding:10px;font-size:12px;color:#aaa;text-align:center;">유저 없음</div>');
}

window.toggleCommentVote = function(articleId, commentId, voteType) {
  if (!isLoggedIn()) return alert("로그인이 필요합니다!");
  const lockKey = `${commentId}_${getUserId()}`;
  if (_commentVotingInProgress.has(lockKey)) return;
  _commentVotingInProgress.add(lockKey);
  const likeBtn = document.getElementById(`clike-${commentId}`), dislikeBtn = document.getElementById(`cdislike-${commentId}`);
  likeBtn && (likeBtn.disabled = !0), dislikeBtn && (dislikeBtn.disabled = !0);
  const uid = getUserId(), voteRef = db.ref(`commentVotes/${articleId}/${commentId}/${uid}`), likeCountRef = db.ref(`comments/${articleId}/${commentId}/likeCount`), dislikeCountRef = db.ref(`comments/${articleId}/${commentId}/dislikeCount`);
  function _unlock() {
    _commentVotingInProgress.delete(lockKey), likeBtn && (likeBtn.disabled = !1), dislikeBtn && (dislikeBtn.disabled = !1);
  }
  voteRef.once("value").then(snap => {
    const current = snap.val(), isCancelling = current === voteType, likeTransaction = likeCountRef.transaction(count => (count = count || 0, 
    isCancelling && "like" === voteType ? count - 1 : isCancelling || "like" !== current ? isCancelling || "like" !== voteType ? count : count + 1 : count - 1)), dislikeTransaction = dislikeCountRef.transaction(count => (count = count || 0, 
    isCancelling && "dislike" === voteType ? count - 1 : isCancelling || "dislike" !== current ? isCancelling || "dislike" !== voteType ? count : count + 1 : count - 1));
    Promise.all([ likeTransaction, dislikeTransaction ]).then(([likeResult, dislikeResult]) => {
      const newLikeCount = likeResult.snapshot.val() || 0, newDislikeCount = dislikeResult.snapshot.val() || 0;
      (isCancelling ? voteRef.remove() : voteRef.set(voteType)).then(() => voteRef.once("value")).then(s => {
        const newVote = s.val();
        likeBtn && (likeBtn.style.cssText = `border:1px solid ${"like" === newVote ? "#1565c0" : "#ddd"}; border-radius:20px; padding:3px 10px; font-size:12px; cursor:pointer; background:${"like" === newVote ? "#e3f2fd" : "#fff"}; color:${"like" === newVote ? "#1565c0" : "inherit"};`, 
        likeBtn.innerHTML = `👍 ${newLikeCount}`), dislikeBtn && (dislikeBtn.style.cssText = `border:1px solid ${"dislike" === newVote ? "#c62828" : "#ddd"}; border-radius:20px; padding:3px 10px; font-size:12px; cursor:pointer; background:${"dislike" === newVote ? "#fce4ec" : "#fff"}; color:${"dislike" === newVote ? "#c62828" : "inherit"};`, 
        dislikeBtn.innerHTML = `👎 ${newDislikeCount}`);
      }).finally(_unlock);
    }).catch(_unlock);
  }).catch(_unlock);
}, window.toggleNestedReplyForm = function(commentId, replyId) {
  if (!isLoggedIn()) return alert("로그인이 필요합니다.");
  const form = document.getElementById(`nestedReplyForm-${commentId}-${replyId}`);
  form && (form.style.display = "none" === form.style.display ? "flex" : "none", "flex" === form.style.display && document.getElementById(`nestedReplyInput-${commentId}-${replyId}`)?.focus());
}, window.submitNestedReply = async function(articleId, commentId, parentReplyId) {
  if (!isLoggedIn()) return alert("로그인이 필요합니다.");
  const input = document.getElementById(`nestedReplyInput-${commentId}-${parentReplyId}`), text = input?.value.trim(), imageInput = document.getElementById(`nestedReplyImageInput-${commentId}-${parentReplyId}`);
  if (text || imageInput && imageInput.files && imageInput.files[0]) {
    if (text) {
      const foundWord = checkBannedWords(text);
      if (foundWord) return void alert(`금지어("${foundWord}")가 포함되어 있습니다.`);
    }
    try {
      let imageBase64 = null;
      imageInput && imageInput.files && imageInput.files[0] && (imageBase64 = await compressImageToBase64(imageInput.files[0], 800, .72));
      const reply = {
        author: getNickname(),
        authorEmail: getUserEmail(),
        text: text,
        timestamp: (new Date).toLocaleString(),
        parentReplyId: parentReplyId
      };
      imageBase64 && (reply.imageBase64 = imageBase64), await db.ref(`comments/${articleId}/${commentId}/replies`).push(reply);
      try {
        const parentReply = (await db.ref(`comments/${articleId}/${commentId}/replies/${parentReplyId}`).once("value")).val();
        parentReply && parentReply.authorEmail && parentReply.authorEmail !== reply.authorEmail && await sendNotification("replyToReply", {
          targetEmail: parentReply.authorEmail,
          replierName: reply.author,
          content: text || "[이미지]",
          articleId: articleId
        });
      } catch (notifError) {}
      triggerGithubNotification(!0), input && (input.value = ""), imageInput && (imageInput.value = ""), 
      clearNestedReplyImage(commentId, parentReplyId);
      const form = document.getElementById(`nestedReplyForm-${commentId}-${parentReplyId}`);
      form && (form.style.display = "none"), loadComments(articleId);
    } catch (e) {
      alert("답글 등록 중 오류가 발생했습니다.");
    }
  }
}, window.openPatchNoteModal = function(id = null) {
  const modal = document.getElementById("patchNoteModal");
  document.getElementById("patchNoteForm").reset(), document.getElementById("editPatchId").value = "", 
  id ? db.ref("patchNotes/" + id).once("value").then(snap => {
    const data = snap.val();
    document.getElementById("editPatchId").value = id, document.getElementById("patchVersion").value = data.version, 
    document.getElementById("patchDate").value = data.date, document.getElementById("patchContent").value = data.content, 
    modal.classList.add("active");
  }) : (document.getElementById("patchDate").value = (new Date).toISOString().split("T")[0], 
  modal.classList.add("active"));
}, window.closePatchNoteModal = function() {
  document.getElementById("patchNoteModal").classList.remove("active");
}, window.savePatchNote = function(e) {
  if (e.preventDefault(), !isAdmin()) return alert("관리자만 가능합니다.");
  const id = document.getElementById("editPatchId").value, data = {
    version: document.getElementById("patchVersion").value,
    date: document.getElementById("patchDate").value,
    content: document.getElementById("patchContent").value
  };
  id ? db.ref("patchNotes/" + id).update(data) : db.ref("patchNotes").push(data), 
  closePatchNoteModal(), document.getElementById("patchnotesSection").classList.contains("active") && showPatchNotesPage();
}, window.deletePatchNote = function(id) {
  isAdmin() && confirm("정말 삭제하시겠습니까?") && db.ref("patchNotes/" + id).remove().then(() => {
    document.getElementById("patchnotesSection").classList.contains("active") && showPatchNotesPage();
  });
}, window.showUserManagement = async function() {
  if (!isAdmin()) return alert("관리자 권한 필요!");
  hideAll();
  const section = document.getElementById("userManagementSection");
  if (!section) return;
  section.classList.add("active");
  const root = document.getElementById("usersList");
  if (root) {
    root.innerHTML = "<p style='text-align:center;color:#868e96;'>사용자 정보 로딩 중...</p>", 
    updateURL("users");
    try {
      const [articlesSnapshot, commentsSnapshot, usersSnapshot] = await Promise.all([ db.ref("articles").once("value"), db.ref("comments").once("value"), db.ref("users").once("value") ]), articlesData = articlesSnapshot.val() || {}, articles = Object.values(articlesData), commentsData = commentsSnapshot.val() || {}, usersData = usersSnapshot.val() || {}, emailToNick = {}, emailToArticles = {}, emailToComments = {};
      articles.forEach(article => {
        article.authorEmail && (article.author && "익명" !== article.author && (emailToNick[article.authorEmail] = article.author), 
        (emailToArticles[article.authorEmail] = emailToArticles[article.authorEmail] || []).push(article));
      }), Object.entries(commentsData).forEach(([articleId, articleComments]) => {
        Object.entries(articleComments).forEach(([commentId, comment]) => {
          comment.authorEmail && (comment.author && "익명" !== comment.author && (emailToNick[comment.authorEmail] = comment.author), 
          (emailToComments[comment.authorEmail] = emailToComments[comment.authorEmail] || []).push({
            ...comment,
            articleId: articleId,
            commentId: commentId
          }));
        });
      });
      const usersMap = new Map;
      Object.entries(usersData).forEach(([uid, userData]) => {
        const email = userData.email;
        if (!email) return;
        const nickname = userData.newNickname || emailToNick[email] || userData.googleDisplayName || userData.authDisplayName || email.split("@")[0] || "이름 없음";
        usersMap.set(email, {
          uid: uid,
          nickname: nickname,
          email: email,
          articles: emailToArticles[email] || [],
          comments: emailToComments[email] || [],
          lastActivity: userData.lastSeen ? formatLastSeen(userData.lastSeen).replace(/<[^>]+>/g, "") : "기록 없음"
        });
      });
      const currentUserEmail = getUserEmail(), currentNickname = getNickname();
      if (currentUserEmail && !usersMap.has(currentUserEmail) && usersMap.set(currentUserEmail, {
        uid: null,
        nickname: currentNickname,
        email: currentUserEmail,
        articles: [],
        comments: [],
        lastActivity: (new Date).toLocaleString()
      }), 0 === usersMap.size) return void (root.innerHTML = "<p style='text-align:center;color:#868e96;'>등록된 사용자가 없습니다.</p>");
      const usersList = Array.from(usersMap.values());
      root.innerHTML = usersList.map(u => {
        const userData = u.uid ? usersData[u.uid] : null, warningCount = userData && userData.warningCount || 0, isBanned = userData && userData.isBanned || !1, safeUid = u.uid || "email_" + btoa(u.email).replace(/=/g, ""), isCurrentUser = u.email === getUserEmail();
        return `\n            <div class="user-card" style="opacity: ${isBanned ? "0.7" : "1"}; border-left-color: ${isBanned ? "#343a40" : "#c62828"};">\n                <h4 style="color:${isCurrentUser ? "#000000" : isBanned ? "#343a40" : "#c62828"};">\n                    ${escapeHTML(u.nickname)}${isCurrentUser ? ' <span style="background:#000;color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;">👤 나</span>' : ""}\n                    ${isBanned ? ' <span style="background:#343a40;color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;">🚫 차단됨</span>' : ""}\n                </h4>\n                <div class="user-info">\n                    📧 이메일: <strong>${u.email}</strong><br>\n                    ${userData && userData.googleDisplayName ? `👤 구글 이름: <strong>${escapeHTML(userData.googleDisplayName)}</strong><br>` : ""}\n                    📰 기사: <strong>${u.articles.length}</strong> | 💬 댓글: <strong>${u.comments.length}</strong><br>\n                    ⚠️ 누적 경고: <strong>${warningCount}회</strong><br>\n                    🕐 마지막 활동: ${u.lastActivity}<br>\n                    🔵 접속: ${userData && userData.lastSeen ? formatLastSeen(userData.lastSeen) : '<span style="color:#adb5bd;">기록 없음</span>'}\n\n                </div>\n                <div class="user-actions">\n                    <button onclick="showUserDetail('${u.nickname}')" class="btn-info">상세</button>\n                    <button onclick="changeWarning('${safeUid}', '${u.email}', 1)" class="btn-warning">경고 +1</button>\n                    <button onclick="changeWarning('${safeUid}', '${u.email}', -1)" class="btn-secondary">경고 -1</button>\n                    ${isBanned ? `<button onclick="toggleBan('${safeUid}', '${u.email}', false)" class="btn-success">차단해제</button>` : `<button onclick="toggleBan('${safeUid}', '${u.email}', true)" class="btn-dark">차단하기</button>`}\n                    <button onclick="deleteUserCompletely('${u.nickname}')" class="btn-danger">삭제</button>\n                </div>\n            </div>\n        `;
      }).join("");
    } catch (error) {
      root.innerHTML = `<p style="color:#dc3545;text-align:center;">오류: ${error.message}</p>`;
    }
  }
}, window.changeWarning = async function(uid, email, amount) {
  if (!isAdmin()) return;
  uid.startsWith("email_") && await db.ref("users/" + uid).update({
    email: email
  });
  const data = (await db.ref("users/" + uid).once("value")).val() || {};
  let nextVal = (data.warningCount || 0) + amount;
  nextVal < 0 && (nextVal = 0);
  let updates = {
    warningCount: nextVal,
    email: email
  };
  nextVal >= 3 && !data.isBanned && (updates.isBanned = !0, alert("🚨 누적 경고 3회 도달로 인해 차단됩니다.")), 
  await db.ref("users/" + uid).update(updates), showUserManagement();
}, window.toggleBan = async function(uid, email, shouldBan) {
  if (!isAdmin()) return;
  const action = shouldBan ? "차단" : "차단 해제";
  confirm(`정말 이 사용자를 ${action}하시겠습니까?`) && (uid.startsWith("email_") && await db.ref("users/" + uid).update({
    email: email
  }), await db.ref("users/" + uid).update({
    isBanned: shouldBan,
    email: email
  }), alert(`${action} 완료되었습니다.`), showUserManagement());
}, window.showUserDetail = async function(nickname) {
  showLoadingIndicator("사용자 정보 로딩 중...");
  const [articlesSnapshot, commentsSnapshot] = await Promise.all([ db.ref("articles").once("value"), db.ref("comments").once("value") ]), articlesData = articlesSnapshot.val() || {}, articles = Object.values(articlesData).filter(a => a.author === nickname), commentsData = commentsSnapshot.val() || {}, userComments = [];
  Object.entries(commentsData).forEach(([articleId, articleComments]) => {
    Object.entries(articleComments).forEach(([commentId, comment]) => {
      comment.author === nickname && userComments.push({
        ...comment,
        articleId: articleId,
        commentId: commentId
      });
    });
  });
  let userEmail = "미확인";
  articles.length > 0 && articles[0].authorEmail ? userEmail = articles[0].authorEmail : userComments.length > 0 && userComments[0].authorEmail && (userEmail = userComments[0].authorEmail), 
  hideLoadingIndicator();
  const modal = document.getElementById("userDetailModal");
  document.getElementById("userDetailContent").innerHTML = `\n        <div style="padding:20px;">\n            <h3 style="margin-top:0;color:#c62828;font-size:22px;">👤 ${nickname}</h3>\n            <p style="margin-bottom:20px;color:#6c757d;">Email: ${userEmail}</p>\n            <div style="margin-top:25px;">\n                <h4 style="color:#1976d2;margin-bottom:15px;">📰 작성 기사 (${articles.length}개)</h4>\n                ${articles.length > 0 ? articles.map(a => `\n                    <div style="background:#f8f9fa;padding:12px;margin-bottom:8px;border-left:3px solid #c62828;border-radius:4px;display:flex;justify-content:space-between;align-items:center;">\n                        <span style="flex:1;">${a.title}</span>\n                        <button onclick="deleteArticleFromAdmin('${a.id}', '${nickname}')" class="btn-secondary" style="padding:6px 12px;font-size:11px;">삭제</button>\n                    </div>`).join("") : '<p style="color:#868e96;text-align:center;padding:20px;">작성한 기사가 없습니다.</p>'}\n            </div>\n            <div style="margin-top:20px;">\n                <h4 style="color:#1976d2;margin-bottom:15px;">💬 작성 댓글 (${userComments.length}개)</h4>\n                ${userComments.length > 0 ? userComments.map(c => `\n                    <div style="background:#f8f9fa;padding:12px;margin-bottom:8px;border-left:3px solid #6c757d;border-radius:4px;display:flex;justify-content:space-between;align-items:center;">\n                        <span style="flex:1;">${c.text}</span>\n                        <button onclick="deleteCommentFromAdmin('${c.articleId}', '${c.commentId}', '${nickname}')" class="btn-secondary" style="padding:6px 12px;font-size:11px;">삭제</button>\n                    </div>`).join("") : '<p style="color:#868e96;text-align:center;padding:20px;">작성한 댓글이 없습니다.</p>'}\n            </div>\n        </div>\n    `, 
  modal.classList.add("active");
}, window.closeUserDetail = function() {
  document.getElementById("userDetailModal").classList.remove("active");
}, window.deleteArticleFromAdmin = function(id, nickname) {
  confirm("이 기사를 삭제하시겠습니까?") && deleteArticleFromDB(id, () => {
    db.ref("comments/" + id).remove(), alert("삭제되었습니다."), closeUserDetail(), showUserDetail(nickname);
  });
}, window.adminResetArticleViews = async function(articleId) {
  if (isAdmin()) {
    if (confirm("이 기사의 조회수를 0으로 초기화하시겠습니까?\n독자 기록도 함께 삭제됩니다.")) try {
      await Promise.all([ db.ref(`articles/${articleId}/views`).set(0), db.ref(`articleReaders/${articleId}`).remove() ]);
      const el = document.getElementById("viewCountDisplay");
      el && (el.innerHTML = "👁️ 0"), alert("✅ 조회수가 초기화되었습니다.");
    } catch (e) {
      alert("❌ 초기화 실패: " + e.message);
    }
  } else alert("관리자 권한이 필요합니다.");
}, window._adminImpersonateUser = null, window._adminClearImpersonate = function() {
  window._adminImpersonateUser = null;
  const toggle = document.getElementById("adminImpersonateToggle"), list = document.getElementById("adminImpersonateUserList");
  toggle && (toggle.checked = !1), list && (list.style.display = "none");
}, window._adminToggleImpersonate = async function(checked) {
  const list = document.getElementById("adminImpersonateUserList");
  if (!list) return;
  if (!checked) return window._adminImpersonateUser = null, void (list.style.display = "none");
  list.style.display = "block", list.innerHTML = '<div style="padding:10px;font-size:12px;color:#aaa;text-align:center;">불러오는 중...</div>';
  _adminRenderUserRadios(await _adminLoadUserList(), "adminImpersonateUserList", "adminImpUser", "window._adminPickImpersonate");
}, window._adminPickImpersonate = function(radio) {
  window._adminImpersonateUser = {
    uid: radio.value,
    nick: radio.dataset.nick,
    email: radio.dataset.email,
    photoURL: radio.dataset.photo
  };
}, window._adminCommentImpersonateUser = null, window._adminClearCommentImpersonate = function() {
  window._adminCommentImpersonateUser = null;
  const toggle = document.getElementById("adminCommentImpersonateToggle"), list = document.getElementById("adminCommentImpersonateUserList");
  toggle && (toggle.checked = !1), list && (list.style.display = "none");
}, window._adminCommentToggleImpersonate = async function(checked) {
  const list = document.getElementById("adminCommentImpersonateUserList");
  if (!list) return;
  if (!checked) return window._adminCommentImpersonateUser = null, void (list.style.display = "none");
  list.style.display = "block", list.innerHTML = '<div style="padding:8px;font-size:12px;color:#aaa;text-align:center;">불러오는 중...</div>';
  _adminRenderUserRadios(await _adminLoadUserList(), "adminCommentImpersonateUserList", "adminImpCommentUser", "window._adminPickCommentImpersonate");
}, window._adminPickCommentImpersonate = function(radio) {
  window._adminCommentImpersonateUser = {
    uid: radio.value,
    nick: radio.dataset.nick,
    email: radio.dataset.email,
    photoURL: radio.dataset.photo
  };
}, function() {
  const _orig = window.showArticleDetail;
  "function" != typeof _orig || _orig._commentImpHooked || (window.showArticleDetail = async function(id) {
    const result = await _orig.apply(this, arguments);
    return setTimeout(() => {
      const box = document.getElementById("adminCommentImpersonateBox");
      box && (box.style.display = isAdmin() ? "block" : "none", window._adminClearCommentImpersonate());
    }, 200), result;
  }, window.showArticleDetail._commentImpHooked = !0);
}(), window.adminSetArticleStats = async function(articleId) {
  if (!isAdmin()) return void alert("관리자 권한이 필요합니다.");
  const viewsEl = document.getElementById(`_adminViewsInput_${articleId}`), likesEl = document.getElementById(`_adminLikesInput_${articleId}`), dislikesEl = document.getElementById(`_adminDislikesInput_${articleId}`);
  if (!viewsEl || !likesEl || !dislikesEl) return;
  const newViews = Math.max(0, parseInt(viewsEl.value) || 0), newLikes = Math.max(0, parseInt(likesEl.value) || 0), newDislikes = Math.max(0, parseInt(dislikesEl.value) || 0);
  if (confirm(`수치를 다음과 같이 변경하시겠습니까?\n\n👁️ 조회수: ${newViews}\n👍 좋아요: ${newLikes}\n👎 싫어요: ${newDislikes}`)) try {
    await db.ref(`articles/${articleId}`).update({
      views: newViews,
      likeCount: newLikes,
      dislikeCount: newDislikes
    });
    const viewEl = document.getElementById("viewCountDisplay");
    viewEl && (viewEl.innerHTML = `👁️ ${newViews}`);
    const likeBtn = document.getElementById(`like-btn-${articleId}`), dislikeBtn = document.getElementById(`dislike-btn-${articleId}`);
    likeBtn && (likeBtn.innerHTML = `👍 추천 ${newLikes}`), dislikeBtn && (dislikeBtn.innerHTML = `👎 비추천 ${newDislikes}`), 
    alert("✅ 수치가 변경되었습니다.");
  } catch (e) {
    alert("❌ 변경 실패: " + e.message);
  }
}, window.adminResetArticleVotes = async function(articleId) {
  if (isAdmin()) {
    if (confirm("이 기사의 추천/비추천을 모두 초기화하시겠습니까?\n투표 기록도 함께 삭제됩니다.")) try {
      await Promise.all([ db.ref(`articles/${articleId}/likeCount`).set(0), db.ref(`articles/${articleId}/dislikeCount`).set(0), db.ref(`votes/${articleId}`).remove() ]);
      const likeBtn = document.getElementById(`like-btn-${articleId}`), dislikeBtn = document.getElementById(`dislike-btn-${articleId}`);
      likeBtn && (likeBtn.innerHTML = "👍 추천 0"), dislikeBtn && (dislikeBtn.innerHTML = "👎 비추천 0"), 
      alert("✅ 추천/비추천이 초기화되었습니다.");
    } catch (e) {
      alert("❌ 초기화 실패: " + e.message);
    }
  } else alert("관리자 권한이 필요합니다.");
}, window.adminShowArticleReaders = async function(articleId) {
  if (!isAdmin()) return void alert("관리자 권한이 필요합니다.");
  document.getElementById("_adminReadersModal")?.remove();
  const data = (await db.ref(`articleReaders/${articleId}`).once("value")).val() || {}, readers = Object.values(data).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)), rows = 0 === readers.length ? '<div style="text-align:center;color:#aaa;padding:30px 0;font-size:14px;">독자 기록이 없습니다.</div>' : readers.map((r, i) => `\n            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;\n                border-bottom:1px solid #f5f5f5;">\n                <div style="width:28px;height:28px;border-radius:50%;background:#c62828;\n                    display:flex;align-items:center;justify-content:center;\n                    color:white;font-size:12px;font-weight:700;flex-shrink:0;">\n                    ${(r.name || "?")[0].toUpperCase()}\n                </div>\n                <div style="flex:1;min-width:0;">\n                    <div style="font-size:14px;font-weight:600;color:#212121;\n                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\n                        ${escapeHTML(r.name || "알 수 없음")}\n                    </div>\n                    <div style="font-size:11px;color:#888;">${escapeHTML(r.email || "")}</div>\n                </div>\n                <div style="font-size:11px;color:#aaa;flex-shrink:0;text-align:right;">\n                    ${escapeHTML(r.readAt || "")}\n                </div>\n            </div>`).join(""), modal = document.createElement("div");
  modal.id = "_adminReadersModal", modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:99999;display:flex;align-items:flex-end;justify-content:center;", 
  modal.innerHTML = `\n        <div style="background:white;width:100%;max-width:600px;border-radius:20px 20px 0 0;\n            max-height:70vh;display:flex;flex-direction:column;\n            box-shadow:0 -4px 24px rgba(0,0,0,0.15);">\n            <div style="padding:16px 20px 12px;border-bottom:1px solid #f0f0f0;flex-shrink:0;">\n                <div style="width:36px;height:4px;background:#e0e0e0;border-radius:2px;margin:0 auto 14px;"></div>\n                <div style="display:flex;align-items:center;justify-content:space-between;">\n                    <div style="font-size:16px;font-weight:800;color:#212121;">\n                        📖 독자 목록 <span style="font-size:13px;color:#888;font-weight:500;">(${readers.length}명)</span>\n                    </div>\n                    <button onclick="document.getElementById('_adminReadersModal').remove()"\n                        style="border:none;background:none;font-size:20px;color:#aaa;cursor:pointer;">✕</button>\n                </div>\n            </div>\n            <div style="flex:1;overflow-y:auto;padding:0 20px;">\n                ${rows}\n            </div>\n        </div>`, 
  modal.addEventListener("click", e => {
    e.target === modal && modal.remove();
  }), document.body.appendChild(modal);
}, window.adminShowArticleVoters = async function(articleId) {
  if (!isAdmin()) return void alert("관리자 권한이 필요합니다.");
  document.getElementById("_adminVotersModal")?.remove();
  const [votesSnap, articleSnap] = await Promise.all([ db.ref(`votes/${articleId}`).once("value"), db.ref(`articles/${articleId}`).once("value") ]), votes = votesSnap.val() || {}, article = articleSnap.val() || {}, likeCount = article.likeCount || 0, dislikeCount = article.dislikeCount || 0, total = likeCount + dislikeCount, uids = Object.keys(votes), userSnaps = await Promise.all(uids.map(uid => db.ref(`users/${uid}`).once("value"))), userMap = {};
  uids.forEach((uid, i) => {
    userMap[uid] = userSnaps[i].val() || {};
  });
  const likers = uids.filter(uid => "like" === votes[uid]), dislikers = uids.filter(uid => "dislike" === votes[uid]);
  function voterRow(uid) {
    const u = userMap[uid] || {}, name = u.newNickname || u.nickname || u.displayName || (u.email ? u.email.split("@")[0] : "알 수 없음"), email = u.email || "";
    return `\n            <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f5f5f5;">\n                <div style="width:26px;height:26px;border-radius:50%;background:#e0e0e0;\n                    display:flex;align-items:center;justify-content:center;\n                    font-size:11px;font-weight:700;color:#555;flex-shrink:0;">\n                    ${name[0].toUpperCase()}\n                </div>\n                <div style="flex:1;min-width:0;">\n                    <div style="font-size:13px;font-weight:600;color:#212121;">${escapeHTML(name)}</div>\n                    <div style="font-size:11px;color:#aaa;">${escapeHTML(email)}</div>\n                </div>\n            </div>`;
  }
  const barW = total > 0 ? Math.round(likeCount / total * 100) : 50, modal = document.createElement("div");
  modal.id = "_adminVotersModal", modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:99999;display:flex;align-items:flex-end;justify-content:center;", 
  modal.innerHTML = `\n        <div style="background:white;width:100%;max-width:600px;border-radius:20px 20px 0 0;\n            max-height:75vh;display:flex;flex-direction:column;\n            box-shadow:0 -4px 24px rgba(0,0,0,0.15);">\n            <div style="padding:16px 20px 12px;border-bottom:1px solid #f0f0f0;flex-shrink:0;">\n                <div style="width:36px;height:4px;background:#e0e0e0;border-radius:2px;margin:0 auto 14px;"></div>\n                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">\n                    <div style="font-size:16px;font-weight:800;color:#212121;">🗳️ 투표 현황</div>\n                    <button onclick="document.getElementById('_adminVotersModal').remove()"\n                        style="border:none;background:none;font-size:20px;color:#aaa;cursor:pointer;">✕</button>\n                </div>\n                \x3c!-- 요약 바 --\x3e\n                <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin-bottom:6px;">\n                    <span style="color:#1565c0;">👍 추천 ${likeCount}</span>\n                    <span style="color:#c62828;">비추천 ${dislikeCount} 👎</span>\n                </div>\n                <div style="background:#fce4ec;border-radius:999px;height:10px;overflow:hidden;">\n                    <div style="background:#1565c0;height:100%;width:${barW}%;border-radius:999px;transition:width 0.4s;"></div>\n                </div>\n                <div style="font-size:11px;color:#aaa;text-align:center;margin-top:4px;">총 ${total}표</div>\n            </div>\n            <div style="flex:1;overflow-y:auto;padding:0 20px;">\n                ${likers.length > 0 ? `\n                    <div style="font-size:12px;font-weight:700;color:#1565c0;padding:12px 0 4px;">\n                        👍 추천 (${likers.length}명)\n                    </div>\n                    ${likers.map(voterRow).join("")}` : ""}\n                ${dislikers.length > 0 ? `\n                    <div style="font-size:12px;font-weight:700;color:#c62828;padding:12px 0 4px;">\n                        👎 비추천 (${dislikers.length}명)\n                    </div>\n                    ${dislikers.map(voterRow).join("")}` : ""}\n                ${0 === uids.length ? '<div style="text-align:center;color:#aaa;padding:30px 0;font-size:14px;">투표 기록이 없습니다.</div>' : ""}\n            </div>\n        </div>`, 
  modal.addEventListener("click", e => {
    e.target === modal && modal.remove();
  }), document.body.appendChild(modal);
}, window.adminToggleAnonymousReveal = function(articleId) {
  if (!isAdmin()) return;
  window._adminRevealAnonymous || (window._adminRevealAnonymous = {}), window._adminRevealAnonymous[articleId] = !window._adminRevealAnonymous[articleId];
  const revealed = window._adminRevealAnonymous[articleId], btn = document.getElementById(`_adminAnonBtn_${articleId}`);
  btn && (btn.textContent = revealed ? "🔓 익명 해제 중 (클릭 시 복원)" : "🔒 익명 해제 보기", btn.style.background = revealed ? "#e8f5e9" : "#fff3e0", 
  btn.style.borderColor = revealed ? "#a5d6a7" : "#ffcc80", btn.style.color = revealed ? "#2e7d32" : "#e65100"), 
  "function" == typeof showArticleDetail && showArticleDetail(articleId);
}, window.deleteCommentFromAdmin = function(articleId, commentId, nickname) {
  confirm("이 댓글을 삭제하시겠습니까?") && db.ref("comments/" + articleId + "/" + commentId).remove().then(() => {
    db.ref("articles/" + articleId + "/commentCount").transaction(n => Math.max((n || 0) - 1, 0)), 
    alert("삭제되었습니다."), closeUserDetail(), showUserDetail(nickname);
  });
}, window.deleteUserCompletely = async function(nick) {
  if (confirm(`"${nick}" 사용자를 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 해당 사용자의 모든 기사와 댓글이 삭제됩니다.`)) {
    showLoadingIndicator("사용자 삭제 중...");
    try {
      const updates = {}, articlesData = (await db.ref("articles").once("value")).val() || {};
      Object.entries(articlesData).forEach(([id, article]) => {
        article.author === nick && (updates[`articles/${id}`] = null, updates[`comments/${id}`] = null, 
        updates[`votes/${id}`] = null);
      });
      const val = (await db.ref("comments").once("value")).val() || {};
      Object.entries(val).forEach(([aid, group]) => {
        Object.entries(group).forEach(([cid, c]) => {
          c.author === nick && (updates[`comments/${aid}/${cid}`] = null);
        });
      }), await db.ref().update(updates), hideLoadingIndicator(), alert(`"${nick}" 사용자가 삭제되었습니다.`), 
      showUserManagement();
    } catch (error) {
      hideLoadingIndicator(), alert("삭제 중 오류가 발생했습니다: " + error.message);
    }
  }
}, window.resetAllViews = async function() {
  if (isAdmin()) {
    if (confirm("⚠️ 정말 모든 기사의 조회수를 0으로 초기화하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다!") && confirm("⚠️ 다시 한 번 확인합니다.\n정말 진행하시겠습니까?")) {
      showLoadingIndicator("조회수 초기화 중...");
      try {
        const articlesData = (await db.ref("articles").once("value")).val() || {}, updates = {};
        let count = 0;
        if (Object.keys(articlesData).forEach(articleId => {
          updates[`articles/${articleId}/views`] = 0, count++;
        }), 0 === count) return hideLoadingIndicator(), void alert("초기화할 기사가 없습니다.");
        await db.ref().update(updates), hideLoadingIndicator(), alert(`✅ ${count}개 기사의 조회수가 초기화되었습니다!`), 
        document.getElementById("articlesSection")?.classList.contains("active") && "function" == typeof renderArticles && renderArticles();
      } catch (error) {
        hideLoadingIndicator(), alert("초기화 실패: " + error.message);
      }
    }
  } else alert("🚫 관리자 권한이 필요합니다!");
}, window.clearMyViewHistory = function() {
  if (confirm("⚠️ 영구 저장된 조회 기록을 삭제하시겠습니까?\n\n삭제 후 모든 기사를 다시 조회할 수 있습니다.")) try {
    localStorage.removeItem("viewedArticles"), alert("✅ 조회 기록이 삭제되었습니다!");
  } catch (error) {
    alert("삭제 실패: " + error.message);
  }
}, window.getViewStats = function() {
  try {
    const viewedArticles = getViewedArticles();
    return {
      totalViewed: Object.keys(viewedArticles).length,
      articles: viewedArticles
    };
  } catch (error) {
    return null;
  }
}, window.showBannedWordManager = function() {
  const modal = document.getElementById("bannedWordsModal");
  document.getElementById("bannedWordsInput").value = bannedWordsList.join(", "), 
  modal.classList.add("active");
}, window.closeBannedWordsModal = function() {
  document.getElementById("bannedWordsModal").classList.remove("active");
}, window.saveBannedWords = function() {
  const newList = document.getElementById("bannedWordsInput").value.split(",").map(s => s.trim()).filter(s => "" !== s);
  db.ref("adminSettings/bannedWords").set(newList.join(",")).then(() => {
    alert("금지어 목록이 저장되었습니다."), closeBannedWordsModal();
  }).catch(err => alert("저장 실패: " + err.message));
};

let articlesListenerActive = !1, _articlesStructureDebounce = null, _pinnedCache = null, _pinnedCacheTime = 0;

const PINNED_CACHE_TTL = 6e4;

async function getPinnedArticles() {
  if (_pinnedCache && Date.now() - _pinnedCacheTime < PINNED_CACHE_TTL) return _pinnedCache;
  const snap = await db.ref("pinnedArticles").once("value");
  return _pinnedCache = snap.val() || {}, _pinnedCacheTime = Date.now(), _pinnedCache;
}

function invalidatePinnedCache() {
  _pinnedCache = null;
}

function setupArticlesListener() {
  articlesListenerActive || (db.ref("articles").on("value", snapshot => {
    const val = snapshot.val() || {};
    allArticles = Object.entries(val).map(([key, a]) => {
      const {content: _c, ...rest} = a;
      return rest.id || (rest.id = key), rest;
    }), hidePageLoadingScreen();
  }), db.ref("articles").on("child_changed", snapshot => {
    const id = snapshot.key, a = snapshot.val() || {}, likeEl = document.getElementById(`card-like-${id}`), dislikeEl = document.getElementById(`card-dislike-${id}`), commentEl = document.getElementById(`card-comment-${id}`);
    if (likeEl && (likeEl.textContent = `👍 ${a.likeCount || 0}`), commentEl && (commentEl.textContent = `💬 ${a.commentCount || 0}`), 
    dislikeEl) {
      const d = a.dislikeCount || 0;
      dislikeEl.textContent = `👎 ${d}`, dislikeEl.style.display = d > 0 ? "" : "none";
    }
  }), db.ref("articles").on("child_added", _scheduleArticlesListRerender), db.ref("articles").on("child_removed", _scheduleArticlesListRerender), 
  articlesListenerActive = !0);
}

function _scheduleArticlesListRerender() {
  clearTimeout(_articlesStructureDebounce), _articlesStructureDebounce = setTimeout(() => {
    document.getElementById("articlesSection")?.classList.contains("active") && searchArticles(!1);
  }, 300);
}

function saveArticle(article, callback) {
  if (!article.id) return void alert("저장 실패: 기사 ID가 없습니다.");
  article.views || (article.views = 0), article.likeCount || (article.likeCount = 0), 
  article.dislikeCount || (article.dislikeCount = 0);
  const {content: content, ...meta} = article;
  Promise.all([ db.ref("articles/" + article.id).set(meta), db.ref("articleContents/" + article.id).set({
    content: content || ""
  }) ]).then(() => {
    callback && callback();
  }).catch(error => {
    alert("저장 실패: " + error.message);
  });
}

function deleteArticleFromDB(articleId, callback) {
  Promise.all([ db.ref("articles/" + articleId).remove(), db.ref("articleContents/" + articleId).remove(), db.ref("votes/" + articleId).remove(), db.ref("comments/" + articleId).remove() ]).then(() => {
    callback && callback();
  }).catch(error => {
    alert("삭제 실패: " + error.message);
  });
}

function getViewedArticles() {
  try {
    const viewed = localStorage.getItem("viewedArticles");
    return viewed ? JSON.parse(viewed) : {};
  } catch (error) {
    return {};
  }
}

function hasViewedArticle(articleId) {
  return !!getViewedArticles()[articleId];
}

function markArticleAsViewed(articleId) {
  try {
    const viewedArticles = getViewedArticles();
    viewedArticles[articleId] = {
      timestamp: Date.now(),
      viewedAt: (new Date).toLocaleString(),
      permanent: !0
    }, localStorage.setItem("viewedArticles", JSON.stringify(viewedArticles));
  } catch (error) {}
}

async function incrementView(id) {
  const uid = getUserId(), isLoggedInUser = !(!uid || "anonymous" === uid);
  if (isLoggedInUser) try {
    if ((await db.ref(`articleReaders/${id}/${uid}`).once("value")).exists()) return;
  } catch (error) {
    return;
  } else if (hasViewedArticle(id)) return;
  db.ref(`articles/${id}/views`).transaction(currentViews => (currentViews || 0) + 1).then(result => {
    markArticleAsViewed(id);
    updateViewCountOnScreen(result.snapshot.val()), isLoggedInUser && db.ref(`articleReaders/${id}/${uid}`).set({
      name: getNickname(),
      email: getUserEmail(),
      timestamp: Date.now(),
      readAt: (new Date).toLocaleString()
    }).catch(() => {});
  }).catch(error => {});
}

function updateViewCountOnScreen(newViewCount) {
  const viewCountDisplay = document.getElementById("viewCountDisplay");
  if (viewCountDisplay) return viewCountDisplay.style.transition = "all 0.3s ease", 
  viewCountDisplay.style.transform = "scale(1.3)", viewCountDisplay.style.color = "#c62828", 
  viewCountDisplay.style.fontWeight = "700", viewCountDisplay.innerHTML = `👁️ ${newViewCount}`, 
  void setTimeout(() => {
    viewCountDisplay.style.transform = "scale(1)", viewCountDisplay.style.color = "#5f6368", 
    viewCountDisplay.style.fontWeight = "400";
  }, 300);
  const articleMeta = document.querySelector(".article-meta");
  if (!articleMeta) return;
  articleMeta.querySelectorAll("span").forEach(span => {
    span.textContent.includes("👁️") && (span.style.transition = "all 0.3s ease", span.style.transform = "scale(1.3)", 
    span.style.color = "#c62828", span.textContent = `👁️ ${newViewCount}`, setTimeout(() => {
      span.style.transform = "scale(1)", span.style.color = "#5f6368";
    }, 300));
  });
}

function getArticleViews(article) {
  return article.views || 0;
}

function getArticleTimestamp(a) {
  return a ? a.createdAt ? Number(a.createdAt) : a.date && new Date(a.date).getTime() || 0 : 0;
}

async function checkUserVote(articleId) {
  if (!isLoggedIn()) return null;
  const uid = getUserId();
  return (await db.ref(`votes/${articleId}/${uid}`).once("value")).val();
}

window.migrateCommentCounts = async function() {
  if (isAdmin()) {
    if (confirm("모든 기사의 댓글 수를 실제 댓글 수로 업데이트합니다.\n시간이 걸릴 수 있습니다. 계속할까요?")) {
      showLoadingIndicator("댓글 수 집계 중...");
      try {
        const [commentsSnap, articlesSnap] = await Promise.all([ db.ref("comments").once("value"), db.ref("articles").once("value") ]), commentsData = commentsSnap.val() || {}, articlesData = articlesSnap.val() || {}, updates = {};
        let updated = 0;
        for (const articleId of Object.keys(articlesData)) {
          const articleComments = commentsData[articleId] || {}, realCount = Object.values(articleComments).filter(c => c && !c.deleted).length;
          realCount !== (articlesData[articleId].commentCount || 0) && (updates[`articles/${articleId}/commentCount`] = realCount, 
          updated++);
        }
        if (0 === Object.keys(updates).length) return hideLoadingIndicator(), void alert("✅ 모든 기사의 댓글 수가 이미 정확합니다.");
        await db.ref().update(updates), hideLoadingIndicator(), alert(`✅ ${updated}개 기사의 댓글 수가 업데이트되었습니다.`);
      } catch (e) {
        hideLoadingIndicator(), alert("❌ 오류: " + e.message);
      }
    }
  } else alert("관리자만 실행 가능합니다.");
};

const _votingInProgress = new Set;

function toggleVote(articleId, voteType) {
  if (!isLoggedIn()) return void alert("추천/비추천은 로그인 후 가능합니다!");
  const lockKey = `${articleId}_${getUserId()}`;
  if (_votingInProgress.has(lockKey)) return;
  _votingInProgress.add(lockKey);
  const likeBtn = document.getElementById(`like-btn-${articleId}`), dislikeBtn = document.getElementById(`dislike-btn-${articleId}`);
  likeBtn && (likeBtn.disabled = !0), dislikeBtn && (dislikeBtn.disabled = !0);
  const uid = getUserId(), voteRef = db.ref(`votes/${articleId}/${uid}`), likeCountRef = db.ref(`articles/${articleId}/likeCount`), dislikeCountRef = db.ref(`articles/${articleId}/dislikeCount`);
  function _unlock() {
    _votingInProgress.delete(lockKey), likeBtn && (likeBtn.disabled = !1), dislikeBtn && (dislikeBtn.disabled = !1);
  }
  voteRef.once("value").then(snapshot => {
    const currentVote = snapshot.val(), isCancelling = currentVote === voteType, likeTransaction = likeCountRef.transaction(count => (count = count || 0, 
    isCancelling && "like" === voteType ? count - 1 : isCancelling || "like" !== currentVote ? isCancelling || "like" !== voteType ? count : count + 1 : count - 1)), dislikeTransaction = dislikeCountRef.transaction(count => (count = count || 0, 
    isCancelling && "dislike" === voteType ? count - 1 : isCancelling || "dislike" !== currentVote ? isCancelling || "dislike" !== voteType ? count : count + 1 : count - 1));
    Promise.all([ likeTransaction, dislikeTransaction ]).then(([likeResult, dislikeResult]) => {
      const newLikeCount = likeResult.snapshot.val() || 0, newDislikeCount = dislikeResult.snapshot.val() || 0;
      (isCancelling ? voteRef.remove() : voteRef.set(voteType)).then(() => voteRef.once("value")).then(snap => {
        const newVote = snap.val();
        likeBtn && (likeBtn.className = "vote-btn" + ("like" === newVote ? " active" : ""), 
        likeBtn.innerHTML = `👍 추천 ${newLikeCount}`), dislikeBtn && (dislikeBtn.className = "vote-btn dislike" + ("dislike" === newVote ? " active" : ""), 
        dislikeBtn.innerHTML = `👎 비추천 ${newDislikeCount}`);
      }).finally(_unlock);
    }).catch(_unlock);
  }).catch(_unlock);
}

let _articleVoteListenerRefs = null;

function detachArticleVoteListeners() {
  _articleVoteListenerRefs && (_articleVoteListenerRefs.likeRef.off("value", _articleVoteListenerRefs.likeCb), 
  _articleVoteListenerRefs.dislikeRef.off("value", _articleVoteListenerRefs.dislikeCb), 
  _articleVoteListenerRefs = null);
}

function attachArticleVoteListeners(articleId) {
  detachArticleVoteListeners();
  const likeRef = db.ref(`articles/${articleId}/likeCount`), dislikeRef = db.ref(`articles/${articleId}/dislikeCount`), likeCb = snapshot => {
    const likeBtn = document.getElementById(`like-btn-${articleId}`);
    likeBtn && (likeBtn.innerHTML = `👍 추천 ${snapshot.val() || 0}`);
  }, dislikeCb = snapshot => {
    const dislikeBtn = document.getElementById(`dislike-btn-${articleId}`);
    dislikeBtn && (dislikeBtn.innerHTML = `👎 비추천 ${snapshot.val() || 0}`);
  };
  likeRef.on("value", likeCb), dislikeRef.on("value", dislikeCb), _articleVoteListenerRefs = {
    likeRef: likeRef,
    dislikeRef: dislikeRef,
    likeCb: likeCb,
    dislikeCb: dislikeCb
  };
}

function getArticleVoteCounts(article) {
  return {
    likes: article.likeCount || 0,
    dislikes: article.dislikeCount || 0
  };
}

let searchTimeout = null;

function searchArticles(resetPage = !0) {
  clearTimeout(searchTimeout), searchTimeout = setTimeout(() => {
    const category = document.getElementById("searchCategory").value, keyword = document.getElementById("searchKeyword").value.toLowerCase();
    let articles = [ ...allArticles ];
    category && (articles = articles.filter(a => a.category === category)), keyword && (articles = articles.filter(a => a.title.toLowerCase().includes(keyword) || a.summary && a.summary.toLowerCase().includes(keyword) || a.author && a.author.toLowerCase().includes(keyword))), 
    filteredArticles = articles, resetPage && (currentArticlePage = 1), renderArticles();
  }, 300);
}

function sortArticles(method, btn) {
  currentSortMethod = method, currentArticlePage = 1, document.querySelectorAll("#articlesSection .chip").forEach(b => b.classList.remove("active")), 
  btn && btn.classList && btn.classList.add("active"), renderArticles();
}

function getSortedArticles() {
  let articles = Array.isArray(filteredArticles) ? [ ...filteredArticles ] : [];
  const sortFunctions = {
    latest: (a, b) => getArticleTimestamp(b) - getArticleTimestamp(a),
    oldest: (a, b) => getArticleTimestamp(a) - getArticleTimestamp(b),
    views: (a, b) => (b.views || 0) - (a.views || 0),
    likes: (a, b) => (b.likeCount || 0) - (a.likeCount || 0)
  }, sortFunction = sortFunctions[currentSortMethod] || sortFunctions.latest;
  return articles.sort(sortFunction), articles;
}

function loadMoreArticles() {
  const beforeHeight = document.documentElement.scrollHeight, beforeScroll = window.pageYOffset;
  currentArticlePage++, renderArticles(), setTimeout(() => {
    const heightDiff = document.documentElement.scrollHeight - beforeHeight;
    window.scrollTo(0, beforeScroll + heightDiff - 100);
  }, 100);
}

function renderActivityUserList(usersData, emailToNickname) {
  const listEl = document.getElementById("activityUserList");
  if (!listEl) return;
  const emailMap = new Map;
  Object.entries(usersData).filter(([uid, data]) => data.email).forEach(([uid, data]) => {
    const email = data.email, thisLastSeen = data.lastSeen || 0, existing = emailMap.get(email);
    (!existing || thisLastSeen > (existing.lastSeen || 0)) && emailMap.set(email, {
      uid: uid,
      email: email,
      nickname: data.newNickname || data.displayName || emailToNickname[email] || email.split("@")[0],
      lastSeen: data.lastSeen || null,
      isBanned: data.isBanned || !1
    });
  });
  const users = Array.from(emailMap.values()).sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
  0 !== users.length ? listEl.innerHTML = users.map(u => {
    const lastSeenHTML = formatLastSeen(u.lastSeen), bannedBadge = u.isBanned ? '<span style="background:#343a40;color:white;padding:2px 7px;border-radius:10px;font-size:10px;margin-left:6px;">차단</span>' : "";
    return `\n            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid #f0f0f0;"\n                 onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background=''">\n                <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">\n                    <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#e3f2fd,#bbdefb);display:flex;align-items:center;justify-content:center;flex-shrink:0;">\n                        <i class="fas fa-user" style="color:#1976d2;font-size:14px;"></i>\n                    </div>\n                    <div style="min-width:0;">\n                        <div style="font-weight:600;color:#212529;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">\n                            ${escapeHTML(u.nickname)}${bannedBadge}\n                        </div>\n                        <div style="font-size:11px;color:#adb5bd;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHTML(u.email)}</div>\n                    </div>\n                </div>\n                <div style="font-size:13px;white-space:nowrap;margin-left:12px;">${lastSeenHTML}</div>\n            </div>\n        `;
  }).join("") : listEl.innerHTML = '<p style="text-align:center;color:#adb5bd;padding:40px;">사용자 정보가 없습니다.</p>';
}

function detachActivityStatusListener() {
  window._activityListenerRef && window._activityListenerCb && window._activityListenerRef.off("value", window._activityListenerCb), 
  window._activityListenerRef = null, window._activityListenerCb = null;
}

window.showActivityStatus = async function() {
  hideAll(), window.scrollTo(0, 0);
  let section = document.getElementById("activityStatusSection");
  section || (section = document.createElement("section"), section.id = "activityStatusSection", 
  section.className = "page-section", document.querySelector("main").appendChild(section)), 
  section.classList.add("active"), section.innerHTML = '\n        <div style="max-width:700px; margin:0 auto; padding:20px;">\n            <div style="background:white; border-radius:14px; box-shadow:0 2px 12px rgba(0,0,0,0.09); overflow:hidden;">\n                <div style="background:linear-gradient(135deg,#1565c0,#1976d2); padding:18px 20px; display:flex; align-items:center; justify-content:space-between;">\n                    <h2 style="color:white; margin:0; font-size:20px; font-weight:800; display:flex; align-items:center; gap:10px;">\n                        <i class="fas fa-users"></i> 사용자 활동 현황\n                    </h2>\n                    <button onclick="showMoreMenu()" style="background:rgba(255,255,255,0.18); border:none; color:white; padding:8px 14px; border-radius:20px; cursor:pointer; font-size:13px; font-weight:600; display:flex; align-items:center; gap:6px;">\n                        <i class="fas fa-arrow-left"></i> 뒤로\n                    </button>\n                </div>\n                <div style="padding:11px 18px; background:#f8f9fa; border-bottom:1px solid #eee; display:flex; gap:16px; flex-wrap:wrap; font-size:12px; color:#6c757d;">\n                    <span>🟢 현재 활동중 (3분 이내)</span>\n                    <span>🟡 하루 이내</span>\n                    <span>⚫ 오래 됨</span>\n                    <span>👻 실종됨 (100일+)</span>\n                </div>\n                <div id="activityUserList" style="padding:8px 0;">\n                    <div style="text-align:center; padding:40px; color:#868e96;">\n                        <i class="fas fa-spinner fa-spin" style="font-size:28px;"></i>\n                        <p style="margin-top:12px;">불러오는 중...</p>\n                    </div>\n                </div>\n            </div>\n        </div>\n    ', 
  updateURL("activity"), detachActivityStatusListener();
  try {
    const articlesData = (await db.ref("articles").once("value")).val() || {}, emailToNickname = {};
    Object.values(articlesData).forEach(article => {
      article.authorEmail && article.author && (emailToNickname[article.authorEmail] = article.author);
    }), window._activityListenerRef = db.ref("users"), window._activityListenerCb = window._activityListenerRef.on("value", snapshot => {
      renderActivityUserList(snapshot.val() || {}, emailToNickname);
    }, err => {
      const listEl = document.getElementById("activityUserList");
      listEl && (listEl.innerHTML = `<p style="color:#f44336;text-align:center;padding:30px;">로드 실패: ${err.message}</p>`);
    });
  } catch (err) {
    document.getElementById("activityUserList").innerHTML = `<p style="color:#f44336;text-align:center;padding:30px;">로드 실패: ${err.message}</p>`;
  }
}, window.showMessenger = async function() {
  if (!isLoggedIn()) return void alert("로그인이 필요합니다!");
  hideAll();
  let section = document.getElementById("messengerSection");
  if (!section) {
    const container = document.querySelector("main") || document.body;
    section = document.createElement("section"), section.id = "messengerSection", section.className = "page-section", 
    container.appendChild(section);
  }
  section.classList.add("active"), section.innerHTML = `\n    <div style="max-width:800px; margin:0 auto; padding:20px;">\n\n        <div style="background:white; border-radius:14px; box-shadow:0 2px 12px rgba(0,0,0,0.09); margin-bottom:20px; overflow:hidden;">\n            <div style="background:linear-gradient(135deg,#c62828,#e53935); padding:18px 20px; display:flex; align-items:center; justify-content:space-between;">\n                <h2 style="color:white; margin:0; font-size:20px; font-weight:800; display:flex; align-items:center; gap:10px;">\n                    <i class="fas fa-bell" style="font-size:18px;"></i> 알림\n                </h2>\n                <button onclick="showMoreMenu()" style="background:rgba(255,255,255,0.18); border:none; color:white; padding:8px 14px; border-radius:20px; cursor:pointer; font-size:13px; font-weight:600; display:flex; align-items:center; gap:6px;">\n                    <i class="fas fa-arrow-left"></i> 뒤로\n                </button>\n            </div>\n            <div style="padding:12px 16px; display:flex; gap:8px; flex-wrap:wrap; border-top:1px solid #f0f0f0; background:#fafafa; align-items:center;">\n                <button onclick="toggleSelectionMode()" id="toggleSelectionBtn"\n                    style="background:white; border:1.5px solid #dee2e6; color:#495057; padding:7px 14px; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; display:flex; align-items:center; gap:6px;">\n                    <i class="fas fa-check-square"></i> 선택\n                </button>\n                <button onclick="deleteSelectedNotifications()" id="deleteSelectedBtn"\n                    style="display:none; background:#ffebee; border:1.5px solid #ef9a9a; color:#c62828; padding:7px 14px; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; align-items:center; gap:6px;">\n                    <i class="fas fa-trash"></i> 선택 삭제\n                </button>\n                <button onclick="markAllNotificationsAsRead()"\n                    style="background:white; border:1.5px solid #dee2e6; color:#495057; padding:7px 14px; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; display:flex; align-items:center; gap:6px;">\n                    <i class="fas fa-check-double"></i> 모두 읽음\n                </button>\n                ${isAdmin() ? '\n                <button onclick="showAdminNotificationManager()"\n                    style="background:#fff8e1; border:1.5px solid #ffe082; color:#856404; padding:7px 14px; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; display:flex; align-items:center; gap:6px; margin-left:auto;">\n                    <i class="fas fa-shield-alt"></i> 관리자 삭제\n                </button>\n                ' : ""}\n            </div>\n        </div>\n            \n            \x3c!-- 필터 버튼 --\x3e\n            <div class="messenger-filters" style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">\n                <button onclick="filterNotifications('all')" class="filter-chip active" data-filter="all">\n                    전체\n                </button>\n                <button onclick="filterNotifications('article')" class="filter-chip" data-filter="article">\n                    새 기사\n                </button>\n                <button onclick="filterNotifications('comment')" class="filter-chip" data-filter="comment">\n                    댓글\n                </button>\n                <button onclick="filterNotifications('myArticleComment')" class="filter-chip" data-filter="myArticleComment">\n                    내 기사\n                </button>\n            </div>\n            \n            \x3c!-- 알림 목록 --\x3e\n            <div id="notificationsList" style="background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">\n                <div style="text-align:center; padding:40px 20px; color:#868e96;">\n                    <i class="fas fa-spinner fa-spin" style="font-size:32px;"></i>\n                    <p style="margin-top:15px;">알림을 불러오는 중...</p>\n                </div>\n            </div>\n        </div>\n        \n        <style>\n            .filter-chip {\n                padding: 8px 16px;\n                background: #f8f9fa;\n                border: 1px solid #dee2e6;\n                border-radius: 20px;\n                cursor: pointer;\n                transition: all 0.2s;\n                font-size: 14px;\n                color: #495057;\n            }\n            \n            .filter-chip:hover {\n                background: #e9ecef;\n            }\n            \n            .filter-chip.active {\n                background: #c62828;\n                color: white;\n                border-color: #c62828;\n            }\n            \n            .notification-item {\n                padding: 15px;\n                border-bottom: 1px solid #f0f0f0;\n                cursor: pointer;\n                transition: background 0.2s;\n                display: flex;\n                gap: 12px;\n                align-items: flex-start;\n            }\n            \n            .notification-item:hover {\n                background: #f8f9fa;\n            }\n            \n            .notification-item.unread {\n                background: #fff3cd;\n            }\n            \n            .notification-icon {\n                width: 40px;\n                height: 40px;\n                border-radius: 50%;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                flex-shrink: 0;\n                font-size: 18px;\n            }\n            \n            .notification-content {\n                flex: 1;\n                min-width: 0;\n            }\n            \n            .notification-title {\n                font-weight: 600;\n                color: #212529;\n                margin-bottom: 4px;\n            }\n            \n            .notification-text {\n                color: #6c757d;\n                font-size: 14px;\n                line-height: 1.5;\n            }\n            \n            .notification-time {\n                font-size: 12px;\n                color: #868e96;\n                margin-top: 4px;\n            }\n        </style>\n    `, 
  updateURL("messenger"), await loadNotificationsList();
};

let currentFilter = "all";

async function loadNotificationsList(filter = "all") {
  currentFilter = filter;
  const myUid = getUserId(), listEl = document.getElementById("notificationsList");
  if (listEl) {
    listEl.innerHTML = '\n        <div style="text-align:center; padding:40px 20px; color:#868e96;">\n            <i class="fas fa-spinner fa-spin" style="font-size:32px;"></i>\n            <p style="margin-top:15px;">알림을 불러오는 중...</p>\n        </div>\n    ';
    try {
      const notificationsData = (await db.ref(`notifications/${myUid}`).once("value")).val() || {};
      let notifications = Object.entries(notificationsData).map(([id, notif]) => ({
        id: id,
        ...notif
      })).sort((a, b) => b.timestamp - a.timestamp);
      if ("all" !== filter && (notifications = notifications.filter(n => n.type === filter)), 
      0 === notifications.length) return void (listEl.innerHTML = `\n                <div style="text-align:center; padding:60px 20px;">\n                    <i class="fas fa-bell-slash" style="font-size:64px; color:#dee2e6;"></i>\n                    <p style="color:#868e96; margin-top:20px; font-size:16px;">\n                        ${"all" === filter ? "알림이 없습니다" : "해당 유형의 알림이 없습니다"}\n                    </p>\n                </div>\n            `);
      listEl.innerHTML = notifications.map(notif => {
        const icon = getNotificationIcon(notif.type), bgColor = getNotificationColor(notif.type), timeAgo = getTimeAgo(notif.timestamp);
        return `\n        <div class="notification-item ${notif.read ? "" : "unread"}" \n             data-notification-id="${notif.id}"\n             onclick="handleNotificationClick('${notif.id}', '${notif.articleId || ""}')">\n            \n            \x3c!-- ✅ 체크박스 추가 (선택 모드일 때만 표시) --\x3e\n            <div class="notification-checkbox" style="display:none; margin-right:12px;">\n                <input type="checkbox" \n                       class="notification-select-checkbox"\n                       data-notif-id="${notif.id}"\n                       onclick="event.stopPropagation();"\n                       style="width:18px; height:18px; cursor:pointer;">\n            </div>\n            \n            <div class="notification-icon" style="background:${bgColor}; color:white;">\n                <i class="fas ${icon}"></i>\n            </div>\n                    <div class="notification-content">\n                        <div class="notification-title">${notif.title || "알림"}</div>\n                        <div class="notification-text">${notif.text || ""}</div>\n                        <div class="notification-time">\n                            ${timeAgo}\n                            ${notif.read ? "" : ' <span style="color:#c62828;">• 읽지 않음</span>'}\n                        </div>\n                    </div>\n                    \x3c!-- ✅ 개별 삭제 버튼 추가 --\x3e\n            <div style="display:flex; gap:8px; margin-left:auto;">\n                ${notif.read ? "" : `\n                    <button onclick="event.stopPropagation(); markNotificationAsRead('${notif.id}')" \n                            class="notif-action-btn"\n                            style="padding:6px 12px; background:#e9ecef; border:none; border-radius:4px; font-size:12px; cursor:pointer;">\n                        읽음\n                    </button>\n                `}\n                \n                <button onclick="event.stopPropagation(); deleteNotification('${notif.id}')"\n                        class="notif-action-btn"\n                        style="padding:6px 12px; background:#ffebee; color:#c62828; border:none; border-radius:4px; font-size:12px; cursor:pointer;">\n                    <i class="fas fa-trash"></i>\n                </button>\n            </div>\n        </div>\n    `;
      }).join("");
    } catch (error) {
      listEl.innerHTML = '\n            <div style="text-align:center; padding:40px 20px; color:#f44336;">\n                <i class="fas fa-exclamation-circle" style="font-size:48px;"></i>\n                <p style="margin-top:15px;">알림을 불러오는데 실패했습니다</p>\n            </div>\n        ';
    }
  }
}

function getNotificationIcon(type) {
  return {
    article: "fa-newspaper",
    comment: "fa-comment",
    myArticleComment: "fa-comments",
    stock_alert: "fa-chart-line",
    notification: "fa-bell"
  }[type] || "fa-bell";
}

function getNotificationColor(type) {
  return {
    article: "#c62828",
    comment: "#1976d2",
    myArticleComment: "#388e3c",
    stock_alert: "#f57c00",
    notification: "#6c757d"
  }[type] || "#6c757d";
}

function getTimeAgo(timestamp) {
  const diff = Date.now() - timestamp, minutes = Math.floor(diff / 6e4), hours = Math.floor(diff / 36e5), days = Math.floor(diff / 864e5);
  return minutes < 1 ? "방금 전" : minutes < 60 ? `${minutes}분 전` : hours < 24 ? `${hours}시간 전` : days < 7 ? `${days}일 전` : new Date(timestamp).toLocaleDateString("ko-KR");
}

async function updateMessengerBadge() {
  if (!isLoggedIn()) return;
  const myUid = getUserId(), badges = document.querySelectorAll("#messengerBadge, #messengerBadgeMore");
  try {
    const unreadCount = (await db.ref(`notifications/${myUid}`).orderByChild("read").equalTo(!1).once("value")).numChildren();
    badges.forEach(badge => {
      badge && (unreadCount > 0 ? (badge.textContent = unreadCount > 99 ? "99+" : unreadCount, 
      badge.style.display = "inline-block") : badge.style.display = "none");
    });
    const moreMenuDot = document.getElementById("moreMenuDot");
    moreMenuDot && (moreMenuDot.style.display = unreadCount > 0 ? "block" : "none");
  } catch (error) {}
}

window.handleNotificationClick = async function(notificationId, articleId) {
  const myUid = getUserId();
  await db.ref(`notifications/${myUid}/${notificationId}`).remove(), await updateMessengerBadge(), 
  await loadNotificationsList(currentFilter), articleId && showArticleDetail(articleId);
}, window.markNotificationAsRead = async function(notificationId) {
  const myUid = getUserId();
  try {
    await db.ref(`notifications/${myUid}/${notificationId}`).update({
      read: !0,
      readAt: Date.now()
    }), await loadNotificationsList(currentFilter), await updateMessengerBadge();
  } catch (error) {}
}, window.markAllNotificationsAsRead = async function() {
  if (!confirm("모든 알림을 읽음으로 표시하시겠습니까?")) return;
  const myUid = getUserId();
  try {
    const notifications = (await db.ref(`notifications/${myUid}`).once("value")).val() || {}, updates = {};
    Object.keys(notifications).forEach(notifId => {
      updates[`notifications/${myUid}/${notifId}/read`] = !0, updates[`notifications/${myUid}/${notifId}/readAt`] = Date.now();
    }), await db.ref().update(updates), await loadNotificationsList(currentFilter), 
    await updateMessengerBadge();
  } catch (error) {
    alert("처리 중 오류가 발생했습니다.");
  }
}, window.filterNotifications = function(filter) {
  document.querySelectorAll(".filter-chip").forEach(btn => {
    btn.classList.remove("active");
  });
  const activeBtn = document.querySelector(`.filter-chip[data-filter="${filter}"]`);
  activeBtn && activeBtn.classList.add("active"), loadNotificationsList(filter);
};

let isSelectionMode = !1;

window.toggleSelectionMode = function() {
  isSelectionMode = !isSelectionMode;
  const toggleBtn = document.getElementById("toggleSelectionBtn"), deleteBtn = document.getElementById("deleteSelectedBtn"), checkboxes = document.querySelectorAll(".notification-checkbox");
  isSelectionMode ? (toggleBtn.innerHTML = '<i class="fas fa-times"></i> 취소', toggleBtn.classList.add("active"), 
  deleteBtn.style.display = "inline-flex", checkboxes.forEach(cb => cb.style.display = "flex"), 
  document.querySelectorAll(".notification-item").forEach(item => {
    item.style.cursor = "default";
    const onclick = item.getAttribute("onclick");
    onclick && (item.setAttribute("data-original-onclick", onclick), item.removeAttribute("onclick"));
  })) : (toggleBtn.innerHTML = '<i class="fas fa-check-square"></i> 선택', toggleBtn.classList.remove("active"), 
  deleteBtn.style.display = "none", checkboxes.forEach(cb => {
    cb.style.display = "none", cb.querySelector("input").checked = !1;
  }), document.querySelectorAll(".notification-item").forEach(item => {
    item.style.cursor = "pointer";
    const onclick = item.getAttribute("data-original-onclick");
    onclick && (item.setAttribute("onclick", onclick), item.removeAttribute("data-original-onclick"));
  }));
}, window.deleteNotification = async function(notificationId) {
  const myUid = getUserId();
  try {
    await db.ref(`notifications/${myUid}/${notificationId}`).remove();
    const notifElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
    notifElement && (notifElement.style.animation = "fadeOut 0.3s ease", setTimeout(() => {
      loadNotificationsList(currentFilter);
    }, 300)), await updateMessengerBadge();
  } catch (error) {
    alert("삭제 중 오류가 발생했습니다.");
  }
}, window.deleteSelectedNotifications = async function() {
  const selectedCheckboxes = document.querySelectorAll(".notification-select-checkbox:checked");
  if (0 === selectedCheckboxes.length) return void alert("삭제할 알림을 선택해주세요.");
  if (!confirm(`선택한 ${selectedCheckboxes.length}개의 알림을 삭제하시겠습니까?`)) return;
  const myUid = getUserId(), updates = {};
  selectedCheckboxes.forEach(checkbox => {
    const notifId = checkbox.getAttribute("data-notif-id");
    updates[`notifications/${myUid}/${notifId}`] = null;
  });
  try {
    await db.ref().update(updates), toggleSelectionMode(), await loadNotificationsList(currentFilter), 
    await updateMessengerBadge(), "function" == typeof showToastNotification && showToastNotification("삭제 완료", `${selectedCheckboxes.length}개의 알림이 삭제되었습니다.`);
  } catch (error) {
    alert("삭제 중 오류가 발생했습니다.");
  }
}, window.showAdminNotificationManager = async function() {
  if (isAdmin()) {
    showLoadingIndicator("알림 목록 로딩 중...");
    try {
      const usersData = (await db.ref("users").once("value")).val() || {}, notificationMap = new Map;
      for (const [uid, userData] of Object.entries(usersData)) {
        const notifications = (await db.ref(`notifications/${uid}`).once("value")).val() || {};
        for (const [notifId, notifData] of Object.entries(notifications)) {
          const key = `${notifData.timestamp}_${notifData.title}_${notifData.articleId || "none"}`;
          notificationMap.has(key) || notificationMap.set(key, {
            sampleId: notifId,
            data: notifData,
            users: [],
            count: 0
          });
          const group = notificationMap.get(key);
          group.users.push({
            uid: uid,
            notifId: notifId
          }), group.count++;
        }
      }
      hideLoadingIndicator();
      const existingModal = document.getElementById("adminNotificationModal");
      existingModal && existingModal.remove();
      const notifications = Array.from(notificationMap.entries()).sort((a, b) => b[1].data.timestamp - a[1].data.timestamp), modalHTML = `\n            <div id="adminNotificationModal" class="modal active">\n                <div class="modal-content" style="max-width:900px; max-height:80vh; overflow-y:auto;">\n                    <div class="modal-header">\n                        <h3 style="color:#c62828;">\n                            <i class="fas fa-shield-alt"></i> 관리자 알림 관리\n                        </h3>\n                        <button onclick="closeAdminNotificationModal()" class="modal-close">\n                            <i class="fas fa-times"></i>\n                        </button>\n                    </div>\n                    \n                    <div style="padding:20px;">\n                        <div style="background:#fff3cd; padding:12px; border-radius:8px; margin-bottom:20px; border:1px solid #ffc107;">\n                            <i class="fas fa-exclamation-triangle" style="color:#856404;"></i>\n                            <strong>주의:</strong> 선택한 알림이 모든 사용자에게서 삭제됩니다.\n                        </div>\n                        \n                        ${0 === notifications.length ? '\n                            <div style="text-align:center; padding:60px 20px; color:#868e96;">\n                                <i class="fas fa-inbox" style="font-size:48px; margin-bottom:15px; display:block;"></i>\n                                <p>전송된 알림이 없습니다.</p>\n                            </div>\n                        ' : notifications.map(([key, group]) => {
        const timeAgo = getTimeAgo(group.data.timestamp), icon = getNotificationIcon(group.data.type);
        return `\n                                <div style="background:#f8f9fa; padding:16px; border-radius:8px; margin-bottom:12px; border:1px solid #dee2e6;">\n                                    <div style="display:flex; gap:12px; align-items:flex-start;">\n                                        <div style="width:40px; height:40px; border-radius:50%; background:${getNotificationColor(group.data.type)}; color:white; display:flex; align-items:center; justify-content:center; flex-shrink:0;">\n                                            <i class="fas ${icon}"></i>\n                                        </div>\n                                        \n                                        <div style="flex:1;">\n                                            <div style="font-weight:600; color:#212529; margin-bottom:4px;">\n                                                ${group.data.title}\n                                            </div>\n                                            <div style="font-size:14px; color:#6c757d; margin-bottom:8px;">\n                                                ${group.data.text}\n                                            </div>\n                                            <div style="font-size:12px; color:#868e96;">\n                                                <i class="fas fa-users"></i> ${group.count}명에게 전송 · ${timeAgo}\n                                                ${group.data.articleId ? ` · 기사 ID: ${group.data.articleId}` : ""}\n                                            </div>\n                                        </div>\n                                        \n                                        <button onclick="deleteNotificationForAllUsers('${key}')" \n                                                class="btn-danger" \n                                                style="padding:8px 16px; white-space:nowrap;">\n                                            <i class="fas fa-trash"></i> 전체 삭제\n                                        </button>\n                                    </div>\n                                </div>\n                            `;
      }).join("")}\n                    </div>\n                </div>\n            </div>\n            \n            <style>\n                @keyframes fadeOut {\n                    to {\n                        opacity: 0;\n                        transform: translateX(-20px);\n                    }\n                }\n            </style>\n        `;
      document.body.insertAdjacentHTML("beforeend", modalHTML), window.adminNotificationMap = notificationMap;
    } catch (error) {
      hideLoadingIndicator(), alert("알림 목록을 불러오는데 실패했습니다.");
    }
  } else alert("🚫 관리자 권한이 필요합니다!");
}, window.deleteNotificationForAllUsers = async function(notificationKey) {
  if (!isAdmin()) return void alert("🚫 관리자 권한이 필요합니다!");
  const group = window.adminNotificationMap.get(notificationKey);
  if (group) {
    if (confirm(`이 알림을 ${group.count}명의 사용자에게서 모두 삭제하시겠습니까?\n\n"${group.data.title}"`)) {
      showLoadingIndicator("삭제 중...");
      try {
        const updates = {};
        group.users.forEach(({uid: uid, notifId: notifId}) => {
          updates[`notifications/${uid}/${notifId}`] = null;
        }), await db.ref().update(updates), hideLoadingIndicator(), "function" == typeof showToastNotification && showToastNotification("삭제 완료", `${group.count}명의 사용자에게서 알림이 삭제되었습니다.`), 
        closeAdminNotificationModal(), setTimeout(() => showAdminNotificationManager(), 300);
      } catch (error) {
        hideLoadingIndicator(), alert("삭제 중 오류가 발생했습니다: " + error.message);
      }
    }
  } else alert("알림 정보를 찾을 수 없습니다.");
}, window.closeAdminNotificationModal = function() {
  const modal = document.getElementById("adminNotificationModal");
  modal && (modal.classList.remove("active"), setTimeout(() => modal.remove(), 300));
}, window.addEventListener("DOMContentLoaded", () => {
  showPageLoadingScreen(), setTimeout(() => hidePageLoadingScreen(), 1e4), setupArticlesListener(), 
  Promise.all([ loadBannedWords() ]).then(() => {}), setupArticleForm(), window._lastSeenInterval && clearInterval(window._lastSeenInterval), 
  window._lastSeenInterval = setInterval(updateLastSeen, 18e4), document.addEventListener("visibilitychange", () => {
    "visible" === document.visibilityState && updateLastSeen();
  }), window.addEventListener("beforeunload", () => {
    clearInterval(window._lastSeenInterval);
  }, {
    once: !0
  }), setupCategoryChangeListener();
  const savedCategory = sessionStorage.getItem("currentCategory");
  savedCategory && (currentCategory = savedCategory), authReady.then(() => {
    initialRoute();
  });
}), window.addEventListener("beforeunload", () => {
  sessionStorage.setItem("currentCategory", currentCategory);
});

let themeStylesheet = null, currentAppliedTheme = null;

function getCurrentTheme() {
  return localStorage.getItem("selectedTheme") || "default";
}

function saveTheme(themeName) {
  localStorage.setItem("selectedTheme", themeName);
}

function initSnowfall() {
  const container = document.getElementById("snowfall-container");
  if (!container) {
    const newContainer = document.createElement("div");
    return newContainer.id = "snowfall-container", document.body.appendChild(newContainer), 
    void setTimeout(() => initSnowfall(), 100);
  }
  container.innerHTML = "";
  const snowflakeCount = window.innerWidth <= 768 ? 40 : 60, snowflakeShapes = [ "❄", "❅", "❆", "•", "∗" ];
  for (let i = 0; i < snowflakeCount; i++) createSnowflake(container, snowflakeShapes);
}

function createSnowflake(container, shapes) {
  const snowflake = document.createElement("div");
  snowflake.className = "snowflake";
  const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
  snowflake.textContent = randomShape;
  const randomLeft = 100 * Math.random();
  snowflake.style.left = randomLeft + "%";
  const randomSize = 1 * Math.random() + .5;
  snowflake.style.fontSize = randomSize + "em";
  const randomDuration = 10 * Math.random() + 5;
  snowflake.style.animationDuration = randomDuration + "s";
  const randomDelay = 2 * Math.random();
  snowflake.style.animationDelay = randomDelay + "s";
  const randomOpacity = .5 * Math.random() + .5;
  snowflake.style.opacity = randomOpacity, container.appendChild(snowflake);
}

function removeSnowfall() {
  const container = document.getElementById("snowfall-container");
  container && (container.innerHTML = "");
}

function showHorseGreeting() {
  if (document.getElementById("horseGreeting")) return;
  const greeting = document.createElement("div");
  greeting.id = "horseGreeting", greeting.className = "horse-greeting", greeting.innerHTML = '\n        <div class="horse-greeting-text">\n            <div class="horse-greeting-title">🎊 2026년 병오년(丙午年) 새해 복 많이 받으세요!</div>\n            <div class="horse-greeting-desc">붉은 말이 여러분의 해정뉴스 탐험을 안내합니다 ✨</div>\n        </div>\n        <button class="horse-greeting-close" onclick="hideHorseGreeting()">×</button>\n    ';
  const mainContent = document.querySelector("main");
  mainContent && mainContent.firstChild && (mainContent.insertBefore(greeting, mainContent.firstChild), 
  setTimeout(() => {
    greeting.style.animation = "slideDown 0.5s ease";
  }, 100));
}

function showGanadiGreeting() {
  if (document.getElementById("ganadiGreeting")) return;
  const greeting = document.createElement("div");
  greeting.id = "ganadiGreeting", greeting.className = "ganadi-greeting", greeting.innerHTML = '\n        <div class="ganadi-greeting-text">\n            <div class="ganadi-greeting-title">🐶 듀... 가나디 테마에 오신 것을 환영합니다!</div>\n            <div class="ganadi-greeting-desc">듀..? 가나디는 숨어있답니다! 찾아보세요! 💧</div>\n        </div>\n        <button class="ganadi-greeting-close" onclick="hideGanadiGreeting()">×</button>\n    ';
  const mainContent = document.querySelector("main");
  mainContent && mainContent.firstChild && (mainContent.insertBefore(greeting, mainContent.firstChild), 
  setTimeout(() => {
    greeting.style.animation = "slideDown 0.5s ease";
  }, 100));
}

function applyTheme(themeName) {
  if (currentAppliedTheme === themeName) return;
  themeStylesheet && themeStylesheet.parentNode && (themeStylesheet.parentNode.removeChild(themeStylesheet), 
  themeStylesheet = null), removeSnowfall();
  const horseGreeting = document.getElementById("horseGreeting");
  horseGreeting && horseGreeting.remove();
  const ganadiGreeting = document.getElementById("ganadiGreeting");
  if (ganadiGreeting && ganadiGreeting.remove(), document.body.classList.remove("ganadi-theme"), 
  document.body.classList.remove("dark-theme"), "red-horse" === themeName) {
    let style2 = document.querySelector('link[href*="style2.css"]');
    style2 ? (style2.disabled = !1, themeStylesheet = style2, currentAppliedTheme = themeName, 
    localStorage.getItem("horseGreetingDismissed") || setTimeout(showHorseGreeting, 500)) : (themeStylesheet = document.createElement("link"), 
    themeStylesheet.rel = "stylesheet", themeStylesheet.href = "css/style2.css", themeStylesheet.id = "red-horse-theme", 
    document.head.appendChild(themeStylesheet), themeStylesheet.onload = function() {
      currentAppliedTheme = themeName, localStorage.getItem("horseGreetingDismissed") || setTimeout(showHorseGreeting, 500);
    });
  } else if ("christmas" === themeName) {
    let style1 = document.querySelector('link[href*="style1.css"]');
    style1 ? (style1.disabled = !1, themeStylesheet = style1, currentAppliedTheme = themeName, 
    setTimeout(() => initSnowfall(), 100)) : (themeStylesheet = document.createElement("link"), 
    themeStylesheet.rel = "stylesheet", themeStylesheet.href = "css/style1.css", themeStylesheet.id = "christmas-theme", 
    document.head.appendChild(themeStylesheet), themeStylesheet.onload = function() {
      currentAppliedTheme = themeName, setTimeout(() => initSnowfall(), 100);
    });
  } else if ("ganadi" === themeName) {
    let style3 = document.querySelector('link[href*="style3.css"]');
    document.body.classList.add("ganadi-theme"), currentAppliedTheme = themeName, style3 ? (style3.disabled = !1, 
    themeStylesheet = style3, localStorage.getItem("ganadiGreetingDismissed") || setTimeout(showGanadiGreeting, 500)) : (themeStylesheet = document.createElement("link"), 
    themeStylesheet.rel = "stylesheet", themeStylesheet.href = "css/style3.css", themeStylesheet.id = "ganadi-theme", 
    document.head.appendChild(themeStylesheet), themeStylesheet.onload = function() {
      document.body.classList.add("ganadi-theme"), localStorage.getItem("ganadiGreetingDismissed") || setTimeout(showGanadiGreeting, 500);
    }, themeStylesheet.onerror = function() {
      document.body.classList.add("ganadi-theme");
    });
  } else if ("dark" === themeName) {
    let style4 = document.querySelector('link[href*="style4.css"]');
    style4 ? (style4.disabled = !1, themeStylesheet = style4, currentAppliedTheme = themeName, 
    document.body.classList.add("dark-theme")) : (themeStylesheet = document.createElement("link"), 
    themeStylesheet.rel = "stylesheet", themeStylesheet.href = "css/style4.css", themeStylesheet.id = "dark-theme", 
    document.head.appendChild(themeStylesheet), themeStylesheet.onload = function() {
      currentAppliedTheme = themeName, document.body.classList.add("dark-theme");
    });
  } else {
    const style1 = document.querySelector('link[href*="style1.css"]'), style2 = document.querySelector('link[href*="style2.css"]'), style3 = document.querySelector('link[href*="style3.css"]'), style4 = document.querySelector('link[href*="style4.css"]');
    style1 && (style1.disabled = !0), style2 && (style2.disabled = !0), style3 && (style3.disabled = !0), 
    style4 && (style4.disabled = !0), document.body.classList.remove("ganadi-theme"), 
    document.body.classList.remove("dark-theme"), currentAppliedTheme = themeName;
  }
  document.body.style.transition = "opacity 0.3s", document.body.style.opacity = "0.9", 
  setTimeout(() => {
    document.body.style.opacity = "1";
  }, 150);
}

function applyInitialTheme() {
  const savedTheme = getCurrentTheme();
  if ("red-horse" === savedTheme) {
    let style2 = document.querySelector('link[href*="style2.css"]');
    if (style2) style2.disabled = !1, themeStylesheet = style2, currentAppliedTheme = "red-horse", 
    document.body.classList.remove("ganadi-theme"); else {
      const newLink = document.createElement("link");
      newLink.rel = "stylesheet", newLink.href = "css/style2.css", newLink.id = "red-horse-theme", 
      document.head.appendChild(newLink), themeStylesheet = newLink, newLink.onload = () => {
        currentAppliedTheme = "red-horse", document.body.classList.remove("ganadi-theme");
      };
    }
  } else if ("christmas" === savedTheme) {
    let style1 = document.querySelector('link[href*="style1.css"]');
    if (style1) style1.disabled = !1, themeStylesheet = style1, currentAppliedTheme = "christmas", 
    document.body.classList.remove("ganadi-theme"), setTimeout(() => initSnowfall(), 100); else {
      const newLink = document.createElement("link");
      newLink.rel = "stylesheet", newLink.href = "css/style1.css", newLink.id = "christmas-theme", 
      document.head.appendChild(newLink), themeStylesheet = newLink, newLink.onload = () => {
        currentAppliedTheme = "christmas", document.body.classList.remove("ganadi-theme"), 
        setTimeout(() => initSnowfall(), 100);
      };
    }
  } else if ("ganadi" === savedTheme) {
    document.body.classList.add("ganadi-theme"), currentAppliedTheme = "ganadi";
    let style3 = document.querySelector('link[href*="style3.css"]');
    if (style3) style3.disabled = !1, themeStylesheet = style3; else {
      const newLink = document.createElement("link");
      newLink.rel = "stylesheet", newLink.href = "css/style3.css", newLink.id = "ganadi-theme", 
      document.head.appendChild(newLink), themeStylesheet = newLink, newLink.onload = () => {
        document.body.classList.add("ganadi-theme");
      }, newLink.onerror = () => {
        document.body.classList.add("ganadi-theme");
      };
    }
  } else if ("dark" === savedTheme) {
    let style4 = document.querySelector('link[href*="style4.css"]');
    if (style4) style4.disabled = !1, themeStylesheet = style4, currentAppliedTheme = "dark", 
    document.body.classList.add("dark-theme"); else {
      const newLink = document.createElement("link");
      newLink.rel = "stylesheet", newLink.href = "css/style4.css", newLink.id = "dark-theme", 
      document.head.appendChild(newLink), themeStylesheet = newLink, newLink.onload = () => {
        currentAppliedTheme = "dark", document.body.classList.add("dark-theme");
      };
    }
  } else document.body.classList.remove("ganadi-theme"), document.body.classList.remove("dark-theme"), 
  currentAppliedTheme = "default";
}

window.hideHorseGreeting = function() {
  const greeting = document.getElementById("horseGreeting");
  greeting && (greeting.style.animation = "slideUp 0.3s ease", setTimeout(() => {
    greeting.remove(), localStorage.setItem("horseGreetingDismissed", "true");
  }, 300));
}, window.hideGanadiGreeting = function() {
  const greeting = document.getElementById("ganadiGreeting");
  greeting && (greeting.style.animation = "slideUp 0.3s ease", setTimeout(() => {
    greeting.remove(), localStorage.setItem("ganadiGreetingDismissed", "true");
  }, 300));
};

let ganadiClickCount = 0, ganadiClickTimer = null;

const GANADI_CLICK_THRESHOLD = 5, GANADI_CLICK_TIMEOUT = 3e3;

function resetGanadiClickCount() {
  ganadiClickCount = 0, ganadiClickTimer && (clearTimeout(ganadiClickTimer), ganadiClickTimer = null);
}

function incrementGanadiClick() {
  "ganadi" === getCurrentTheme() && (isEasterEggActive || (ganadiClickCount++, ganadiClickTimer && clearTimeout(ganadiClickTimer), 
  ganadiClickTimer = setTimeout(() => {
    resetGanadiClickCount();
  }, 3e3), ganadiClickCount >= 5 && (activateGanadiEasterEgg(), resetGanadiClickCount())));
}

function activateGanadiEasterEgg() {
  "ganadi" === getCurrentTheme() && (isEasterEggActive || (isEasterEggActive = !0, 
  showGanadiEasterEggAlert(), setTimeout(() => {
    summonGanadiCharacters();
  }, 1e3), createGanadiRainEffect(), playGanadiSound(), setTimeout(() => {
    endGanadiEasterEgg();
  }, 2e4)));
}

function endGanadiEasterEgg() {
  isEasterEggActive = !1, document.querySelectorAll(".ganadi-character").forEach(el => {
    el.style.animation = "ganadiDisappear 0.8s ease-out", setTimeout(() => el.remove(), 800);
  });
  const rainContainer = document.getElementById("ganadiRainContainer");
  rainContainer && (rainContainer.style.opacity = "0", rainContainer.style.transition = "opacity 1s", 
  setTimeout(() => rainContainer.remove(), 1e3));
}

function summonGanadiCharacters() {
  document.querySelectorAll(".ganadi-character").forEach(el => el.remove()), createGanadiCharacter({
    position: "fixed",
    top: "80px",
    right: "100px",
    size: "80px",
    delay: 0,
    animation: "ganadiSpinScale 3s ease-in-out infinite"
  }), createGanadiCharacter({
    position: "fixed",
    bottom: "100px",
    left: "50px",
    size: "100px",
    delay: 200,
    animation: "ganadiSpinScale 2.5s ease-in-out infinite"
  }), createGanadiCharacter({
    position: "fixed",
    top: "50%",
    right: "30px",
    size: "70px",
    delay: 400,
    animation: "ganadiSpinScale 3.5s ease-in-out infinite",
    transform: "translateY(-50%)"
  }), createGanadiCharacter({
    position: "fixed",
    top: "150px",
    left: "80px",
    size: "60px",
    delay: 600,
    animation: "ganadiSpinScale 2s ease-in-out infinite"
  }), createGanadiCharacter({
    position: "fixed",
    bottom: "50px",
    left: "50%",
    size: "120px",
    delay: 800,
    animation: "ganadiSpinScale 4s ease-in-out infinite",
    transform: "translateX(-50%)"
  });
}

function createGanadiCharacter(config) {
  const ganadi = document.createElement("div");
  ganadi.className = "ganadi-character", ganadi.style.cssText = `\n        position: ${config.position};\n        top: ${config.top || "auto"};\n        bottom: ${config.bottom || "auto"};\n        left: ${config.left || "auto"};\n        right: ${config.right || "auto"};\n        width: ${config.size};\n        height: ${config.size};\n        pointer-events: none;\n        z-index: 9998;\n        opacity: 0;\n        transform: ${config.transform || "scale(0)"};\n        transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);\n        filter: drop-shadow(2px 2px 8px rgba(255, 182, 193, 0.4));\n    `, 
  ganadi.innerHTML = `\n    <div style="\n        width: 100%;\n        height: 100%;\n        background: linear-gradient(135deg, #B3D9FF 0%, #87CEEB 100%);\n        border-radius: 50%;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        font-size: calc(${config.size} * 0.5);\n        position: relative;\n        box-shadow: 0 4px 12px rgba(135, 206, 235, 0.3);\n        border: 3px solid rgba(179, 217, 255, 0.5);\n    ">\n        <span style="position: relative; z-index: 2;">🐶</span>\n        <div style="\n            position: absolute;\n            top: 20%;\n            right: 15%;\n            font-size: calc(${config.size} * 0.3);\n        ">💧</div>\n    </div>\n`, 
  document.body.appendChild(ganadi), setTimeout(() => {
    ganadi.style.opacity = "0.8", config.transform && (ganadi.style.transformOrigin = "center"), 
    ganadi.style.transform = config.transform || "scale(1)", ganadi.style.animation = config.animation;
  }, config.delay), ganadi.addEventListener("mouseenter", () => {
    ganadi.style.animationPlayState = "paused", ganadi.style.transform = (config.transform || "") + " scale(1.4)", 
    ganadi.style.opacity = "1";
  }), ganadi.addEventListener("mouseleave", () => {
    ganadi.style.animationPlayState = "running", ganadi.style.opacity = "0.8";
  }), ganadi.addEventListener("mouseenter", () => {
    ganadi.style.transform = (config.transform || "scale(1)") + " scale(1.2)", ganadi.style.opacity = "1";
  }), ganadi.addEventListener("mouseleave", () => {
    ganadi.style.transform = config.transform || "scale(1)", ganadi.style.opacity = "0.8";
  });
}

function createGanadiRainEffect() {
  const rainContainer = document.createElement("div");
  rainContainer.id = "ganadiRainContainer", rainContainer.style.cssText = "\n        position: fixed;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n        pointer-events: none;\n        z-index: 9997;\n        overflow: hidden;\n    ", 
  document.body.appendChild(rainContainer);
  for (let i = 0; i < 30; i++) createTearDrop(rainContainer, i);
  setTimeout(() => {
    rainContainer.parentNode && (rainContainer.style.opacity = "0", rainContainer.style.transition = "opacity 2s", 
    setTimeout(() => rainContainer.remove(), 2e3));
  }, 2e4);
}

function createTearDrop(container, index) {
  const tear = document.createElement("div");
  tear.className = "ganadi-tear";
  const randomLeft = 100 * Math.random(), randomSize = 20 * Math.random() + 15, randomDuration = 3 * Math.random() + 2, randomDelay = 2 * Math.random();
  tear.style.cssText = `\n        position: absolute;\n        left: ${randomLeft}%;\n        top: -50px;\n        font-size: ${randomSize}px;\n        animation: tearFall ${randomDuration}s linear ${randomDelay}s infinite;\n        opacity: 0.7;\n    `, 
  tear.textContent = "💧", container.appendChild(tear);
}

function playGanadiSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext);
    [ {
      freq: 523.25,
      time: 0
    }, {
      freq: 659.25,
      time: .2
    }, {
      freq: 783.99,
      time: .4
    }, {
      freq: 1046.5,
      time: .6
    } ].forEach(note => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator(), gainNode = audioContext.createGain();
        oscillator.connect(gainNode), gainNode.connect(audioContext.destination), oscillator.frequency.value = note.freq, 
        oscillator.type = "sine", gainNode.gain.setValueAtTime(.3, audioContext.currentTime), 
        gainNode.gain.exponentialRampToValueAtTime(.01, audioContext.currentTime + .3), 
        oscillator.start(audioContext.currentTime), oscillator.stop(audioContext.currentTime + .3);
      }, 1e3 * note.time);
    });
  } catch (error) {}
}

const style = document.createElement("style");

function showGanadiEasterEggAlert() {
  const existingAlert = document.getElementById("ganadiEasterEggAlert");
  existingAlert && existingAlert.remove();
  document.body.insertAdjacentHTML("beforeend", '\n        <div id="ganadiEasterEggAlert" style="\n            position: fixed;\n            top: 50%;\n            left: 50%;\n            transform: translate(-50%, -50%);\n            background: linear-gradient(135deg, #FFB6C1 0%, #B3D9FF 100%);\n            border: 4px solid #FFFFFF;\n            border-radius: 30px;\n            padding: 50px;\n            box-shadow: 0 12px 48px rgba(255, 182, 193, 0.6);\n            z-index: 99999;\n            text-align: center;\n            animation: easterEggPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);\n            max-width: 500px;\n        ">\n            <div style="font-size: 96px; margin-bottom: 20px; animation: wiggle 1s infinite;">\n                🐶\n            </div>\n            <div style="font-size: 28px; font-weight: 900; color: #4A4A4A; margin-bottom: 15px; text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.5);">\n                듀... 이스터에그 발견!\n            </div>\n            <div style="font-size: 18px; color: #4A4A4A; margin-bottom: 25px; line-height: 1.6;">\n                축하합니다! 숨겨진 가나디들을 깨웠어요! 💧<br>\n                <span style="font-size: 14px; opacity: 0.8;">이제 가나디들이 함께할 거예요...</span>\n            </div>\n            <button onclick="closeGanadiEasterEgg()" style="\n                background: white;\n                border: 3px solid #FFB6C1;\n                padding: 15px 35px;\n                border-radius: 15px;\n                font-size: 18px;\n                font-weight: 700;\n                color: #4A4A4A;\n                cursor: pointer;\n                transition: all 0.3s;\n                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);\n            " onmouseover="this.style.background=\'#FFB6C1\'; this.style.color=\'white\'; this.style.transform=\'scale(1.05)\';" \n               onmouseout="this.style.background=\'white\'; this.style.color=\'#4A4A4A\'; this.style.transform=\'scale(1)\';">\n                확인 💖\n            </button>\n        </div>\n        \n        <style>\n            @keyframes easterEggPop {\n                0% {\n                    transform: translate(-50%, -50%) scale(0) rotate(-180deg);\n                    opacity: 0;\n                }\n                70% {\n                    transform: translate(-50%, -50%) scale(1.1) rotate(10deg);\n                }\n                100% {\n                    transform: translate(-50%, -50%) scale(1) rotate(0deg);\n                    opacity: 1;\n                }\n            }\n            \n            @keyframes wiggle {\n                0%, 100% { transform: rotate(0deg); }\n                25% { transform: rotate(-10deg); }\n                75% { transform: rotate(10deg); }\n            }\n        </style>\n    ');
}

function initThemeSelector() {
  const defaultRadio = document.getElementById("themeDefault"), redHorseRadio = document.getElementById("themeRedHorse"), christmasRadio = document.getElementById("themeChristmas"), ganadiRadio = document.getElementById("themeGanadi"), darkRadio = document.getElementById("themeDark");
  if (!defaultRadio || !redHorseRadio) return void setTimeout(initThemeSelector, 1e3);
  const savedTheme = getCurrentTheme();
  defaultRadio.checked = "default" === savedTheme, redHorseRadio.checked = "red-horse" === savedTheme, 
  christmasRadio && (christmasRadio.checked = "christmas" === savedTheme), ganadiRadio && (ganadiRadio.checked = "ganadi" === savedTheme), 
  darkRadio && (darkRadio.checked = "dark" === savedTheme), applyTheme(savedTheme);
  document.querySelectorAll('input[name="theme"]').forEach(radio => {
    const newRadio = radio.cloneNode(!0);
    radio.parentNode.replaceChild(newRadio, radio);
  }), document.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.addEventListener("change", function(e) {
      const selectedTheme = e.target.value;
      saveTheme(selectedTheme), applyTheme(selectedTheme), "ganadi" === selectedTheme ? setTimeout(() => {
        incrementGanadiClick();
      }, 100) : resetGanadiClickCount();
      const messages = {
        "red-horse": "🐴 붉은 말이 안내하는 새해 테마가 적용되었습니다!",
        christmas: "🎄 메리 크리스마스! 눈 내리는 테마가 적용되었습니다!",
        ganadi: "🐶 가나디 테마가 적용되었습니다! 듀...",
        dark: "🌙 다크 테마가 적용되었습니다!",
        default: "📰 기본 테마로 돌아왔습니다!"
      };
      "function" == typeof showToastNotification && showToastNotification("테마 변경", messages[selectedTheme] || messages.default), 
      "red-horse" === selectedTheme ? localStorage.removeItem("horseGreetingDismissed") : "ganadi" === selectedTheme && localStorage.removeItem("ganadiGreetingDismissed");
    });
  });
}

let resizeTimeout;

async function isMaintenanceAdmin() {
  return await isAdminAsync();
}

async function checkMaintenanceMode() {
  try {
    const data = (await db.ref("maintenanceMode").once("value")).val();
    if (!data || !data.enabled) return void hideMaintenanceScreen();
    if (await isMaintenanceAdmin()) return hideMaintenanceScreen(), void showAdminMaintenanceBadge();
    showMaintenanceScreen(data);
  } catch (error) {
    hideMaintenanceScreen();
  }
}

function showMaintenanceScreen(data) {
  const screen = document.getElementById("maintenanceScreen");
  if (!screen) return;
  const titleEl = document.getElementById("maintenanceTitle"), contentEl = document.getElementById("maintenanceContent"), imageContainer = document.getElementById("maintenanceImageContainer");
  titleEl && (titleEl.textContent = data.title || "🔧 점검 중입니다"), contentEl && (contentEl.textContent = data.content || "시스템 점검 중입니다.\n잠시 후 다시 이용해주세요."), 
  imageContainer && (data.image ? imageContainer.innerHTML = `<img src="${data.image}" style="max-width:100%; height:auto; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">` : imageContainer.innerHTML = ""), 
  screen.style.display = "block";
}

function hideMaintenanceScreen() {
  const screen = document.getElementById("maintenanceScreen");
  screen && (screen.style.display = "none"), removeAdminMaintenanceBadge();
}

function showAdminMaintenanceBadge() {
  if (document.getElementById("adminMaintenanceBadge")) return;
  const badge = document.createElement("div");
  badge.id = "adminMaintenanceBadge", badge.style.cssText = "\n        position: fixed;\n        top: 70px;\n        right: 20px;\n        background: linear-gradient(135deg, #FF6F00, #c62828);\n        color: white;\n        padding: 8px 16px;\n        border-radius: 20px;\n        font-size: 12px;\n        font-weight: 700;\n        z-index: 9999;\n        box-shadow: 0 4px 12px rgba(198, 40, 40, 0.3);\n        animation: pulse 2s infinite;\n    ", 
  badge.innerHTML = "🔧 점검모드 ON", document.body.appendChild(badge);
}

function removeAdminMaintenanceBadge() {
  const badge = document.getElementById("adminMaintenanceBadge");
  badge && badge.remove();
}

async function showErrorLogs() {
  if (!isAdmin()) return alert("🚫 관리자 권한이 필요합니다."), void showArticles();
  document.querySelectorAll(".page-section").forEach(s => s.classList.remove("active"));
  let section = document.getElementById("errorLogsSection");
  section || (section = document.createElement("div"), section.id = "errorLogsSection", 
  section.className = "page-section", document.querySelector("main")?.appendChild(section)), 
  section.classList.add("active"), section.innerHTML = '\n        <div style="max-width:1100px;margin:0 auto;padding:20px;">\n            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:gap;">\n                <h2 style="margin:0;font-size:22px;font-weight:700;">🛠️ 오류 로그</h2>\n                <div style="display:flex;gap:8px;flex-wrap:wrap;">\n                    <select id="errFilterDevice" onchange="renderErrorLogs()" style="padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px;">\n                        <option value="">전체 디바이스</option>\n                        <option value="PC">PC</option>\n                        <option value="모바일">모바일</option>\n                        <option value="태블릿">태블릿</option>\n                    </select>\n                   <select id="errFilterLevel" onchange="renderErrorLogs()" style="padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px;">\n                        <option value="">오류+경고</option>\n                        <option value="error">🔴 오류만</option>\n                        <option value="warn">🟡 경고만</option>\n                    </select>\n                    <select id="errFilterType" onchange="renderErrorLogs()" style="padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px;">\n                        <option value="">전체 타입</option>\n                        <option value="uncaught">uncaught</option>\n                        <option value="unhandledrejection">promise</option>\n                        <option value="runtime">runtime</option>\n                        <option value="console.warn">console.warn</option>\n                    </select>\n                    <input id="errFilterUser" oninput="renderErrorLogs()" placeholder="이메일/메시지 검색" style="padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:180px;">\n                    <button onclick="clearErrorLogs()" style="padding:6px 14px;background:#c62828;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;">🗑️ 전체 삭제</button>\n                </div>\n            </div>\n            <div id="errSummary" style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;"></div>\n            <div id="errTableWrap" style="overflow-x:auto;">\n                <div style="text-align:center;padding:40px;color:#999;">⏳ 불러오는 중...</div>\n            </div>\n        </div>';
  try {
    const raw = (await db.ref("errorLogs").orderByChild("timestamp").once("value")).val() || {};
    window._errorLogsData = Object.entries(raw).map(([id, v]) => ({
      id: id,
      ...v
    })).sort((a, b) => b.timestamp - a.timestamp), renderErrorLogs();
  } catch (e) {
    document.getElementById("errTableWrap").innerHTML = `<p style="color:red;">오류 로드 실패: ${e.message}</p>`;
  }
}

function renderErrorLogs() {
  const data = window._errorLogsData || [], filterDevice = document.getElementById("errFilterDevice")?.value || "", filterType = document.getElementById("errFilterType")?.value || "", filterLevel = document.getElementById("errFilterLevel")?.value || "", filterUser = (document.getElementById("errFilterUser")?.value || "").toLowerCase(), filtered = data.filter(e => (!filterDevice || e.device === filterDevice) && (!filterType || e.type === filterType) && (!filterLevel || (e.level || "error") === filterLevel) && (!filterUser || (e.email || "").toLowerCase().includes(filterUser) || (e.message || "").toLowerCase().includes(filterUser))), summary = document.getElementById("errSummary");
  if (summary) {
    const total = filtered.length, errors = filtered.filter(e => "error" === (e.level || "error")).length, warns = filtered.filter(e => "warn" === e.level).length, today = filtered.filter(e => e.timestamp > Date.now() - 864e5).length, mobile = filtered.filter(e => "모바일" === e.device).length;
    summary.innerHTML = [ [ "전체", total, "#1565c0" ], [ "오류", errors, "#c62828" ], [ "경고", warns, "#e65100" ], [ "오늘", today, "#2e7d32" ], [ "모바일", mobile, "#6a1b9a" ] ].map(([label, count, color]) => `\n            <div style="background:#fff;border:1px solid #eee;border-radius:8px;padding:12px 20px;\n                min-width:72px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.06);">\n                <div style="font-size:22px;font-weight:700;color:${color};">${count}</div>\n                <div style="font-size:12px;color:#666;margin-top:2px;">${label}</div>\n            </div>`).join("");
  }
  const wrap = document.getElementById("errTableWrap");
  if (!wrap) return;
  if (0 === filtered.length) return void (wrap.innerHTML = '<div style="text-align:center;padding:60px;color:#999;">로그가 없습니다.</div>');
  const esc = s => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"), rows = filtered.map(e => {
    const date = new Date(e.timestamp), dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}<br>\n            <span style="color:#adb5bd;">${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}</span>`, isWarn = "warn" === e.level, rowBg = isWarn ? "#fffde7" : "#fff", levelBadge = isWarn ? '<span style="font-size:10px;padding:1px 6px;border-radius:3px;background:#fff3e0;color:#e65100;font-weight:700;margin-right:4px;">WARN</span>' : '<span style="font-size:10px;padding:1px 6px;border-radius:3px;background:#ffebee;color:#c62828;font-weight:700;margin-right:4px;">ERR</span>', typeColor = {
      uncaught: "#c62828",
      unhandledrejection: "#e65100",
      runtime: "#1565c0",
      "console.warn": "#e65100"
    }[e.type] || "#555", deviceIcon = "PC" === e.device ? "🖥️" : "모바일" === e.device ? "📱" : "📟", stackPrev = (e.stack || "").split("\n").filter(l => l.trim())[0] || "-";
    return `\n            <tr style="border-bottom:1px solid #f0f0f0;background:${rowBg};cursor:pointer;"\n                onclick="toggleErrDetail('${e.id}')">\n                <td style="padding:10px 12px;font-size:11px;color:#555;white-space:nowrap;">${dateStr}</td>\n                <td style="padding:10px 12px;font-size:12px;">${levelBadge}<br>\n                    <span style="font-size:11px;padding:2px 6px;border-radius:4px;\n                    background:${typeColor}18;color:${typeColor};font-weight:600;">${e.type || "-"}</span></td>\n                <td style="padding:10px 12px;font-size:12px;">${deviceIcon} ${e.device || "-"}<br>\n                    <span style="font-size:11px;color:#888;">${e.os || "-"}</span></td>\n                <td style="padding:10px 12px;font-size:11px;color:#555;">${e.browser || "-"}<br>\n                    <span style="color:#adb5bd;">${e.networkType || "-"} ${!1 === e.online ? "🔴오프라인" : ""}</span></td>\n                <td style="padding:10px 12px;font-size:12px;color:#333;">${esc(e.email) || "비로그인"}</td>\n                <td style="padding:10px 12px;font-size:12px;max-width:260px;">\n                    <div style="color:${isWarn ? "#e65100" : "#c62828"};font-weight:600;\n                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px;"\n                        title="${esc(e.message)}">${esc(e.message) || "-"}</div>\n                    <div style="font-size:10px;color:#aaa;margin-top:2px;\n                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px;"\n                        title="${esc(stackPrev)}">${esc(stackPrev)}</div>\n                </td>\n                <td style="padding:10px 12px;">\n                    <button onclick="event.stopPropagation();deleteErrorLog('${e.id}')"\n                        style="padding:3px 8px;background:#ffebee;color:#c62828;border:none;\n                        border-radius:4px;cursor:pointer;font-size:11px;">삭제</button>\n                </td>\n            </tr>\n            <tr id="errDetail-${e.id}" style="display:none;background:#f8f9fa;">\n                <td colspan="7" style="padding:16px 20px;">\n                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;font-size:12px;color:#333;margin-bottom:12px;">\n                        <div><strong>📍 페이지</strong><br><span style="color:#1565c0;word-break:break-all;">${esc(e.page) || "-"}</span></div>\n                        <div><strong>🔗 레퍼러</strong><br><span style="color:#555;">${esc(e.referrer) || "-"}</span></div>\n                        <div><strong>🔑 UID</strong><br><code style="font-size:11px;">${esc(e.uid) || "-"}</code></div>\n                        <div><strong>📐 화면 / 뷰포트</strong><br>${esc(e.screenSize) || "-"} / ${esc(e.viewport) || "-"}</div>\n                        <div><strong>🌐 언어</strong><br>${esc(e.language) || "-"}</div>\n                        <div><strong>💾 메모리 사용</strong><br>${null != e.memoryMB ? e.memoryMB + " MB" : "-"}</div>\n                        <div><strong>📶 네트워크</strong><br>${esc(e.networkType) || "-"} · ${!1 === e.online ? '<span style="color:#c62828;">오프라인</span>' : "온라인"}</div>\n                        <div><strong>🕐 타임스탬프</strong><br>${new Date(e.timestamp).toLocaleString("ko-KR")}</div>\n                    </div>\n                    <div style="margin-bottom:8px;font-size:12px;font-weight:700;color:#333;">🖥️ User-Agent</div>\n                    <pre style="margin:0 0 12px;padding:8px 12px;background:#f0f0f0;border-radius:4px;\n                        font-size:10px;overflow-x:auto;white-space:pre-wrap;color:#444;">${esc(e.userAgent) || "-"}</pre>\n                    <div style="margin-bottom:8px;font-size:12px;font-weight:700;color:#333;">📋 스택 트레이스</div>\n                    <pre style="margin:0;padding:12px;background:#1e1e1e;color:#d4d4d4;border-radius:6px;\n                        font-size:11px;overflow-x:auto;white-space:pre-wrap;line-height:1.6;">${esc(e.stack || "-")}</pre>\n                    ${e.context ? `<div style="margin-top:12px;font-size:12px;font-weight:700;color:#333;">🔍 컨텍스트</div>\n                    <pre style="margin:4px 0 0;padding:10px;background:#f5f5f5;border-radius:4px;font-size:11px;overflow-x:auto;">${esc(JSON.stringify(e.context, null, 2))}</pre>` : ""}\n                </td>\n            </tr>`;
  }).join("");
  wrap.innerHTML = `\n        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:10px;\n            overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">\n            <thead>\n                <tr style="background:#f8f9fa;border-bottom:2px solid #eee;">\n                    <th style="padding:10px 12px;text-align:left;font-size:11px;color:#555;white-space:nowrap;">시간</th>\n                    <th style="padding:10px 12px;text-align:left;font-size:11px;color:#555;">레벨 / 타입</th>\n                    <th style="padding:10px 12px;text-align:left;font-size:11px;color:#555;">디바이스 / OS</th>\n                    <th style="padding:10px 12px;text-align:left;font-size:11px;color:#555;">브라우저 / 네트워크</th>\n                    <th style="padding:10px 12px;text-align:left;font-size:11px;color:#555;">계정</th>\n                    <th style="padding:10px 12px;text-align:left;font-size:11px;color:#555;">메시지 / 스택 미리보기</th>\n                    <th style="padding:10px 12px;"></th>\n                </tr>\n            </thead>\n            <tbody>${rows}</tbody>\n        </table>`;
}

function toggleErrDetail(id) {
  const row = document.getElementById(`errDetail-${id}`);
  row && (row.style.display = "none" === row.style.display ? "table-row" : "none");
}

async function deleteErrorLog(id) {
  confirm("이 오류 로그를 삭제할까요?") && (await db.ref(`errorLogs/${id}`).remove(), window._errorLogsData = (window._errorLogsData || []).filter(e => e.id !== id), 
  renderErrorLogs());
}

async function clearErrorLogs() {
  confirm("⚠️ 모든 오류 로그를 삭제할까요?") && (await db.ref("errorLogs").remove(), window._errorLogsData = [], 
  renderErrorLogs());
}

async function showManualNotificationSender() {
  if (!isAdmin()) return void alert("🚫 관리자 권한이 필요합니다.");
  document.getElementById("_manualNotifModal")?.remove();
  const usersData = (await db.ref("users").once("value")).val() || {}, fcmUsers = Object.entries(usersData).filter(([_, u]) => u && u.email && u.fcmTokens && Object.keys(u.fcmTokens).length > 0).map(([uid, u]) => ({
    uid: uid,
    email: u.email
  })), modal = document.createElement("div");
  modal.id = "_manualNotifModal", modal.style.cssText = "\n        position:fixed; top:0; left:0; width:100%; height:100%;\n        background:rgba(0,0,0,0.5); z-index:99999;\n        display:flex; align-items:center; justify-content:center; padding:16px;\n    ", 
  modal.innerHTML = `\n        <div style="background:#fff; border-radius:14px; padding:28px; width:100%; max-width:480px; max-height:90vh; overflow-y:auto; box-shadow:0 8px 32px rgba(0,0,0,0.2);">\n            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">\n                <h3 style="margin:0; font-size:18px; font-weight:700;">📢 수동 알림 전송</h3>\n                <button onclick="document.getElementById('_manualNotifModal').remove()"\n                    style="background:none; border:none; font-size:22px; cursor:pointer; color:#888; line-height:1;">✕</button>\n            </div>\n\n            \x3c!-- 대상 --\x3e\n            <div style="margin-bottom:16px;">\n                <label style="font-size:13px; font-weight:600; color:#333; display:block; margin-bottom:6px;">📌 전송 대상</label>\n                <select id="_notifTarget" onchange="toggleManualNotifUserSelect()" style="width:100%; padding:9px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px;">\n                    <option value="all">전체 유저</option>\n                    <option value="specific">특정 유저 선택</option>\n                </select>\n            </div>\n\n            \x3c!-- 특정 유저 선택 (체크박스) --\x3e\n            <div id="_notifUserSelectWrap" style="display:none; margin-bottom:16px;">\n                <label style="font-size:13px; font-weight:600; color:#333; display:block; margin-bottom:6px;">\n                    👤 유저 선택\n                    <span style="font-weight:400; color:#999;">(FCM 등록 유저만 표시 · 복수 선택 가능)</span>\n                </label>\n                <div style="display:flex; gap:6px; margin-bottom:8px; align-items:center;">\n                    <button type="button" onclick="selectAllNotifUsers(true)"\n                        style="padding:4px 10px; font-size:12px; border:1px solid #c62828; background:#fff; color:#c62828; border-radius:5px; cursor:pointer;">전체 선택</button>\n                    <button type="button" onclick="selectAllNotifUsers(false)"\n                        style="padding:4px 10px; font-size:12px; border:1px solid #ddd; background:#fff; color:#888; border-radius:5px; cursor:pointer;">전체 해제</button>\n                    <span id="_notifSelectedCount" style="font-size:12px; color:#888; margin-left:4px;">0명 선택됨</span>\n                </div>\n                <div id="_notifUserCheckList"\n                    style="max-height:200px; overflow-y:auto; border:1px solid #ddd; border-radius:8px; padding:8px; background:#fafafa; display:flex; flex-direction:column; gap:2px;">\n                    ${0 === fcmUsers.length ? '<p style="color:#999; font-size:13px; text-align:center; margin:10px 0;">FCM 토큰이 등록된 유저가 없습니다.</p>' : fcmUsers.map(u => `\n                            <label style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:6px; cursor:pointer; font-size:13px; background:transparent; transition:background 0.15s;"\n                                onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='transparent'">\n                                <input type="checkbox" value="${u.uid}" onchange="updateNotifSelectedCount()"\n                                    style="width:15px; height:15px; accent-color:#c62828; cursor:pointer; flex-shrink:0;">\n                                <span style="color:#333;">${u.email}</span>\n                            </label>`).join("")}\n                </div>\n            </div>\n\n            \x3c!-- 제목 --\x3e\n            <div style="margin-bottom:16px;">\n                <label style="font-size:13px; font-weight:600; color:#333; display:block; margin-bottom:6px;">📋 제목</label>\n                <input id="_notifTitle" type="text" placeholder="알림 제목을 입력하세요"\n                    style="width:100%; padding:9px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; box-sizing:border-box;">\n            </div>\n\n            \x3c!-- 내용 --\x3e\n            <div style="margin-bottom:16px;">\n                <label style="font-size:13px; font-weight:600; color:#333; display:block; margin-bottom:6px;">💬 내용</label>\n                <textarea id="_notifBody" placeholder="알림 내용을 입력하세요" rows="3"\n                    style="width:100%; padding:9px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; resize:vertical; box-sizing:border-box;"></textarea>\n            </div>\n\n            \x3c!-- 기사 ID (선택) --\x3e\n            <div style="margin-bottom:20px;">\n                <label style="font-size:13px; font-weight:600; color:#333; display:block; margin-bottom:6px;">\n                    🔗 기사 ID\n                    <span style="font-weight:400; color:#999;">(선택 · 클릭 시 해당 기사로 이동)</span>\n                </label>\n                <input id="_notifArticleId" type="text" placeholder="기사 ID (없으면 홈으로 이동)"\n                    style="width:100%; padding:9px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; box-sizing:border-box;">\n            </div>\n\n            <div id="_notifResult" style="margin-bottom:12px; font-size:13px; min-height:20px;"></div>\n\n            <button onclick="sendManualNotification()"\n                style="width:100%; padding:12px; background:#c62828; color:#fff; border:none; border-radius:8px; font-size:15px; font-weight:700; cursor:pointer;">\n                📢 알림 전송\n            </button>\n        </div>\n    `, 
  document.body.appendChild(modal), modal.addEventListener("click", e => {
    e.target === modal && modal.remove();
  });
}

function toggleManualNotifUserSelect() {
  const target = document.getElementById("_notifTarget")?.value, wrap = document.getElementById("_notifUserSelectWrap");
  wrap && (wrap.style.display = "specific" === target ? "block" : "none"), updateNotifSelectedCount();
}

function selectAllNotifUsers(selectAll) {
  document.querySelectorAll('#_notifUserCheckList input[type="checkbox"]').forEach(cb => cb.checked = selectAll), 
  updateNotifSelectedCount();
}

function updateNotifSelectedCount() {
  const count = document.querySelectorAll('#_notifUserCheckList input[type="checkbox"]:checked').length, el = document.getElementById("_notifSelectedCount");
  el && (el.textContent = `${count}명 선택됨`);
}

async function sendManualNotification() {
  const target = document.getElementById("_notifTarget")?.value, title = document.getElementById("_notifTitle")?.value.trim(), body = document.getElementById("_notifBody")?.value.trim(), articleId = document.getElementById("_notifArticleId")?.value.trim(), resultEl = document.getElementById("_notifResult");
  if (title) if (body) {
    resultEl.innerHTML = '<span style="color:#888;">⏳ 전송 중...</span>';
    try {
      let targetUids = [];
      if ("all" === target) {
        const usersData = (await db.ref("users").once("value")).val() || {};
        targetUids = Object.keys(usersData).filter(uid => usersData[uid]);
      } else {
        const checkboxes = document.querySelectorAll('#_notifUserCheckList input[type="checkbox"]:checked');
        if (targetUids = Array.from(checkboxes).map(cb => cb.value), 0 === targetUids.length) return void (resultEl.innerHTML = '<span style="color:#c62828;">⚠️ 유저를 1명 이상 선택해주세요.</span>');
      }
      const timestamp = Date.now(), updates = {};
      targetUids.forEach(uid => {
        const notifId = `notif_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
        updates[`notifications/${uid}/${notifId}`] = {
          type: "admin",
          title: title,
          text: body,
          articleId: articleId || "",
          timestamp: timestamp,
          read: !1,
          pushed: !1
        };
      }), await db.ref().update(updates);
      const triggered = await triggerGithubNotification(!1);
      resultEl.innerHTML = `<span style="color:#2e7d32;">✅ ${targetUids.length}명에게 알림 전송 완료! ${triggered ? "(즉시 FCM 푸시 요청됨)" : "(5분 내 FCM 푸시 예정)"}</span>`;
    } catch (error) {
      resultEl.innerHTML = `<span style="color:#c62828;">❌ 전송 실패: ${error.message}</span>`, 
      logErrorToFirebase({
        message: error.message,
        stack: error.stack,
        type: "manual-notification"
      });
    }
  } else resultEl.innerHTML = '<span style="color:#c62828;">⚠️ 내용을 입력해주세요.</span>'; else resultEl.innerHTML = '<span style="color:#c62828;">⚠️ 제목을 입력해주세요.</span>';
}

async function triggerGithubNotification(silent = !1) {
  try {
    const lastTrigger = parseInt(localStorage.getItem("lastGithubTrigger") || "0");
    if (Date.now() - lastTrigger < 6e4) return !1;
    const config = (await db.ref("siteSettings/githubDispatch").once("value")).val();
    if (!config?.owner || !config?.repo || !config?.token) return !1;
    return 204 === (await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        event_type: "send-notification"
      })
    })).status && (localStorage.setItem("lastGithubTrigger", Date.now().toString()), 
    !0);
  } catch (error) {
    return !1;
  }
}

function compressImageToBase64(file, maxPx = 800, quality = .72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onload = e => {
      const img = new Image;
      img.onload = () => {
        let w = img.width, h = img.height;
        (w > maxPx || h > maxPx) && (w > h ? (h = Math.round(h * maxPx / w), w = maxPx) : (w = Math.round(w * maxPx / h), 
        h = maxPx));
        const canvas = document.createElement("canvas");
        canvas.width = w, canvas.height = h, canvas.getContext("2d").drawImage(img, 0, 0, w, h), 
        resolve(canvas.toDataURL("image/jpeg", quality));
      }, img.onerror = reject, img.src = e.target.result;
    }, reader.onerror = reject, reader.readAsDataURL(file);
  });
}

async function loadAdminMemos() {
  const listEl = document.getElementById("adminMemoList");
  if (listEl) try {
    const snap = await db.ref("adminMemos").orderByChild("createdAt").once("value"), memos = [];
    if (snap.forEach(child => memos.push({
      id: child.key,
      ...child.val()
    })), memos.reverse(), 0 === memos.length) return void (listEl.innerHTML = '<div style="text-align:center; padding:40px; color:#adb5bd;"><i class="fas fa-sticky-note" style="font-size:32px;"></i><p style="margin-top:10px;">메모가 없습니다. 새 메모를 추가해보세요!</p></div>');
    listEl.innerHTML = memos.map(m => `\n            <div id="memoCard-${m.id}" style="background:#fffde7; border:1px solid #ffe082; border-radius:10px; padding:14px;">\n                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">\n                    <div style="flex:1;">\n                        <div style="font-size:13px; font-weight:700; color:#5d4037; margin-bottom:6px;">${escapeHTML(m.title || "제목 없음")}</div>\n                        <div style="font-size:13px; color:#6d4c41; white-space:pre-wrap; line-height:1.6;">${escapeHTML(m.content || "")}</div>\n                        <div style="font-size:11px; color:#bcaaa4; margin-top:8px;">📅 ${new Date(m.createdAt).toLocaleString("ko-KR")}</div>\n                    </div>\n                    <div style="display:flex; flex-direction:column; gap:6px; flex-shrink:0;">\n                        <button onclick="editAdminMemo('${m.id}', \`${m.title ? m.title.replace(/`/g, "\\`") : ""}\`, \`${m.content ? m.content.replace(/`/g, "\\`") : ""}\`)"\n                            style="background:#ffa000; color:white; border:none; padding:5px 10px; border-radius:6px; font-size:11px; cursor:pointer; font-weight:700;">\n                            <i class="fas fa-edit"></i>\n                        </button>\n                        <button onclick="deleteAdminMemo('${m.id}')"\n                            style="background:#dc3545; color:white; border:none; padding:5px 10px; border-radius:6px; font-size:11px; cursor:pointer; font-weight:700;">\n                            <i class="fas fa-trash"></i>\n                        </button>\n                    </div>\n                </div>\n            </div>\n        `).join("");
  } catch (e) {
    listEl && (listEl.innerHTML = '<p style="color:#dc3545; text-align:center;">불러오기 실패</p>');
  }
}

function toggleSettingsAccordion(id) {
  const panel = document.getElementById(id), btn = document.getElementById(id + "Btn");
  if (!panel) return;
  const isOpen = "none" !== panel.style.display;
  panel.style.display = isOpen ? "none" : "block", btn && (btn.textContent = isOpen ? "더보기 ▾" : "접기 ▴");
}

style.textContent = "\n    /* 눈물 떨어지는 애니메이션 */\n    @keyframes tearFall {\n        0% {\n            transform: translateY(0) rotate(0deg);\n            opacity: 0.7;\n        }\n        100% {\n            transform: translateY(100vh) rotate(360deg);\n            opacity: 0;\n        }\n    }\n    \n    /* 🎪 가나디 빙빙 돌면서 커졌다 작아졌다 */\n    @keyframes ganadiSpinScale {\n        0% {\n            transform: rotate(0deg) scale(1);\n        }\n        25% {\n            transform: rotate(90deg) scale(1.3);\n        }\n        50% {\n            transform: rotate(180deg) scale(0.8);\n        }\n        75% {\n            transform: rotate(270deg) scale(1.3);\n        }\n        100% {\n            transform: rotate(360deg) scale(1);\n        }\n    }\n    \n    /* 가나디 사라지는 애니메이션 */\n    @keyframes ganadiDisappear {\n        0% {\n            opacity: 0.8;\n            transform: scale(1) rotate(0deg);\n        }\n        100% {\n            opacity: 0;\n            transform: scale(0) rotate(720deg);\n        }\n    }\n    \n    /* 부드러운 바운스 (예비용) */\n    @keyframes gentle-bounce {\n        0%, 100% { \n            transform: translateY(0) rotate(0deg); \n        }\n        50% { \n            transform: translateY(-15px) rotate(5deg); \n        }\n    }\n", 
document.head.appendChild(style), window.closeGanadiEasterEgg = function() {
  const alert = document.getElementById("ganadiEasterEggAlert");
  alert && (alert.style.animation = "easterEggPop 0.3s reverse", setTimeout(() => alert.remove(), 300));
}, window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout), resizeTimeout = setTimeout(() => {
    if ("christmas" === getCurrentTheme()) {
      const container = document.getElementById("snowfall-container");
      container && container.children.length > 0 && initSnowfall();
    }
  }, 500);
}), applyInitialTheme(), "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initThemeSelector, 100), "christmas" === getCurrentTheme() && setTimeout(() => initSnowfall(), 200);
}) : (setTimeout(initThemeSelector, 100), "christmas" === getCurrentTheme() && setTimeout(() => initSnowfall(), 200)), 
window.showMaintenanceModeManager = async function() {
  if (isAdmin()) {
    showLoadingIndicator("점검모드 설정 로드 중...");
    try {
      const data = (await db.ref("maintenanceMode").once("value")).val() || {};
      hideLoadingIndicator();
      const modal = document.getElementById("maintenanceModeModal");
      if (!modal) return;
      const toggleEl = document.getElementById("maintenanceToggle"), titleEl = document.getElementById("maintenanceTitle"), contentEl = document.getElementById("maintenanceContent"), previewEl = document.getElementById("maintenanceImagePreview"), uploadTextEl = document.getElementById("maintenanceImageUploadText");
      toggleEl && (toggleEl.checked = data.enabled || !1), titleEl && (titleEl.value = data.title || ""), 
      contentEl && (contentEl.value = data.content || ""), previewEl && uploadTextEl && (data.image ? (previewEl.src = data.image, 
      previewEl.style.display = "block", uploadTextEl.innerHTML = '<i class="fas fa-check"></i><p>기존 이미지</p>') : (previewEl.style.display = "none", 
      uploadTextEl.innerHTML = '<i class="fas fa-image"></i><p>클릭하여 이미지 업로드</p>')), modal.classList.add("active");
      const imageInput = document.getElementById("maintenanceImageInput");
      if (imageInput) {
        const newInput = imageInput.cloneNode(!0);
        imageInput.parentNode.replaceChild(newInput, imageInput), newInput.addEventListener("change", function(e) {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader;
            reader.onload = function(event) {
              previewEl && uploadTextEl && (previewEl.src = event.target.result, previewEl.style.display = "block", 
              uploadTextEl.innerHTML = '<i class="fas fa-check"></i><p>이미지 선택됨</p>');
            }, reader.readAsDataURL(file);
          }
        });
      }
    } catch (error) {
      hideLoadingIndicator(), alert("설정을 불러오는데 실패했습니다: " + error.message);
    }
  } else alert("🚫 관리자 권한이 필요합니다!");
}, window.closeMaintenanceModeModal = function() {
  const modal = document.getElementById("maintenanceModeModal");
  modal && modal.classList.remove("active");
}, window.saveMaintenanceMode = async function() {
  if (!isAdmin()) return void alert("🚫 관리자 권한이 필요합니다!");
  const enabled = document.getElementById("maintenanceToggle")?.checked || !1, title = document.getElementById("maintenanceTitle")?.value.trim() || "🔧 점검 중입니다", content = document.getElementById("maintenanceContent")?.value.trim() || "시스템 점검 중입니다.\n잠시 후 다시 이용해주세요.", imageInput = document.getElementById("maintenanceImageInput"), previewEl = document.getElementById("maintenanceImagePreview");
  showLoadingIndicator("점검모드 설정 저장 중...");
  try {
    const data = {
      enabled: enabled,
      title: title,
      content: content,
      image: "",
      updatedAt: Date.now()
    };
    if (imageInput && imageInput.files && imageInput.files[0]) {
      const reader = new FileReader, imageData = await new Promise((resolve, reject) => {
        reader.onload = e => resolve(e.target.result), reader.onerror = reject, reader.readAsDataURL(imageInput.files[0]);
      });
      data.image = imageData;
    } else previewEl && previewEl.src && !previewEl.src.includes("data:,") && (data.image = previewEl.src);
    await db.ref("maintenanceMode").set(data), hideLoadingIndicator(), closeMaintenanceModeModal(), 
    alert(`✅ 점검모드가 ${enabled ? "활성화" : "비활성화"}되었습니다!`), checkMaintenanceMode();
  } catch (error) {
    hideLoadingIndicator(), alert("저장 중 오류가 발생했습니다: " + error.message);
  }
}, auth.onAuthStateChanged(async user => {
  setTimeout(async () => {
    await checkMaintenanceMode();
  }, 800);
}), window.addEventListener("load", () => {
  setTimeout(() => {
    checkMaintenanceMode();
  }, 1e3);
}), db.ref("maintenanceMode").on("value", async snapshot => {
  const data = snapshot.val(), adminStatus = await isAdminAsync();
  data && data.enabled && !adminStatus ? showMaintenanceScreen(data) : (hideMaintenanceScreen(), 
  adminStatus && data && data.enabled && showAdminMaintenanceBadge());
}), function() {
  "use strict";
  const logs = [];
  let isConsoleOpen = !1, filterType = "all", searchKeyword = "";
  const _orig = {
    log: function() {}.bind(),
    warn: function() {}.bind(),
    error: function() {}.bind(),
    info: function() {}.bind()
  };
  function capture(type, args) {
    const text = args.map(a => {
      if (null === a) return "null";
      if (void 0 === a) return "undefined";
      if ("object" == typeof a) try {
        return JSON.stringify(a, null, 2);
      } catch {
        return String(a);
      }
      return String(a);
    }).join(" ");
    logs.push({
      type: type,
      text: text,
      time: (new Date).toLocaleTimeString("ko-KR")
    }), logs.length > 300 && logs.shift(), isConsoleOpen && renderLogs(), "error" === type && function() {
      errorCount++;
      const badge = document.getElementById("_mcBadge");
      badge && (badge.textContent = errorCount > 99 ? "99+" : errorCount, badge.style.display = "flex");
    }();
  }
  console.log = (...a) => {
    _orig.log(...a), capture("log", a);
  }, console.warn = (...a) => {
    _orig.warn(...a), capture("warn", a);
  }, console.error = (...a) => {
    _orig.error(...a), capture("error", a);
  }, console.info = (...a) => {
    _orig.info(...a), capture("info", a);
  }, window.addEventListener("error", e => {
    capture("error", [ `[Uncaught] ${e.message}`, `${e.filename}:${e.lineno}` ]);
  }), window.addEventListener("unhandledrejection", e => {
    capture("error", [ `[Promise] ${e.reason}` ]);
  });
  let errorCount = 0;
  const TYPE_STYLE = {
    log: {
      color: "#e2e8f0",
      bg: "transparent",
      icon: "›",
      label: "LOG"
    },
    info: {
      color: "#63b3ed",
      bg: "rgba(99,179,237,0.08)",
      icon: "ℹ",
      label: "INF"
    },
    warn: {
      color: "#f6ad55",
      bg: "rgba(246,173,85,0.08)",
      icon: "⚠",
      label: "WRN"
    },
    error: {
      color: "#fc8181",
      bg: "rgba(252,129,129,0.10)",
      icon: "✕",
      label: "ERR"
    }
  };
  function renderLogs() {
    const container = document.getElementById("_mcLogs");
    if (!container) return;
    const filtered = logs.filter(l => ("all" === filterType || l.type === filterType) && !(searchKeyword && !l.text.toLowerCase().includes(searchKeyword)));
    0 !== filtered.length ? (container.innerHTML = filtered.map((l, i) => {
      const s = TYPE_STYLE[l.type] || TYPE_STYLE.log, escaped = l.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<div style="\n                display:flex;gap:8px;align-items:flex-start;\n                padding:6px 10px;border-bottom:1px solid rgba(255,255,255,0.04);\n                background:${s.bg};animation:_mcFadeIn 0.15s ease;\n            ">\n                <span style="color:${s.color};font-size:11px;font-weight:700;\n                    flex-shrink:0;margin-top:1px;font-family:monospace;">${s.label}</span>\n                <span style="color:#718096;font-size:10px;flex-shrink:0;margin-top:2px;\n                    font-family:monospace;">${l.time}</span>\n                <pre style="color:${s.color};font-size:11px;font-family:monospace;\n                    margin:0;white-space:pre-wrap;word-break:break-all;flex:1;\n                    line-height:1.5;">${escaped}</pre>\n            </div>`;
    }).join(""), container.scrollTop = container.scrollHeight) : container.innerHTML = '<div style="color:#4a5568;text-align:center;padding:40px 0;font-size:13px;">로그 없음</div>';
  }
  function injectConsoleUI() {
    if (document.getElementById("_mcFab")) return;
    const css = document.createElement("style");
    css.textContent = "\n            @keyframes _mcFadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }\n            @keyframes _mcSlideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }\n            #_mcPanel {\n                animation: _mcSlideUp 0.25s cubic-bezier(.16,1,.3,1);\n                font-family: 'SF Mono', 'Fira Code', monospace;\n            }\n            #_mcFab { transition: transform 0.2s, box-shadow 0.2s; }\n            #_mcFab:active { transform: scale(0.92) !important; }\n            ._mcFilterBtn { transition: all 0.15s; }\n            ._mcFilterBtn:hover { opacity:1 !important; }\n            #_mcSearch {\n                background: rgba(255,255,255,0.06);\n                border: 1px solid rgba(255,255,255,0.12);\n                border-radius: 6px;\n                color: #e2e8f0;\n                font-size: 12px;\n                padding: 5px 10px;\n                outline: none;\n                width: 100%;\n                box-sizing: border-box;\n                font-family: monospace;\n            }\n            #_mcSearch::placeholder { color: #4a5568; }\n            #_mcSearch:focus { border-color: rgba(255,255,255,0.3); }\n        ", 
    document.head.appendChild(css);
    const fab = document.createElement("div");
    fab.id = "_mcFab", fab.style.cssText = "\n            position:fixed;bottom:80px;right:16px;z-index:99990;\n            width:46px;height:46px;border-radius:14px;\n            background:linear-gradient(135deg,#1a202c,#2d3748);\n            box-shadow:0 4px 16px rgba(0,0,0,0.5);\n            display:flex;align-items:center;justify-content:center;\n            cursor:pointer;user-select:none;\n        ", 
    fab.innerHTML = '\n            <span style="font-size:18px;line-height:1;">⌨️</span>\n            <div id="_mcBadge" style="\n                display:none;position:absolute;top:-4px;right:-4px;\n                background:#fc8181;color:white;font-size:9px;font-weight:700;\n                border-radius:8px;padding:2px 5px;min-width:16px;\n                text-align:center;font-family:monospace;\n                border:2px solid #0d0d0d;\n            "></div>\n        ', 
    fab.addEventListener("click", toggleConsole), document.body.appendChild(fab);
    const panel = document.createElement("div");
    panel.id = "_mcPanel", panel.style.cssText = "\n            display:none;position:fixed;bottom:0;left:0;right:0;z-index:99991;\n            height:65vh;background:#0d1117;\n            border-top:1px solid rgba(255,255,255,0.1);\n            border-radius:20px 20px 0 0;\n            box-shadow:0 -8px 40px rgba(0,0,0,0.6);\n            flex-direction:column;overflow:hidden;\n        ", 
    panel.innerHTML = `\n            \x3c!-- 드래그 핸들 --\x3e\n            <div style="text-align:center;padding:10px 0 6px;cursor:grab;" id="_mcHandle">\n                <div style="width:36px;height:4px;border-radius:2px;\n                    background:rgba(255,255,255,0.2);display:inline-block;"></div>\n            </div>\n\n            \x3c!-- 헤더 --\x3e\n            <div style="display:flex;align-items:center;gap:10px;\n                padding:0 14px 8px;border-bottom:1px solid rgba(255,255,255,0.07);">\n                <span style="color:#e2e8f0;font-size:13px;font-weight:700;letter-spacing:1px;">\n                    🛡️ ADMIN CONSOLE\n                </span>\n                <span id="_mcCount" style="color:#4a5568;font-size:11px;margin-left:auto;"></span>\n                <button onclick="window._mcClear()" style="\n                    background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);\n                    color:#718096;font-size:11px;border-radius:6px;padding:4px 10px;\n                    cursor:pointer;font-family:monospace;">CLR</button>\n                <button onclick="window._mcCopy()" style="\n                    background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);\n                    color:#718096;font-size:11px;border-radius:6px;padding:4px 10px;\n                    cursor:pointer;font-family:monospace;">CPY</button>\n                <button onclick="window._mcClose()" style="\n                    background:rgba(252,129,129,0.15);border:1px solid rgba(252,129,129,0.2);\n                    color:#fc8181;font-size:13px;border-radius:6px;padding:4px 10px;\n                    cursor:pointer;font-family:monospace;">✕</button>\n            </div>\n\n            \x3c!-- 검색 + 필터 --\x3e\n            <div style="padding:8px 14px;border-bottom:1px solid rgba(255,255,255,0.05);\n                display:flex;flex-direction:column;gap:6px;">\n                <input id="_mcSearch" placeholder="🔍 로그 검색..." autocomplete="off"\n                    oninput="window._mcFilter(this.value)">\n                <div style="display:flex;gap:6px;">\n                    ${[ "all", "log", "info", "warn", "error" ].map(t => `\n                        <button class="_mcFilterBtn" data-type="${t}" onclick="window._mcSetFilter('${t}')"\n                            style="flex:1;background:rgba(255,255,255,0.05);\n                            border:1px solid rgba(255,255,255,0.1);\n                            color:${"all" === t ? "#e2e8f0" : TYPE_STYLE[t]?.color || "#718096"};\n                            font-size:10px;font-weight:700;letter-spacing:0.5px;\n                            border-radius:6px;padding:4px 0;cursor:pointer;\n                            font-family:monospace;text-transform:uppercase;">\n                            ${"all" === t ? "ALL" : t}\n                        </button>\n                    `).join("")}\n                </div>\n            </div>\n\n            \x3c!-- 로그 목록 --\x3e\n            <div id="_mcLogs" style="flex:1;overflow-y:auto;overscroll-behavior:contain;"></div>\n        `, 
    document.body.appendChild(panel), renderLogs();
  }
  function toggleConsole() {
    isConsoleOpen = !isConsoleOpen;
    const panel = document.getElementById("_mcPanel");
    document.getElementById("_mcFab");
    if (panel) {
      if (isConsoleOpen) {
        panel.style.display = "flex", errorCount = 0;
        const badge = document.getElementById("_mcBadge");
        badge && (badge.style.display = "none");
      } else panel.style.display = "none";
      renderLogs(), updateCount();
    }
  }
  function updateCount() {
    const el = document.getElementById("_mcCount");
    el && (el.textContent = `${logs.length}/300`);
  }
  function tryInject() {
    "function" == typeof isAdmin && isAdmin() ? injectConsoleUI() : "function" == typeof isAdminAsync && isAdminAsync().then(ok => {
      ok && injectConsoleUI();
    });
  }
  window._mcClose = () => {
    isConsoleOpen = !1;
    const p = document.getElementById("_mcPanel");
    p && (p.style.display = "none");
  }, window._mcClear = () => {
    logs.length = 0, renderLogs(), updateCount();
  }, window._mcCopy = () => {
    const text = logs.map(l => `[${l.time}][${l.type.toUpperCase()}] ${l.text}`).join("\n");
    navigator.clipboard.writeText(text).then(() => alert("✅ 로그 복사 완료!")).catch(() => prompt("로그:", text));
  }, window._mcFilter = kw => {
    searchKeyword = kw.toLowerCase(), renderLogs();
  }, window._mcSetFilter = type => {
    filterType = type, document.querySelectorAll("._mcFilterBtn").forEach(btn => {
      const isActive = btn.dataset.type === type;
      btn.style.background = isActive ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)", 
      btn.style.borderColor = isActive ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.1)", 
      btn.style.opacity = isActive ? "1" : "0.6";
    }), renderLogs();
  }, void 0 !== auth && auth.onAuthStateChanged ? auth.onAuthStateChanged(user => {
    if (user) setTimeout(tryInject, 1e3); else {
      const fab = document.getElementById("_mcFab"), panel = document.getElementById("_mcPanel");
      fab && fab.remove(), panel && panel.remove(), isConsoleOpen = !1;
    }
  }) : window.addEventListener("load", () => setTimeout(tryInject, 2e3));
}(), window.previewCommentImage = function(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader;
  reader.onload = e => {
    const preview = document.getElementById("commentImagePreview"), img = document.getElementById("commentImagePreviewImg");
    preview && img && (img.src = e.target.result, preview.style.display = "block");
  }, reader.readAsDataURL(input.files[0]);
}, window.clearCommentImage = function() {
  const preview = document.getElementById("commentImagePreview"), input = document.getElementById("commentImageInput");
  preview && (preview.style.display = "none"), input && (input.value = "");
}, window.previewReplyImage = function(input, commentId) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader;
  reader.onload = e => {
    const preview = document.getElementById(`replyImagePreview-${commentId}`), img = document.getElementById(`replyImagePreviewImg-${commentId}`);
    preview && img && (img.src = e.target.result, preview.style.display = "block");
  }, reader.readAsDataURL(input.files[0]);
}, window.clearReplyImage = function(commentId) {
  const preview = document.getElementById(`replyImagePreview-${commentId}`), input = document.getElementById(`replyImageInput-${commentId}`);
  preview && (preview.style.display = "none"), input && (input.value = "");
}, window.previewNestedReplyImage = function(input, commentId, replyId) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader;
  reader.onload = e => {
    const preview = document.getElementById(`nestedReplyImagePreview-${commentId}-${replyId}`), img = document.getElementById(`nestedReplyImagePreviewImg-${commentId}-${replyId}`);
    preview && img && (img.src = e.target.result, preview.style.display = "block");
  }, reader.readAsDataURL(input.files[0]);
}, window.clearNestedReplyImage = function(commentId, replyId) {
  const preview = document.getElementById(`nestedReplyImagePreview-${commentId}-${replyId}`), input = document.getElementById(`nestedReplyImageInput-${commentId}-${replyId}`);
  preview && (preview.style.display = "none"), input && (input.value = "");
}, window._bugReportList = [], window.showBugReportPage = function() {
  hideAll(), window.scrollTo(0, 0), window._bugReportList = [];
  const section = document.getElementById("moreMenuSection");
  if (!section) return;
  section.classList.add("active");
  const deviceInfo = `${navigator.platform} / ${navigator.userAgent.match(/(Chrome|Safari|Firefox|Edge|Opera)[\\/\\s][\\d.]+/)?.[0] || "알 수 없음"}`, now = (new Date).toLocaleString("ko-KR");
  section.innerHTML = `\n        <div style="max-width:600px; margin:0 auto; padding:20px;">\n            <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">\n                <button onclick="showMoreMenu()" style="background:none; border:none; font-size:20px; cursor:pointer; color:#495057;">\n                    <i class="fas fa-arrow-left"></i>\n                </button>\n                <h2 style="margin:0; font-size:20px; font-weight:800; color:#00376b;">\n                    <i class="fas fa-bug"></i> 버그 제보\n                </h2>\n            </div>\n\n            <div style="background:#fff3cd; border:1px solid #ffc107; border-radius:10px; padding:12px 16px; margin-bottom:20px; font-size:13px; color:#856404;">\n                <i class="fas fa-info-circle"></i> 버그를 여러 개 추가한 뒤 한 번에 전송할 수 있어요!\n            </div>\n\n            <div style="background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.08); display:flex; flex-direction:column; gap:14px; margin-bottom:16px;">\n                <input type="hidden" id="bugDevice" value="${deviceInfo}">\n                <input type="hidden" id="bugTime" value="${now}">\n\n                <div>\n                    <label style="font-size:13px; font-weight:600; color:#495057; display:block; margin-bottom:6px;">📝 제목 <span style="color:#dc3545;">*</span></label>\n                    <input type="text" id="bugTitle" placeholder="버그를 간단히 설명해주세요" maxlength="100"\n                        style="width:100%; padding:10px 12px; border:1px solid #dee2e6; border-radius:8px; font-size:14px; box-sizing:border-box; outline:none;"\n                        onfocus="this.style.borderColor='#00376b'" onblur="this.style.borderColor='#dee2e6'">\n                </div>\n\n                <div>\n                    <label style="font-size:13px; font-weight:600; color:#495057; display:block; margin-bottom:6px;">📄 상세 내용 <span style="color:#dc3545;">*</span></label>\n                    <textarea id="bugContent" placeholder="버그가 발생한 상황, 재현 방법 등을 자세히 적어주세요" rows="4"\n                        style="width:100%; padding:10px 12px; border:1px solid #dee2e6; border-radius:8px; font-size:14px; resize:vertical; font-family:inherit; box-sizing:border-box; outline:none;"\n                        onfocus="this.style.borderColor='#00376b'" onblur="this.style.borderColor='#dee2e6'"></textarea>\n                </div>\n\n                <div>\n                    <label style="font-size:13px; font-weight:600; color:#495057; display:block; margin-bottom:6px;">📷 스크린샷 (선택)</label>\n                    <div id="bugImagePreviewArea" onclick="document.getElementById('bugImageInput').click()"\n                        style="border:2px dashed #dee2e6; border-radius:8px; padding:16px; text-align:center; cursor:pointer; background:#fafafa; transition:all 0.2s;"\n                        onmouseover="this.style.borderColor='#00376b'" onmouseout="this.style.borderColor='#dee2e6'">\n                        <i class="fas fa-camera" style="font-size:22px; color:#adb5bd;"></i>\n                        <p style="margin:6px 0 0; font-size:13px; color:#adb5bd;">클릭하여 이미지 첨부</p>\n                    </div>\n                    <input type="file" id="bugImageInput" accept="image/*" style="display:none;" onchange="previewBugImage(this)">\n                </div>\n\n                <button onclick="addBugToList()"\n                    style="background:linear-gradient(135deg,#00376b,#005fa3); color:white; border:none; padding:12px; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; width:100%;">\n                    <i class="fas fa-plus-circle"></i> 목록에 추가\n                </button>\n            </div>\n\n            <div id="bugQueueArea" style="display:none; margin-bottom:16px;">\n                <div style="font-size:13px; font-weight:700; color:#495057; margin-bottom:8px;">\n                    📋 제보 목록 <span id="bugQueueCount" style="background:#00376b; color:white; border-radius:10px; padding:1px 8px; font-size:12px;">0</span>\n                </div>\n                <div id="bugQueueList" style="display:flex; flex-direction:column; gap:8px;"></div>\n            </div>\n\n            <button id="bugSubmitAllBtn" onclick="submitBugReport()" style="display:none;\n                background:linear-gradient(135deg,#c62828,#e53935); color:white; border:none; padding:14px;\n                border-radius:10px; font-size:15px; font-weight:700; cursor:pointer; width:100%; margin-bottom:8px;">\n                <i class="fas fa-paper-plane"></i> 전체 전송 (<span id="bugSubmitCount">0</span>건)\n            </button>\n\n            <div id="bugSubmitMsg" style="margin-top:8px; text-align:center;"></div>\n        </div>\n    `, 
  updateURL("bugreport");
}, window.addBugToList = async function() {
  const title = document.getElementById("bugTitle").value.trim(), content = document.getElementById("bugContent").value.trim(), imageInput = document.getElementById("bugImageInput");
  if (!title) return void alert("제목을 입력해주세요.");
  if (!content) return void alert("상세 내용을 입력해주세요.");
  let imageBase64 = null;
  imageInput.files && imageInput.files[0] && (imageBase64 = await compressImageToBase64(imageInput.files[0], 800, .72)), 
  window._bugReportList.push({
    id: Date.now(),
    title: title,
    content: content,
    device: document.getElementById("bugDevice").value,
    time: document.getElementById("bugTime").value,
    imageBase64: imageBase64
  }), document.getElementById("bugTitle").value = "", document.getElementById("bugContent").value = "", 
  imageInput.value = "", document.getElementById("bugImagePreviewArea").innerHTML = '<i class="fas fa-camera" style="font-size:22px; color:#adb5bd;"></i><p style="margin:6px 0 0; font-size:13px; color:#adb5bd;">클릭하여 이미지 첨부</p>', 
  renderBugQueue();
}, window.renderBugQueue = function() {
  const list = window._bugReportList, area = document.getElementById("bugQueueArea"), queueList = document.getElementById("bugQueueList"), submitBtn = document.getElementById("bugSubmitAllBtn");
  if (area && queueList) {
    if (0 === list.length) return area.style.display = "none", void (submitBtn.style.display = "none");
    area.style.display = "block", submitBtn.style.display = "block", document.getElementById("bugQueueCount").textContent = list.length, 
    document.getElementById("bugSubmitCount").textContent = list.length, queueList.innerHTML = list.map((item, idx) => `\n        <div style="background:white; border-radius:10px; padding:12px 14px; box-shadow:0 1px 4px rgba(0,0,0,0.08);\n            display:flex; align-items:flex-start; gap:10px; border-left:3px solid #00376b;">\n            <div style="flex:1; min-width:0;">\n                <div style="font-size:14px; font-weight:700; color:#202124; margin-bottom:2px;">${escapeHTML(item.title)}</div>\n                <div style="font-size:12px; color:#868e96; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHTML(item.content)}</div>\n                ${item.imageBase64 ? '<div style="font-size:11px; color:#00376b; margin-top:3px;"><i class="fas fa-image"></i> 이미지 첨부됨</div>' : ""}\n            </div>\n            <button onclick="removeBugFromList(${idx})"\n                style="background:#fff0f0; border:none; color:#dc3545; border-radius:6px; padding:4px 8px; cursor:pointer; font-size:12px; flex-shrink:0;">\n                <i class="fas fa-times"></i>\n            </button>\n        </div>\n    `).join("");
  }
}, window.removeBugFromList = function(idx) {
  window._bugReportList.splice(idx, 1), renderBugQueue();
}, window.previewBugImage = function(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader;
  reader.onload = e => {
    document.getElementById("bugImagePreviewArea").innerHTML = `\n            <img src="${e.target.result}" style="max-width:100%; max-height:200px; border-radius:8px; object-fit:contain;">\n            <p style="margin:8px 0 0; font-size:12px; color:#868e96;">클릭하여 변경</p>\n        `;
  }, reader.readAsDataURL(input.files[0]);
}, window.submitBugReport = async function() {
  if (!isLoggedIn()) return void alert("로그인 후 이용해주세요.");
  const list = window._bugReportList || [];
  if (0 === list.length) return void alert("제보할 버그를 먼저 추가해주세요.");
  const btn = document.getElementById("bugSubmitAllBtn"), msgEl = document.getElementById("bugSubmitMsg");
  btn && (btn.disabled = !0, btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 전송 중...');
  try {
    const user = auth.currentUser, authorName = getNickname(), authorEmail = getUserEmail(), baseTime = Date.now();
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      await db.ref("bugReports").push({
        title: item.title,
        content: item.content,
        device: item.device,
        time: item.time,
        authorName: authorName,
        authorEmail: authorEmail,
        authorUid: user.uid,
        imageBase64: item.imageBase64 || null,
        status: "pending",
        createdAt: baseTime + i
      });
    }
    window._bugReportList = [], showToastNotification("🐛 버그 제보 완료", `${list.length}건 제보 감사합니다! 빠르게 수정할게요 🙏`), 
    setTimeout(() => showMoreMenu(), 1200);
  } catch (e) {
    msgEl && (msgEl.innerHTML = '<div style="background:#f8d7da; color:#721c24; padding:12px 16px; border-radius:8px; font-size:14px;"><i class="fas fa-exclamation-circle"></i> 전송 실패. 다시 시도해주세요.</div>'), 
    btn && (btn.disabled = !1, btn.innerHTML = `<i class="fas fa-paper-plane"></i> 전체 전송 (${list.length}건)`);
  }
}, window._allBugReports = [], window.showAdminBugReports = async function() {
  if (!isAdmin()) return void alert("관리자만 접근 가능합니다.");
  hideAll(), window.scrollTo(0, 0);
  const section = document.getElementById("moreMenuSection");
  section.classList.add("active"), section.innerHTML = '\n        <div style="max-width:700px; margin:0 auto; padding:20px;">\n            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">\n                <button onclick="showMoreMenu()" style="background:none; border:none; font-size:20px; cursor:pointer; color:#495057;">\n                    <i class="fas fa-arrow-left"></i>\n                </button>\n                <h2 style="margin:0; font-size:20px; font-weight:800; color:#c62828; flex:1;">\n                    <i class="fas fa-bug"></i> 버그 제보 관리\n                </h2>\n                <span id="bugTotalCount" style="font-size:13px; color:#868e96;"></span>\n            </div>\n            <div style="display:flex; gap:8px; margin-bottom:16px;">\n                <input id="bugSearchInput" type="text" placeholder="제목, 내용, 작성자 검색..."\n                    oninput="filterAdminBugs()"\n                    style="flex:1; padding:10px 14px; border:1.5px solid #dee2e6; border-radius:10px; font-size:14px; outline:none; box-sizing:border-box;"\n                    onfocus="this.style.borderColor=\'#c62828\'" onblur="this.style.borderColor=\'#dee2e6\'">\n                <select id="bugStatusFilter" onchange="filterAdminBugs()"\n                    style="padding:10px 12px; border:1.5px solid #dee2e6; border-radius:10px; font-size:14px; outline:none; background:white; cursor:pointer;">\n                    <option value="all">전체</option>\n                    <option value="pending">대기중</option>\n                    <option value="fixed">수정완료</option>\n                </select>\n            </div>\n            <div id="adminBugList" style="display:flex; flex-direction:column; gap:14px;">\n                <div style="text-align:center; padding:40px; color:#adb5bd;">\n                    <i class="fas fa-spinner fa-spin" style="font-size:24px;"></i>\n                    <p>불러오는 중...</p>\n                </div>\n            </div>\n        </div>\n    ';
  try {
    const snap = await db.ref("bugReports").once("value"), reports = [];
    snap.forEach(child => {
      reports.push({
        id: child.key,
        ...child.val()
      });
    }), reports.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)), window._allBugReports = reports;
    const countEl = document.getElementById("bugTotalCount");
    countEl && (countEl.textContent = `총 ${reports.length}건`), renderAdminBugList(reports);
  } catch (e) {
    const listEl = document.getElementById("adminBugList");
    listEl && (listEl.innerHTML = `<p style="color:#dc3545; text-align:center;">불러오기 실패: ${e.message}</p>`);
  }
}, window.filterAdminBugs = function() {
  const kw = (document.getElementById("bugSearchInput")?.value || "").toLowerCase(), status = document.getElementById("bugStatusFilter")?.value || "all", filtered = (window._allBugReports || []).filter(r => {
    const matchStatus = "all" === status || r.status === status || "pending" === status && !r.status, matchKw = !kw || (r.title || "").toLowerCase().includes(kw) || (r.content || "").toLowerCase().includes(kw) || (r.authorName || "").toLowerCase().includes(kw) || (r.authorEmail || "").toLowerCase().includes(kw);
    return matchStatus && matchKw;
  });
  renderAdminBugList(filtered);
}, window.renderAdminBugList = function(reports) {
  const listEl = document.getElementById("adminBugList");
  listEl && (0 !== reports.length ? listEl.innerHTML = reports.map(r => {
    const statusBadge = "fixed" === r.status ? '<span style="background:#d4edda; color:#155724; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:700;"><i class="fas fa-check"></i> 수정완료</span>' : '<span style="background:#fff3cd; color:#856404; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:700;"><i class="fas fa-clock"></i> 대기중</span>', date = new Date(r.createdAt).toLocaleString("ko-KR");
    return `\n            <div id="bugCard-${r.id}" style="background:white; border-radius:12px; padding:18px; box-shadow:0 2px 8px rgba(0,0,0,0.08); border-left:4px solid ${"fixed" === r.status ? "#28a745" : "#ffc107"};">\n                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; gap:8px;">\n                    <div style="flex:1;">\n                        <div style="font-size:15px; font-weight:700; color:#202124; margin-bottom:4px;">${escapeHTML(r.title || "")}</div>\n                        <div style="font-size:12px; color:#868e96;">👤 ${escapeHTML(r.authorName || "알 수 없음")} &nbsp;|&nbsp; 🕐 ${escapeHTML(r.time || "")}</div>\n                    </div>\n                    ${statusBadge}\n                </div>\n                <div style="font-size:13px; color:#495057; white-space:pre-wrap; background:#f8f9fa; border-radius:8px; padding:10px 12px; margin-bottom:10px; line-height:1.6;">${escapeHTML(r.content || "")}</div>\n                <div style="font-size:12px; color:#adb5bd; margin-bottom:10px;">📱 ${escapeHTML(r.device || "")} &nbsp;|&nbsp; 📅 접수: ${date}</div>\n                ${r.imageBase64 ? `<div style="margin-bottom:12px;"><img src="${r.imageBase64}" onclick="openImageModal('${r.imageBase64}')" style="max-width:100%; max-height:200px; border-radius:8px; cursor:pointer; object-fit:contain; border:1px solid #dee2e6;"></div>` : ""}\n                ${"fixed" !== r.status ? `\n                <button onclick="markBugFixed('${r.id}', '${r.authorUid || ""}', '${(r.title || "").replace(/'/g, "\\'")}')"\n                    style="background:linear-gradient(135deg, #28a745, #20c997); color:white; border:none; padding:10px 20px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; width:100%;">\n                    <i class="fas fa-check-circle"></i> 수정 완료 처리 & 유저 알림\n                </button>` : `\n                <div style="display:flex; align-items:center; gap:8px;">\n                    <div style="flex:1; text-align:center; font-size:13px; color:#28a745; font-weight:600; padding:8px;"><i class="fas fa-check-circle"></i> 수정 완료됨</div>\n                    <button onclick="deleteBugReport('${r.id}')"\n                        style="background:#dc3545; color:white; border:none; padding:8px 16px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; white-space:nowrap;">\n                        <i class="fas fa-trash"></i> 삭제\n                    </button>\n                </div>`}\n            </div>`;
  }).join("") : listEl.innerHTML = '<div style="text-align:center; padding:60px 20px; color:#adb5bd;"><i class="fas fa-inbox" style="font-size:40px;"></i><p style="margin-top:12px;">검색 결과가 없습니다</p></div>');
}, window.markBugFixed = async function(reportId, authorUid, reportTitle) {
  if (isAdmin() && confirm(`"${reportTitle}" 버그를 수정 완료 처리하고 해당 유저에게 알림을 보내시겠습니까?`)) try {
    if (await db.ref(`bugReports/${reportId}/status`).set("fixed"), await db.ref(`bugReports/${reportId}/fixedAt`).set(Date.now()), 
    authorUid) {
      const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.ref(`notifications/${authorUid}/${notifId}`).set({
        type: "bugFixed",
        title: "🐛 버그 수정 완료",
        text: `제보하신 버그 "${reportTitle}"가 수정되었습니다! 감사합니다 🙏`,
        timestamp: Date.now(),
        read: !1
      });
    }
    const target = (window._allBugReports || []).find(r => r.id === reportId);
    target && (target.status = "fixed"), filterAdminBugs(), alert("✅ 수정 완료 처리 및 유저 알림 전송 완료!");
  } catch (e) {
    alert("처리 중 오류가 발생했습니다.");
  }
}, window.deleteBugReport = async function(reportId) {
  if (isAdmin() && confirm("이 버그 제보를 삭제하시겠습니까?")) try {
    await db.ref(`bugReports/${reportId}`).remove(), window._allBugReports = (window._allBugReports || []).filter(r => r.id !== reportId);
    const countEl = document.getElementById("bugTotalCount");
    countEl && (countEl.textContent = `총 ${window._allBugReports.length}건`), filterAdminBugs();
  } catch (e) {
    alert("삭제 중 오류가 발생했습니다.");
  }
}, window.showAdminMemo = async function() {
  if (!isAdmin()) return void alert("관리자만 접근 가능합니다.");
  hideAll(), window.scrollTo(0, 0);
  const section = document.getElementById("moreMenuSection");
  section.classList.add("active"), section.innerHTML = '\n        <div style="max-width:700px; margin:0 auto; padding:20px;">\n            <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">\n                <button onclick="showMoreMenu()" style="background:none; border:none; font-size:20px; cursor:pointer; color:#495057;">\n                    <i class="fas fa-arrow-left"></i>\n                </button>\n                <h2 style="margin:0; font-size:20px; font-weight:800; color:#c62828;">\n                    <i class="fas fa-sticky-note"></i> 관리자 메모장\n                </h2>\n            </div>\n\n            <div style="background:#fff8dc; border:1px solid #ffc107; border-radius:10px; padding:12px 16px; margin-bottom:20px; font-size:13px; color:#856404;">\n                <i class="fas fa-lock"></i> 관리자만 볼 수 있는 메모입니다. Firebase에 저장됩니다.\n            </div>\n\n            <div style="background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.08); margin-bottom:16px;">\n                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">\n                    <label style="font-size:14px; font-weight:700; color:#495057;">📋 메모 목록</label>\n                    <button onclick="addAdminMemoItem()"\n                        style="background:#c62828; color:white; border:none; padding:7px 14px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer;">\n                        <i class="fas fa-plus"></i> 새 메모\n                    </button>\n                </div>\n                <div id="adminMemoList" style="display:flex; flex-direction:column; gap:10px;">\n                    <div style="text-align:center; padding:30px; color:#adb5bd;">\n                        <i class="fas fa-spinner fa-spin"></i> 불러오는 중...\n                    </div>\n                </div>\n            </div>\n        </div>\n    ', 
  await loadAdminMemos();
}, window.addAdminMemoItem = function() {
  const listEl = document.getElementById("adminMemoList");
  if (!listEl) return;
  const formId = `memoForm-new-${Date.now()}`, formHTML = `\n        <div id="${formId}" style="background:#fff8e1; border:2px solid #ffc107; border-radius:10px; padding:14px; display:flex; flex-direction:column; gap:10px;">\n            <input id="${formId}-title" type="text" placeholder="제목" maxlength="100"\n                style="padding:8px 12px; border:1px solid #dee2e6; border-radius:8px; font-size:14px; width:100%; box-sizing:border-box;">\n            <textarea id="${formId}-content" placeholder="내용을 입력하세요..." rows="4"\n                style="padding:8px 12px; border:1px solid #dee2e6; border-radius:8px; font-size:14px; resize:vertical; font-family:inherit; width:100%; box-sizing:border-box;"></textarea>\n            <div style="display:flex; gap:8px;">\n                <button onclick="saveAdminMemo('${formId}', null)"\n                    style="background:#c62828; color:white; border:none; padding:9px 18px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; flex:1;">\n                    <i class="fas fa-save"></i> 저장\n                </button>\n                <button onclick="document.getElementById('${formId}').remove()"\n                    style="background:#6c757d; color:white; border:none; padding:9px 18px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer;">\n                    취소\n                </button>\n            </div>\n        </div>\n    `;
  listEl.insertAdjacentHTML("afterbegin", formHTML);
}, window.editAdminMemo = function(memoId, title, content) {
  const card = document.getElementById(`memoCard-${memoId}`);
  if (!card) return;
  const formId = `memoForm-edit-${memoId}`;
  card.outerHTML = `\n        <div id="${formId}" style="background:#fff8e1; border:2px solid #ffc107; border-radius:10px; padding:14px; display:flex; flex-direction:column; gap:10px;">\n            <input id="${formId}-title" type="text" value="${title.replace(/"/g, "&quot;")}" maxlength="100"\n                style="padding:8px 12px; border:1px solid #dee2e6; border-radius:8px; font-size:14px; width:100%; box-sizing:border-box;">\n            <textarea id="${formId}-content" rows="4"\n                style="padding:8px 12px; border:1px solid #dee2e6; border-radius:8px; font-size:14px; resize:vertical; font-family:inherit; width:100%; box-sizing:border-box;">${content}</textarea>\n            <div style="display:flex; gap:8px;">\n                <button onclick="saveAdminMemo('${formId}', '${memoId}')"\n                    style="background:#c62828; color:white; border:none; padding:9px 18px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; flex:1;">\n                    <i class="fas fa-save"></i> 저장\n                </button>\n                <button onclick="loadAdminMemos()"\n                    style="background:#6c757d; color:white; border:none; padding:9px 18px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer;">\n                    취소\n                </button>\n            </div>\n        </div>\n    `;
}, window.saveAdminMemo = async function(formId, memoId) {
  const title = document.getElementById(`${formId}-title`)?.value.trim(), content = document.getElementById(`${formId}-content`)?.value.trim();
  if (title || content) try {
    memoId ? await db.ref(`adminMemos/${memoId}`).update({
      title: title || "",
      content: content || "",
      updatedAt: Date.now()
    }) : await db.ref("adminMemos").push({
      title: title || "",
      content: content || "",
      createdAt: Date.now()
    }), await loadAdminMemos();
  } catch (e) {
    alert("저장 실패. 다시 시도해주세요.");
  } else alert("제목 또는 내용을 입력해주세요.");
}, window.deleteAdminMemo = async function(memoId) {
  if (confirm("이 메모를 삭제하시겠습니까?")) try {
    await db.ref(`adminMemos/${memoId}`).remove();
    const card = document.getElementById(`memoCard-${memoId}`);
    card && (card.style.transition = "all 0.3s", card.style.opacity = "0", card.style.transform = "translateX(30px)", 
    setTimeout(() => card.remove(), 300));
  } catch (e) {
    alert("삭제 실패. 다시 시도해주세요.");
  }
}, window._improvementList = [], window.showImprovementPage = function() {
  hideAll(), window.scrollTo(0, 0), window._improvementList = [];
  const section = document.getElementById("moreMenuSection");
  if (!section) return;
  section.classList.add("active");
  const now = (new Date).toLocaleString("ko-KR");
  section.innerHTML = `\n        <div style="max-width:600px; margin:0 auto; padding:20px;">\n            <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">\n                <button onclick="showMoreMenu()" style="background:none; border:none; font-size:20px; cursor:pointer; color:#495057;"><i class="fas fa-arrow-left"></i></button>\n                <h2 style="margin:0; font-size:20px; font-weight:800; color:#e65100;"><i class="fas fa-lightbulb"></i> 개선 제보</h2>\n            </div>\n            <div style="background:#fff8e1; border:1px solid #ffca28; border-radius:10px; padding:12px 16px; margin-bottom:20px; font-size:13px; color:#795548;">\n                <i class="fas fa-info-circle"></i> 사이트를 더 좋게 만들 아이디어나 불편한 점을 알려주세요! 여러 개 추가 후 한 번에 전송할 수 있어요.\n            </div>\n            <div style="background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.08); display:flex; flex-direction:column; gap:14px; margin-bottom:16px;">\n                <input type="hidden" id="improveTime" value="${now}">\n                <div>\n                    <label style="font-size:13px; font-weight:600; color:#495057; display:block; margin-bottom:6px;">📝 제목 <span style="color:#dc3545;">*</span></label>\n                    <input type="text" id="improveTitle" placeholder="개선 아이디어를 간단히 설명해주세요" maxlength="100"\n                        style="width:100%; padding:10px 12px; border:1px solid #dee2e6; border-radius:8px; font-size:14px; box-sizing:border-box; outline:none;"\n                        onfocus="this.style.borderColor='#e65100'" onblur="this.style.borderColor='#dee2e6'">\n                </div>\n                <div>\n                    <label style="font-size:13px; font-weight:600; color:#495057; display:block; margin-bottom:6px;">📂 분류</label>\n                    <select id="improveCategory" style="width:100%; padding:10px 12px; border:1px solid #dee2e6; border-radius:8px; font-size:14px; box-sizing:border-box; outline:none; background:white; cursor:pointer;"\n                        onfocus="this.style.borderColor='#e65100'" onblur="this.style.borderColor='#dee2e6'">\n                        <option value="UI/UX">🎨 UI/UX 개선</option>\n                        <option value="기능">⚙️ 새 기능 추가</option>\n                        <option value="성능">⚡ 성능 개선</option>\n                        <option value="콘텐츠">📰 콘텐츠 관련</option>\n                        <option value="기타">💬 기타</option>\n                    </select>\n                </div>\n                <div>\n                    <label style="font-size:13px; font-weight:600; color:#495057; display:block; margin-bottom:6px;">📄 상세 내용 <span style="color:#dc3545;">*</span></label>\n                    <textarea id="improveContent" placeholder="어떻게 개선하면 좋을지 자세히 알려주세요" rows="4"\n                        style="width:100%; padding:10px 12px; border:1px solid #dee2e6; border-radius:8px; font-size:14px; resize:vertical; font-family:inherit; box-sizing:border-box; outline:none;"\n                        onfocus="this.style.borderColor='#e65100'" onblur="this.style.borderColor='#dee2e6'"></textarea>\n                </div>\n                <div>\n                    <label style="font-size:13px; font-weight:600; color:#495057; display:block; margin-bottom:6px;">📷 참고 이미지 (선택)</label>\n                    <div id="improveImagePreviewArea" onclick="document.getElementById('improveImageInput').click()"\n                        style="border:2px dashed #dee2e6; border-radius:8px; padding:16px; text-align:center; cursor:pointer; background:#fafafa;"\n                        onmouseover="this.style.borderColor='#e65100'" onmouseout="this.style.borderColor='#dee2e6'">\n                        <i class="fas fa-camera" style="font-size:22px; color:#adb5bd;"></i>\n                        <p style="margin:6px 0 0; font-size:13px; color:#adb5bd;">클릭하여 이미지 첨부</p>\n                    </div>\n                    <input type="file" id="improveImageInput" accept="image/*" style="display:none;" onchange="previewImproveImage(this)">\n                </div>\n                <button onclick="addImproveToList()"\n                    style="background:linear-gradient(135deg,#e65100,#ff8f00); color:white; border:none; padding:12px; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; width:100%;">\n                    <i class="fas fa-plus-circle"></i> 목록에 추가\n                </button>\n            </div>\n            <div id="improveQueueArea" style="display:none; margin-bottom:16px;">\n                <div style="font-size:13px; font-weight:700; color:#495057; margin-bottom:8px;">\n                    📋 제보 목록 <span id="improveQueueCount" style="background:#e65100; color:white; border-radius:10px; padding:1px 8px; font-size:12px;">0</span>\n                </div>\n                <div id="improveQueueList" style="display:flex; flex-direction:column; gap:8px;"></div>\n            </div>\n            <button id="improveSubmitAllBtn" onclick="submitImprovementReport()" style="display:none;\n                background:linear-gradient(135deg,#e65100,#ff6d00); color:white; border:none; padding:14px;\n                border-radius:10px; font-size:15px; font-weight:700; cursor:pointer; width:100%; margin-bottom:8px;">\n                <i class="fas fa-paper-plane"></i> 전체 전송 (<span id="improveSubmitCount">0</span>건)\n            </button>\n            <div id="improveSubmitMsg" style="margin-top:8px; text-align:center;"></div>\n        </div>\n    `, 
  updateURL("improvement");
}, window.addImproveToList = async function() {
  const title = document.getElementById("improveTitle").value.trim(), content = document.getElementById("improveContent").value.trim(), category = document.getElementById("improveCategory").value, imageInput = document.getElementById("improveImageInput");
  if (!title) return void alert("제목을 입력해주세요.");
  if (!content) return void alert("상세 내용을 입력해주세요.");
  let imageBase64 = null;
  imageInput.files && imageInput.files[0] && (imageBase64 = await compressImageToBase64(imageInput.files[0], 800, .72)), 
  window._improvementList.push({
    id: Date.now(),
    title: title,
    content: content,
    category: category,
    time: document.getElementById("improveTime").value,
    imageBase64: imageBase64
  }), document.getElementById("improveTitle").value = "", document.getElementById("improveContent").value = "", 
  imageInput.value = "", document.getElementById("improveImagePreviewArea").innerHTML = '<i class="fas fa-camera" style="font-size:22px; color:#adb5bd;"></i><p style="margin:6px 0 0; font-size:13px; color:#adb5bd;">클릭하여 이미지 첨부</p>', 
  renderImproveQueue();
}, window.renderImproveQueue = function() {
  const list = window._improvementList, area = document.getElementById("improveQueueArea"), queueList = document.getElementById("improveQueueList"), submitBtn = document.getElementById("improveSubmitAllBtn");
  if (area && queueList) {
    if (0 === list.length) return area.style.display = "none", void (submitBtn.style.display = "none");
    area.style.display = "block", submitBtn.style.display = "block", document.getElementById("improveQueueCount").textContent = list.length, 
    document.getElementById("improveSubmitCount").textContent = list.length, queueList.innerHTML = list.map((item, idx) => `\n        <div style="background:white; border-radius:10px; padding:12px 14px; box-shadow:0 1px 4px rgba(0,0,0,0.08); display:flex; align-items:flex-start; gap:10px; border-left:3px solid #e65100;">\n            <div style="flex:1; min-width:0;">\n                <div style="font-size:11px; color:#e65100; font-weight:700; margin-bottom:2px;">${escapeHTML(item.category)}</div>\n                <div style="font-size:14px; font-weight:700; color:#202124; margin-bottom:2px;">${escapeHTML(item.title)}</div>\n                <div style="font-size:12px; color:#868e96; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHTML(item.content)}</div>\n                ${item.imageBase64 ? '<div style="font-size:11px; color:#e65100; margin-top:3px;"><i class="fas fa-image"></i> 이미지 첨부됨</div>' : ""}\n            </div>\n            <button onclick="removeImproveFromList(${idx})" style="background:#fff0f0; border:none; color:#dc3545; border-radius:6px; padding:4px 8px; cursor:pointer; font-size:12px; flex-shrink:0;"><i class="fas fa-times"></i></button>\n        </div>`).join("");
  }
}, window.removeImproveFromList = function(idx) {
  window._improvementList.splice(idx, 1), renderImproveQueue();
}, window.previewImproveImage = function(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader;
  reader.onload = e => {
    document.getElementById("improveImagePreviewArea").innerHTML = `<img src="${e.target.result}" style="max-width:100%; max-height:200px; border-radius:8px; object-fit:contain;"><p style="margin:8px 0 0; font-size:12px; color:#868e96;">클릭하여 변경</p>`;
  }, reader.readAsDataURL(input.files[0]);
}, window.submitImprovementReport = async function() {
  if (!isLoggedIn()) return void alert("로그인 후 이용해주세요.");
  const list = window._improvementList || [];
  if (0 === list.length) return void alert("제보할 내용을 먼저 추가해주세요.");
  const btn = document.getElementById("improveSubmitAllBtn"), msgEl = document.getElementById("improveSubmitMsg");
  btn && (btn.disabled = !0, btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 전송 중...');
  try {
    const user = auth.currentUser, baseTime = Date.now();
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      await db.ref("improvements").push({
        title: item.title,
        content: item.content,
        category: item.category,
        time: item.time,
        authorName: getNickname(),
        authorEmail: getUserEmail(),
        authorUid: user.uid,
        imageBase64: item.imageBase64 || null,
        status: "pending",
        createdAt: baseTime + i
      });
    }
    window._improvementList = [], showToastNotification("💡 개선 제보 완료", `${list.length}건 제보 감사합니다! 검토 후 반영할게요 🙏`), 
    setTimeout(() => showMoreMenu(), 1200);
  } catch (e) {
    msgEl && (msgEl.innerHTML = '<div style="background:#f8d7da; color:#721c24; padding:12px 16px; border-radius:8px; font-size:14px;"><i class="fas fa-exclamation-circle"></i> 전송 실패. 다시 시도해주세요.</div>'), 
    btn && (btn.disabled = !1, btn.innerHTML = `<i class="fas fa-paper-plane"></i> 전체 전송 (${list.length}건)`);
  }
}, window._allImprovements = [], window.showAdminImprovements = async function() {
  if (!isAdmin()) return void alert("관리자만 접근 가능합니다.");
  hideAll(), window.scrollTo(0, 0);
  const section = document.getElementById("moreMenuSection");
  section.classList.add("active"), section.innerHTML = '\n        <div style="max-width:700px; margin:0 auto; padding:20px;">\n            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">\n                <button onclick="showMoreMenu()" style="background:none; border:none; font-size:20px; cursor:pointer; color:#495057;"><i class="fas fa-arrow-left"></i></button>\n                <h2 style="margin:0; font-size:20px; font-weight:800; color:#e65100; flex:1;"><i class="fas fa-lightbulb"></i> 개선 제보 관리</h2>\n                <span id="improveTotalCount" style="font-size:13px; color:#868e96;"></span>\n            </div>\n            <div style="display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap;">\n                <input id="improveSearchInput" type="text" placeholder="제목, 내용, 작성자 검색..."\n                    oninput="filterAdminImprovements()"\n                    style="flex:1; min-width:160px; padding:10px 14px; border:1.5px solid #dee2e6; border-radius:10px; font-size:14px; outline:none; box-sizing:border-box;"\n                    onfocus="this.style.borderColor=\'#e65100\'" onblur="this.style.borderColor=\'#dee2e6\'">\n                <select id="improveStatusFilter" onchange="filterAdminImprovements()"\n                    style="padding:10px 12px; border:1.5px solid #dee2e6; border-radius:10px; font-size:14px; outline:none; background:white; cursor:pointer;">\n                    <option value="all">전체 상태</option>\n                    <option value="pending">검토중</option>\n                    <option value="accepted">반영 예정</option>\n                    <option value="done">반영 완료</option>\n                    <option value="rejected">미반영</option>\n                </select>\n                <select id="improveCategoryFilter" onchange="filterAdminImprovements()"\n                    style="padding:10px 12px; border:1.5px solid #dee2e6; border-radius:10px; font-size:14px; outline:none; background:white; cursor:pointer;">\n                    <option value="all">전체 분류</option>\n                    <option value="UI/UX">UI/UX</option>\n                    <option value="기능">새 기능</option>\n                    <option value="성능">성능</option>\n                    <option value="콘텐츠">콘텐츠</option>\n                    <option value="기타">기타</option>\n                </select>\n            </div>\n            <div id="adminImproveList" style="display:flex; flex-direction:column; gap:14px;">\n                <div style="text-align:center; padding:40px; color:#adb5bd;"><i class="fas fa-spinner fa-spin" style="font-size:24px;"></i><p>불러오는 중...</p></div>\n            </div>\n        </div>';
  try {
    const snap = await db.ref("improvements").once("value"), reports = [];
    snap.forEach(child => {
      reports.push({
        id: child.key,
        ...child.val()
      });
    }), reports.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)), window._allImprovements = reports;
    const countEl = document.getElementById("improveTotalCount");
    countEl && (countEl.textContent = `총 ${reports.length}건`), renderAdminImproveList(reports);
  } catch (e) {
    const listEl = document.getElementById("adminImproveList");
    listEl && (listEl.innerHTML = `<p style="color:#dc3545; text-align:center;">불러오기 실패: ${e.message}</p>`);
  }
}, window.filterAdminImprovements = function() {
  const kw = (document.getElementById("improveSearchInput")?.value || "").toLowerCase(), status = document.getElementById("improveStatusFilter")?.value || "all", category = document.getElementById("improveCategoryFilter")?.value || "all", filtered = (window._allImprovements || []).filter(r => {
    const matchStatus = "all" === status || r.status === status || "pending" === status && !r.status, matchCat = "all" === category || r.category === category, matchKw = !kw || (r.title || "").toLowerCase().includes(kw) || (r.content || "").toLowerCase().includes(kw) || (r.authorName || "").toLowerCase().includes(kw);
    return matchStatus && matchCat && matchKw;
  });
  renderAdminImproveList(filtered);
}, window.renderAdminImproveList = function(reports) {
  const listEl = document.getElementById("adminImproveList");
  if (!listEl) return;
  if (0 === reports.length) return void (listEl.innerHTML = '<div style="text-align:center; padding:60px 20px; color:#adb5bd;"><i class="fas fa-inbox" style="font-size:40px;"></i><p style="margin-top:12px;">검색 결과가 없습니다</p></div>');
  const statusConfig = {
    pending: {
      label: "검토중",
      bg: "#fff3cd",
      color: "#856404",
      icon: "fa-clock",
      border: "#ffc107"
    },
    accepted: {
      label: "반영 예정",
      bg: "#cce5ff",
      color: "#004085",
      icon: "fa-thumbs-up",
      border: "#007bff"
    },
    done: {
      label: "반영 완료",
      bg: "#d4edda",
      color: "#155724",
      icon: "fa-check-circle",
      border: "#28a745"
    },
    rejected: {
      label: "미반영",
      bg: "#f8d7da",
      color: "#721c24",
      icon: "fa-times-circle",
      border: "#dc3545"
    }
  }, catEmoji = {
    "UI/UX": "🎨",
    "기능": "⚙️",
    "성능": "⚡",
    "콘텐츠": "📰",
    "기타": "💬"
  };
  listEl.innerHTML = reports.map(r => {
    const cur = statusConfig[r.status] || statusConfig.pending, cat = r.category || "기타", date = new Date(r.createdAt).toLocaleString("ko-KR"), statusBtns = Object.entries(statusConfig).map(([s, c]) => {
      const active = (r.status || "pending") === s;
      return `<button onclick="updateImproveStatus('${r.id}','${s}','${r.authorUid || ""}','${(r.title || "").replace(/'/g, "\\'")}')"\n                style="padding:6px 12px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; border:1.5px solid ${active ? c.border : "#dee2e6"}; background:${active ? c.bg : "#fff"}; color:${active ? c.color : "#868e96"};">\n                <i class="fas ${c.icon}"></i> ${c.label}</button>`;
    }).join("");
    return `\n            <div id="improveCard-${r.id}" style="background:white; border-radius:12px; padding:18px; box-shadow:0 2px 8px rgba(0,0,0,0.08); border-left:4px solid ${cur.border};">\n                <div style="display:flex; align-items:flex-start; gap:8px; margin-bottom:10px;">\n                    <div style="flex:1;">\n                        <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">\n                            <span style="font-size:11px; background:#fff8e1; color:#e65100; padding:2px 8px; border-radius:10px; font-weight:700;">${catEmoji[cat] || "💬"} ${escapeHTML(cat)}</span>\n                            <span style="background:${cur.bg}; color:${cur.color}; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:700;"><i class="fas ${cur.icon}"></i> ${cur.label}</span>\n                        </div>\n                        <div style="font-size:15px; font-weight:700; color:#202124; margin-bottom:4px;">${escapeHTML(r.title || "")}</div>\n                        <div style="font-size:12px; color:#868e96;">👤 ${escapeHTML(r.authorName || "알 수 없음")} &nbsp;|&nbsp; 📅 ${date}</div>\n                    </div>\n                </div>\n                <div style="font-size:13px; color:#495057; white-space:pre-wrap; background:#f8f9fa; border-radius:8px; padding:10px 12px; margin-bottom:12px; line-height:1.6;">${escapeHTML(r.content || "")}</div>\n                ${r.imageBase64 ? `<div style="margin-bottom:12px;"><img src="${r.imageBase64}" onclick="openImageModal('${r.imageBase64}')" style="max-width:100%; max-height:200px; border-radius:8px; cursor:pointer; object-fit:contain; border:1px solid #dee2e6;"></div>` : ""}\n                <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;">${statusBtns}</div>\n                <button onclick="deleteImprovement('${r.id}')" style="background:#f8f9fa; color:#868e96; border:1px solid #dee2e6; padding:7px 14px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; width:100%;"><i class="fas fa-trash"></i> 삭제</button>\n            </div>`;
  }).join("");
}, window.updateImproveStatus = async function(reportId, newStatus, authorUid, reportTitle) {
  if (isAdmin()) try {
    await db.ref(`improvements/${reportId}/status`).set(newStatus);
    const msgs = {
      accepted: `제보하신 개선 사항 "${reportTitle}"이 반영 예정 목록에 추가되었습니다! 🎉`,
      done: `제보하신 개선 사항 "${reportTitle}"이 반영 완료되었습니다! 감사합니다 🙏`,
      rejected: `제보하신 개선 사항 "${reportTitle}"은 이번에는 반영이 어렵습니다. 소중한 의견 감사합니다.`
    };
    if (authorUid && msgs[newStatus]) {
      const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.ref(`notifications/${authorUid}/${notifId}`).set({
        type: "improvementUpdate",
        title: "💡 개선 제보 상태 업데이트",
        text: msgs[newStatus],
        timestamp: Date.now(),
        read: !1
      });
    }
    const target = (window._allImprovements || []).find(r => r.id === reportId);
    target && (target.status = newStatus), filterAdminImprovements();
  } catch (e) {
    alert("처리 중 오류가 발생했습니다.");
  }
}, window.deleteImprovement = async function(reportId) {
  if (isAdmin() && confirm("이 개선 제보를 삭제하시겠습니까?")) try {
    await db.ref(`improvements/${reportId}`).remove(), window._allImprovements = (window._allImprovements || []).filter(r => r.id !== reportId);
    const countEl = document.getElementById("improveTotalCount");
    countEl && (countEl.textContent = `총 ${window._allImprovements.length}건`), filterAdminImprovements();
  } catch (e) {
    alert("삭제 중 오류가 발생했습니다.");
  }
};