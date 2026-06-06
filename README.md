# 동네 알림이

위치 기반 실시간 상황 공유 MVP입니다.  
SNS의 팔로우 관계가 아니라, **지금 내 주변에서 일어나는 상황**을 지도와 거리 기준으로 빠르게 확인하는 것을 목표로 합니다.

## 문제의식

사이렌 소리는 들리는데 무슨 일인지 알기 어렵고, 교통 정체나 안전 이슈는 내가 그 장소에 도착한 뒤에야 알게 되는 경우가 많습니다.  
동네 알림이는 위치와 시간을 중심으로 제보를 모아, 주변 상황을 더 빠르게 파악할 수 있는지 검증하는 실험입니다.

## 현재 MVP 기능

- 현재 위치 기반 지도 표시
- 상황 제보 및 빠른 제보
- 이미지 첨부 및 자동 압축
- 내 주변 상황 모달: 거리/시간 기준 정렬, 카테고리 필터
- 지도 마커 군집화
- 제보 상세 팝업
- 현장 대화
- 커뮤니티 검증: 확인, 반박, 증거
- 상황 상태: 진행중, 확인됨, 주의필요, 해결됨
- 반경 기반 앱 내 알림함
- 비회원 작성자 키 기반 수정/삭제
- 개인정보처리방침, 위치정보 이용약관, 이용약관

## 중요한 안내

이 프로젝트는 MVP입니다.

- 응급상황은 반드시 112, 119 등 공식 기관에 먼저 신고해야 합니다.
- 사용자 제보 기반 정보이므로 공식 정보가 아닙니다.
- 차량번호, 얼굴, 실명, 전화번호, 정확한 주소 등 타인의 개인정보를 올리면 안 됩니다.
- 위치정보 기반 공개 서비스로 운영하기 전에는 위치정보 관련 신고/법무 검토가 필요합니다.

## 기술 스택

- React 18
- Vite
- Tailwind CSS
- Lucide React
- Kakao Maps JavaScript API
- Supabase Database, Realtime, Storage

## 환경변수

`.env`에 아래 값을 설정합니다.

```env
VITE_KAKAO_MAP_API_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Kakao Developers에서는 JavaScript 키를 사용합니다.  
Supabase는 `Project URL`과 `anon public` 키를 사용하며, `service_role` 키는 프론트엔드에 넣지 않습니다.

## Supabase 설정

Supabase SQL Editor에서 아래 파일을 실행합니다.

```sql
-- supabase-app-setup.sql
```

데모 데이터가 필요하면 아래 파일을 추가 실행합니다.

```sql
-- seed-demo-alerts.sql
```

## 개발 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
npm run preview
```

## 피드백 받고 싶은 부분

- 위치 기반 실시간 상황 공유가 실제로 필요한 문제인지
- 제보/검증/현장 대화 흐름이 직관적인지
- 허위정보, 명예훼손, 개인정보 노출을 줄이기 위해 어떤 장치가 더 필요한지
- 정식 서비스 전에 가장 먼저 보완해야 할 리스크가 무엇인지

## Contact

Yohan Choi  
businessyh0312@gmail.com
