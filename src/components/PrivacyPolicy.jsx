import React from "react";
import { X, Lock, MapPin, MessageSquare, Database, Eye } from "lucide-react";

const PrivacyPolicy = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
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

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="prose max-w-none">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">
                  개인정보 보호 원칙
                </h3>
              </div>
              <p className="text-green-700">
                "동네 알림이"는 사용자의 개인정보를 소중히 여기며, 최소한의
                정보만 수집하여 안전하게 보호합니다.
              </p>
            </div>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                1. 수집하는 개인정보
              </h3>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">위치 정보</h4>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• GPS 좌표 (위도, 경도)</li>
                    <li>• 알림 생성 시점에만 수집</li>
                    <li>• 정확한 주소는 저장하지 않음</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-800">댓글 정보</h4>
                  </div>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• 사용자명 (닉네임)</li>
                    <li>• 댓글 내용</li>
                    <li>• 작성 시간</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  수집하지 않는 정보:
                </h4>
                <ul className="text-sm text-gray-600 grid md:grid-cols-2 gap-1">
                  <li>✗ 이름, 전화번호, 이메일</li>
                  <li>✗ 주민등록번호, 신용카드 정보</li>
                  <li>✗ 정확한 주소나 건물명</li>
                  <li>✗ 기기 고유 식별자</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2 text-gray-600" />
                2. 개인정보 이용 목적
              </h3>
              <div className="space-y-3 text-gray-700">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p>
                    <strong>위치 정보:</strong> 동네 알림 생성 및 지도 표시
                    목적으로만 사용
                  </p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <p>
                    <strong>댓글 정보:</strong> 사용자 간 소통 및 정보 공유
                    목적으로만 사용
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <p>
                    <strong>서비스 개선:</strong> 통계적 분석을 통한 서비스 품질
                    향상
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                3. 개인정보 보관 및 보호
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3 text-gray-700">
                  <h4 className="font-semibold text-gray-800">보관 기간:</h4>
                  <ul className="space-y-2">
                    <li>
                      • <strong>알림 정보:</strong> 30일 후 자동 삭제
                    </li>
                    <li>
                      • <strong>댓글:</strong> 사용자 요청 시 즉시 삭제
                    </li>
                    <li>
                      • <strong>위치 정보:</strong> 알림 삭제 시 함께 삭제
                    </li>
                  </ul>
                </div>
                <div className="space-y-3 text-gray-700">
                  <h4 className="font-semibold text-gray-800">보안 조치:</h4>
                  <ul className="space-y-2">
                    <li>• 암호화된 HTTPS 통신</li>
                    <li>• 안전한 클라우드 데이터베이스</li>
                    <li>• 접근 권한 제한</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                4. 제3자 정보 제공
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 font-semibold">
                  ❌ 원칙적으로 제3자에게 개인정보를 제공하지 않습니다.
                </p>
                <div className="mt-3 text-red-600 text-sm">
                  <p>
                    <strong>예외사항:</strong>
                  </p>
                  <ul className="mt-1 space-y-1">
                    <li>• 법원의 영장이 있는 경우</li>
                    <li>• 수사기관의 요청이 있는 경우</li>
                    <li>• 사용자의 명시적 동의가 있는 경우</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                5. 사용자 권리
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">열람권</h4>
                  <p className="text-sm text-blue-700">
                    본인의 개인정보 처리 현황을 확인할 수 있습니다.
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">
                    정정·삭제권
                  </h4>
                  <p className="text-sm text-green-700">
                    잘못된 정보의 수정이나 삭제를 요청할 수 있습니다.
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">
                    처리정지권
                  </h4>
                  <p className="text-sm text-purple-700">
                    개인정보 처리를 중단하도록 요청할 수 있습니다.
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    손해배상청구권
                  </h4>
                  <p className="text-sm text-yellow-700">
                    개인정보 침해로 인한 정신적 피해에 대해 배상을 청구할 수
                    있습니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                6. 쿠키 및 추적 기술
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>현재 사용 중인 기술:</strong>
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 로컬 스토리지: 사용자명 임시 저장</li>
                  <li>• 세션 스토리지: 오프라인 모드 지원</li>
                  <li>• 쿠키: 사용하지 않음</li>
                  <li>• 추적 스크립트: 사용하지 않음</li>
                </ul>
              </div>
            </section>

            <section className="mb-8 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                7. 문의 및 신고
              </h3>
              <div className="text-gray-700">
                <p className="mb-3">
                  개인정보 처리에 관한 문의나 신고는 아래로 연락주시기 바랍니다:
                </p>
                <div className="bg-white p-3 rounded border">
                  <p>
                    <strong>개인정보보호 담당자:</strong>{" "}
                    businessyh0312@gmail.com
                  </p>
                  <p>
                    <strong>이메일:</strong> businessyh0312@gmail.com
                  </p>
                  <p>
                    <strong>처리 기간:</strong> 접수 후 7일 이내 답변
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  <strong>개인정보보호위원회 신고센터:</strong> privacy.go.kr
                  <br />
                  <strong>개인정보 분쟁조정위원회:</strong> privacy.go.kr/kor
                </p>
                <p className="text-sm text-gray-500 mt-3">
                  최종 업데이트: {new Date().toLocaleDateString("ko-KR")}
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* 푸터 */}
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
