import React, { useState } from "react";
import {
  X,
  Volume2,
  Car,
  AlertTriangle,
  Shield,
  MoreHorizontal,
  Camera,
  Upload,
  Trash2,
} from "lucide-react";
import { uploadImage } from "../services/alertService";

const ReportModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const alertTypes = [
    {
      id: "emergency",
      label: "응급상황",
      icon: AlertTriangle,
      color: "bg-red-500",
    },
    { id: "noise", label: "소음", icon: Volume2, color: "bg-orange-500" },
    { id: "traffic", label: "교통", icon: Car, color: "bg-yellow-500" },
    { id: "safety", label: "안전", icon: Shield, color: "bg-cyan-500" },
    {
      id: "other",
      label: "기타",
      icon: MoreHorizontal,
      color: "bg-purple-500",
    },
  ];

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 체크 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        window.alert("파일 크기는 5MB 이하여야 합니다.");
        return;
      }

      // 이미지 파일인지 확인
      if (!file.type.startsWith("image/")) {
        window.alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      setImageFile(file);

      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.type && formData.title && formData.description) {
      setIsUploading(true);
      try {
        let imageUrl = null;

        // 이미지가 있다면 업로드
        if (imageFile) {
          imageUrl = await uploadImage(imageFile);
        }

        // 폼 데이터에 이미지 URL 추가
        const submitData = {
          ...formData,
          imageUrl,
        };

        onSubmit(submitData);
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        window.alert("이미지 업로드에 실패했습니다: " + error.message);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">상황 신고하기</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 카테고리 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              어떤 상황인가요?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {alertTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.id })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.type === type.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full ${type.color} flex items-center justify-center mx-auto mb-2`}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="간단한 제목을 입력해주세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors"
              required
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상세 설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="상황을 자세히 설명해주세요"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors resize-none"
              required
            />
          </div>

          {/* 이미지 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사진 첨부 (선택사항)
            </label>

            {/* 이미지 미리보기 */}
            {imagePreview ? (
              <div className="relative mb-3">
                <img
                  src={imagePreview}
                  alt="미리보기"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Camera className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    사진을 선택하세요
                  </span>
                  <span className="text-xs text-gray-500">
                    최대 5MB, JPG, PNG 형식
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={
                !formData.type ||
                !formData.title ||
                !formData.description ||
                isUploading
              }
              className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isUploading ? (
                <>
                  <Upload className="h-4 w-4 animate-spin" />
                  <span>업로드 중...</span>
                </>
              ) : (
                <span>신고하기</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
