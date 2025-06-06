import React from "react";
import { X, Shield, Copyright, AlertTriangle } from "lucide-react";

const TermsOfService = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">이용약관</h2>
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-800">
                  중요 공지
                </h3>
              </div>
              <p className="text-blue-700">
                본 서비스를 이용하기 전에 아래 약관을 반드시 읽어보시기
                바랍니다. 서비스 이용 시 본 약관에 동의한 것으로 간주됩니다.
              </p>
            </div>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Copyright className="h-5 w-5 mr-2 text-gray-600" />
                1. 지적재산권 및 저작권
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>1.1</strong> 본 서비스("동네 알림이")의 모든 콘텐츠,
                  기능, 디자인, 소스코드, 알고리즘, 데이터베이스는 저작권법 및
                  지적재산권법에 의해 보호받습니다.
                </p>
                <p>
                  <strong>1.2</strong> 사용자는 본 서비스의 소스코드, 디자인,
                  기능을
                  <span className="text-red-600 font-semibold">
                    {" "}
                    무단으로 복제, 수정, 배포, 재판매하는 것을 금지
                  </span>
                  합니다.
                </p>
                <p>
                  <strong>1.3</strong> 서비스의 아이디어, 컨셉, 비즈니스 모델을
                  무단으로 모방하여 유사한 서비스를 개발하는 것을 금지합니다.
                </p>
                <p>
                  <strong>1.4</strong> 위반 시 관련 법령에 따라 민사 및 형사상
                  책임을 질 수 있습니다.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                2. 서비스 이용
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>2.1</strong> 본 서비스는 동네 안전 정보 공유를
                  목적으로 합니다.
                </p>
                <p>
                  <strong>2.2</strong> 사용자는 정확하고 유용한 정보를 제공해야
                  하며, 거짓 정보나 악의적인 내용을 게시해서는 안 됩니다.
                </p>
                <p>
                  <strong>2.3</strong> 개인정보나 타인의 사생활을 침해하는 내용
                  게시를 금지합니다.
                </p>
                <p>
                  <strong>2.4</strong> 상업적 목적의 광고나 스팸 게시를
                  금지합니다.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                3. 면책조항
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>3.1</strong> 본 서비스는 사용자 간 정보 공유
                  플랫폼으로, 게시된 정보의 정확성에 대해 보장하지 않습니다.
                </p>
                <p>
                  <strong>3.2</strong> 서비스 이용으로 인한 직간접적 손해에 대해
                  책임지지 않습니다.
                </p>
                <p>
                  <strong>3.3</strong> 응급상황 시에는 반드시 119, 112 등 공식
                  기관에 신고하시기 바랍니다.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                4. 개인정보 보호
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>4.1</strong> 위치 정보는 알림 생성 목적으로만
                  사용되며, 정확한 주소는 저장하지 않습니다.
                </p>
                <p>
                  <strong>4.2</strong> 사용자명은 익명으로 처리되며, 개인 식별이
                  불가능합니다.
                </p>
                <p>
                  <strong>4.3</strong> 자세한 내용은 개인정보처리방침을
                  참조하시기 바랍니다.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                5. 약관 변경
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>5.1</strong> 본 약관은 서비스 개선을 위해 변경될 수
                  있습니다.
                </p>
                <p>
                  <strong>5.2</strong> 중요한 변경사항은 서비스 내 공지를 통해
                  알려드립니다.
                </p>
              </div>
            </section>

            <section className="mb-8 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                6. 연락처
              </h3>
              <div className="text-gray-700">
                <p>서비스 관련 문의나 신고는 아래로 연락주시기 바랍니다:</p>
                <p className="mt-2">
                  <strong>이메일:</strong> businessyh0312@gmail.com
                  <br />
                  <strong>신고:</strong> businessyh0312@gmail.com
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
