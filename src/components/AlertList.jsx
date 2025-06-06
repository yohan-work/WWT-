import React from "react";
import {
  Volume2,
  Car,
  AlertTriangle,
  Shield,
  MoreHorizontal,
  Clock,
} from "lucide-react";

const AlertList = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">🔍</div>
          <div className="text-sm">주변에 신고된 상황이 없습니다</div>
        </div>
      </div>
    );
  }

  const getAlertIcon = (type) => {
    const icons = {
      emergency: AlertTriangle,
      noise: Volume2,
      traffic: Car,
      safety: Shield,
      other: MoreHorizontal,
    };
    return icons[type] || icons.other;
  };

  const getAlertColor = (type) => {
    const colors = {
      emergency: "text-red-500 bg-red-50",
      noise: "text-orange-500 bg-orange-50",
      traffic: "text-yellow-600 bg-yellow-50",
      safety: "text-cyan-500 bg-cyan-50",
      other: "text-purple-500 bg-purple-50",
    };
    return colors[type] || colors.other;
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);

    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">최근 알림</h3>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {alerts.map((alert) => {
          const Icon = getAlertIcon(alert.type);
          const colorClass = getAlertColor(alert.type);

          return (
            <div
              key={alert.id}
              className="p-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {alert.title}
                    </h4>
                    <div className="flex items-center text-gray-400 text-xs ml-2">
                      <Clock className="h-3 w-3 mr-1" />
                      {getTimeAgo(alert.timestamp)}
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                    {alert.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertList;
