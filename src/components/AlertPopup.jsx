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
  Send,
  User,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  Key,
  CheckCircle,
  Flag,
  ImagePlus,
  Radio,
} from "lucide-react";
import {
  deleteAlert,
  updateAlert,
  checkAuthorPermission,
  updateAlertStatus,
  getAlertVerifications,
  addAlertVerification,
  subscribeToAlertVerifications,
  getOrCreateAlertChatRoom,
  getChatMessages,
  addChatMessage,
  subscribeToChatMessages,
} from "../services/alertService";
import { isSupabaseConnected } from "../lib/supabase";

const AlertPopup = ({ alert, onClose, onUpdate }) => {
  // alert가 배열인지 단일 객체인지 확인
  const isMultipleAlerts = Array.isArray(alert);
  const alerts = isMultipleAlerts ? alert : [alert];
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentAlert = alerts[currentIndex];

  const [chatRoom, setChatRoom] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [verificationState, setVerificationState] = useState({
    counts: { confirm: 0, dispute: 0, evidence: 0 },
    myTypes: [],
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [userName, setUserName] = useState(
    localStorage.getItem("username") || ""
  );
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
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // 현재 사용자의 권한 확인
  const hasAuthorPermission = checkAuthorPermission(currentAlert.id);

  useEffect(() => {
    if (!currentAlert?.id || !isSupabaseOnline) return;

    loadVerifications();
    loadChatRoom();

    const verificationSubscription = subscribeToAlertVerifications(
      currentAlert.id,
      loadVerifications
    );

    return () => {
      if (verificationSubscription) {
        verificationSubscription.unsubscribe();
      }
    };
  }, [currentAlert?.id, isSupabaseOnline]);

  // 슬라이드 변경 시 검증과 현장 대화도 다시 로드
  useEffect(() => {
    if (currentAlert?.id && isSupabaseOnline) {
      loadVerifications();
      loadChatRoom();
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!chatRoom?.id || !isSupabaseOnline) return;

    loadChatMessages(chatRoom.id);
    const subscription = subscribeToChatMessages(
      chatRoom.id,
      handleChatMessageChange
    );

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [chatRoom?.id, isSupabaseOnline]);

  const loadVerifications = async () => {
    try {
      const data = await getAlertVerifications(currentAlert.id);
      setVerificationState(data);
    } catch (error) {
      console.error("검증 정보 로드 실패:", error);
    }
  };

  const loadChatRoom = async () => {
    try {
      const room = await getOrCreateAlertChatRoom(currentAlert);
      setChatRoom(room);
    } catch (error) {
      console.error("채팅방 로드 실패:", error);
      setChatRoom(null);
      setChatMessages([]);
    }
  };

  const loadChatMessages = async (roomId) => {
    try {
      const messages = await getChatMessages(roomId);
      setChatMessages(messages);
    } catch (error) {
      console.error("채팅 메시지 로드 실패:", error);
    }
  };

  const handleChatMessageChange = (payload) => {
    if (payload.eventType === "INSERT") {
      setChatMessages((prev) => [...prev, payload.new]);
    } else if (payload.eventType === "DELETE" || payload.eventType === "UPDATE") {
      loadChatMessages(chatRoom.id);
    }
  };

  const handleVerification = async (type) => {
    if (!isSupabaseOnline || isVerifying) return;

    setIsVerifying(true);
    try {
      await addAlertVerification(currentAlert.id, type);
      await loadVerifications();
    } catch (error) {
      console.error("검증 등록 실패:", error);
      window.alert("검증 등록에 실패했습니다. " + error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitChatMessage = async (e) => {
    e.preventDefault();
    if (
      !newChatMessage.trim() ||
      !userName.trim() ||
      !chatRoom?.id ||
      isSendingChat ||
      !isSupabaseOnline
    )
      return;

    setIsSendingChat(true);
    try {
      localStorage.setItem("username", userName);
      await addChatMessage(
        chatRoom.id,
        newChatMessage.trim(),
        userName.trim()
      );
      setNewChatMessage("");
    } catch (error) {
      console.error("채팅 작성 실패:", error);
      window.alert("채팅 작성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleStatusChange = async (status) => {
    if (!isSupabaseOnline || isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    try {
      const updatedAlert = await updateAlertStatus(currentAlert.id, status);
      if (onUpdate) onUpdate(updatedAlert);
    } catch (error) {
      console.error("상태 변경 실패:", error);
      window.alert("상태 변경에 실패했습니다. " + error.message);
    } finally {
      setIsUpdatingStatus(false);
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

  const getVerificationStatus = () => {
    const { confirm, dispute, evidence } = verificationState.counts;
    if (dispute > confirm && dispute > 0) return "반박 있음";
    if (confirm > 0) return "현장 확인";
    if (evidence > 0 || currentAlert.image_url) return "증거 있음";
    return "미확인";
  };

  const getVerificationStatusClass = () => {
    const status = getVerificationStatus();
    if (status === "현장 확인") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "반박 있음") return "bg-rose-50 text-rose-700 border-rose-200";
    if (status === "증거 있음") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-gray-50 text-gray-600 border-gray-200";
  };

  const isMyVerification = (type) => verificationState.myTypes.includes(type);

  const getStatusMeta = (status = "active") => {
    const statuses = {
      active: {
        label: "진행중",
        className: "bg-gray-100 text-gray-700 border-gray-200",
      },
      confirmed: {
        label: "확인됨",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      },
      resolved: {
        label: "해결됨",
        className: "bg-blue-50 text-blue-700 border-blue-200",
      },
      needs_attention: {
        label: "주의필요",
        className: "bg-rose-50 text-rose-700 border-rose-200",
      },
    };

    return statuses[status] || statuses.active;
  };

  const currentStatus = getStatusMeta(currentAlert.status);

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
        <div className="flex flex-col gap-4 p-4 sm:p-6 border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className={`shrink-0 p-3 rounded-full border-2 ${colorClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="break-words font-bold text-gray-900 text-lg leading-tight">
                {currentAlert.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <span>{getTypeLabel(currentAlert.type)}</span>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${currentStatus.className}`}
                >
                  {currentStatus.label}
                </span>
                {hasAuthorPermission && (
                  <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    <Key className="h-3 w-3" />
                    <span>내가 작성</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-2">
            {/* 수정/삭제 버튼 - 작성자만 표시 */}
            {hasAuthorPermission && isSupabaseOnline && (
              <div className="flex items-center gap-1">
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
              <div className="flex items-center gap-1">
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
            {/* 이미지 표시 */}
            {currentAlert.image_url && (
              <div className="mb-4">
                <img
                  src={currentAlert.image_url}
                  alt="첨부 이미지"
                  className="w-full h-48 object-cover rounded-xl"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                상세 내용
              </h3>
              <p className="text-gray-900 leading-relaxed">
                {currentAlert.description}
              </p>
            </div>

            {/* 위치 및 시간 정보 */}
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {currentAlert.location
                    ? `${currentAlert.location.lat.toFixed(
                        4
                      )}, ${currentAlert.location.lng.toFixed(4)}`
                    : "위치 정보 없음"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4 shrink-0" />
                <span>
                  {getTimeAgo(
                    currentAlert.timestamp || currentAlert.created_at
                  )}
                </span>
              </div>
            </div>

            {/* 검증 상태 */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex flex-col gap-3 mb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">
                    커뮤니티 검증
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    근처 사람들이 확인하고 반박한 신호입니다.
                  </p>
                </div>
                <span
                  className={`w-fit shrink-0 border rounded-full px-3 py-1 text-xs font-semibold ${getVerificationStatusClass()}`}
                >
                  {getVerificationStatus()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleVerification("confirm")}
                  disabled={!isSupabaseOnline || isVerifying}
                  className={`rounded-lg border px-2 py-3 text-sm transition-colors ${
                    isMyVerification("confirm")
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <CheckCircle className="mx-auto mb-1 h-4 w-4" />
                  <span className="block font-medium">확인</span>
                  <span className="text-xs">
                    {verificationState.counts.confirm}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleVerification("dispute")}
                  disabled={!isSupabaseOnline || isVerifying}
                  className={`rounded-lg border px-2 py-3 text-sm transition-colors ${
                    isMyVerification("dispute")
                      ? "border-rose-300 bg-rose-50 text-rose-700"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Flag className="mx-auto mb-1 h-4 w-4" />
                  <span className="block font-medium">반박</span>
                  <span className="text-xs">
                    {verificationState.counts.dispute}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleVerification("evidence")}
                  disabled={!isSupabaseOnline || isVerifying}
                  className={`rounded-lg border px-2 py-3 text-sm transition-colors ${
                    isMyVerification("evidence")
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <ImagePlus className="mx-auto mb-1 h-4 w-4" />
                  <span className="block font-medium">증거</span>
                  <span className="text-xs">
                    {verificationState.counts.evidence +
                      (currentAlert.image_url ? 1 : 0)}
                  </span>
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ["active", "진행중"],
                  ["confirmed", "확인됨"],
                  ["needs_attention", "주의필요"],
                  ["resolved", "해결됨"],
                ].map(([status, label]) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusChange(status)}
                    disabled={!isSupabaseOnline || isUpdatingStatus}
                    className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      (currentAlert.status || "active") === status
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 현장 대화 섹션 */}
          <div className="border-t border-gray-100">
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Radio className="h-5 w-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">
                  현장 대화 {chatMessages.length}개
                </h3>
                {isSupabaseOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-gray-400" />
                )}
              </div>

              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {chatMessages.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-4">
                    {isSupabaseOnline
                      ? "이 위치의 실시간 대화를 시작해보세요."
                      : "현장 대화가 비활성화되었습니다."}
                  </p>
                ) : (
                  chatMessages.map((message) => (
                    <div key={message.id} className="rounded-lg bg-slate-50 p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {message.user_name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {getTimeAgo(message.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{message.content}</p>
                    </div>
                  ))
                )}
              </div>

              {isSupabaseOnline && (
                <form onSubmit={handleSubmitChatMessage} className="space-y-3">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="닉네임"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    required
                  />
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      placeholder="현장 상황을 공유하세요..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      disabled={isSendingChat || !chatRoom}
                      required
                    />
                    <button
                      type="submit"
                      disabled={
                        !newChatMessage.trim() ||
                        !userName.trim() ||
                        isSendingChat ||
                        !chatRoom
                      }
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

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
