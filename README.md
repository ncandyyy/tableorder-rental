# 페이앤밴 테이블오더 렌탈 상세페이지

피그마 `페이앤밴_렌탈 상세페이지` 의 `테이블오더 렌탈` 페이지를 반응형 웹페이지로 옮긴 프로젝트입니다.
poss-rental 과 같은 방식: 빌드 과정 없는 순수 HTML/CSS/JS, `public` 폴더를 넷리파이가 그대로 배포합니다.

## 폴더 구조

```
.
├── netlify.toml            # 넷리파이 설정 (public 폴더 배포, 빌드 없음)
├── apps-script/Code.gs     # 구글 시트 저장 + 슬랙 알림 (공용 Apps Script, torder 추가)
├── docs/form-setup.md      # 시트·슬랙 연결 방법
└── public/
    ├── index.html          # 페이지 전체 마크업 (섹션별 주석)
    ├── css/                # base(토큰·공통) / components(폼·말풍선·신청창…) / sections(섹션별)
    ├── js/config.js        # ★ 운영 설정: 접수 주소, 테이블오더 선택지, 업종, 상담 시간
    ├── js/modules/         # 폼, 신청 창, 탭, 제품 고르기·기능 슬라이드, 흐르는 캐러셀, 조회수 …
    └── assets/             # 피그마에서 추출한 이미지(WebP)·아이콘(SVG)·영상
```

## 섹션 ↔ 피그마 프레임

| 섹션 | 피그마 | 동작 |
| --- | --- | --- |
| `.topbar` | 상단 플로팅 바 | 상단 고정, 실제 누적 조회수 카운트업 |
| `.hero` | 00히어로 | 기기 3종 둥실, 라벨·설명 카드 순차 등장 |
| `.pain` | 01 | 카드 4장, 말풍선 톡톡. 휴대폰에서는 옆으로 넘기는 카드 |
| `.lineup` | 02 (+ 하이오더/업오더 슬라이드) | KT 하이오더 / 티오더 / 업오더 탭 → 매장 사진 줄이 바뀌며 자동으로 흐름 |
| `.reviews` | 03 | 1,000 카운트업, 후기 2줄 반대 방향으로 흐름 |
| `.picker` | 04 (+ 오른쪽 슬라이드 9장) | 제품 카드 3장(업오더·티오더·KT 하이오더)을 넘기거나 누르면 아래 기능 슬라이드가 그 제품 것으로 바뀜. 슬라이드는 순서대로 업오더 3 · 티오더 3 · KT 3. 칩 클릭/스와이프/자동 넘김, 티오더 1·2번은 영상 |
| `.apply` | 12 + 폼 1·9·10 | 3단계 신청 폼 (+ **신청할 테이블오더** 선택: 업오더/하이오더/티오더), 포스기 세트 → poss-rental, 시크릿 페이백 → 인터넷 견적 |
| 하단 고정 버튼 | — | 히어로를 지나면 나타나고, 누르면 신청 창 (poss-rental 과 동일) |

## 링크

- 포스기 월 비용 면제 세트 → https://poss-rental.netlify.app/
- 인터넷 통신사 3사 견적 비교 → https://bejewelled-begonia-20c94c.netlify.app/

(`index.html` 의 `data-extra-link` 두 곳)

## 로컬에서 보기

```bash
python3 -m http.server 8080 --directory public
```

## 오픈 전 체크리스트

- [ ] Apps Script 에 `torder` 추가·새 버전 배포 + 슬랙 워크플로 (방법: [docs/form-setup.md](docs/form-setup.md)). `FORM_ENDPOINT` 는 공용 주소로 이미 연결됨
- [ ] 넷리파이에서 이 저장소 연결 (사이트 이름 `tableorder-rental` 가정 — 다르면 `index.html` canonical·og 주소와 `Code.gs` siteUrl 변경)
- [ ] 공유 미리보기 이미지 `assets/images/og/og-image.png` (1200×630) 넣기 — 아직 없음
- [ ] 네이버 공통 스크립트 넣기 (`index.html` 맨 아래 TODO)
- [ ] 개인정보 동의 문구, 약관 링크 확인 (푸터 TODO)
