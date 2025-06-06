import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL_HERE";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY_HERE";

// Supabase 설정이 있는지 확인
const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "YOUR_SUPABASE_URL_HERE" &&
  supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY_HERE";

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Supabase 연결 상태 확인 함수
export const isSupabaseConnected = () => {
  return !!supabase;
};

// 테이블명 상수
export const TABLES = {
  ALERTS: "alerts",
  COMMENTS: "comments",
  USERS: "users",
};
