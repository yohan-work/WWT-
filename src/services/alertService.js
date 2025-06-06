import { supabase, TABLES, isSupabaseConnected } from "../lib/supabase";

// 알림 생성
export const createAlert = async (alertData) => {
  if (!isSupabaseConnected()) {
    throw new Error(
      "Supabase가 설정되지 않았습니다. 오프라인 모드로 작동합니다."
    );
  }

  try {
    // location 객체를 lat, lng로 분리
    const { location, ...restData } = alertData;
    const dataToInsert = {
      ...restData,
      lat: location?.lat,
      lng: location?.lng,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from(TABLES.ALERTS)
      .insert([dataToInsert])
      .select()
      .single();

    if (error) throw error;

    // 반환할 때는 location 객체를 다시 생성
    return {
      ...data,
      location: data.lat && data.lng ? { lat: data.lat, lng: data.lng } : null,
    };
  } catch (error) {
    console.error("알림 생성 오류:", error);
    throw error;
  }
};

// 모든 알림 조회
export const getAlerts = async () => {
  if (!isSupabaseConnected()) {
    throw new Error(
      "Supabase가 설정되지 않았습니다. 오프라인 모드로 작동합니다."
    );
  }

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

    // lat, lng를 location 객체로 변환
    const alertsWithLocation = (data || []).map((alert) => ({
      ...alert,
      location:
        alert.lat && alert.lng ? { lat: alert.lat, lng: alert.lng } : null,
    }));

    return alertsWithLocation;
  } catch (error) {
    console.error("알림 조회 오류:", error);
    throw error;
  }
};

// 실시간 알림 구독
export const subscribeToAlerts = (callback) => {
  if (!isSupabaseConnected()) {
    console.warn(
      "Supabase가 설정되지 않았습니다. 실시간 구독이 비활성화됩니다."
    );
    return { unsubscribe: () => {} };
  }

  const subscription = supabase
    .channel("alerts_channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: TABLES.ALERTS },
      (payload) => {
        console.log("알림 변경:", payload);

        // 데이터에 location 객체 추가
        if (payload.new) {
          payload.new.location =
            payload.new.lat && payload.new.lng
              ? { lat: payload.new.lat, lng: payload.new.lng }
              : null;
        }

        callback(payload);
      }
    )
    .subscribe();

  return subscription;
};

// 댓글 추가
export const addComment = async (alertId, content, userName) => {
  if (!isSupabaseConnected()) {
    throw new Error(
      "Supabase가 설정되지 않았습니다. 댓글 기능을 사용할 수 없습니다."
    );
  }

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
  if (!isSupabaseConnected()) {
    throw new Error(
      "Supabase가 설정되지 않았습니다. 댓글을 불러올 수 없습니다."
    );
  }

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
    throw error;
  }
};

// 실시간 댓글 구독
export const subscribeToComments = (alertId, callback) => {
  if (!isSupabaseConnected()) {
    console.warn(
      "Supabase가 설정되지 않았습니다. 실시간 댓글 구독이 비활성화됩니다."
    );
    return { unsubscribe: () => {} };
  }

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
