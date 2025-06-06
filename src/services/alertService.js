import { supabase, TABLES } from "../lib/supabase";

// 알림 생성
export const createAlert = async (alertData) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.ALERTS)
      .insert([
        {
          ...alertData,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("알림 생성 오류:", error);
    throw error;
  }
};

// 모든 알림 조회
export const getAlerts = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLES.ALERTS)
      .select(
        `
        *,
        comments:${TABLES.COMMENTS}(
          id,
          content,
          user_name,
          created_at
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("알림 조회 오류:", error);
    return [];
  }
};

// 실시간 알림 구독
export const subscribeToAlerts = (callback) => {
  const subscription = supabase
    .channel("alerts_channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: TABLES.ALERTS },
      (payload) => {
        console.log("알림 변경:", payload);
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
};

// 댓글 추가
export const addComment = async (alertId, content, userName) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.COMMENTS)
      .insert([
        {
          alert_id: alertId,
          content,
          user_name: userName,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("댓글 추가 오류:", error);
    throw error;
  }
};

// 특정 알림의 댓글 조회
export const getComments = async (alertId) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.COMMENTS)
      .select("*")
      .eq("alert_id", alertId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("댓글 조회 오류:", error);
    return [];
  }
};

// 실시간 댓글 구독
export const subscribeToComments = (alertId, callback) => {
  const subscription = supabase
    .channel(`comments_${alertId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: TABLES.COMMENTS,
        filter: `alert_id=eq.${alertId}`,
      },
      (payload) => {
        console.log("댓글 변경:", payload);
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
};
