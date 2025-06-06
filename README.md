# 동네 알림이 🏠

우리 동네 실시간 상황 공유 플랫폼

## 🎯 프로젝트 소개

사이렌 소리나 기타 동네 상황을 지도 위에서 실시간으로 공유할 수 있는 웹 애플리케이션입니다.

### 핵심 기능

- 📍 GPS 기반 위치 확인
- 🗺️ 지도 위 마커 표시
- 📝 상황 신고 및 공유
- 💬 실시간 댓글 시스템
- 🔄 실시간 데이터 동기화
- 🎨 Toss 스타일 깔끔한 UI

### 카테고리

- 🚨 응급상황
- 🔊 소음
- 🚗 교통
- 🛡️ 안전
- ⚪ 기타

## 🚀 시작하기

### 개발 환경 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

### 카카오맵 API 설정 (무료!)

1. [카카오 디벨로퍼스](https://developers.kakao.com/)에서 앱 생성
2. Web 플랫폼 추가 및 도메인 등록 (localhost:5173)
3. JavaScript 키 발급
4. `.env` 파일에 API 키 설정

### Supabase 설정 (실시간 댓글 기능)

1. [Supabase](https://supabase.com/) 프로젝트 생성
2. SQL Editor에서 `database-schema.sql` 실행
3. `.env` 파일에 설정 추가:

```env
VITE_KAKAO_MAP_API_KEY=your_kakao_javascript_key
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**🎉 Supabase 장점:**

- 실시간 데이터베이스
- 무료 tier 포함
- 자동 API 생성
- 실시간 구독 기능

현재는 API 키 없이도 오프라인 모드로 테스트 가능합니다.

## 🛠️ 기술 스택

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Maps**: 카카오맵 API
- **Database**: Supabase (PostgreSQL)
- **Realtime**: Supabase Realtime
- **Offline**: Local Storage 백업

## 📱 사용법

1. **위치 권한 허용**: 브라우저에서 위치 접근 허용
2. **상황 신고**: 오른쪽 하단 + 버튼 클릭
3. **카테고리 선택**: 적절한 상황 유형 선택
4. **내용 작성**: 제목과 상세 설명 입력
5. **신고 완료**: 지도에 마커로 표시
6. **마커 클릭**: 상세 정보 팝업 확인
7. **댓글 작성**: 닉네임과 댓글 입력

## 🎨 디자인 특징

- Toss 앱 스타일의 깔끔한 인터페이스
- 직관적인 아이콘과 색상 체계
- 전체 화면 지도 UI
- 실시간 댓글 인터페이스
- 부드러운 애니메이션

## 📦 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 🗃️ 데이터베이스 스키마

### alerts 테이블

- id (Primary Key)
- title (제목)
- description (설명)
- type (카테고리)
- lat, lng (위치 좌표)
- created_at (생성 시간)

### comments 테이블

- id (Primary Key)
- alert_id (알림 ID, Foreign Key)
- content (댓글 내용)
- user_name (사용자 닉네임)
- created_at (생성 시간)

## 🔄 실시간 기능

- **실시간 알림 동기화**: 새로운 신고가 즉시 모든 사용자에게 표시
- **실시간 댓글**: 댓글 작성 시 즉시 다른 사용자에게 표시
- **오프라인 지원**: 네트워크 연결이 없어도 로컬 스토리지로 작동

## 🤝 향후 개선사항

- [ ] 사용자 인증 시스템
- [ ] 푸시 알림
- [ ] 이미지 첨부 기능
- [ ] 신고 검증 시스템
- [ ] 지역별 필터링
- [ ] 마커 클러스터링
- [ ] 좋아요/싫어요 기능
- [ ] 관리자 대시보드

---

Made with ❤️ for safer neighborhoods
