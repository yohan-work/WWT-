import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Car,
  Clock,
  MapPin,
  MoreHorizontal,
  Shield,
  Volume2,
  X,
} from "lucide-react";
import { getNearbyAlerts } from "../services/alertService";

const filters = [
  { id: "all", label: "전체" },
  { id: "emergency", label: "응급" },
  { id: "safety", label: "안전" },
  { id: "traffic", label: "교통" },
  { id: "noise", label: "소음" },
  { id: "other", label: "기타" },
];

const typeMeta = {
  emergency: {
    label: "응급상황",
    icon: AlertTriangle,
    className: "bg-red-50 text-red-600 border-red-100",
  },
  noise: {
    label: "소음",
    icon: Volume2,
    className: "bg-orange-50 text-orange-600 border-orange-100",
  },
  traffic: {
    label: "교통",
    icon: Car,
    className: "bg-yellow-50 text-yellow-700 border-yellow-100",
  },
  safety: {
    label: "안전",
    icon: Shield,
    className: "bg-cyan-50 text-cyan-700 border-cyan-100",
  },
  other: {
    label: "기타",
    icon: MoreHorizontal,
    className: "bg-purple-50 text-purple-600 border-purple-100",
  },
};

const statusMeta = {
  active: { label: "진행중", className: "bg-gray-100 text-gray-700" },
  confirmed: { label: "확인됨", className: "bg-emerald-100 text-emerald-700" },
  resolved: { label: "해결됨", className: "bg-blue-100 text-blue-700" },
  needs_attention: { label: "주의필요", className: "bg-rose-100 text-rose-700" },
};

const formatDistance = (meters) => {
  if (!Number.isFinite(meters)) return "거리 알 수 없음";
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

const getTimeAgo = (timestamp) => {
  const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);

  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
};

const NearbySheet = ({ alerts, userLocation, radius, onSelectAlert, onClose }) => {
  const [filter, setFilter] = useState("all");
  const [hideResolved, setHideResolved] = useState(true);

  const nearbyAlerts = useMemo(
    () =>
      getNearbyAlerts(alerts, userLocation, {
        category: filter,
        hideResolved,
        radius,
      }),
    [alerts, filter, hideResolved, radius, userLocation]
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-3 sm:items-center">
      <section className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <p className="text-base font-bold text-gray-900">내 주변</p>
            <p className="text-xs text-gray-500">
              {nearbyAlerts.length}개 상황 · 거리/시간순
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-t border-gray-100">
            <div className="flex gap-2 overflow-x-auto px-4 py-3">
              {filters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    filter === item.id
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setHideResolved((value) => !value)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  hideResolved
                    ? "bg-blue-50 text-blue-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                해결 제외
              </button>
            </div>

            <div className="max-h-[60vh] space-y-2 overflow-y-auto px-3 pb-4">
              {nearbyAlerts.length === 0 ? (
                <div className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                  반경 안에 표시할 상황이 없습니다.
                </div>
              ) : (
                nearbyAlerts.map((alert) => {
                  const meta = typeMeta[alert.type] || typeMeta.other;
                  const Icon = meta.icon;
                  const status = statusMeta[alert.status || "active"];

                  return (
                    <button
                      key={alert.id}
                      type="button"
                      onClick={() => {
                        onSelectAlert(alert);
                        onClose();
                      }}
                      className={`w-full rounded-xl border bg-white p-3 text-left shadow-sm transition active:scale-[0.99] ${
                        alert.status === "resolved"
                          ? "border-blue-100 opacity-70"
                          : "border-gray-100"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${meta.className}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                              {alert.title}
                            </p>
                            <span
                              className={`shrink-0 rounded-full px-2 py-1 text-[0.65rem] font-semibold ${
                                status?.className || statusMeta.active.className
                              }`}
                            >
                              {status?.label || statusMeta.active.label}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {formatDistance(alert.distanceMeters)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getTimeAgo(alert.created_at || alert.timestamp)}
                            </span>
                            <span>{meta.label}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
      </section>
    </div>
  );
};

export default NearbySheet;
