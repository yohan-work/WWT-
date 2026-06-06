import { supabase, TABLES, isSupabaseConnected } from "../lib/supabase";

// 고유 키 생성 함수 (비회원 인증용)
const generateAuthorKey = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const getGuestKey = () => {
  const existingKey = localStorage.getItem("guestKey");
  if (existingKey) return existingKey;

  const guestKey = `guest_${generateAuthorKey()}`;
  localStorage.setItem("guestKey", guestKey);
  return guestKey;
};

const normalizeVerificationCounts = (verifications = []) => {
  return verifications.reduce(
    (counts, item) => {
      if (item.type === "confirm") counts.confirm += 1;
      if (item.type === "dispute") counts.dispute += 1;
      if (item.type === "evidence") counts.evidence += 1;
      return counts;
    },
    { confirm: 0, dispute: 0, evidence: 0 }
  );
};

export const getLocalGuestKey = () => getGuestKey();

export const getDistanceMeters = (from, to) => {
  if (!from || !to) return Infinity;

  const earthRadiusMeters = 6371000;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const deltaLat = ((to.lat - from.lat) * Math.PI) / 180;
  const deltaLng = ((to.lng - from.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMeters * c;
};

export const getAlertLocation = (alert) => {
  return (
    alert?.location ||
    (alert?.lat && alert?.lng ? { lat: alert.lat, lng: alert.lng } : null)
  );
};

export const getNearbyAlerts = (
  alerts,
  userLocation,
  { category = "all", hideResolved = true, radius = 3000 } = {}
) => {
  return (alerts || [])
    .map((alert) => ({
      ...alert,
      distanceMeters: getDistanceMeters(userLocation, getAlertLocation(alert)),
    }))
    .filter((alert) => alert.distanceMeters <= radius)
    .filter((alert) => category === "all" || alert.type === category)
    .filter((alert) => !hideResolved || alert.status !== "resolved")
    .sort((a, b) => {
      const priority = { emergency: 0, safety: 1, traffic: 2, noise: 3, other: 4 };
      const aTime = new Date(a.created_at || a.timestamp || 0).getTime();
      const bTime = new Date(b.created_at || b.timestamp || 0).getTime();
      const aScore =
        a.distanceMeters / 20 +
        (Date.now() - aTime) / 60000 +
        (priority[a.type] || 4) * 30;
      const bScore =
        b.distanceMeters / 20 +
        (Date.now() - bTime) / 60000 +
        (priority[b.type] || 4) * 30;

      return aScore - bScore;
    });
};

export const createQuickAlertPayload = ({ type, note, imageUrl, location }) => {
  const labels = {
    emergency: "응급상황",
    noise: "소음",
    traffic: "교통",
    safety: "안전",
    other: "기타",
  };
  const label = labels[type] || "상황";

  return {
    type,
    title: `${label} 제보`,
    description: note?.trim() || "현장에서 빠르게 공유된 상황입니다.",
    imageUrl,
    location,
  };
};

const LOCAL_NOTIFICATIONS_KEY = "localNotifications";

export const getLocalNotifications = () => {
  return JSON.parse(localStorage.getItem(LOCAL_NOTIFICATIONS_KEY) || "[]");
};

export const saveLocalNotification = (notification) => {
  const notifications = getLocalNotifications();
  const nextNotification = {
    id: notification.id || `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    read: false,
    created_at: new Date().toISOString(),
    ...notification,
  };
  const nextNotifications = [nextNotification, ...notifications].slice(0, 50);

  localStorage.setItem(
    LOCAL_NOTIFICATIONS_KEY,
    JSON.stringify(nextNotifications)
  );

  return nextNotifications;
};

export const markNotificationRead = (notificationId) => {
  const nextNotifications = getLocalNotifications().map((notification) =>
    notification.id === notificationId
      ? { ...notification, read: true }
      : notification
  );

  localStorage.setItem(
    LOCAL_NOTIFICATIONS_KEY,
    JSON.stringify(nextNotifications)
  );

  return nextNotifications;
};

// 이미지 압축 함수
const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // 비율 유지하면서 최대 너비로 리사이즈
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // 이미지 그리기
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Blob으로 변환
      canvas.toBlob(resolve, "image/jpeg", quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

// 이미지 업로드 함수
export const uploadImage = async (file) => {
  if (!isSupabaseConnected()) {
    throw new Error(
      "Supabase가 설정되지 않았습니다. 이미지 업로드를 사용할 수 없습니다."
    );
  }

  try {
    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("파일 크기는 5MB 이하여야 합니다.");
    }

    // 이미지 파일인지 확인
    if (!file.type.startsWith("image/")) {
      throw new Error("이미지 파일만 업로드 가능합니다.");
    }

    // 이미지 압축
    const compressedFile = await compressImage(file);

    // 고유 파일명 생성
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `alerts/${fileName}`;

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from("images")
      .upload(filePath, compressedFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    // 공개 URL 가져오기
    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("이미지 업로드 오류:", error);
    throw error;
  }
};

// 이미지 삭제 함수
export const deleteImage = async (imageUrl) => {
  if (!isSupabaseConnected() || !imageUrl) return;

  try {
    // URL에서 파일 경로 추출
    const url = new URL(imageUrl);
    const pathSegments = url.pathname.split("/");
    const filePath = pathSegments.slice(-2).join("/"); // alerts/filename.jpg

    const { error } = await supabase.storage.from("images").remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error("이미지 삭제 오류:", error);
    // 이미지 삭제 실패는 중요하지 않으므로 에러를 던지지 않음
  }
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
      status: restData.status || "active",
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

export const updateAlertStatus = async (alertId, status) => {
  if (!isSupabaseConnected()) {
    throw new Error(
      "Supabase가 설정되지 않았습니다. 오프라인 모드로 작동합니다."
    );
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.ALERTS)
      .update({
        status,
        resolved_at: status === "resolved" ? new Date().toISOString() : null,
      })
      .eq("id", alertId)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      location: data.lat && data.lng ? { lat: data.lat, lng: data.lng } : null,
    };
  } catch (error) {
    console.error("상태 변경 오류:", error);
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
    // 먼저 알림 데이터 조회 (이미지 URL 확인용)
    const { data: alertData, error: fetchError } = await supabase
      .from(TABLES.ALERTS)
      .select("image_url")
      .eq("id", alertId)
      .eq("author_key", authorKey)
      .single();

    if (fetchError) throw fetchError;
    if (!alertData) throw new Error("권한이 없거나 게시글을 찾을 수 없습니다.");

    // 이미지가 있다면 삭제
    if (alertData.image_url) {
      await deleteImage(alertData.image_url);
    }

    // 알림 삭제
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

export const getAlertVerifications = async (alertId) => {
  if (!isSupabaseConnected()) {
    throw new Error("Supabase가 설정되지 않았습니다.");
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.ALERT_VERIFICATIONS)
      .select("*")
      .eq("alert_id", alertId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const guestKey = getGuestKey();
    const items = data || [];

    return {
      items,
      counts: normalizeVerificationCounts(items),
      myTypes: items
        .filter((item) => item.guest_key === guestKey)
        .map((item) => item.type),
    };
  } catch (error) {
    console.error("검증 정보 조회 오류:", error);
    throw error;
  }
};

export const addAlertVerification = async (alertId, type, note = "") => {
  if (!isSupabaseConnected()) {
    throw new Error("Supabase가 설정되지 않았습니다.");
  }

  try {
    const guestKey = getGuestKey();
    const { data: existing, error: selectError } = await supabase
      .from(TABLES.ALERT_VERIFICATIONS)
      .select("*")
      .eq("alert_id", alertId)
      .eq("guest_key", guestKey)
      .eq("type", type)
      .maybeSingle();

    if (selectError) throw selectError;
    if (existing) {
      const { error: deleteError } = await supabase
        .from(TABLES.ALERT_VERIFICATIONS)
        .delete()
        .eq("id", existing.id);

      if (deleteError) throw deleteError;
      return { ...existing, removed: true };
    }

    const { data, error } = await supabase
      .from(TABLES.ALERT_VERIFICATIONS)
      .insert([
        {
          alert_id: alertId,
          guest_key: guestKey,
          type,
          note,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("검증 등록 오류:", error);
    throw error;
  }
};

export const subscribeToAlertVerifications = (alertId, callback) => {
  if (!isSupabaseConnected()) {
    console.warn("Supabase가 설정되지 않았습니다. 검증 구독이 비활성화됩니다.");
    return { unsubscribe: () => {} };
  }

  return supabase
    .channel(`alert_verifications_${alertId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: TABLES.ALERT_VERIFICATIONS,
        filter: `alert_id=eq.${alertId}`,
      },
      callback
    )
    .subscribe();
};

export const getOrCreateAlertChatRoom = async (alertItem) => {
  if (!isSupabaseConnected()) {
    throw new Error("Supabase가 설정되지 않았습니다.");
  }

  try {
    const { data: existingRoom, error: selectError } = await supabase
      .from(TABLES.CHAT_ROOMS)
      .select("*")
      .eq("type", "alert")
      .eq("alert_id", alertItem.id)
      .maybeSingle();

    if (selectError) throw selectError;
    if (existingRoom) return existingRoom;

    const { data, error } = await supabase
      .from(TABLES.CHAT_ROOMS)
      .insert([
        {
          type: "alert",
          alert_id: alertItem.id,
          center_lat: alertItem.location?.lat || alertItem.lat || null,
          center_lng: alertItem.location?.lng || alertItem.lng || null,
          radius_m: 500,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("채팅방 생성/조회 오류:", error);
    throw error;
  }
};

export const getChatMessages = async (roomId) => {
  if (!isSupabaseConnected()) {
    throw new Error("Supabase가 설정되지 않았습니다.");
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.CHAT_MESSAGES)
      .select("*")
      .eq("room_id", roomId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("채팅 메시지 조회 오류:", error);
    throw error;
  }
};

export const addChatMessage = async (roomId, content, userName) => {
  if (!isSupabaseConnected()) {
    throw new Error("Supabase가 설정되지 않았습니다.");
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.CHAT_MESSAGES)
      .insert([
        {
          room_id: roomId,
          guest_key: getGuestKey(),
          user_name: userName,
          content,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("채팅 메시지 작성 오류:", error);
    throw error;
  }
};

export const subscribeToChatMessages = (roomId, callback) => {
  if (!isSupabaseConnected()) {
    console.warn("Supabase가 설정되지 않았습니다. 채팅 구독이 비활성화됩니다.");
    return { unsubscribe: () => {} };
  }

  return supabase
    .channel(`chat_messages_${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: TABLES.CHAT_MESSAGES,
        filter: `room_id=eq.${roomId}`,
      },
      callback
    )
    .subscribe();
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
