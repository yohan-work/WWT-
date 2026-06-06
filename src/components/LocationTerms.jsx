import React from "react";
import { MapPin, X } from "lucide-react";

const LocationTerms = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[90] p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              위치정보 이용약관
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 text-gray-700">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 font-semibold">
              본 약관은 동네 알림이가 위치 기반 상황 공유 서비스를 제공하기
              위해 위치정보를 이용하는 기준을 설명합니다.
            </p>
          </div>

          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              1. 위치기반서비스의 내용
            </h3>
            <ul className="space-y-2">
              <li>현재 위치 또는 기본 위치를 기준으로 주변 제보를 지도와 목록에 표시합니다.</li>
              <li>사용자가 제보를 작성하면 해당 제보 위치 좌표를 저장하고 공개합니다.</li>
              <li>설정한 반경 안의 새 제보 또는 상태 변경을 앱 내 알림으로 제공합니다.</li>
              <li>주변 상황 거리 계산, 군집 마커, 관심 반경 필터에 위치정보를 사용합니다.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              2. 개인위치정보의 이용 목적 및 보유
            </h3>
            <ul className="space-y-2">
              <li>목적: 제보 위치 표시, 주변 제보 정렬, 반경 기반 알림, 현장 대화 연결</li>
              <li>보유: 제보에 포함된 위치 좌표는 해당 제보가 삭제 또는 비공개 처리될 때까지 보관됩니다.</li>
              <li>브라우저가 제공하는 현재 위치는 주변 계산에 사용되며 별도 위치 이력으로 저장하지 않습니다.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              3. 개인위치정보의 제3자 제공
            </h3>
            <p>
              동네 알림이는 법령상 의무 또는 이용자 동의가 있는 경우를 제외하고
              개인위치정보를 제3자에게 임의로 제공하지 않습니다. 다만, 사용자가
              직접 작성한 제보의 위치 좌표는 서비스 화면에서 다른 이용자에게
              공개됩니다.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              4. 이용자의 권리
            </h3>
            <ul className="space-y-2">
              <li>위치정보 이용에 대한 동의를 거부할 수 있습니다.</li>
              <li>브라우저 또는 OS 설정에서 위치 권한을 철회할 수 있습니다.</li>
              <li>본인이 작성한 제보의 삭제를 요청하거나 앱에서 직접 삭제할 수 있습니다.</li>
              <li>위치정보 이용·제공 사실 확인 및 오류 정정을 요청할 수 있습니다.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              5. 긴급상황 관련 안내
            </h3>
            <p>
              본 서비스는 이용자 간 정보 공유를 돕는 서비스이며, 구조·신고를
              대체하지 않습니다. 생명·신체에 위험이 있는 경우 반드시 112, 119
              등 공식 기관에 우선 신고해야 합니다.
            </p>
          </section>

          <section className="mb-8 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              6. 위치정보 관리책임자
            </h3>
            <p>담당자: 동네 알림이 운영자</p>
            <p>연락처: businessyh0312@gmail.com</p>
            <p className="text-sm text-gray-500 mt-3">
              최종 업데이트: {new Date().toLocaleDateString("ko-KR")}
            </p>
          </section>
        </div>

        <div className="border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationTerms;
