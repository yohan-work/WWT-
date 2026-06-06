import React, { useState, useEffect } from "react";
import {
  MapPin,
  Plus,
  AlertTriangle,
  Bell,
  BellOff,
  Edit3,
  List,
  Zap,
} from "lucide-react";
import Map from "./components/Map";
import ReportModal from "./components/ReportModal";
import AlertPopup from "./components/AlertPopup";
import NearbySheet from "./components/NearbySheet";
import NotificationPanel from "./components/NotificationPanel";
import QuickReportModal from "./components/QuickReportModal";
import Footer from "./components/Footer";
import TermsOfService from "./components/TermsOfService";
import PrivacyPolicy from "./components/PrivacyPolicy";
import { useToast } from "./components/Toast";
import {
  getAlerts,
  createAlert,
  subscribeToAlerts,
  getDistanceMeters,
  getAlertLocation,
  getLocalNotifications,
  saveLocalNotification,
  markNotificationRead,
} from "./services/alertService";

function App() {
  const [alerts, setAlerts] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showQuickReportModal, setShowQuickReportModal] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showNearbyModal, setShowNearbyModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(getLocalNotifications);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem("notificationsEnabled") !== "false"
  );
  const [notificationRadius, setNotificationRadius] = useState(
    Number(localStorage.getItem("notificationRadius") || 1000)
  );
  const { showToast, ToastContainer } = useToast();

  // 법적 문서 모달 상태
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    // 위치 권한 요청
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("위치 정보를 가져올 수 없습니다:", error);
          // 기본 위치 (서울)
          setUserLocation({ lat: 37.5665, lng: 126.978 });
        }
      );
    }

    // 초기 알림 데이터 로드
    loadAlerts();

    // 실시간 알림 구독
    const subscription = subscribeToAlerts(handleAlertChange);

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const loadAlerts = async () => {
    try {
      const alertsData = await getAlerts();
      setAlerts(alertsData);
      setIsOnline(true);
    } catch (error) {
      console.error("알림 로드 실패:", error);
      setIsOnline(false);
      // 오프라인 모드: 로컬 스토리지에서 데이터 로드
      const savedAlerts = localStorage.getItem("neighborhoodAlerts");
      if (savedAlerts) {
        setAlerts(JSON.parse(savedAlerts));
      }
    }
  };

  const handleAlertChange = (payload) => {
    if (payload.eventType === "INSERT") {
      setAlerts((prev) => [payload.new, ...prev]);
      notifyNearbyAlert(payload.new);
    } else if (payload.eventType === "DELETE") {
      setAlerts((prev) => prev.filter((alert) => alert.id !== payload.old.id));
    } else if (payload.eventType === "UPDATE") {
      setAlerts((prev) =>
        prev.map((alert) => (alert.id === payload.new.id ? payload.new : alert))
      );
      if (payload.old?.status && payload.old.status !== payload.new?.status) {
        const nextNotifications = saveLocalNotification({
          alert_id: payload.new.id,
          type: "status_changed",
          title: "상황 상태 변경",
          message: `${payload.new.title} · ${getStatusLabel(payload.new.status)}`,
        });
        setNotifications(nextNotifications);
      }
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: "진행중",
      confirmed: "확인됨",
      resolved: "해결됨",
      needs_attention: "주의필요",
    };
    return labels[status] || "진행중";
  };

  const notifyNearbyAlert = (alert) => {
    if (!notificationsEnabled || !userLocation) return;

    const alertLocation = getAlertLocation(alert);
    const distance = getDistanceMeters(userLocation, alertLocation);

    if (distance <= notificationRadius) {
      const nextNotifications = saveLocalNotification({
        alert_id: alert.id,
        type: "nearby_alert",
        title: "내 주변 새 제보",
        message: alert.title,
      });

      setNotifications(nextNotifications);
      showToast(
        `반경 ${Math.round(notificationRadius / 1000)}km 안 새 제보: ${
          alert.title
        }`,
        alert.type === "emergency" || alert.type === "safety"
          ? "error"
          : "info",
        5000
      );
    }
  };

  const toggleNotifications = () => {
    const nextValue = !notificationsEnabled;
    setNotificationsEnabled(nextValue);
    localStorage.setItem("notificationsEnabled", String(nextValue));
  };

  const updateNotificationRadius = (radius) => {
    setNotificationRadius(radius);
    localStorage.setItem("notificationRadius", String(radius));
  };

  const getCreateAlertErrorMessage = (error) => {
    const message = error?.message || "";

    if (
      message.includes("author_key") ||
      message.includes("image_url") ||
      message.includes("status")
    ) {
      return "Supabase 테이블 컬럼이 현재 앱과 맞지 않습니다. supabase-app-setup.sql을 실행해주세요.";
    }
    if (message.includes("row-level security") || message.includes("policy")) {
      return "Supabase 권한 정책 때문에 저장할 수 없습니다. RLS 정책을 확인해주세요.";
    }
    if (message.includes("Supabase가 설정되지 않았습니다")) {
      return "Supabase 환경변수 또는 연결 설정을 확인해주세요.";
    }

    return "알림 생성에 실패했습니다. 다시 시도해주세요.";
  };

  const addAlert = async (alertData) => {
    try {
      const { imageUrl, ...restData } = alertData;
      const alertWithLocation = {
        ...restData,
        location: userLocation,
        image_url: imageUrl, // 데이터베이스 필드명에 맞게 변경
      };

      if (isOnline) {
        // 온라인: Supabase에 저장
        await createAlert(alertWithLocation);
      } else {
        // 오프라인: 로컬 스토리지에 저장
        const newAlert = {
          id: Date.now(),
          ...alertWithLocation,
          created_at: new Date().toISOString(),
        };

        const updatedAlerts = [newAlert, ...alerts];
        setAlerts(updatedAlerts);
        localStorage.setItem(
          "neighborhoodAlerts",
          JSON.stringify(updatedAlerts)
        );
      }

      setShowReportModal(false);
      setShowQuickReportModal(false);
      setShowCreateMenu(false);
    } catch (error) {
      console.error("알림 생성 실패:", error);
      window.alert(getCreateAlertErrorMessage(error));
    }
  };

  const handlePopupUpdate = (updatedAlert) => {
    if (updatedAlert?.id) {
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === updatedAlert.id ? { ...alert, ...updatedAlert } : alert
        )
      );
      setSelectedAlert((prev) => {
        if (Array.isArray(prev)) {
          return prev.map((alert) =>
            alert.id === updatedAlert.id ? { ...alert, ...updatedAlert } : alert
          );
        }
        return prev?.id === updatedAlert.id ? { ...prev, ...updatedAlert } : prev;
      });
      return;
    }

    loadAlerts();
  };

  const handleSelectNotification = (notification) => {
    setNotifications(markNotificationRead(notification.id));
    const alert = alerts.find((item) => item.id === notification.alert_id);
    if (alert) {
      setSelectedAlert(alert);
      setShowNotifications(false);
    }
  };

  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* 전체 화면 지도 */}
      <Map
        userLocation={userLocation}
        alerts={alerts}
        onMarkerClick={setSelectedAlert}
        className="h-full w-full"
      />

      {/* 상단 미니 헤더 */}
      <div className="fixed top-4 left-4 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg z-50">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-primary-600" />
          <span className="font-bold text-gray-900">동네 알림이</span>
          <div className="flex items-center space-x-1 text-sm text-gray-600 ml-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{alerts.length}</span>
          </div>
          {!isOnline && (
            <div className="flex items-center space-x-1 text-xs text-orange-500">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>오프라인</span>
            </div>
          )}
        </div>
      </div>

      {/* 반경 기반 알림 설정 */}
      <div className="fixed top-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-lg z-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotifications((value) => !value)}
            className={`relative p-2 rounded-full transition-colors ${
              notificationsEnabled
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
            title="알림함"
          >
            {notificationsEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
            {unreadNotificationCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[0.6rem] font-bold text-white">
                {unreadNotificationCount}
              </span>
            )}
          </button>
          <select
            value={notificationRadius}
            onChange={(e) => updateNotificationRadius(Number(e.target.value))}
            disabled={!notificationsEnabled}
            className="bg-transparent text-sm font-medium text-gray-700 outline-none disabled:text-gray-400"
            title="주변 알림 반경"
          >
            <option value={500}>500m</option>
            <option value={1000}>1km</option>
            <option value={3000}>3km</option>
          </select>
          <button
            onClick={toggleNotifications}
            className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
            title={notificationsEnabled ? "주변 알림 끄기" : "주변 알림 켜기"}
          >
            {notificationsEnabled ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {showNotifications && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onSelectNotification={handleSelectNotification}
          onMarkRead={(id) => setNotifications(markNotificationRead(id))}
        />
      )}

      {showNearbyModal && (
        <NearbySheet
          alerts={alerts}
          userLocation={userLocation}
          radius={notificationRadius}
          onSelectAlert={setSelectedAlert}
          onClose={() => setShowNearbyModal(false)}
        />
      )}

      {/* 플로팅 버튼 */}
      {!showNearbyModal && showCreateMenu && (
        <div
          className="fixed right-6 z-50 w-44 rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl"
          style={{
            bottom: "max(9rem, env(safe-area-inset-bottom) + 9rem)",
            right: "max(1.5rem, env(safe-area-inset-right))",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setShowQuickReportModal(true);
              setShowCreateMenu(false);
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
          >
            <Zap className="h-4 w-4 text-primary-600" />
            빠른 제보
          </button>
          <button
            type="button"
            onClick={() => {
              setShowReportModal(true);
              setShowCreateMenu(false);
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
          >
            <Edit3 className="h-4 w-4 text-gray-600" />
            상세 작성
          </button>
        </div>
      )}
      {!showNearbyModal && (
        <>
          <button
            onClick={() => setShowNearbyModal(true)}
            className="fixed right-6 bg-white text-gray-800 rounded-full p-4 shadow-2xl transition-all hover:scale-105 active:scale-95 z-50 touch-manipulation"
            style={{
              bottom: "max(9.5rem, env(safe-area-inset-bottom) + 9.5rem)",
              right: "max(1.5rem, env(safe-area-inset-right))",
            }}
            title="내 주변"
          >
            <List className="h-6 w-6" />
          </button>
          <button
            onClick={() => setShowCreateMenu((value) => !value)}
            className="fixed bottom-20 right-6 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white rounded-full p-4 shadow-2xl transition-all hover:scale-105 active:scale-95 z-50 touch-manipulation"
            style={{
              bottom: "max(5rem, env(safe-area-inset-bottom) + 5rem)",
              right: "max(1.5rem, env(safe-area-inset-right))",
            }}
          >
            <Plus className="h-6 w-6" />
          </button>
        </>
      )}

      {/* 푸터 */}
      <Footer
        onTermsClick={() => setShowTerms(true)}
        onPrivacyClick={() => setShowPrivacy(true)}
      />

      {/* 신고 모달 */}
      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          onSubmit={addAlert}
        />
      )}

      {showQuickReportModal && (
        <QuickReportModal
          userLocation={userLocation}
          onClose={() => setShowQuickReportModal(false)}
          onSubmit={addAlert}
        />
      )}

      {/* 알림 팝업 */}
      {selectedAlert && (
        <AlertPopup
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onUpdate={handlePopupUpdate}
        />
      )}

      {/* 이용약관 모달 */}
      {showTerms && <TermsOfService onClose={() => setShowTerms(false)} />}

      {/* 개인정보처리방침 모달 */}
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}

      <ToastContainer />
    </div>
  );
}

export default App;
