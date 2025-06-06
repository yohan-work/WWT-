import React, { useEffect, useRef } from "react";

const Map = ({ userLocation, alerts, onMarkerClick, className }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // 카카오맵 API 키 (환경변수에서 가져오기)
  const KAKAO_API_KEY =
    import.meta.env.VITE_KAKAO_MAP_API_KEY || "YOUR_KAKAO_API_KEY_HERE";

  useEffect(() => {
    if (!userLocation) return;

    const loadKakaoMapScript = () => {
      return new Promise((resolve, reject) => {
        // 이미 로드된 경우
        if (window.kakao && window.kakao.maps) {
          resolve();
          return;
        }

        // 스크립트가 이미 있는지 확인
        const existingScript = document.getElementById("kakao-map-script");
        if (existingScript) {
          existingScript.onload = resolve;
          existingScript.onerror = reject;
          return;
        }

        // 카카오맵 스크립트 동적 로드
        const script = document.createElement("script");
        script.id = "kakao-map-script";
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&autoload=false`;
        script.onload = () => {
          window.kakao.maps.load(resolve);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initMap = () => {
      try {
        // 카카오맵 API 키가 설정되지 않은 경우
        if (KAKAO_API_KEY === "YOUR_KAKAO_API_KEY_HERE") {
          if (mapRef.current) {
            mapRef.current.innerHTML = `
              <div class="w-full h-full bg-gray-200 flex flex-col items-center justify-center text-gray-600">
                <div class="text-center mb-8">
                  <div class="text-4xl mb-4">🗺️</div>
                  <div class="text-lg font-medium mb-2">지도 영역 (테스트 모드)</div>
                  <div class="text-sm">위치: ${userLocation.lat.toFixed(
                    4
                  )}, ${userLocation.lng.toFixed(4)}</div>
                  <div class="text-sm mt-1">알림 ${alerts.length}개</div>
                  <div class="text-xs mt-2 text-blue-500">카카오맵 API 키를 설정하면 실제 지도가 표시됩니다</div>
                </div>
                ${
                  alerts.length > 0
                    ? `
                  <div class="grid grid-cols-2 gap-3 max-w-md">
                    ${alerts
                      .slice(-4)
                      .map(
                        (alert) => `
                      <div class="bg-white rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow" 
                           onclick="window.handleMarkerClick && window.handleMarkerClick(${
                             alert.id
                           })">
                        <div class="text-xs font-medium text-gray-900 truncate">${
                          alert.title
                        }</div>
                        <div class="text-xs text-gray-500 mt-1">${getTypeLabel(
                          alert.type
                        )}</div>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                `
                    : ""
                }
              </div>
            `;

            // 임시 마커 클릭 핸들러 설정
            window.handleMarkerClick = (alertId) => {
              const alert = alerts.find((a) => a.id === alertId);
              if (alert && onMarkerClick) {
                onMarkerClick(alert);
              }
            };
          }
          return;
        }

        // 카카오맵 컨테이너와 옵션
        const container = mapRef.current;
        const options = {
          center: new window.kakao.maps.LatLng(
            userLocation.lat,
            userLocation.lng
          ),
          level: 3, // 확대/축소 레벨
        };

        // 지도 생성
        const map = new window.kakao.maps.Map(container, options);
        mapInstanceRef.current = map;

        // 사용자 위치 마커
        const userMarkerPosition = new window.kakao.maps.LatLng(
          userLocation.lat,
          userLocation.lng
        );
        const userMarker = new window.kakao.maps.Marker({
          position: userMarkerPosition,
          image: new window.kakao.maps.MarkerImage(
            "data:image/svg+xml;base64," +
              btoa(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="white" stroke-width="2"/>
              </svg>
            `),
            new window.kakao.maps.Size(24, 24),
            {
              offset: new window.kakao.maps.Point(12, 12),
            }
          ),
        });
        userMarker.setMap(map);

        // 알림 마커들 업데이트
        updateAlertMarkers(map);
      } catch (error) {
        console.error("지도 초기화 중 오류:", error);
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
              <div class="text-center">
                <div class="text-2xl mb-2">📍</div>
                <div class="text-sm">지도를 불러올 수 없습니다</div>
                <div class="text-xs mt-1">카카오맵 API 오류: ${error.message}</div>
              </div>
            </div>
          `;
        }
      }
    };

    // 카카오맵 스크립트 로드 후 지도 초기화
    loadKakaoMapScript()
      .then(initMap)
      .catch((error) => {
        console.error("카카오맵 스크립트 로드 실패:", error);
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
              <div class="text-center">
                <div class="text-2xl mb-2">🚫</div>
                <div class="text-sm">카카오맵을 불러올 수 없습니다</div>
                <div class="text-xs mt-1">네트워크 연결을 확인해주세요</div>
              </div>
            </div>
          `;
        }
      });
  }, [userLocation, KAKAO_API_KEY]);

  useEffect(() => {
    if (mapInstanceRef.current && window.kakao && window.kakao.maps) {
      updateAlertMarkers(mapInstanceRef.current);
    }
  }, [alerts]);

  const updateAlertMarkers = (map) => {
    // 기존 마커들 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 새 알림 마커들 생성
    alerts.forEach((alert) => {
      if (alert.location && window.kakao && window.kakao.maps) {
        const position = new window.kakao.maps.LatLng(
          alert.location.lat,
          alert.location.lng
        );

        // 마커 이미지 생성 (타입별 색상)
        const markerColor = getAlertColor(alert.type);
        const markerImage = new window.kakao.maps.MarkerImage(
          "data:image/svg+xml;base64," +
            btoa(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="${markerColor}" stroke="white" stroke-width="2"/>
              <circle cx="16" cy="16" r="6" fill="white" fill-opacity="0.8"/>
            </svg>
          `),
          new window.kakao.maps.Size(32, 32),
          {
            offset: new window.kakao.maps.Point(16, 16),
          }
        );

        const marker = new window.kakao.maps.Marker({
          position: position,
          image: markerImage,
        });

        marker.setMap(map);

        // 마커 클릭 이벤트
        window.kakao.maps.event.addListener(marker, "click", () => {
          if (onMarkerClick) {
            onMarkerClick(alert);
          }
        });

        markersRef.current.push(marker);
      }
    });
  };

  const getAlertColor = (type) => {
    const colors = {
      emergency: "#ef4444",
      noise: "#f97316",
      traffic: "#eab308",
      safety: "#06b6d4",
      other: "#8b5cf6",
    };
    return colors[type] || colors.other;
  };

  const getTypeLabel = (type) => {
    const labels = {
      emergency: "응급상황",
      noise: "소음",
      traffic: "교통",
      safety: "안전",
      other: "기타",
    };
    return labels[type] || "기타";
  };

  return <div ref={mapRef} className={className} />;
};

export default Map;
