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
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  Key,
} from "lucide-react";
import {
  getComments,
  addComment,
  subscribeToComments,
  deleteAlert,
  updateAlert,
  checkAuthorPermission,
} from "../services/alertService";
import { isSupabaseConnected } from "../lib/supabase";

const AlertPopup = ({ alert, onClose, onUpdate }) => {
  // alert가 배열인지 단일 객체인지 확인
  const isMultipleAlerts = Array.isArray(alert);
  const alerts = isMultipleAlerts ? alert : [alert];
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentAlert = alerts[currentIndex];

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState(
    localStorage.getItem("username") || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSupabaseOnline] = useState(isSupabaseConnected());

  // 수정/삭제 관련 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    type: "other",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 현재 사용자의 권한 확인
  const hasAuthorPermission = checkAuthorPermission(currentAlert.id);

  useEffect(() => {
    if (!currentAlert?.id || !isSupabaseOnline) return;

    // 댓글 불러오기
    loadComments();

    // 실시간 댓글 구독
    const subscription = subscribeToComments(
      currentAlert.id,
      handleCommentChange
    );

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [currentAlert?.id, isSupabaseOnline]);

  // 슬라이드 변경 시 댓글도 다시 로드
  useEffect(() => {
    if (currentAlert?.id && isSupabaseOnline) {
      loadComments();
    }
  }, [currentIndex]);

  const loadComments = async () => {
    try {
      const commentsData = await getComments(currentAlert.id);
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

      await addComment(currentAlert.id, newComment.trim(), userName.trim());
      setNewComment("");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      window.alert("댓글 작성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!hasAuthorPermission) return;

    setIsDeleting(true);
    try {
      await deleteAlert(currentAlert.id, hasAuthorPermission);
      window.alert("게시글이 삭제되었습니다.");
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error("삭제 실패:", error);
      window.alert("삭제에 실패했습니다. " + error.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // 수정 핸들러
  const handleEdit = async (e) => {
    e.preventDefault();
    if (!hasAuthorPermission) return;

    setIsEditing(true);
    try {
      await updateAlert(currentAlert.id, editForm, hasAuthorPermission);
      window.alert("게시글이 수정되었습니다.");
      if (onUpdate) onUpdate();
      setShowEditModal(false);
    } catch (error) {
      console.error("수정 실패:", error);
      window.alert("수정에 실패했습니다. " + error.message);
    } finally {
      setIsEditing(false);
    }
  };

  // 수정 모달 열기
  const openEditModal = () => {
    setEditForm({
      title: currentAlert.title,
      description: currentAlert.description,
      type: currentAlert.type,
    });
    setShowEditModal(true);
  };

  // 슬라이드 네비게이션
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : alerts.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < alerts.length - 1 ? prev + 1 : 0));
  };

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 터치/스와이프 네비게이션
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !isMultipleAlerts) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
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

  const Icon = getAlertIcon(currentAlert.type);
  const colorClass = getAlertColor(currentAlert.type);

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 슬라이드 네비게이션 버튼 - 여러 알림이 있을 때만 표시 */}
        {isMultipleAlerts && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </>
        )}

        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-full border-2 ${colorClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">
                {currentAlert.title}
              </h2>
              <span className="text-sm text-gray-500 flex items-center space-x-2">
                <span>{getTypeLabel(currentAlert.type)}</span>
                {hasAuthorPermission && (
                  <span className="flex items-center space-x-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    <Key className="h-3 w-3" />
                    <span>내가 작성</span>
                  </span>
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* 수정/삭제 버튼 - 작성자만 표시 */}
            {hasAuthorPermission && isSupabaseOnline && (
              <div className="flex items-center space-x-1 mr-2">
                <button
                  onClick={openEditModal}
                  className="p-2 hover:bg-blue-50 text-blue-600 rounded-full transition-colors"
                  title="수정"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors"
                  title="삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
            {/* 슬라이드 인디케이터 - 여러 알림이 있을 때만 표시 */}
            {isMultipleAlerts && (
              <div className="flex items-center space-x-1 mr-4">
                <span className="text-xs text-gray-500">
                  {currentIndex + 1}/{alerts.length}
                </span>
                <div className="flex space-x-1">
                  {alerts.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentIndex ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* 스크롤 가능한 내용 영역 */}
        <div className="flex-1 overflow-y-auto transition-all duration-300 ease-in-out">
          {/* 알림 내용 */}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                상세 내용
              </h3>
              <p className="text-gray-900 leading-relaxed">
                {currentAlert.description}
              </p>
            </div>

            {/* 위치 및 시간 정보 */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                <span>
                  {currentAlert.location
                    ? `${currentAlert.location.lat.toFixed(
                        4
                      )}, ${currentAlert.location.lng.toFixed(4)}`
                    : "위치 정보 없음"}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>
                  {getTimeAgo(
                    currentAlert.timestamp || currentAlert.created_at
                  )}
                </span>
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

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">게시글 삭제</h3>
                <p className="text-sm text-gray-500">
                  이 작업은 되돌릴 수 없습니다.
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              정말로 이 게시글을 삭제하시겠습니까?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isDeleting}
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-300"
                disabled={isDeleting}
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Edit3 className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">게시글 수정</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isEditing}
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                  disabled={isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리
                </label>
                <select
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm({ ...editForm, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={isEditing}
                >
                  <option value="emergency">응급상황</option>
                  <option value="noise">소음</option>
                  <option value="traffic">교통</option>
                  <option value="safety">안전</option>
                  <option value="other">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상세 내용
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  required
                  disabled={isEditing}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isEditing}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                  disabled={isEditing}
                >
                  {isEditing ? "수정 중..." : "수정"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertPopup;
