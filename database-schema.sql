-- 알림 테이블
CREATE TABLE alerts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('emergency', 'noise', 'traffic', 'safety', 'other')),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 댓글 테이블
CREATE TABLE comments (
  id BIGSERIAL PRIMARY KEY,
  alert_id BIGINT REFERENCES alerts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_alerts_location ON alerts(lat, lng);
CREATE INDEX idx_comments_alert_id ON comments(alert_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);

-- Row Level Security (RLS) 활성화
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 알림 테이블 정책 (모든 사용자가 읽기/쓰기 가능)
CREATE POLICY "Everyone can view alerts" ON alerts FOR SELECT USING (true);
CREATE POLICY "Everyone can insert alerts" ON alerts FOR INSERT WITH CHECK (true);

-- 댓글 테이블 정책 (모든 사용자가 읽기/쓰기 가능)
CREATE POLICY "Everyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Everyone can insert comments" ON comments FOR INSERT WITH CHECK (true);

-- Realtime 활성화 (실시간 구독을 위해)
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE comments; 