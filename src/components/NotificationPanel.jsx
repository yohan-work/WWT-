import React from "react";
import { Bell, CheckCircle, Clock, X } from "lucide-react";

const getTimeAgo = (timestamp) => {
  const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);

  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
};

const NotificationPanel = ({
  notifications,
  onClose,
  onSelectNotification,
  onMarkRead,
}) => {
  return (
    <div className="fixed right-3 top-16 z-50 w-[min(calc(100vw-1.5rem),22rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-gray-700" />
          <h2 className="text-sm font-bold text-gray-900">알림함</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-3">
        {notifications.length === 0 ? (
          <div className="rounded-xl bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
            아직 알림이 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => onSelectNotification(notification)}
                className={`w-full rounded-xl border p-3 text-left transition-colors ${
                  notification.read
                    ? "border-gray-100 bg-white"
                    : "border-blue-100 bg-blue-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                      {notification.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                      {notification.message}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {getTimeAgo(notification.created_at)}
                    </span>
                  </div>
                  {!notification.read && (
                    <span
                      className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500"
                      aria-label="읽지 않음"
                    />
                  )}
                </div>
                {!notification.read && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      onMarkRead(notification.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        onMarkRead(notification.id);
                      }
                    }}
                    className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-medium text-blue-700"
                  >
                    <CheckCircle className="h-3 w-3" />
                    읽음
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
