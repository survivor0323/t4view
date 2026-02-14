# Premium Web App Design (1) 적용 계획

기본적인 다크 모드를 넘어, 세련된 색감과 동적인 요소를 추가하여 사용자에게 프리미엄 베네핏을 전달하는 디자인으로 업그레이드합니다.

## 제안된 변경 사항

### [Design System & Foundation]

#### 1. [MODIFY] [globals.css](file:///c:/Users/양준모/Documents/antigravity/t4view/app/globals.css)
- **컬러 팔레트**: 단순한 회색 대신 깊이 있는 HSL 기반의 다크 블루/슬레이트 톤을 적용합니다.
- **메시 그라데이션**: 배경에 은은한 메시 그라데이션을 추가하여 시각적 깊이감을 더합니다.
- **글래스모피즘**: `backdrop-blur`와 반투명 배경을 활용한 유리 질감의 컴포넌트 스타일을 정의합니다.
- **스크롤바**: 더욱 얇고 세련된 디자인으로 개선합니다.

#### 2. [MODIFY] [layout.tsx](file:///c:/Users/양준모/Documents/antigravity/t4view/app/layout.tsx)
- **Typography**: Google Fonts의 'Inter' 또는 'Outfit' 폰트를 적용하여 현대적인 가독성을 확보합니다.

### [Components Aesthetic Upgrade]

#### 3. [MODIFY] [Sidebar.tsx](file:///c:/Users/양준모/Documents/antigravity/t4view/components/layout/Sidebar.tsx)
- 사이드바에 글래스모피즘 효과를 적용합니다.
- 파일/폴더 아이콘에 브랜드 컬러 액센트를 부여합니다.
- 아이템 호버 시 부드러운 스케일 및 색상 전환 애니메이션을 추가합니다.
- 선택된 아이템에 그라데이션 하이라이트를 적용합니다.

#### 4. [MODIFY] [MainViewer.tsx](file:///c:/Users/양준모/Documents/antigravity/t4view/components/layout/MainViewer.tsx)
- 상단 헤더의 폰트 웨이트와 간격을 조정하여 전문적인 느낌을 강화합니다.
- 뷰어 영역에 미세한 테두리(`border-white/5`)와 그림자를 추가하여 입체감을 부여합니다.

### [Animations]

#### 5. [MODIFY] [WatermarkOverlay.tsx](file:///c:/Users/양준모/Documents/antigravity/t4view/components/watermark/WatermarkOverlay.tsx)
- 워터마크가 시야를 가리지 않으면서도 보안성을 유지하도록 불투명도와 블렌드 모드를 조정합니다.

### [Viewers Fix]

#### 6. [MODIFY] [PDFViewer.tsx](file:///c:/Users/양준모/Documents/antigravity/t4view/components/viewers/PDFViewer.tsx)
- **Worker URL 수정**: `unpkg` 대신 `cdnjs`의 `.mjs` 확장자를 가진 워커 URL을 사용하여 최신 PDF.js(v5+)와의 호환성 문제를 해결합니다.
- **에러 핸들링 강화**: 워커 로드 실패 시 사용자에게 더 명확한 안내를 제공하도록 개선합니다.

## 검증 계획

### 수동 확인 (Manual Verification)
1. **첫 인상 (WOW Factor)**: 페이지 로드 시 정돈되고 세련된 느낌이 드는지 확인.
2. **반응형 동작**: 다양한 화면 크기에서 글래스모피즘과 레이아웃이 깨지지 않는지 확인.
3. **상호작용**: 사이드바 항목 클릭, 폴더 확장 시의 애니메이션이 부드러운지 확인.
