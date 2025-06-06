import React, { useState, useEffect } from "react";
import {
  MapPin,
  Plus,
  AlertTriangle,
  Volume2,
  Users,
  MessageSquare,
} from "lucide-react";
import Map from "./components/Map";
import ReportModal from "./components/ReportModal";
import AlertPopup from "./components/AlertPopup";
import {
  getAlerts,
  createAlert,
  subscribeToAlerts,
} from "./services/alertService";

function App() {
  const [alerts, setAlerts] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

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
    } else if (payload.eventType === "DELETE") {
      setAlerts((prev) => prev.filter((alert) => alert.id !== payload.old.id));
    } else if (payload.eventType === "UPDATE") {
      setAlerts((prev) =>
        prev.map((alert) => (alert.id === payload.new.id ? payload.new : alert))
      );
    }
  };

  const addAlert = async (alertData) => {
    try {
      const alertWithLocation = {
        ...alertData,
        location: userLocation,
        lat: userLocation?.lat,
        lng: userLocation?.lng,
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
    } catch (error) {
      console.error("알림 생성 실패:", error);
      alert("알림 생성에 실패했습니다. 다시 시도해주세요.");
    }
  };

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
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg z-10">
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

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setShowReportModal(true)}
        className="absolute bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-105 z-10"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* 신고 모달 */}
      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          onSubmit={addAlert}
        />
      )}

      {/* 알림 팝업 */}
      {selectedAlert && (
        <AlertPopup
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </div>
  );
}

export default App;
