import React from "react";
import { Database, Eye, Lock, MapPin, MessageSquare, X } from "lucide-react";

const PrivacyPolicy = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[90] p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Lock className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              개인정보처리방침
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800">
                처리 원칙
              </h3>
            </div>
            <p className="text-green-700">
              동네 알림이는 위치 기반 실시간 상황 공유를 위해 필요한 최소한의
              정보만 처리하며, 게시자가 직접 입력한 내용은 공개될 수 있습니다.
            </p>
          </div>

          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              1. 처리하는 개인정보 항목
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">위치 정보</h4>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>GPS 좌표 또는 기본 위치의 위도/경도</li>
                  <li>제보 작성 위치, 지도 표시, 주변 알림 반경 계산</li>
                  <li>정확한 주소는 별도로 저장하지 않음</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-800">
                    게시·소통 정보
                  </h4>
                </div>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>제보 제목, 설명, 카테고리, 상태, 작성 시간</li>
                  <li>첨부 이미지 URL 및 현장 대화 내용</li>
                  <li>닉네임, 검증/반박/증거 표시 기록</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                <h4 className="font-semibold text-gray-800 mb-2">
                  브라우저에 저장되는 정보
                </h4>
                <ul className="text-sm text-gray-600 grid md:grid-cols-2 gap-1">
                  <li>게스트 식별 키</li>
                  <li>작성자 권한 키</li>
                  <li>닉네임</li>
                  <li>알림 설정, 반경, 앱 내 알림함</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="h-5 w-5 mr-2 text-gray-600" />
              2. 이용 목적
            </h3>
            <div className="space-y-3 text-gray-700">
              <p>위치 기반 제보 생성, 지도 표시, 주변 상황 정렬 및 알림</p>
              <p>현장 대화, 커뮤니티 검증, 상태 변경 등 실시간 정보 공유</p>
              <p>작성자 본인 글 수정·삭제, 악용 방지, 서비스 안정성 확보</p>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              3. 보관 기간 및 파기
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>제보, 이미지, 현장 대화는 서비스 운영 기간 동안 보관됩니다.</li>
              <li>작성자가 삭제하거나 운영 정책상 숨김·삭제가 필요한 경우 삭제 또는 비공개 처리됩니다.</li>
              <li>브라우저 localStorage 정보는 사용자가 브라우저 저장공간을 삭제하면 함께 삭제됩니다.</li>
              <li>향후 자동 만료 기능 도입 시 카테고리별 보관 기간을 별도 공지합니다.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              4. 제3자 제공 및 처리 위탁
            </h3>
            <div className="space-y-3 text-gray-700">
              <p>
                법령상 의무, 수사기관의 적법한 요청, 이용자의 별도 동의가 있는
                경우를 제외하고 개인정보를 제3자에게 판매하거나 임의 제공하지
                않습니다.
              </p>
              <p>
                서비스 제공을 위해 Supabase에 데이터 저장·실시간 동기화·이미지
                저장을, Kakao Maps에 지도 표시를 의존합니다.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              5. 이용자 권리
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                ["열람", "본인의 정보 처리 현황 확인을 요청할 수 있습니다."],
                ["정정", "잘못된 정보의 수정을 요청할 수 있습니다."],
                ["삭제", "본인 게시물 또는 개인정보 삭제를 요청할 수 있습니다."],
                ["처리정지", "개인정보 처리 중단을 요청할 수 있습니다."],
              ].map(([title, body]) => (
                <div key={title} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
                  <p className="text-sm text-gray-600">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              6. 안전성 확보 조치
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>HTTPS 통신과 Supabase 권한 정책을 사용합니다.</li>
              <li>서비스에 필요하지 않은 실명, 전화번호, 이메일 입력을 요구하지 않습니다.</li>
              <li>개인정보 또는 타인의 사생활이 포함된 게시물은 신고·삭제될 수 있습니다.</li>
            </ul>
          </section>

          <section className="mb-8 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              7. 문의 및 권익침해 구제
            </h3>
            <div className="text-gray-700 space-y-2">
              <p>개인정보 관련 문의: businessyh0312@gmail.com</p>
              <p>개인정보보호위원회 신고센터: privacy.go.kr</p>
              <p>개인정보 분쟁조정위원회: privacy.go.kr</p>
              <p className="text-sm text-gray-500">
                최종 업데이트: {new Date().toLocaleDateString("ko-KR")}
              </p>
            </div>
          </section>
        </div>

        <div className="border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
