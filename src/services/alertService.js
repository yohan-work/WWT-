import { supabase, TABLES, isSupabaseConnected } from "../lib/supabase";

// 고유 키 생성 함수 (비회원 인증용)
const generateAuthorKey = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 알림 생성
export const createAlert = async (alertData) => {
  if (!isSupabaseConnected()) {
    throw new Error(
      "Supabase가 설정되지 않았습니다. 오프라인 모드로 작동합니다."
    );
  }

  try {
    // 고유 키 생성
    const authorKey = generateAuthorKey();

    // location 객체를 lat, lng로 분리
    const { location, ...restData } = alertData;
    const dataToInsert = {
      ...restData,
      lat: location?.lat,
      lng: location?.lng,
      author_key: authorKey,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from(TABLES.ALERTS)
      .insert([dataToInsert])
      .select()
      .single();

    if (error) throw error;

    // 반환할 때는 location 객체를 다시 생성하고 author_key도 포함
    const result = {
      ...data,
      location: data.lat && data.lng ? { lat: data.lat, lng: data.lng } : null,
    };

    // 작성자 키를 로컬 스토리지에 저장
    const authorKeys = JSON.parse(localStorage.getItem("authorKeys") || "{}");
    authorKeys[data.id] = authorKey;
    localStorage.setItem("authorKeys", JSON.stringify(authorKeys));

    return result;
  } catch (error) {
    console.error("알림 생성 오류:", error);
    throw error;
  }
};

// 알림 수정
export const updateAlert = async (alertId, alertData, authorKey) => {
  if (!isSupabaseConnected()) {
    throw new Error(
      "Supabase가 설정되지 않았습니다. 오프라인 모드로 작동합니다."
    );
  }

  try {
    // location 객체를 lat, lng로 분리
    const { location, ...restData } = alertData;
    const dataToUpdate = {
      ...restData,
      lat: location?.lat,
      lng: location?.lng,
    };

    const { data, error } = await supabase
      .from(TABLES.ALERTS)
      .update(dataToUpdate)
      .eq("id", alertId)
      .eq("author_key", authorKey)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("권한이 없거나 게시글을 찾을 수 없습니다.");

    // 반환할 때는 location 객체를 다시 생성
    return {
      ...data,
      location: data.lat && data.lng ? { lat: data.lat, lng: data.lng } : null,
    };
  } catch (error) {
    console.error("알림 수정 오류:", error);
    throw error;
  }
};

// 알림 삭제
export const deleteAlert = async (alertId, authorKey) => {
  if (!isSupabaseConnected()) {
    throw new Error(
      "Supabase가 설정되지 않았습니다. 오프라인 모드로 작동합니다."
    );
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.ALERTS)
      .delete()
      .eq("id", alertId)
      .eq("author_key", authorKey)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("권한이 없거나 게시글을 찾을 수 없습니다.");

    // 로컬 스토리지에서 author key 제거
    const authorKeys = JSON.parse(localStorage.getItem("authorKeys") || "{}");
    delete authorKeys[alertId];
    localStorage.setItem("authorKeys", JSON.stringify(authorKeys));

    return data;
  } catch (error) {
    console.error("알림 삭제 오류:", error);
    throw error;
  }
};

// 작성자 권한 확인
export const checkAuthorPermission = (alertId) => {
  const authorKeys = JSON.parse(localStorage.getItem("authorKeys") || "{}");
  return authorKeys[alertId] || null;
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
