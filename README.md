# 동네 알림이

우리 동네 실시간 상황 공유 플랫폼

<img width="1246" alt="image" src="https://github.com/user-attachments/assets/8d2a3a70-5ab7-4471-917b-ed8ce35bc510" />
<img width="645" alt="image" src="https://github.com/user-attachments/assets/dbcfa7fd-6892-44e2-afe9-a5448cc6aa24" />
<img width="496" alt="image" src="https://github.com/user-attachments/assets/fbf5a0b9-893a-4368-ba56-720662ad276e" />

## 프로젝트 소개

사이렌 소리나 기타 동네 상황, 현재 위치에서 공유하고 싶은 상황을 지도 위에서 실시간으로 공유할 수 있는 웹 애플리케이션입니다.

### 핵심 기능

- GPS 기반 위치 확인
- 지도 위 마커 표시
- 상황 신고 및 공유
- 비회원 게시글 관리: 자신이 작성한 게시글 수정/삭제 가능
- 이미지 첨부: 게시글에 사진 첨부 가능 (자동 압축)
- 실시간 댓글 시스템
- 실시간 데이터 동기화
- 오프라인 지원

### 상황 카테고리

- 응급상황
- 소음
- 교통
- 안전
- 기타

## 시작하기

### 개발 환경 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

참고사항:

- 카카오맵: 하루 300,000건 무료 호출 가능
- Supabase: 무료 티어에서 실시간 데이터베이스 제공
- 환경변수 미설정 시 오프라인 모드로 작동

## 기술 스택

- Frontend: React 18, Vite
- Styling: Tailwind CSS
- Icons: Lucide React
- Maps: 카카오맵 API
- Database: Supabase (PostgreSQL)
- Realtime: Supabase Realtime
- Offline: Local Storage 백업

## 사용법

1. 위치 권한 허용: 브라우저에서 위치 접근 허용
2. 상황 신고: 오른쪽 하단 + 버튼 클릭
3. 카테고리 선택: 적절한 상황 유형 선택
4. 내용 작성: 제목과 상세 설명 입력
5. 신고 완료: 지도에 마커로 표시
6. 마커 클릭: 상세 정보 팝업 확인
7. 댓글 작성: 닉네임과 댓글 입력 (Supabase 설정 필요)
8. 게시글 관리: 자신이 작성한 게시글에 수정/삭제 버튼 표시

## 데이터베이스 스키마

### alerts 테이블

- id: Primary Key
- title: 제목
- description: 설명
- type: 카테고리
- lat, lng: 위치 좌표
- author_key: 작성자 인증 키 (비회원 권한 관리)
- image_url: 첨부 이미지 URL
- created_at: 생성 시간

### comments 테이블

- id: Primary Key
- alert_id: 알림 ID (Foreign Key)
- content: 댓글 내용
- user_name: 사용자 닉네임
- created_at: 생성 시간

## 실시간 기능

- 실시간 알림 동기화: 새로운 신고가 즉시 모든 사용자에게 표시
- 실시간 댓글: 댓글 작성 시 즉시 다른 사용자에게 표시
- 오프라인 지원: 네트워크 연결이 없어도 로컬 스토리지로 작동

## 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 새로운 기능: 비회원 게시글 관리

### 작동 방식

- 게시글 작성 시 고유한 `author_key` 생성
- 브라우저 로컬 스토리지에 작성자 키 저장
- 자신이 작성한 게시글에만 수정/삭제 버튼 표시
- 수정/삭제 시 `author_key`로 권한 검증

### 데이터베이스 마이그레이션

기존 데이터베이스에 새 필드를 추가하려면:

```bash
# Supabase SQL Editor에서 실행
\i migrate-author-key.sql
```

### 기능 특징

- 보안: 서버 측에서 `author_key` 검증
- 사용자 친화적: 로그인 없이도 게시글 관리 가능
- 실시간: 수정/삭제 시 즉시 모든 사용자에게 반영
- 브라우저 지원: 로컬 스토리지 기반 권한 관리

## 새로운 기능: 이미지 첨부

### 기능 특징

- 이미지 업로드: 게시글에 사진 첨부 가능
- 자동 압축: 800px 최대 너비로 자동 리사이즈
- 용량 제한: 5MB 이하 파일만 업로드 가능
- 미리보기: 업로드 전 이미지 미리보기 제공
- 이미지 관리: 게시글 삭제 시 이미지도 자동 삭제

### Supabase Storage 설정

Private.

---

Yohan Choi.
