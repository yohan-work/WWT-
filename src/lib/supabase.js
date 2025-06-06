import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL_HERE";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY_HERE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 테이블명 상수
export const TABLES = {
  ALERTS: "alerts",
  COMMENTS: "comments",
  USERS: "users",
};
