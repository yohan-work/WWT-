import React, { useState } from "react";
import {
  AlertTriangle,
  Camera,
  Car,
  MoreHorizontal,
  Shield,
  Trash2,
  Upload,
  Volume2,
  X,
} from "lucide-react";
import { createQuickAlertPayload, uploadImage } from "../services/alertService";

const alertTypes = [
  { id: "emergency", label: "응급", icon: AlertTriangle, color: "bg-red-500" },
  { id: "noise", label: "소음", icon: Volume2, color: "bg-orange-500" },
  { id: "traffic", label: "교통", icon: Car, color: "bg-yellow-500" },
  { id: "safety", label: "안전", icon: Shield, color: "bg-cyan-500" },
  { id: "other", label: "기타", icon: MoreHorizontal, color: "bg-purple-500" },
];

const QuickReportModal = ({ userLocation, onClose, onSubmit }) => {
  const [type, setType] = useState("other");
  const [note, setNote] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      window.alert("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      window.alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!type || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      await onSubmit(
        createQuickAlertPayload({
          type,
          note,
          imageUrl,
          location: userLocation,
        })
      );
    } catch (error) {
      console.error("빠른 제보 실패:", error);
      window.alert("빠른 제보에 실패했습니다. " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">빠른 제보</h2>
            <p className="text-xs text-gray-500">카테고리만 골라도 바로 공유됩니다.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {alertTypes.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id)}
                  className={`h-20 w-20 shrink-0 rounded-xl border-2 text-xs font-medium transition-colors ${
                    type === item.id
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  <span
                    className={`mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-full ${item.color}`}
                  >
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="짧은 메모를 남겨주세요. 선택사항입니다."
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-primary-500"
          />

          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="빠른 제보 이미지"
                className="h-36 w-full rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-4 text-sm text-gray-500">
              <Camera className="h-4 w-4" />
              사진 추가
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !userLocation}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-primary-700 disabled:bg-gray-300"
          >
            {isSubmitting && <Upload className="h-4 w-4 animate-spin" />}
            {userLocation ? "바로 공유하기" : "위치 확인 중"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuickReportModal;
