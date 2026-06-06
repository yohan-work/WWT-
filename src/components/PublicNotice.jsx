import React from "react";
import { AlertTriangle, MessageSquare, ShieldCheck, X } from "lucide-react";

const PublicNotice = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">MVP 안내</h2>
              <p className="mt-1 text-sm text-gray-500">
                동네 알림이는 위치 기반 실시간 상황 공유 실험 서비스입니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5 text-sm text-gray-700">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p>
              응급상황은 반드시 112, 119 등 공식 기관에 먼저 신고해주세요.
            </p>
          </div>
          <div className="flex gap-3">
            <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-gray-600" />
            <p>
              사용자 제보 기반 정보이므로 검증 배지와 현장 대화는 참고용입니다.
            </p>
          </div>
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <p>
              차량번호, 얼굴, 실명, 연락처 등 타인의 개인정보는 올리지 말아주세요.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 p-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
          >
            확인하고 둘러보기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicNotice;
