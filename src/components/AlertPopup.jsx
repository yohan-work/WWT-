import React, { useState, useEffect } from "react";
import {
  X,
  Volume2,
  Car,
  AlertTriangle,
  Shield,
  MoreHorizontal,
  Clock,
  MapPin,
  MessageSquare,
  Send,
  User,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  getComments,
  addComment,
  subscribeToComments,
} from "../services/alertService";
import { isSupabaseConnected } from "../lib/supabase";

const AlertPopup = ({ alert, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState(
    localStorage.getItem("username") || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSupabaseOnline] = useState(isSupabaseConnected());

  useEffect(() => {
    if (!alert?.id || !isSupabaseOnline) return;

    // 댓글 불러오기
    loadComments();

    // 실시간 댓글 구독
    const subscription = subscribeToComments(alert.id, handleCommentChange);

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [alert?.id, isSupabaseOnline]);

  const loadComments = async () => {
    try {
      const commentsData = await getComments(alert.id);
      setComments(commentsData);
    } catch (error) {
      console.error("댓글 로드 실패:", error);
    }
  };

  const handleCommentChange = (payload) => {
    if (payload.eventType === "INSERT") {
      setComments((prev) => [...prev, payload.new]);
    } else if (payload.eventType === "DELETE") {
      setComments((prev) => prev.filter((c) => c.id !== payload.old.id));
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (
      !newComment.trim() ||
      !userName.trim() ||
      isSubmitting ||
      !isSupabaseOnline
    )
      return;

    setIsSubmitting(true);
    try {
      // 사용자명 저장
      localStorage.setItem("username", userName);

      await addComment(alert.id, newComment.trim(), userName.trim());
      setNewComment("");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      emergency: "text-red-500 bg-red-50 border-red-200",
      noise: "text-orange-500 bg-orange-50 border-orange-200",
      traffic: "text-yellow-600 bg-yellow-50 border-yellow-200",
      safety: "text-cyan-500 bg-cyan-50 border-cyan-200",
      other: "text-purple-500 bg-purple-50 border-purple-200",
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

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);

    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  };

  const Icon = getAlertIcon(alert.type);
  const colorClass = getAlertColor(alert.type);

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-full border-2 ${colorClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">{alert.title}</h2>
              <span className="text-sm text-gray-500">
                {getTypeLabel(alert.type)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* 스크롤 가능한 내용 영역 */}
        <div className="flex-1 overflow-y-auto">
          {/* 알림 내용 */}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                상세 내용
              </h3>
              <p className="text-gray-900 leading-relaxed">
                {alert.description}
              </p>
            </div>

            {/* 위치 및 시간 정보 */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                <span>
                  {alert.location
                    ? `${alert.location.lat.toFixed(
                        4
                      )}, ${alert.location.lng.toFixed(4)}`
                    : "위치 정보 없음"}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{getTimeAgo(alert.timestamp || alert.created_at)}</span>
              </div>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="border-t border-gray-100">
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="h-5 w-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">
                  댓글 {comments.length}개
                </h3>
                {isSupabaseOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-gray-400" />
                )}
              </div>

              {!isSupabaseOnline && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    💡 댓글 기능을 사용하려면 Supabase 설정이 필요합니다.
                  </p>
                </div>
              )}

              {/* 댓글 목록 */}
              <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-4">
                    {isSupabaseOnline
                      ? "첫 번째 댓글을 작성해보세요!"
                      : "댓글 기능이 비활성화되었습니다."}
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {comment.user_name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {getTimeAgo(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 댓글 작성 폼 */}
        {isSupabaseOnline && (
          <div className="border-t border-gray-100 p-4">
            <form onSubmit={handleSubmitComment} className="space-y-3">
              {/* 사용자명 입력 */}
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="닉네임"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                required
              />

              {/* 댓글 입력 */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="submit"
                  disabled={
                    !newComment.trim() || !userName.trim() || isSubmitting
                  }
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertPopup;
